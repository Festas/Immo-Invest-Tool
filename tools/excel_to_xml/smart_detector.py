"""
Smart Column Detector Module

Provides intelligent field detection for Excel data:
- Auto-detect column types by content analysis (not position)
- Recognize KKKU containers with variations
- Detect seal numbers (V-numbers)
- Find PFP group headers
- Handle sheets with rearranged columns dynamically

Pattern matching is based on regex patterns defined in config.yaml.
"""

import re
import logging
from typing import Optional
from pathlib import Path
from functools import lru_cache

import pandas as pd
import yaml

# Configure logging
logger = logging.getLogger(__name__)


class SmartColumnDetector:
    """
    Intelligent column and field detector for Excel data.

    Uses content-based pattern matching to identify:
    - Container columns (KKKU numbers)
    - Seal columns (V-numbers)
    - PFP group headers
    - Container-seal pairings
    """

    # Default patterns if config is not available
    DEFAULT_PATTERNS = {
        "container": r"KKKU[\s\-]?\d{6}[\-\.]?\d",
        "seal": r"V\s?\d{6,7}",
        "pfp_group": r"PFP\s*\d+\.\d+(?:\s+\w+)?",
    }

    def __init__(self, config_path: Optional[Path] = None):
        """
        Initialize the detector with patterns from config.

        Args:
            config_path: Path to configuration file.
        """
        self.config = self._load_config(config_path)
        self.patterns = self._compile_patterns()
        self.detection_config = self.config.get("detection", {})
        self.min_match_threshold = self.detection_config.get("min_match_threshold", 0.1)
        self.max_header_rows = self.detection_config.get("max_header_rows", 5)
        self._cache: dict = {}

    def _load_config(self, config_path: Optional[Path] = None) -> dict:
        """Load configuration from YAML file."""
        if config_path is None:
            config_path = Path(__file__).parent / "config.yaml"

        try:
            with open(config_path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except (FileNotFoundError, yaml.YAMLError):
            logger.warning("Config file not found, using default patterns")
            return {}

    def _compile_patterns(self) -> dict[str, re.Pattern]:
        """Compile regex patterns from config or defaults."""
        raw_patterns = self.config.get("patterns", self.DEFAULT_PATTERNS)
        compiled = {}

        for name, pattern in raw_patterns.items():
            try:
                compiled[name] = re.compile(pattern, re.IGNORECASE)
            except re.error as e:
                logger.error(f"Invalid regex pattern for {name}: {e}")
                # Use default pattern if available
                if name in self.DEFAULT_PATTERNS:
                    compiled[name] = re.compile(
                        self.DEFAULT_PATTERNS[name], re.IGNORECASE
                    )

        return compiled

    def _get_cache_key(self, df: pd.DataFrame, pattern_name: str) -> str:
        """Generate a cache key for detection results."""
        # Use shape and first few values as cache key
        return f"{id(df)}_{df.shape}_{pattern_name}"

    def detect_by_content_pattern(
        self, df: pd.DataFrame
    ) -> dict[str, list[int]]:
        """
        Detect column types by analyzing content patterns.

        Scans all columns and identifies which contain:
        - Container numbers (KKKU)
        - Seal numbers (V-numbers)
        - PFP group identifiers

        Args:
            df: DataFrame to analyze.

        Returns:
            dict[str, list[int]]: Mapping of pattern names to column indices.
        """
        results: dict[str, list[int]] = {name: [] for name in self.patterns}

        for col_idx, col_name in enumerate(df.columns):
            # Convert column to string for pattern matching
            col_data = df.iloc[:, col_idx].astype(str)

            for pattern_name, pattern in self.patterns.items():
                # Count matches in this column
                matches = col_data.str.contains(pattern, na=False, regex=True).sum()
                match_ratio = matches / len(col_data) if len(col_data) > 0 else 0

                # If enough cells match, this is likely a relevant column
                if match_ratio >= self.min_match_threshold or matches >= 3:
                    results[pattern_name].append(col_idx)
                    logger.debug(
                        f"Column {col_idx} ({col_name}) matches pattern "
                        f"'{pattern_name}' with {matches} matches ({match_ratio:.1%})"
                    )

        return results

    def find_container_columns(self, df: pd.DataFrame) -> list[int]:
        """
        Find columns containing KKKU container numbers.

        Recognizes variations:
        - KKKU 011913-0
        - KKKU011913-0
        - KKKU-011913-0

        Args:
            df: DataFrame to search.

        Returns:
            list[int]: List of column indices containing container numbers.
        """
        cache_key = self._get_cache_key(df, "container")
        if cache_key in self._cache:
            return self._cache[cache_key]

        container_cols = []
        pattern = self.patterns.get("container")

        if pattern is None:
            return []

        for col_idx in range(len(df.columns)):
            col_data = df.iloc[:, col_idx].astype(str)
            matches = col_data.str.contains(pattern, na=False, regex=True).sum()

            if matches >= 1:  # At least one container number
                container_cols.append(col_idx)
                logger.info(
                    f"Found container column at index {col_idx}: "
                    f"{df.columns[col_idx]} ({matches} containers)"
                )

        self._cache[cache_key] = container_cols
        return container_cols

    def find_seal_columns(self, df: pd.DataFrame) -> list[int]:
        """
        Find columns containing seal numbers (V-numbers).

        Recognizes variations:
        - V367011
        - V 367011

        Args:
            df: DataFrame to search.

        Returns:
            list[int]: List of column indices containing seal numbers.
        """
        cache_key = self._get_cache_key(df, "seal")
        if cache_key in self._cache:
            return self._cache[cache_key]

        seal_cols = []
        pattern = self.patterns.get("seal")

        if pattern is None:
            return []

        for col_idx in range(len(df.columns)):
            col_data = df.iloc[:, col_idx].astype(str)
            matches = col_data.str.contains(pattern, na=False, regex=True).sum()

            if matches >= 1:  # At least one seal number
                seal_cols.append(col_idx)
                logger.info(
                    f"Found seal column at index {col_idx}: "
                    f"{df.columns[col_idx]} ({matches} seals)"
                )

        self._cache[cache_key] = seal_cols
        return seal_cols

    def find_group_headers(
        self, df: pd.DataFrame
    ) -> list[tuple[int, str]]:
        """
        Find PFP group headers in the data.

        Searches for patterns like:
        - PFP 5.1 Transportlos
        - PFP 5.2

        Args:
            df: DataFrame to search.

        Returns:
            list[tuple[int, str]]: List of (row_index, group_name) tuples.
        """
        group_headers: list[tuple[int, str]] = []
        pattern = self.patterns.get("pfp_group")

        if pattern is None:
            return []

        # Search in all cells
        for row_idx in range(min(len(df), 1000)):  # Limit search to first 1000 rows
            for col_idx in range(len(df.columns)):
                cell_value = str(df.iloc[row_idx, col_idx])
                match = pattern.search(cell_value)

                if match:
                    group_name = match.group(0).strip()
                    group_headers.append((row_idx, group_name))
                    logger.debug(f"Found group header at row {row_idx}: {group_name}")

        # Remove duplicates while preserving order
        seen = set()
        unique_headers = []
        for header in group_headers:
            if header[1] not in seen:
                seen.add(header[1])
                unique_headers.append(header)

        return unique_headers

    def map_column_pairs(
        self, df: pd.DataFrame
    ) -> list[tuple[int, int]]:
        """
        Map container columns to their corresponding seal columns.

        Pairs are determined by proximity in the column layout.

        Args:
            df: DataFrame to analyze.

        Returns:
            list[tuple[int, int]]: List of (container_col, seal_col) pairs.
        """
        container_cols = self.find_container_columns(df)
        seal_cols = self.find_seal_columns(df)

        if not container_cols or not seal_cols:
            logger.warning("Could not find container or seal columns for pairing")
            return []

        pairs: list[tuple[int, int]] = []

        # Match each container column to the nearest seal column
        for container_col in container_cols:
            # Find the closest seal column
            closest_seal = min(
                seal_cols, key=lambda s: abs(s - container_col), default=None
            )
            if closest_seal is not None:
                pairs.append((container_col, closest_seal))
                logger.debug(
                    f"Paired container column {container_col} with seal column {closest_seal}"
                )

        return pairs

    def detect_header_row(self, df: pd.DataFrame) -> int:
        """
        Detect the actual header row in the data.

        Some Excel files have merged cells or multiple header rows.

        Args:
            df: DataFrame to analyze.

        Returns:
            int: Row index of the detected header row.
        """
        # Look for rows with text that looks like headers
        for row_idx in range(min(self.max_header_rows, len(df))):
            row_data = df.iloc[row_idx]
            non_null_count = row_data.notna().sum()
            string_count = sum(
                1 for v in row_data if isinstance(v, str) and len(str(v)) > 2
            )

            # If most cells are strings, this might be a header row
            if string_count >= len(df.columns) * 0.5:
                return row_idx

        return 0  # Default to first row

    def normalize_container_number(self, value: str) -> Optional[str]:
        """
        Normalize a container number to a standard format.

        Input variations:
        - KKKU 011913-0
        - KKKU011913-0
        - KKKU-011913-0

        Output: KKKU 011913-0 (standardized format)

        Args:
            value: Raw container number string.

        Returns:
            str: Normalized container number, or None if invalid.
        """
        pattern = self.patterns.get("container")
        if pattern is None:
            return None

        match = pattern.search(str(value))
        if not match:
            return None

        # Extract the matched portion
        raw = match.group(0)

        # Normalize to "KKKU NNNNNN-N" format
        # Remove all spaces and hyphens first
        cleaned = re.sub(r"[\s\-]", "", raw.upper())

        # Extract number parts
        numbers_match = re.search(r"KKKU(\d{6})(\d)", cleaned)
        if numbers_match:
            return f"KKKU {numbers_match.group(1)}-{numbers_match.group(2)}"

        return raw  # Return original if normalization fails

    def normalize_seal_number(self, value: str) -> Optional[str]:
        """
        Normalize a seal number to a standard format.

        Input variations:
        - V367011
        - V 367011

        Output: V367011 (no space)

        Args:
            value: Raw seal number string.

        Returns:
            str: Normalized seal number, or None if invalid.
        """
        pattern = self.patterns.get("seal")
        if pattern is None:
            return None

        match = pattern.search(str(value))
        if not match:
            return None

        # Extract and normalize (remove spaces)
        raw = match.group(0)
        return re.sub(r"\s", "", raw.upper())

    def clear_cache(self):
        """Clear the detection results cache."""
        self._cache.clear()
        logger.debug("Cleared detection cache")
