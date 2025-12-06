# ==============================================================================
# Motor Vibration Dataset Generator
# Generate time-series CSV files with 3-axis accelerometer data
# Creates train/ and test/ directories with CSV files for each condition
# ==============================================================================

import numpy as np
import pandas as pd
import os
from pathlib import Path

# Set seed for reproducibility
np.random.seed(42)

# ==============================================================================
# CONFIGURATION
# ==============================================================================

# Motor specifications
MOTOR_RPM = 1500  # Motor speed in RPM
FUNDAMENTAL_FREQ = MOTOR_RPM / 60  # 25 Hz fundamental frequency
SAMPLING_RATE = 100  # 100 Hz sampling rate
DURATION = 10  # 10 seconds per sample
NUM_SAMPLES = SAMPLING_RATE * DURATION  # 1000 samples per file

# Dataset size
SAMPLES_PER_CONDITION = 40  # Number of CSV files per condition
TRAIN_RATIO = 0.8  # 80% for training, 20% for testing

# Output directories
TRAIN_DIR = "train"
TEST_DIR = "test"

# ==============================================================================
# VIBRATION DATA GENERATION FUNCTIONS
# ==============================================================================

def generate_normal_vibration(time, fundamental_freq):
    """
    Generate normal motor vibration (3-axis accelerometer).
    Healthy motor: balanced, low amplitude, regular patterns.
    """
    n = len(time)
    
    # Axial (ax): primarily 1× component
    ax = 0.3 * np.sin(2 * np.pi * fundamental_freq * time) + \
         0.1 * np.sin(2 * np.pi * 2 * fundamental_freq * time) + \
         0.05 * np.random.normal(0, 0.1, n)
    
    # Radial horizontal (ay): similar pattern with phase shift
    ay = 0.25 * np.sin(2 * np.pi * fundamental_freq * time + np.pi/4) + \
         0.08 * np.sin(2 * np.pi * 2 * fundamental_freq * time + np.pi/4) + \
         0.05 * np.random.normal(0, 0.1, n)
    
    # Radial vertical (az): similar pattern with different phase
    az = 0.25 * np.sin(2 * np.pi * fundamental_freq * time + np.pi/2) + \
         0.08 * np.sin(2 * np.pi * 2 * fundamental_freq * time + np.pi/2) + \
         0.05 * np.random.normal(0, 0.1, n)
    
    return ax, ay, az


def generate_bearing_failure(time, fundamental_freq):
    """
    Generate bearing failure vibration.
    Characteristics: Increased vibration, especially in radial axes.
    """
    n = len(time)
    
    # Bearing failure: higher amplitude, more noise in radial directions
    # Axial (ax): moderate increase
    ax = 0.4 * np.sin(2 * np.pi * fundamental_freq * time) + \
         0.15 * np.sin(2 * np.pi * 2 * fundamental_freq * time) + \
         0.1 * np.random.normal(0, 0.15, n)
    
    # Radial horizontal (ay): significantly increased
    ay = 0.6 * np.sin(2 * np.pi * fundamental_freq * time + np.pi/4) + \
         0.2 * np.sin(2 * np.pi * 2 * fundamental_freq * time + np.pi/4) + \
         0.15 * np.random.normal(0, 0.2, n)
    
    # Radial vertical (az): significantly increased
    az = 0.6 * np.sin(2 * np.pi * fundamental_freq * time + np.pi/2) + \
         0.2 * np.sin(2 * np.pi * 2 * fundamental_freq * time + np.pi/2) + \
         0.15 * np.random.normal(0, 0.2, n)
    
    return ax, ay, az


def generate_misalignment(time, fundamental_freq):
    """
    Generate misalignment vibration.
    Characteristics: Asymmetric patterns, phase differences between axes.
    """
    n = len(time)
    
    # Misalignment: asymmetric vibration, phase shifts
    # Axial (ax): moderate increase
    ax = 0.35 * np.sin(2 * np.pi * fundamental_freq * time) + \
         0.12 * np.sin(2 * np.pi * 2 * fundamental_freq * time) + \
         0.08 * np.random.normal(0, 0.12, n)
    
    # Radial horizontal (ay): asymmetric pattern
    ay = 0.5 * np.sin(2 * np.pi * fundamental_freq * time + np.pi/3) + \
         0.15 * np.sin(2 * np.pi * 2 * fundamental_freq * time + np.pi/6) + \
         0.12 * np.random.normal(0, 0.18, n)
    
    # Radial vertical (az): different phase, higher amplitude
    az = 0.55 * np.sin(2 * np.pi * fundamental_freq * time + 2*np.pi/3) + \
         0.18 * np.sin(2 * np.pi * 2 * fundamental_freq * time + np.pi/3) + \
         0.12 * np.random.normal(0, 0.18, n)
    
    return ax, ay, az


