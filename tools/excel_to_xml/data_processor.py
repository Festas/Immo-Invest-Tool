"""
Data Processor Module

Handles extraction and transformation of container data:
- Extract Transportlose structure from data
- Extract container-seal pairings
- Handle merged cells
- Detect data boundaries
- Process both Activities and Container Overview files
"""

import logging
from typing import Optional, Any
from pathlib import Path
from dataclasses import dataclass, field
from datetime import datetime

import pandas as pd
import yaml

from .smart_detector import SmartColumnDetector

# Configure logging
logger = logging.getLogger(__name__)


@dataclass
class ContainerRecord:
    """Represents a single container with its associated data."""

    number: str
    seal: Optional[str] = None
    group: Optional[str] = None
    activities: list[str] = field(default_factory=list)
    status: Optional[str] = None
    timestamp: Optional[datetime] = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class TransportlosGroup:
    """Represents a PFP Transportlos group containing containers."""

    name: str
    containers: list[ContainerRecord] = field(default_factory=list)
    start_row: int = 0
    end_row: int = 0


class DataExtractor:
    """
    Extracts and transforms data from Excel files.

    Handles:
    - Transportlose structure extraction
    - Container-seal pair extraction
    - Merged cell handling
    - Data boundary detection
    """

    def __init__(self, config_path: Optional[Path] = None):
        """
        Initialize the data extractor.

        Args:
            config_path: Path to configuration file.
        """
        self.config = self._load_config(config_path)
        self.detector = SmartColumnDetector(config_path)

    def _load_config(self, config_path: Optional[Path] = None) -> dict:
        """Load configuration from YAML file."""
        if config_path is None:
            config_path = Path(__file__).parent / "config.yaml"

        try:
            with open(config_path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except (FileNotFoundError, yaml.YAMLError):
            return {}

    def detect_data_boundaries(
        self, df: pd.DataFrame
    ) -> tuple[int, int]:
        """
        Detect the start and end rows of actual data.

        Handles:
        - Header rows
        - Empty rows at the beginning/end
        - Footer/summary rows

        Args:
            df: DataFrame to analyze.

        Returns:
            tuple[int, int]: (start_row, end_row) indices.
        """
        if df.empty:
            return (0, 0)

        # Find first row with substantial data
        start_row = 0
        for idx in range(len(df)):
            row = df.iloc[idx]
            non_null_count = row.notna().sum()
            if non_null_count >= 2:  # At least 2 non-null values
                start_row = idx
                break

        # Find last row with data
        end_row = len(df) - 1
        for idx in range(len(df) - 1, -1, -1):
            row = df.iloc[idx]
            non_null_count = row.notna().sum()
            if non_null_count >= 2:
                end_row = idx
                break

        logger.info(f"Detected data boundaries: rows {start_row} to {end_row}")
        return (start_row, end_row)

    def handle_merged_cells(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Handle merged cells by forward-filling values.

        Merged cells in Excel appear as NaN in subsequent rows.
        This method fills those NaN values with the previous value.

        Args:
            df: DataFrame to process.

        Returns:
            pd.DataFrame: DataFrame with merged cells filled.
        """
        # Forward fill for columns that might have merged cells
        # (typically first few columns with group headers)
        df_filled = df.copy()

        for col_idx in range(min(3, len(df.columns))):
            col_name = df.columns[col_idx]
            # Only fill if there are NaN values and the column seems to be a group column
            if df_filled[col_name].isna().any():
                # Check if this looks like a group column (has PFP patterns)
                has_groups = (
                    df_filled[col_name]
                    .astype(str)
                    .str.contains(r"PFP|Transportlos", na=False, regex=True)
                    .any()
                )
                if has_groups:
                    df_filled[col_name] = df_filled[col_name].ffill()
                    logger.debug(f"Forward-filled column {col_name}")

        return df_filled

    def extract_transportlose_structure(
        self, df: pd.DataFrame
    ) -> dict[str, TransportlosGroup]:
        """
        Extract the Transportlose (transport lot) structure from data.

        Identifies PFP groups and their associated containers.

        Args:
            df: DataFrame to process.

        Returns:
            dict[str, TransportlosGroup]: Mapping of group names to groups.
        """
        groups: dict[str, TransportlosGroup] = {}

        # Handle merged cells first
        df_processed = self.handle_merged_cells(df)

        # Find group headers
        group_headers = self.detector.find_group_headers(df_processed)

        if not group_headers:
            logger.warning("No PFP groups found in data")
            # Create a default group for all containers
            groups["Ungrouped"] = TransportlosGroup(name="Ungrouped")

        # Sort headers by row index
        group_headers.sort(key=lambda x: x[0])

        # Create groups with row ranges
        for i, (row_idx, group_name) in enumerate(group_headers):
            # Determine end row (start of next group or end of data)
            if i < len(group_headers) - 1:
                end_row = group_headers[i + 1][0] - 1
            else:
                end_row = len(df_processed) - 1

            groups[group_name] = TransportlosGroup(
                name=group_name, start_row=row_idx, end_row=end_row
            )
            logger.debug(
                f"Created group '{group_name}' from rows {row_idx} to {end_row}"
            )

        # Extract containers for each group
        container_cols = self.detector.find_container_columns(df_processed)
        seal_cols = self.detector.find_seal_columns(df_processed)

        for group_name, group in groups.items():
            if group.start_row == 0 and group.end_row == 0:
                # Use all data for ungrouped
                data_slice = df_processed
            else:
                data_slice = df_processed.iloc[group.start_row : group.end_row + 1]

            containers = self._extract_containers_from_slice(
                data_slice, container_cols, seal_cols, group_name
            )
            group.containers = containers

        return groups

    def _extract_containers_from_slice(
        self,
        df_slice: pd.DataFrame,
        container_cols: list[int],
        seal_cols: list[int],
        group_name: str,
    ) -> list[ContainerRecord]:
        """
        Extract container records from a DataFrame slice.

        Args:
            df_slice: DataFrame slice to process.
            container_cols: Column indices with container numbers.
            seal_cols: Column indices with seal numbers.
            group_name: Name of the group these containers belong to.

        Returns:
            list[ContainerRecord]: Extracted container records.
        """
        containers: list[ContainerRecord] = []

        # Get column pairs
        pairs = self.detector.map_column_pairs(df_slice)

        if not pairs and container_cols:
            # If no pairs found, use first container column with first seal column
            pairs = [(container_cols[0], seal_cols[0] if seal_cols else -1)]

        for container_col, seal_col in pairs:
            if container_col >= len(df_slice.columns):
                continue

            for row_idx in range(len(df_slice)):
                container_value = df_slice.iloc[row_idx, container_col]

                # Skip NaN or empty values
                if pd.isna(container_value) or str(container_value).strip() == "":
                    continue

                # Normalize container number
                normalized_container = self.detector.normalize_container_number(
                    str(container_value)
                )

                if normalized_container is None:
                    continue

                # Extract seal if available
                seal_value = None
                if 0 <= seal_col < len(df_slice.columns):
                    raw_seal = df_slice.iloc[row_idx, seal_col]
                    if pd.notna(raw_seal):
                        seal_value = self.detector.normalize_seal_number(str(raw_seal))

                container = ContainerRecord(
                    number=normalized_container, seal=seal_value, group=group_name
                )
                containers.append(container)

        # Remove duplicates by container number
        seen = set()
        unique_containers = []
        for c in containers:
            if c.number not in seen:
                seen.add(c.number)
                unique_containers.append(c)

        logger.info(
            f"Extracted {len(unique_containers)} unique containers from group '{group_name}'"
        )
        return unique_containers

    def extract_container_pairs(
        self,
        df: pd.DataFrame,
        container_col: int,
        seal_col: int,
    ) -> list[dict[str, Any]]:
        """
        Extract container-seal pairs from specific columns.

        Args:
            df: DataFrame to process.
            container_col: Column index for container numbers.
            seal_col: Column index for seal numbers.

        Returns:
            list[dict]: List of container-seal pair dictionaries.
        """
        pairs: list[dict[str, Any]] = []

        for row_idx in range(len(df)):
            container_value = df.iloc[row_idx, container_col]
            seal_value = df.iloc[row_idx, seal_col]

            # Skip rows without container numbers
            if pd.isna(container_value):
                continue

            normalized_container = self.detector.normalize_container_number(
                str(container_value)
            )
            if normalized_container is None:
                continue

            normalized_seal = None
            if pd.notna(seal_value):
                normalized_seal = self.detector.normalize_seal_number(str(seal_value))

            pairs.append(
                {
                    "container": normalized_container,
                    "seal": normalized_seal,
                    "row": row_idx,
                }
            )

        return pairs

    def extract_activities(
        self, df: pd.DataFrame
    ) -> dict[str, list[str]]:
        """
        Extract activity data per container from the Activities file.

        Args:
            df: DataFrame containing activity data.

        Returns:
            dict[str, list[str]]: Mapping of container numbers to activities.
        """
        activities: dict[str, list[str]] = {}

        # Find container columns
        container_cols = self.detector.find_container_columns(df)

        if not container_cols:
            logger.warning("No container columns found in activities data")
            return activities

        container_col = container_cols[0]

        # Find columns that might contain activity/status information
        # (typically columns with text data)
        for row_idx in range(len(df)):
            container_value = df.iloc[row_idx, container_col]

            if pd.isna(container_value):
                continue

            normalized_container = self.detector.normalize_container_number(
                str(container_value)
            )
            if normalized_container is None:
                continue

            # Extract activity from other columns
            row_activities = []
            for col_idx in range(len(df.columns)):
                if col_idx == container_col:
                    continue

                cell_value = df.iloc[row_idx, col_idx]
                if pd.notna(cell_value) and isinstance(cell_value, str):
                    if len(cell_value.strip()) > 0:
                        row_activities.append(cell_value.strip())

            if normalized_container not in activities:
                activities[normalized_container] = []

            activities[normalized_container].extend(row_activities)

        return activities

    def combine_data(
        self,
        container_data: dict[str, TransportlosGroup],
        activities: dict[str, list[str]],
    ) -> dict[str, TransportlosGroup]:
        """
        Combine container data with activity information.

        Cross-references the Container Overview data with Activities data.

        Args:
            container_data: Extracted container group data.
            activities: Extracted activity data per container.

        Returns:
            dict[str, TransportlosGroup]: Combined data with activities.
        """
        for group_name, group in container_data.items():
            for container in group.containers:
                container_activities = activities.get(container.number, [])
                container.activities = container_activities

        return container_data

    def process_files(
        self,
        container_df: Optional[pd.DataFrame],
        activities_df: Optional[pd.DataFrame],
    ) -> dict[str, TransportlosGroup]:
        """
        Process both Container Overview and Activities files.

        Args:
            container_df: DataFrame from Container Overview file.
            activities_df: DataFrame from Activities file.

        Returns:
            dict[str, TransportlosGroup]: Combined container data.
        """
        # Process container overview
        container_data: dict[str, TransportlosGroup] = {}

        if container_df is not None:
            container_data = self.extract_transportlose_structure(container_df)
            logger.info(f"Extracted {len(container_data)} groups from container file")
        else:
            logger.warning("No container data available")

        # Process activities
        activities: dict[str, list[str]] = {}

        if activities_df is not None:
            activities = self.extract_activities(activities_df)
            logger.info(f"Extracted activities for {len(activities)} containers")
        else:
            logger.warning("No activities data available")

        # Combine data
        combined = self.combine_data(container_data, activities)

        return combined
