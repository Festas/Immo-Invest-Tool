"""
Excel to XML Converter - Main Entry Point

Optimized converter for two specific ESSI-2025 Excel files:
1. ESSI_Aktivitäten_Container.xlsx - Activities file
2. Container-Übersicht_ESSI2025.xlsx - Container Overview file

Features:
- Direct file access with hardcoded network paths
- Intelligent field detection
- Robust data extraction
- XML generation with proper structure

Usage:
    python main.py [--output OUTPUT_PATH] [--verbose]
"""

import argparse
import logging
import sys
from pathlib import Path
from datetime import datetime

from .fixed_file_handler import FixedFileHandler
from .data_processor import DataExtractor
from .xml_builder import XMLBuilder

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def main(output_path: Path | None = None, verbose: bool = False) -> int:
    """
    Main entry point for the Excel to XML converter.

    Args:
        output_path: Optional path for the output XML file.
        verbose: Whether to enable verbose logging.

    Returns:
        int: Exit code (0 for success, 1 for failure).
    """
    if verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    logger.info("=" * 60)
    logger.info("Excel to XML Converter - ESSI-2025")
    logger.info("=" * 60)

    # Initialize components
    config_path = Path(__file__).parent / "config.yaml"
    file_handler = FixedFileHandler(config_path)
    data_extractor = DataExtractor(config_path)
    xml_builder = XMLBuilder(config_path)

    # Check file status
    status = file_handler.get_file_status()
    logger.info(f"Network accessible: {status['network_accessible']}")
    logger.info(
        f"Activities file exists: {status['aktivitaeten_file']['exists']}"
    )
    logger.info(
        f"Container file exists: {status['container_file']['exists']}"
    )

    # Load data from both files
    container_df = None
    activities_df = None
    partial_success = False

    # Try to load container overview file
    try:
        logger.info("Loading Container Overview file...")
        container_df = file_handler.load_container_overview()
        if container_df is not None:
            logger.info(f"Loaded container data: {len(container_df)} rows")
            partial_success = True
        else:
            logger.warning("Could not load Container Overview file")
    except Exception as e:
        logger.error(f"Error loading Container Overview: {e}")

    # Try to load activities file
    try:
        logger.info("Loading Activities file...")
        activities_df = file_handler.load_aktivitaeten()
        if activities_df is not None:
            logger.info(f"Loaded activities data: {len(activities_df)} rows")
            partial_success = True
        else:
            logger.warning("Could not load Activities file")
    except Exception as e:
        logger.error(f"Error loading Activities file: {e}")

    # Check if we have any data to process
    if container_df is None and activities_df is None:
        logger.error("No data could be loaded from either file")

        # Generate error XML
        error_root = xml_builder.build_error_xml(
            "No data could be loaded from source files",
            {"files_checked": 2, "network_status": status["network_accessible"]},
        )

        if output_path:
            error_xml = xml_builder._prettify(error_root)
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(error_xml)
            logger.info(f"Error XML saved to {output_path}")

        return 1

    # Process data
    logger.info("Processing data...")
    try:
        combined_data = data_extractor.process_files(container_df, activities_df)
        logger.info(f"Processed {len(combined_data)} groups")

        # Calculate statistics
        total_containers = sum(len(g.containers) for g in combined_data.values())
        containers_with_seals = sum(
            1 for g in combined_data.values() for c in g.containers if c.seal
        )
        logger.info(f"Total containers extracted: {total_containers}")
        logger.info(f"Containers with seals: {containers_with_seals}")

    except Exception as e:
        logger.error(f"Error processing data: {e}")
        return 1

    # Generate XML output
    logger.info("Generating XML output...")
    try:
        # Determine output path
        if output_path is None:
            output_path = Path.cwd() / f"container_data_{datetime.now():%Y%m%d_%H%M%S}.xml"

        success = xml_builder.save_to_file(
            combined_data,
            output_path,
            source_path="Z:\\KKK\\Fachbereiche\\TKW\\Allgemein\\ESSI-2025",
        )

        if success:
            logger.info(f"XML successfully generated: {output_path}")
            logger.info("=" * 60)
            logger.info("Conversion completed successfully")
            logger.info("=" * 60)
            return 0
        else:
            logger.error("Failed to save XML file")
            return 1

    except Exception as e:
        logger.error(f"Error generating XML: {e}")
        return 1


def cli():
    """Command-line interface entry point."""
    parser = argparse.ArgumentParser(
        description="Convert ESSI-2025 Excel files to XML format",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python -m excel_to_xml
    python -m excel_to_xml --output output.xml
    python -m excel_to_xml --verbose
        """,
    )

    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        help="Output XML file path (default: container_data_TIMESTAMP.xml)",
    )

    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable verbose logging",
    )

    parser.add_argument(
        "--check-files",
        action="store_true",
        help="Only check if source files are accessible",
    )

    args = parser.parse_args()

    if args.check_files:
        handler = FixedFileHandler()
        status = handler.get_file_status()

        print("\nFile Status Check")
        print("=" * 40)
        print(f"Network (Z:\\): {'✓ Accessible' if status['network_accessible'] else '✗ Not accessible'}")
        print(
            f"Activities file: {'✓ Found' if status['aktivitaeten_file']['exists'] else '✗ Not found'}"
        )
        print(
            f"Container file: {'✓ Found' if status['container_file']['exists'] else '✗ Not found'}"
        )
        print("=" * 40)

        sys.exit(0 if status["network_accessible"] else 1)

    sys.exit(main(args.output, args.verbose))


if __name__ == "__main__":
    cli()
