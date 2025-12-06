# ==============================================================================
# Motor Vibration Dataset Validation
# Utilities for loading, validating, and visualizing generated CSV files
# ==============================================================================

import numpy as np
import pandas as pd
import os
from pathlib import Path
import matplotlib.pyplot as plt

# ==============================================================================
# CSV FILE LOADING AND VALIDATION
# ==============================================================================

def load_csv_file(filepath):
    """
    Load a single CSV file and return DataFrame.
    
    Args:
        filepath: Path to CSV file
    
    Returns:
        DataFrame with columns: time, ax, ay, az, label
    """
    df = pd.read_csv(filepath)
    return df


def load_dataset(directory):
    """
    Load all CSV files from a directory with condition subdirectories.
    
    Args:
        directory: Base directory (train/ or test/) containing condition subdirectories
    
    Returns:
        Dictionary with condition names as keys and list of DataFrames as values
    """
    dataset = {}
    
    if not os.path.exists(directory):
        print(f"Directory {directory} does not exist!")
        return dataset
    
    # Look for condition subdirectories
    base_path = Path(directory)
    
    # Check if subdirectories exist (new structure)
    condition_dirs = [d for d in base_path.iterdir() if d.is_dir()]
    
    if condition_dirs:
        # New structure: train/condition/*.csv
        for condition_dir in sorted(condition_dirs):
            condition = condition_dir.name
            csv_files = sorted(condition_dir.glob("*.csv"))
            
            if condition not in dataset:
                dataset[condition] = []
            
            for filepath in csv_files:
                df = load_csv_file(filepath)
                dataset[condition].append(df)
    else:
        # Old structure: train/*.csv (backward compatibility)
        csv_files = sorted(base_path.glob("*.csv"))
        
        for filepath in csv_files:
            # Extract condition from filename (e.g., "normal_001.csv" -> "normal")
            condition = filepath.stem.split('_')[0]
            
            if condition not in dataset:
                dataset[condition] = []
            
            df = load_csv_file(filepath)
            dataset[condition].append(df)
    
    return dataset


def validate_dataset(directory):
    """
    Validate dataset structure and data quality.
    
    Args:
        directory: Directory containing CSV files
    
    Returns:
        Dictionary with validation results
    """
    print(f"Validating dataset in: {directory}")
    print("="*60)
    
    dataset = load_dataset(directory)
    
    if not dataset:
        print("No CSV files found!")
        return {}
    
    validation_results = {
        'conditions': list(dataset.keys()),
        'files_per_condition': {},
        'total_files': 0,
        'columns': None,
        'sample_count': {},
        'data_ranges': {}
    }
    
    for condition, files in dataset.items():
        num_files = len(files)
        validation_results['files_per_condition'][condition] = num_files
        validation_results['total_files'] += num_files
        
        if files:
            # Check first file structure
            sample_df = files[0]
            if validation_results['columns'] is None:
                validation_results['columns'] = list(sample_df.columns)
            
            # Count samples
            total_samples = sum(len(df) for df in files)
            validation_results['sample_count'][condition] = total_samples
            
            # Check data ranges
            all_ax = np.concatenate([df['ax'].values for df in files])
            all_ay = np.concatenate([df['ay'].values for df in files])
            all_az = np.concatenate([df['az'].values for df in files])
            
            validation_results['data_ranges'][condition] = {
                'ax': (all_ax.min(), all_ax.max()),
                'ay': (all_ay.min(), all_ay.max()),
                'az': (all_az.min(), all_az.max())
            }
    
    # Print results
    print(f"Conditions found: {len(validation_results['conditions'])}")
    for condition in validation_results['conditions']:
        print(f"  {condition}: {validation_results['files_per_condition'][condition]} files")
    
    print(f"\nTotal files: {validation_results['total_files']}")
    print(f"\nColumns: {validation_results['columns']}")
    
    print("\nSample counts per condition:")
    for condition, count in validation_results['sample_count'].items():
        print(f"  {condition}: {count:,} samples")
    
    print("\nData ranges:")
    for condition, ranges in validation_results['data_ranges'].items():
        print(f"  {condition}:")
        print(f"    ax: [{ranges['ax'][0]:.3f}, {ranges['ax'][1]:.3f}]")
        print(f"    ay: [{ranges['ay'][0]:.3f}, {ranges['ay'][1]:.3f}]")
        print(f"    az: [{ranges['az'][0]:.3f}, {ranges['az'][1]:.3f}]")
    
    print("="*60)
    
    return validation_results