def generate_imbalance(time, fundamental_freq):
    """
    Generate imbalance vibration.
    Characteristics: High amplitude in one radial axis, rotational patterns.
    """
    n = len(time)
    
    # Imbalance: very high amplitude in radial directions
    # Axial (ax): relatively normal
    ax = 0.3 * np.sin(2 * np.pi * fundamental_freq * time) + \
         0.1 * np.sin(2 * np.pi * 2 * fundamental_freq * time) + \
         0.06 * np.random.normal(0, 0.1, n)
    
    # Radial horizontal (ay): very high amplitude
    ay = 0.8 * np.sin(2 * np.pi * fundamental_freq * time + np.pi/4) + \
         0.25 * np.sin(2 * np.pi * 2 * fundamental_freq * time + np.pi/4) + \
         0.2 * np.random.normal(0, 0.25, n)
    
    # Radial vertical (az): very high amplitude, phase shifted
    az = 0.85 * np.sin(2 * np.pi * fundamental_freq * time + np.pi/2) + \
         0.25 * np.sin(2 * np.pi * 2 * fundamental_freq * time + np.pi/2) + \
         0.2 * np.random.normal(0, 0.25, n)
    
    return ax, ay, az

# ==============================================================================
# CSV FILE GENERATION
# ==============================================================================

def generate_and_save_csv(condition, condition_func, file_number, output_dir):
    """
    Generate a single CSV file for a given condition.
    
    Args:
        condition: Condition name (e.g., 'normal', 'bearing')
        condition_func: Function to generate vibration data
        file_number: File number for naming
        output_dir: Base directory (train/ or test/)
    """
    # Create condition subdirectory
    condition_dir = os.path.join(output_dir, condition)
    os.makedirs(condition_dir, exist_ok=True)
    
    # Generate time vector
    time = np.arange(0, DURATION, 1/SAMPLING_RATE)
    
    # Generate vibration data
    ax, ay, az = condition_func(time, FUNDAMENTAL_FREQ)
    
    # Create DataFrame
    df = pd.DataFrame({
        'time': time,
        'ax': ax,
        'ay': ay,
        'az': az,
        'label': condition
    })
    
    # Save to CSV in condition subdirectory
    filename = f"{file_number:03d}.csv"
    filepath = os.path.join(condition_dir, filename)
    df.to_csv(filepath, index=False)
    
    return filepath

# ==============================================================================
# MAIN DATASET GENERATION
# ==============================================================================

def create_dataset():
    """
    Generate complete dataset with train/test split.
    """
    conditions = {
        'normal': generate_normal_vibration,
        'bearing': generate_bearing_failure,
        'misalignment': generate_misalignment,
        'imbalance': generate_imbalance
    }
    
    print("="*60)
    print("Motor Vibration Dataset Generation")
    print("="*60)
    print(f"Conditions: {list(conditions.keys())}")
    print(f"Samples per condition: {SAMPLES_PER_CONDITION}")
    print(f"Train/Test ratio: {TRAIN_RATIO:.0%}/{1-TRAIN_RATIO:.0%}")
    print(f"Duration per sample: {DURATION} seconds")
    print(f"Sampling rate: {SAMPLING_RATE} Hz")
    print(f"Samples per file: {NUM_SAMPLES}")
    print("="*60)
    print()
    
    total_train = 0
    total_test = 0
    
    for condition, func in conditions.items():
        print(f"Generating {condition} condition...")
        
        # Calculate train/test split
        num_train = int(SAMPLES_PER_CONDITION * TRAIN_RATIO)
        num_test = SAMPLES_PER_CONDITION - num_train
        
        # Generate training files
        for i in range(1, num_train + 1):
            generate_and_save_csv(condition, func, i, TRAIN_DIR)
            total_train += 1
        
        # Generate test files
        for i in range(1, num_test + 1):
            generate_and_save_csv(condition, func, i, TEST_DIR)
            total_test += 1
        
        print(f"  [OK] Generated {num_train} train files, {num_test} test files")
    
    print()
    print("="*60)
    print("Dataset Generation Complete!")
    print("="*60)
    print(f"Total training files: {total_train}")
    print(f"Total test files: {total_test}")
    print(f"Total files: {total_train + total_test}")
    print()
    print(f"Training files saved to: {TRAIN_DIR}/<condition>/")
    print(f"Test files saved to: {TEST_DIR}/<condition>/")
    print("="*60)

# ==============================================================================
# RUN GENERATION
# ==============================================================================

if __name__ == "__main__":
    create_dataset()

