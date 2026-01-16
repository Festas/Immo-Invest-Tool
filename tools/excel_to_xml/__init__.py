r"""
Excel to XML Converter for ESSI-2025 Container Data

This module provides optimized conversion of two specific Excel files
from a network drive (Z:\) to structured XML format with intelligent
field detection and robust data extraction.

Fixed File Paths:
- Activities: Z:\KKK\Fachbereiche\TKW\Allgemein\ESSI-2025\Aktivitäten\ESSI_Aktivitäten_Container.xlsx
- Container Overview: Z:\KKK\Fachbereiche\TKW\Allgemein\ESSI-2025\ReVS\Container\Container-Übersicht_ESSI2025.xlsx

Usage:
    from excel_to_xml import main
    main(output_path='output.xml')

Or from command line:
    python -m excel_to_xml --output output.xml --verbose
"""

from .fixed_file_handler import FixedFileHandler
from .smart_detector import SmartColumnDetector
from .data_processor import DataExtractor, ContainerRecord, TransportlosGroup
from .xml_builder import XMLBuilder
from .main import main, cli

__version__ = "1.0.0"
__author__ = "ESSI-2025 Team"

__all__ = [
    "FixedFileHandler",
    "SmartColumnDetector",
    "DataExtractor",
    "ContainerRecord",
    "TransportlosGroup",
    "XMLBuilder",
    "main",
    "cli",
]
