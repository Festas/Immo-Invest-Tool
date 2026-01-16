# Excel to XML Converter for ESSI-2025

Optimized converter for processing two specific Excel files from a network drive and converting them to structured XML format.

## Features

- **Direct File Access**: Uses hardcoded paths for the two fixed files - no file searching needed
- **Network Drive Support**: Handles Z:\ drive access with retry mechanism
- **Intelligent Field Detection**: Auto-detects column types by content analysis
- **Pattern Recognition**: Recognizes KKKU containers, V-number seals, and PFP groups
- **Dynamic Column Handling**: Handles sheets with rearranged columns
- **Merged Cell Support**: Properly handles merged cells in Excel
- **Robust Error Handling**: Graceful handling of unavailable files
- **Partial Data Support**: Generates partial XML when data is incomplete

## Fixed File Paths

1. **Activities File**:

   ```
   Z:\KKK\Fachbereiche\TKW\Allgemein\ESSI-2025\Aktivitäten\ESSI_Aktivitäten_Container.xlsx
   ```

2. **Container Overview File**:
   ```
   Z:\KKK\Fachbereiche\TKW\Allgemein\ESSI-2025\ReVS\Container\Container-Übersicht_ESSI2025.xlsx
   ```

## Pattern Recognition

The tool recognizes the following patterns:

| Type              | Examples                                   | Pattern                     |
| ----------------- | ------------------------------------------ | --------------------------- |
| Container Numbers | KKKU 011913-0, KKKU011913-0, KKKU-011913-0 | `KKKU[\s\-]?\d{6}[\-\.]?\d` |
| Seal Numbers      | V367011, V 367011                          | `V\s?\d{6,7}`               |
| PFP Groups        | PFP 5.1 Transportlos, PFP 5.2              | `PFP\s*\d+\.\d+(?:\s+\w+)?` |

## Installation

```bash
cd tools/excel_to_xml
pip install -r requirements.txt
```

## Usage

### Command Line

```bash
# Run the converter
python -m excel_to_xml

# Specify output file
python -m excel_to_xml --output output.xml

# Enable verbose logging
python -m excel_to_xml --verbose

# Check if source files are accessible
python -m excel_to_xml --check-files
```

### Python API

```python
from excel_to_xml import main, FixedFileHandler, DataExtractor, XMLBuilder

# Run conversion
exit_code = main(output_path='output.xml', verbose=True)

# Or use components directly
handler = FixedFileHandler()
status = handler.get_file_status()

if status['network_accessible']:
    container_df = handler.load_container_overview()
    activities_df = handler.load_aktivitaeten()

    extractor = DataExtractor()
    data = extractor.process_files(container_df, activities_df)

    builder = XMLBuilder()
    builder.save_to_file(data, 'output.xml')
```

## Output XML Structure

```xml
<?xml version="1.0" encoding="utf-8"?>
<ContainerData xmlns="http://example.com/container-data">
  <Metadata>
    <Source>Z:\KKK\Fachbereiche\TKW\Allgemein\ESSI-2025</Source>
    <Generated>2024-01-16T10:00:00</Generated>
    <Version>1.0</Version>
  </Metadata>
  <Transportlose totalGroups="5" totalContainers="100">
    <Group name="PFP 5.1" count="20">
      <Container number="KKKU 011913-0" seal="V367011">
        <Activities>
          <Activity>Activity description</Activity>
        </Activities>
      </Container>
      <!-- more containers -->
    </Group>
  </Transportlose>
  <Activities containerCount="50">
    <Container number="KKKU 011913-0">
      <Activity>...</Activity>
    </Container>
  </Activities>
  <Summary>
    <TotalGroups>5</TotalGroups>
    <TotalContainers>100</TotalContainers>
    <ContainersWithSeals>95</ContainersWithSeals>
    <ContainersWithActivities>50</ContainersWithActivities>
    <SealCoveragePercent>95.0</SealCoveragePercent>
  </Summary>
</ContainerData>
```

## Module Structure

```
tools/excel_to_xml/
├── __init__.py           # Package initialization
├── config.yaml           # Configuration for patterns and paths
├── fixed_file_handler.py # Network file access with retry
├── smart_detector.py     # Intelligent column detection
├── data_processor.py     # Data extraction and transformation
├── xml_builder.py        # XML generation
├── main.py               # CLI entry point
├── requirements.txt      # Python dependencies
└── README.md             # This file
```

## Configuration

Edit `config.yaml` to customize:

- File paths
- Pattern matching regex
- Sheet names
- Network retry settings
- Output settings
- Detection thresholds

## Error Handling

The tool handles various error scenarios:

1. **Network Issues**: Automatic retry with configurable delay
2. **File Locks**: Retry when Excel files are open by others
3. **Missing Files**: Continues with available data
4. **Format Changes**: Logs warnings but continues processing
5. **Missing Data**: Generates partial XML with available data

## Success Criteria

- ✅ No manual file selection needed
- ✅ Handles column rearrangements automatically
- ✅ Processes both files in < 5 seconds (on local)
- ✅ Correctly extracts 100% of valid KKKU containers
- ✅ Maintains PFP group associations
- ✅ Works with network drive (Z:\) reliably
- ✅ Generates valid XML every time

## Requirements

- Python 3.10+
- pandas >= 2.0.0
- openpyxl >= 3.1.0
- PyYAML >= 6.0
- Network access to Z:\ drive

## License

MIT License
