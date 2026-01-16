r"""
Fixed File Handler Module

Handles the two specific Excel files from the network drive (Z:\):
1. ESSI_Aktivitäten_Container.xlsx - Activities file
2. Container-Übersicht_ESSI2025.xlsx - Container Overview file

Features:
- Direct file access with hardcoded paths
- Network drive access handling (Z:\ drive)
- Graceful handling of unavailable files
- Retry mechanism for network issues
"""

import time
import logging
from pathlib import Path
from typing import Optional

import pandas as pd
import yaml

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


class FixedFileHandler:
    """
    Handler for the two fixed Excel files from the ESSI-2025 network drive.

    Provides methods to:
    - Check network drive accessibility
    - Read files with retry mechanism
    - Handle file locks and temporary unavailability
    """

    # Fixed file paths - hardcoded as per requirements
    AKTIVITAETEN_FILE = Path(
        r"Z:\KKK\Fachbereiche\TKW\Allgemein\ESSI-2025\Aktivitäten\ESSI_Aktivitäten_Container.xlsx"
    )
    CONTAINER_FILE = Path(
        r"Z:\KKK\Fachbereiche\TKW\Allgemein\ESSI-2025\ReVS\Container\Container-Übersicht_ESSI2025.xlsx"
    )

    def __init__(self, config_path: Optional[Path] = None):
        """
        Initialize the file handler.

        Args:
            config_path: Optional path to configuration file.
                         If not provided, uses default config.yaml in the same directory.
        """
        self.config = self._load_config(config_path)
        self.max_retries = self.config.get("network", {}).get("max_retries", 3)
        self.retry_delay = self.config.get("network", {}).get("retry_delay_seconds", 2)
        self.timeout = self.config.get("network", {}).get("timeout_seconds", 30)

    def _load_config(self, config_path: Optional[Path] = None) -> dict:
        """Load configuration from YAML file."""
        if config_path is None:
            config_path = Path(__file__).parent / "config.yaml"

        try:
            with open(config_path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            logger.warning(f"Config file not found at {config_path}, using defaults")
            return {}
        except yaml.YAMLError as e:
            logger.error(f"Error parsing config file: {e}")
            return {}

    def check_network_access(self) -> bool:
        r"""
        Check if the network drive (Z:\) is accessible.

        Returns:
            bool: True if network drive is accessible, False otherwise.
        """
        import platform

        # Only check Z:\ on Windows systems
        if platform.system() != "Windows":
            logger.info("Non-Windows system detected, skipping network drive check")
            return False

        # Check if Z:\ drive exists
        network_root = Path(r"Z:\\")
        try:
            if network_root.exists():
                logger.info(r"Network drive Z:\ is accessible")
                return True
            else:
                logger.warning(r"Network drive Z:\ is not accessible")
                return False
        except OSError as e:
            logger.error(f"Error checking network drive: {e}")
            return False

    def check_file_exists(self, filepath: Path) -> bool:
        """
        Check if a specific file exists and is accessible.

        Args:
            filepath: Path to the file to check.

        Returns:
            bool: True if file exists and is accessible.
        """
        try:
            return filepath.exists() and filepath.is_file()
        except OSError as e:
            logger.error(f"Error checking file {filepath}: {e}")
            return False

    def read_with_retry(
        self,
        filepath: Path,
        sheet_name: Optional[str] = None,
        max_retries: Optional[int] = None,
    ) -> Optional[pd.DataFrame]:
        """
        Read an Excel file with retry mechanism for network issues.

        Args:
            filepath: Path to the Excel file.
            sheet_name: Name of the sheet to read. If None, reads the first sheet.
            max_retries: Maximum number of retry attempts. Uses config default if not specified.

        Returns:
            pd.DataFrame: The loaded data, or None if all retries failed.
        """
        retries = max_retries if max_retries is not None else self.max_retries

        for attempt in range(retries):
            try:
                logger.info(
                    f"Reading file {filepath.name} (attempt {attempt + 1}/{retries})"
                )

                # Read the Excel file
                if sheet_name:
                    df = pd.read_excel(filepath, sheet_name=sheet_name, engine="openpyxl")
                else:
                    df = pd.read_excel(filepath, engine="openpyxl")

                logger.info(f"Successfully read {filepath.name}: {len(df)} rows")
                return df

            except FileNotFoundError:
                logger.error(f"File not found: {filepath}")
                return None

            except PermissionError:
                # File might be locked by another user
                logger.warning(
                    f"File is locked: {filepath}. "
                    f"Retrying in {self.retry_delay} seconds..."
                )
                if attempt < retries - 1:
                    time.sleep(self.retry_delay)

            except OSError as e:
                # Network connectivity issues
                logger.warning(
                    f"Network error reading {filepath}: {e}. "
                    f"Retrying in {self.retry_delay} seconds..."
                )
                if attempt < retries - 1:
                    time.sleep(self.retry_delay)

            except ValueError as e:
                # Sheet not found or other Excel parsing errors
                logger.error(f"Error parsing Excel file {filepath}: {e}")
                return None

        logger.error(f"Failed to read {filepath} after {retries} attempts")
        return None

    def read_all_sheets(
        self, filepath: Path, max_retries: Optional[int] = None
    ) -> Optional[dict[str, pd.DataFrame]]:
        """
        Read all sheets from an Excel file.

        Args:
            filepath: Path to the Excel file.
            max_retries: Maximum number of retry attempts.

        Returns:
            dict[str, pd.DataFrame]: Dictionary mapping sheet names to DataFrames,
                                     or None if reading failed.
        """
        retries = max_retries if max_retries is not None else self.max_retries

        for attempt in range(retries):
            try:
                logger.info(
                    f"Reading all sheets from {filepath.name} "
                    f"(attempt {attempt + 1}/{retries})"
                )

                sheets = pd.read_excel(filepath, sheet_name=None, engine="openpyxl")
                logger.info(f"Successfully read {len(sheets)} sheets from {filepath.name}")
                return sheets

            except FileNotFoundError:
                logger.error(f"File not found: {filepath}")
                return None

            except PermissionError:
                logger.warning(
                    f"File is locked: {filepath}. "
                    f"Retrying in {self.retry_delay} seconds..."
                )
                if attempt < retries - 1:
                    time.sleep(self.retry_delay)

            except OSError as e:
                logger.warning(
                    f"Network error: {e}. Retrying in {self.retry_delay} seconds..."
                )
                if attempt < retries - 1:
                    time.sleep(self.retry_delay)

        logger.error(f"Failed to read sheets from {filepath} after {retries} attempts")
        return None

    def get_sheet_names(self, filepath: Path) -> Optional[list[str]]:
        """
        Get the names of all sheets in an Excel file.

        Args:
            filepath: Path to the Excel file.

        Returns:
            list[str]: List of sheet names, or None if reading failed.
        """
        try:
            excel_file = pd.ExcelFile(filepath, engine="openpyxl")
            return excel_file.sheet_names
        except Exception as e:
            logger.error(f"Error getting sheet names from {filepath}: {e}")
            return None

    def load_aktivitaeten(
        self, sheet_name: Optional[str] = None
    ) -> Optional[pd.DataFrame]:
        """
        Load the Activities (Aktivitäten) file.

        Args:
            sheet_name: Optional specific sheet name to load.

        Returns:
            pd.DataFrame: The loaded data, or None if loading failed.
        """
        if not self.check_file_exists(self.AKTIVITAETEN_FILE):
            logger.error(f"Activities file not found: {self.AKTIVITAETEN_FILE}")
            return None

        return self.read_with_retry(self.AKTIVITAETEN_FILE, sheet_name=sheet_name)

    def load_container_overview(
        self, sheet_name: Optional[str] = None
    ) -> Optional[pd.DataFrame]:
        """
        Load the Container Overview file.

        Args:
            sheet_name: Optional specific sheet name to load.
                        Defaults to "Plomben" sheet as per requirements.

        Returns:
            pd.DataFrame: The loaded data, or None if loading failed.
        """
        if not self.check_file_exists(self.CONTAINER_FILE):
            logger.error(f"Container file not found: {self.CONTAINER_FILE}")
            return None

        # Default to "Plomben" sheet for container overview
        target_sheet = sheet_name or self.config.get("sheets", {}).get(
            "container_overview", {}
        ).get("target_sheet", "Plomben")

        df = self.read_with_retry(self.CONTAINER_FILE, sheet_name=target_sheet)

        # If target sheet fails, try fallback sheets
        if df is None:
            fallback_sheets = self.config.get("sheets", {}).get(
                "container_overview", {}
            ).get("fallback_sheets", [])

            for fallback in fallback_sheets:
                logger.info(f"Trying fallback sheet: {fallback}")
                df = self.read_with_retry(self.CONTAINER_FILE, sheet_name=fallback)
                if df is not None:
                    break

        return df

    def get_file_status(self) -> dict:
        """
        Get the status of both fixed files.

        Returns:
            dict: Status information for both files.
        """
        return {
            "network_accessible": self.check_network_access(),
            "aktivitaeten_file": {
                "path": str(self.AKTIVITAETEN_FILE),
                "exists": self.check_file_exists(self.AKTIVITAETEN_FILE),
            },
            "container_file": {
                "path": str(self.CONTAINER_FILE),
                "exists": self.check_file_exists(self.CONTAINER_FILE),
            },
        }
