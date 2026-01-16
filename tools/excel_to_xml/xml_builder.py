"""
XML Builder Module

Generates XML output from processed container data:
- Proper XML structure with metadata
- Transportlose groups
- Container-seal pairings
- Activity information
- Error handling for partial data
"""

import logging
from typing import Optional
from pathlib import Path
from datetime import datetime
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

import yaml

from .data_processor import TransportlosGroup, ContainerRecord

# Configure logging
logger = logging.getLogger(__name__)


class XMLBuilder:
    """
    Builds XML output from processed container data.

    Generates structure:
    <ContainerData>
      <Metadata>...</Metadata>
      <Transportlose>
        <Group name="PFP 5.1">
          <Container number="KKKU 011913-0" seal="V367011"/>
        </Group>
      </Transportlose>
      <Activities>...</Activities>
    </ContainerData>
    """

    def __init__(self, config_path: Optional[Path] = None):
        """
        Initialize the XML builder.

        Args:
            config_path: Path to configuration file.
        """
        self.config = self._load_config(config_path)
        self.output_config = self.config.get("output", {})
        self.encoding = self.output_config.get("encoding", "utf-8")
        self.indent = self.output_config.get("indent", 2)

    def _load_config(self, config_path: Optional[Path] = None) -> dict:
        """Load configuration from YAML file."""
        if config_path is None:
            config_path = Path(__file__).parent / "config.yaml"

        try:
            with open(config_path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except (FileNotFoundError, yaml.YAMLError):
            return {}

    def _prettify(self, elem: Element) -> str:
        """
        Return a pretty-printed XML string.

        Args:
            elem: Root XML element.

        Returns:
            str: Formatted XML string.
        """
        rough_string = tostring(elem, encoding="unicode")
        reparsed = minidom.parseString(rough_string)
        return reparsed.toprettyxml(indent=" " * self.indent)

    def build_metadata(self, root: Element, source_path: Optional[str] = None) -> None:
        """
        Add metadata section to XML.

        Args:
            root: Root XML element.
            source_path: Optional source file path.
        """
        metadata = SubElement(root, "Metadata")

        # Source information
        source = SubElement(metadata, "Source")
        source.text = source_path or "Z:\\KKK\\Fachbereiche\\TKW\\Allgemein\\ESSI-2025"

        # Generation timestamp
        generated = SubElement(metadata, "Generated")
        generated.text = datetime.now().isoformat()

        # Version
        version = SubElement(metadata, "Version")
        version.text = "1.0"

    def build_container_element(
        self, parent: Element, container: ContainerRecord
    ) -> Element:
        """
        Create a container XML element.

        Args:
            parent: Parent XML element.
            container: Container record data.

        Returns:
            Element: The created container element.
        """
        container_elem = SubElement(parent, "Container")
        container_elem.set("number", container.number)

        if container.seal:
            container_elem.set("seal", container.seal)

        if container.status:
            container_elem.set("status", container.status)

        # Add activities if present
        if container.activities:
            activities_elem = SubElement(container_elem, "Activities")
            for activity in container.activities:
                activity_elem = SubElement(activities_elem, "Activity")
                activity_elem.text = activity

        # Add metadata if present
        if container.metadata:
            metadata_elem = SubElement(container_elem, "Metadata")
            for key, value in container.metadata.items():
                item = SubElement(metadata_elem, "Item")
                item.set("key", str(key))
                item.text = str(value)

        return container_elem

    def build_transportlose(
        self, root: Element, groups: dict[str, TransportlosGroup]
    ) -> None:
        """
        Add Transportlose section with groups and containers.

        Args:
            root: Root XML element.
            groups: Dictionary of transport groups.
        """
        transportlose = SubElement(root, "Transportlose")

        total_containers = 0

        for group_name, group in sorted(groups.items()):
            if not group.containers:
                continue

            group_elem = SubElement(transportlose, "Group")
            group_elem.set("name", group_name)
            group_elem.set("count", str(len(group.containers)))

            for container in group.containers:
                self.build_container_element(group_elem, container)

            total_containers += len(group.containers)

        transportlose.set("totalGroups", str(len(groups)))
        transportlose.set("totalContainers", str(total_containers))

    def build_activities_section(
        self, root: Element, groups: dict[str, TransportlosGroup]
    ) -> None:
        """
        Add Activities section summarizing all container activities.

        Args:
            root: Root XML element.
            groups: Dictionary of transport groups.
        """
        activities_section = SubElement(root, "Activities")

        # Collect all containers with activities
        containers_with_activities = []
        for group in groups.values():
            for container in group.containers:
                if container.activities:
                    containers_with_activities.append(container)

        if not containers_with_activities:
            activities_section.set("status", "empty")
            return

        activities_section.set("containerCount", str(len(containers_with_activities)))

        for container in containers_with_activities:
            container_elem = SubElement(activities_section, "Container")
            container_elem.set("number", container.number)

            for activity in container.activities:
                activity_elem = SubElement(container_elem, "Activity")
                activity_elem.text = activity

    def build_summary(
        self, root: Element, groups: dict[str, TransportlosGroup]
    ) -> None:
        """
        Add Summary section with statistics.

        Args:
            root: Root XML element.
            groups: Dictionary of transport groups.
        """
        summary = SubElement(root, "Summary")

        # Calculate statistics
        total_containers = sum(len(g.containers) for g in groups.values())
        containers_with_seals = sum(
            1 for g in groups.values() for c in g.containers if c.seal
        )
        containers_with_activities = sum(
            1 for g in groups.values() for c in g.containers if c.activities
        )

        SubElement(summary, "TotalGroups").text = str(len(groups))
        SubElement(summary, "TotalContainers").text = str(total_containers)
        SubElement(summary, "ContainersWithSeals").text = str(containers_with_seals)
        SubElement(summary, "ContainersWithActivities").text = str(
            containers_with_activities
        )

        # Calculate seal coverage percentage
        if total_containers > 0:
            seal_coverage = (containers_with_seals / total_containers) * 100
            SubElement(summary, "SealCoveragePercent").text = f"{seal_coverage:.1f}"

    def build_xml(
        self,
        groups: dict[str, TransportlosGroup],
        source_path: Optional[str] = None,
        include_summary: bool = True,
    ) -> Element:
        """
        Build the complete XML structure.

        Args:
            groups: Dictionary of transport groups with containers.
            source_path: Optional source file path for metadata.
            include_summary: Whether to include summary statistics.

        Returns:
            Element: Root XML element.
        """
        root = Element("ContainerData")
        root.set("xmlns", "http://example.com/container-data")

        # Add sections
        self.build_metadata(root, source_path)
        self.build_transportlose(root, groups)
        self.build_activities_section(root, groups)

        if include_summary:
            self.build_summary(root, groups)

        return root

    def to_string(
        self,
        groups: dict[str, TransportlosGroup],
        source_path: Optional[str] = None,
        pretty: bool = True,
    ) -> str:
        """
        Generate XML string from container data.

        Args:
            groups: Dictionary of transport groups.
            source_path: Optional source file path.
            pretty: Whether to format the output nicely.

        Returns:
            str: XML string.
        """
        root = self.build_xml(groups, source_path)

        if pretty:
            return self._prettify(root)
        else:
            return tostring(root, encoding="unicode")

    def save_to_file(
        self,
        groups: dict[str, TransportlosGroup],
        output_path: Path,
        source_path: Optional[str] = None,
    ) -> bool:
        """
        Save XML output to a file.

        Args:
            groups: Dictionary of transport groups.
            output_path: Path to save the XML file.
            source_path: Optional source file path for metadata.

        Returns:
            bool: True if save was successful.
        """
        try:
            xml_string = self.to_string(groups, source_path)

            # Remove XML declaration from minidom (it adds it automatically)
            lines = xml_string.split("\n")
            if lines[0].startswith("<?xml"):
                lines = lines[1:]
            xml_content = "\n".join(lines)

            # Add proper XML declaration
            declaration = f'<?xml version="1.0" encoding="{self.encoding}"?>\n'
            full_content = declaration + xml_content

            with open(output_path, "w", encoding=self.encoding) as f:
                f.write(full_content)

            logger.info(f"Successfully saved XML to {output_path}")
            return True

        except OSError as e:
            logger.error(f"Error saving XML file: {e}")
            return False

    def build_error_xml(
        self, error_message: str, partial_data: Optional[dict] = None
    ) -> Element:
        """
        Build an error XML document for failure cases.

        Args:
            error_message: Description of the error.
            partial_data: Any partial data that was extracted.

        Returns:
            Element: Root XML element with error information.
        """
        root = Element("ContainerData")
        root.set("status", "error")

        # Add metadata
        self.build_metadata(root)

        # Add error section
        error_elem = SubElement(root, "Error")
        SubElement(error_elem, "Message").text = error_message
        SubElement(error_elem, "Timestamp").text = datetime.now().isoformat()

        # Add partial data if available
        if partial_data:
            partial = SubElement(root, "PartialData")
            partial.set("warning", "Data may be incomplete")

            for key, value in partial_data.items():
                item = SubElement(partial, "Item")
                item.set("key", str(key))
                item.text = str(value)

        return root