def visualize_sample(directory, condition='normal', file_index=0):
    """
    Visualize a sample CSV file from the dataset.
    
    Args:
        directory: Directory containing CSV files
        condition: Condition name to visualize
        file_index: Index of file to visualize (0-based)
    """
    dataset = load_dataset(directory)
    
    if condition not in dataset:
        print(f"Condition '{condition}' not found in dataset!")
        return
    
    if file_index >= len(dataset[condition]):
        print(f"File index {file_index} out of range (max: {len(dataset[condition])-1})")
        return
    
    df = dataset[condition][file_index]
    
    # Create visualization
    fig, axes = plt.subplots(3, 1, figsize=(12, 10))
    
    axes[0].plot(df['time'], df['ax'], label='ax (Axial)', color='red', linewidth=1)
    axes[0].set_xlabel('Time (s)')
    axes[0].set_ylabel('Acceleration (g)')
    axes[0].set_title(f'{condition.capitalize()} Condition - Axial (ax)')
    axes[0].grid(True, alpha=0.3)
    axes[0].legend()
    
    axes[1].plot(df['time'], df['ay'], label='ay (Radial Horizontal)', color='blue', linewidth=1)
    axes[1].set_xlabel('Time (s)')
    axes[1].set_ylabel('Acceleration (g)')
    axes[1].set_title(f'{condition.capitalize()} Condition - Radial Horizontal (ay)')
    axes[1].grid(True, alpha=0.3)
    axes[1].legend()
    
    axes[2].plot(df['time'], df['az'], label='az (Radial Vertical)', color='green', linewidth=1)
    axes[2].set_xlabel('Time (s)')
    axes[2].set_ylabel('Acceleration (g)')
    axes[2].set_title(f'{condition.capitalize()} Condition - Radial Vertical (az)')
    axes[2].grid(True, alpha=0.3)
    axes[2].legend()
    
    plt.tight_layout()
    plt.savefig(f"output/{condition}_sample_visualization.png", dpi=150, bbox_inches='tight')
    plt.show()
    
    print(f"Visualized: {condition} condition, file #{file_index+1}")
    print(f"Data shape: {df.shape}")
    print(f"Time range: {df['time'].min():.2f} to {df['time'].max():.2f} seconds")


def compare_conditions(directory):
    """
    Compare vibration patterns across all conditions.
    
    Args:
        directory: Directory containing CSV files
    """
    dataset = load_dataset(directory)
    
    if not dataset:
        print("No data found!")
        return
    
    # Create output directory
    os.makedirs("output", exist_ok=True)
    
    # Get first file from each condition
    fig, axes = plt.subplots(4, 3, figsize=(15, 12))
    
    conditions = sorted(dataset.keys())
    
    for row, condition in enumerate(conditions):
        if dataset[condition]:
            df = dataset[condition][0]  # Use first file
            
            # Plot ax
            axes[row, 0].plot(df['time'], df['ax'], color='red', linewidth=1)
            axes[row, 0].set_ylabel('Acceleration (g)')
            axes[row, 0].set_title(f'{condition.capitalize()} - ax')
            axes[row, 0].grid(True, alpha=0.3)
            
            # Plot ay
            axes[row, 1].plot(df['time'], df['ay'], color='blue', linewidth=1)
            axes[row, 1].set_ylabel('Acceleration (g)')
            axes[row, 1].set_title(f'{condition.capitalize()} - ay')
            axes[row, 1].grid(True, alpha=0.3)
            
            # Plot az
            axes[row, 2].plot(df['time'], df['az'], color='green', linewidth=1)
            axes[row, 2].set_xlabel('Time (s)')
            axes[row, 2].set_ylabel('Acceleration (g)')
            axes[row, 2].set_title(f'{condition.capitalize()} - az')
            axes[row, 2].grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig("output/condition_comparison.png", dpi=150, bbox_inches='tight')
    plt.show()
    
    print("Condition comparison visualization saved to output/condition_comparison.png")


# ==============================================================================
# MAIN TEST/VALIDATION
# ==============================================================================

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "validate":
            # Validate train and test datasets
            print("Validating TRAIN dataset:")
            validate_dataset("train")
            print("\n")
            print("Validating TEST dataset:")
            validate_dataset("test")
        
        elif command == "visualize":
            condition = sys.argv[2] if len(sys.argv) > 2 else "normal"
            file_idx = int(sys.argv[3]) if len(sys.argv) > 3 else 0
            visualize_sample("train", condition, file_idx)
        
        elif command == "compare":
            compare_conditions("train")
        
        else:
            print(f"Unknown command: {command}")
            print("Available commands: validate, visualize, compare")
    else:
        # Default: validate both datasets
        print("Validating TRAIN dataset:")
        validate_dataset("train")
        print("\n")
        print("Validating TEST dataset:")
        validate_dataset("test")

