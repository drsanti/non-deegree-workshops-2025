# Validate Script Documentation

**File**: `validate.py`  
**Purpose**: Validate dataset structure, visualize samples, and compare vibration patterns across conditions

## Overview

This script provides utilities for validating and visualizing the generated motor vibration CSV dataset. It can check dataset structure, visualize individual samples, and compare patterns across different motor conditions.

## Prerequisites

- Dataset must exist in `train/` or `test/` directories
- Virtual environment with required packages activated

## Usage

### 1. Validate Dataset Structure

```bash
# Validate both train and test datasets
../venv/Scripts/python.exe validate.py validate
```

### 2. Visualize a Sample

```bash
# Visualize a specific condition and file
../venv/Scripts/python.exe validate.py visualize <condition> <file_index>

# Examples:
../venv/Scripts/python.exe validate.py visualize normal 0
../venv/Scripts/python.exe validate.py visualize bearing 2
../venv/Scripts/python.exe validate.py visualize imbalance 1
```

### 3. Compare All Conditions

```bash
# Compare vibration patterns across all conditions
../venv/Scripts/python.exe validate.py compare
```

### 4. Default (Validate Both Datasets)

```bash
# If no command provided, validates both datasets
../venv/Scripts/python.exe validate.py
```

## Commands

| Command | Description | Arguments |
|---------|-------------|-----------|
| `validate` | Validate dataset structure | None |
| `visualize` | Visualize a sample file | `<condition> <file_index>` |
| `compare` | Compare all conditions | None |
| (none) | Default: validate both datasets | None |

## What Each Command Does

### 1. Validate Command

**Purpose**: Check dataset structure and data quality

**Output**:
- Number of conditions found
- Files per condition
- Total files
- Column names
- Sample counts per condition
- Data ranges (min/max) for each axis per condition

**Example Output**:
```
Validating dataset in: train
============================================================
Conditions found: 4
  bearing: 32 files
  imbalance: 32 files
  misalignment: 32 files
  normal: 32 files

Total files: 128

Columns: ['time', 'ax', 'ay', 'az', 'label']

Sample counts per condition:
  bearing: 32,000 samples
  imbalance: 32,000 samples
  misalignment: 32,000 samples
  normal: 32,000 samples

Data ranges:
  bearing:
    ax: [-2.345, 2.123]
    ay: [-3.456, 3.789]
    az: [-3.123, 3.456]
  ...
```

### 2. Visualize Command

**Purpose**: Display 3-axis accelerometer data for a specific sample

**Arguments**:
- `<condition>`: One of: `normal`, `bearing`, `misalignment`, `imbalance`
- `<file_index>`: File number (0-based, e.g., 0 = first file)

**Output File**: `output/{condition}_sample_visualization.png`

**Visualization**:
- 3×1 subplot grid showing:
  - **Top**: Axial acceleration (ax) - Red
  - **Middle**: Radial horizontal acceleration (ay) - Blue
  - **Bottom**: Radial vertical acceleration (az) - Green

**Example**:
```bash
../venv/Scripts/python.exe validate.py visualize normal 0
```

**Output**:
```
Visualized: normal condition, file #1
Data shape: (1000, 5)
Time range: 0.00 to 10.00 seconds
```

### 3. Compare Command

**Purpose**: Side-by-side comparison of vibration patterns across all conditions

**Output File**: `output/condition_comparison.png`

**Visualization**:
- 4×3 subplot grid:
  - **Rows**: One per condition (normal, bearing, misalignment, imbalance)
  - **Columns**: One per axis (ax, ay, az)
  - Uses first file from each condition

**Purpose**: Quickly identify visual differences between conditions

## Functions

### `load_csv_file(filepath)`
Loads a single CSV file and returns a DataFrame.

**Parameters**:
- `filepath`: Path to CSV file

**Returns**: DataFrame with columns: time, ax, ay, az, label

### `load_dataset(directory)`
Loads all CSV files from a directory with condition subdirectories.

**Parameters**:
- `directory`: Base directory (train/ or test/) containing condition subdirectories

**Returns**: Dictionary with condition names as keys and list of DataFrames as values

**Structure**:
```python
{
    'normal': [df1, df2, ...],
    'bearing': [df1, df2, ...],
    'misalignment': [df1, df2, ...],
    'imbalance': [df1, df2, ...]
}
```

### `validate_dataset(directory)`
Validates dataset structure and data quality.

**Parameters**:
- `directory`: Directory containing CSV files

**Returns**: Dictionary with validation results

**Validation Checks**:
- Number of conditions
- Files per condition
- Total files
- Column structure
- Sample counts
- Data ranges (min/max for each axis)

### `visualize_sample(directory, condition, file_index)`
Visualizes a sample CSV file from the dataset.

**Parameters**:
- `directory`: Directory containing CSV files
- `condition`: Condition name to visualize
- `file_index`: Index of file to visualize (0-based)

**Output**: Saves plot to `output/{condition}_sample_visualization.png`

### `compare_conditions(directory)`
Compares vibration patterns across all conditions.

**Parameters**:
- `directory`: Directory containing CSV files

**Output**: Saves plot to `output/condition_comparison.png`

## Output Files

### Sample Visualizations
- **`output/normal_sample_visualization.png`**: Normal condition sample
- **`output/bearing_sample_visualization.png`**: Bearing condition sample
- **`output/misalignment_sample_visualization.png`**: Misalignment condition sample
- **`output/imbalance_sample_visualization.png`**: Imbalance condition sample

### Comparison Plot
- **`output/condition_comparison.png`**: Side-by-side comparison of all conditions

## Dataset Structure

The script expects the following directory structure:

```
train/
├── normal/
│   ├── 001.csv
│   ├── 002.csv
│   └── ...
├── bearing/
│   ├── 001.csv
│   └── ...
├── misalignment/
│   └── ...
└── imbalance/
    └── ...

test/
├── normal/
│   └── ...
└── ...
```

## CSV File Format

Each CSV file should contain:
- **time**: Time in seconds (0.0 to 10.0)
- **ax**: Axial acceleration (g)
- **ay**: Radial horizontal acceleration (g)
- **az**: Radial vertical acceleration (g)
- **label**: Condition label (normal, bearing, misalignment, imbalance)

## Error Handling

The script handles:
- Missing directories: Prints error message
- Missing files: Skips and continues
- Invalid file indices: Prints error message
- Unknown conditions: Prints warning and skips

## Example Workflow

```bash
# 1. Validate dataset structure
../venv/Scripts/python.exe validate.py validate

# 2. Visualize a normal sample
../venv/Scripts/python.exe validate.py visualize normal 0

# 3. Visualize a bearing fault sample
../venv/Scripts/python.exe validate.py visualize bearing 0

# 4. Compare all conditions
../venv/Scripts/python.exe validate.py compare
```

## Visual Interpretation

### Normal Condition
- Balanced vibration across all axes
- Low amplitude oscillations
- Regular patterns

### Bearing Failure
- Increased vibration, especially in radial axes (ay, az)
- Higher noise levels
- Moderate amplitude increase

### Misalignment
- Asymmetric vibration patterns
- Phase differences between axes
- Moderate amplitude increase

### Imbalance
- Very high amplitude in radial directions
- Rotational patterns
- Highest vibration levels

## Related Scripts

- **`generate.py`**: Generate the dataset
- **`train_lstm.py`**: Train LSTM model
- **`train_features.py`**: Train feature-based model

## Notes

- Supports both new structure (condition subdirectories) and old structure (flat directory)
- Automatically creates `output/` directory if it doesn't exist
- Plots are saved and displayed in windows
- Validation provides comprehensive dataset statistics
- Visualization helps understand data characteristics before training

