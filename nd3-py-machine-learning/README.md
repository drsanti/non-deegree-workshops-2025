# Machine Learning for Industrial Sensor Data (Python)

A comprehensive 10-chapter tutorial on machine learning for industrial sensor data using Python, covering data generation, traditional ML algorithms, and deep learning for fault detection.

## Overview

This tutorial teaches machine learning concepts through hands-on examples with synthetic industrial sensor data. All data is generated directly in code—no external files needed.

### Chapters

**Chapters 1-3: Data Generation and Visualization**
- Chapter 1: Generate Synthetic Industrial Sensor Data
- Chapter 2: Preprocessing & Feature Engineering
- Chapter 3: Advanced Visualization & Exploratory Data Analysis

**Chapters 4-7: Machine Learning Algorithms (scikit-learn)**
- Chapter 4: Linear Regression for Sensor Value Prediction
- Chapter 5: Logistic Regression for Binary Classification
- Chapter 6: Decision Trees and Random Forest
- Chapter 7: K-means Clustering and SVM for Anomaly Detection

**Chapters 8-10: TensorFlow for Fault Detection**
- Chapter 8: Binary Fault Classification with Neural Networks
- Chapter 9: Multi-class Fault Detection
- Chapter 10: Time-series Fault Prediction with LSTM

## Setup Instructions

### Prerequisites

- **Python 3.11.9** (required for all chapters including TensorFlow support)
  - Check your Python version: `python --version`
  - If you don't have Python 3.11.9, download from [python.org](https://www.python.org/downloads/release/python-3119/)
- pip (Python package installer)

### Option 1: Using Virtual Environment (Recommended)

1. **Create a virtual environment:**
   
   **If Python 3.11.9 is in your PATH:**
   ```bash
   python -m venv venv
   ```
   
   **If Python 3.11.9 is installed in `C:\Python311` (Windows):**
   ```bash
   # Windows Command Prompt/PowerShell
   C:\Python311\python.exe -m venv venv
   
   # Git Bash
   /c/Python311/python.exe -m venv venv
   ```
   
   **If using pyenv:**
   ```bash
   # Set Python 3.11.9 for this project
   pyenv local 3.11.9
   python -m venv venv
   ```

2. **Activate the virtual environment:**
   
   On Windows (Command Prompt or PowerShell):
   ```bash
   venv\Scripts\activate
   ```
   
   On Windows (Git Bash):
   ```bash
   source venv/Scripts/activate
   ```
   
   On macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

3. **Verify Python version:**
   ```bash
   python --version
   # Should show: Python 3.11.9
   ```

4. **Install dependencies:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

5. **Verify installation:**
   ```bash
   python -c "import numpy, pandas, matplotlib, sklearn, tensorflow; print('All packages installed successfully!')"
   ```

### Option 2: Using Automated Setup Scripts

**Windows (Command Prompt):**
```bash
setup.bat
```

**Windows (Git Bash) or Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

The setup script will automatically:
- Create a virtual environment
- Activate it
- Install all dependencies
- Verify the installation

### Option 3: Using Conda

1. **Create a conda environment:**
   ```bash
   conda create -n ml-sensors python=3.11.9
   conda activate ml-sensors
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Running the Code

### Run Individual Chapters

Navigate to the `codes` directory and run any chapter:

```bash
cd codes
python chapter01.py
python chapter02.py
# ... etc
```

### Expected Output

Each chapter will:
- Generate synthetic sensor data
- Perform analysis or train models
- Create visualizations (saved as PNG files)
- Print results and statistics to console

### Output Files

Chapters generate output files in the `codes/output/` directory:
- `output/chapter01-sensors.png`
- `output/chapter02-preprocessing.png`
- `output/chapter03-correlation.png`
- etc.

The `output/` directory is automatically created when you run any chapter.

## Project Structure

```
nd3-py-machine-learning/
├── codes/              # Python code files for each chapter
│   ├── chapter01.py
│   ├── chapter02.py
│   ├── output/         # Generated PNG files (created automatically)
│   │   ├── chapter01-sensors.png
│   │   ├── chapter02-preprocessing.png
│   │   └── ...
│   └── ...
├── docs/               # Documentation for each chapter
│   ├── chapter01.md
│   ├── chapter02.md
│   └── ...
├── requirements.txt    # Python dependencies
└── README.md           # This file
```

## Dependencies

### Core Libraries
- **NumPy**: Numerical computing
- **Pandas**: Data manipulation and analysis
- **Matplotlib**: Plotting and visualization
- **Seaborn**: Statistical visualizations

### Machine Learning
- **scikit-learn**: Traditional ML algorithms (chapters 4-7)
- **TensorFlow**: Deep learning framework (chapters 8-10)

### Scientific Computing
- **SciPy**: Scientific computing utilities

## Learning Path

1. **Start with Chapter 1**: Learn to generate synthetic sensor data
2. **Progress sequentially**: Each chapter builds on previous concepts
3. **Read documentation**: Check `docs/` folder for detailed explanations
4. **Experiment**: Modify code to see how changes affect results
5. **Practice**: Try applying techniques to your own data

## Troubleshooting

### Git Bash Specific Notes

If you're using Git Bash on Windows:
- Use forward slashes (`/`) instead of backslashes (`\`) in paths
- Use `source venv/Scripts/activate` (not `venv\Scripts\activate`)
- If Python 3.11.9 is in `C:\Python311`, use: `/c/Python311/python.exe -m venv venv`
- Check Python version: `python --version` or `python3 --version`

### Python 3.11.9 Not Found

**If `python --version` doesn't show Python 3.11.9:**

1. **Check if Python 3.11.9 is installed:**
   ```bash
   # Windows
   C:\Python311\python.exe --version
   # or
   /c/Python311/python.exe --version  # Git Bash
   ```

2. **If not installed, download and install:**
   - Download from [python.org](https://www.python.org/downloads/release/python-3119/)
   - During installation, check "Add Python to PATH"
   - Or install to `C:\Python311` and use the full path

3. **Create venv using full path:**
   ```bash
   # Windows Command Prompt
   C:\Python311\python.exe -m venv venv
   
   # Git Bash
   /c/Python311/python.exe -m venv venv
   ```

### Using pyenv with Python 3.11.9

If you're using pyenv:

1. **Install Python 3.11.9:**
   ```bash
   pyenv install 3.11.9
   ```

2. **Set it for this project:**
   ```bash
   cd nd3-py-machine-learning
   pyenv local 3.11.9
   ```

3. **Verify:**
   ```bash
   python --version
   # Should show: Python 3.11.9
   ```

4. **Create venv:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   ```

### Import Errors

If you get import errors, make sure:
- Virtual environment is activated (you should see `(venv)` in your prompt)
- All packages are installed: `pip install -r requirements.txt`
- Python version is 3.11.9: `python --version`
- You're using the correct Python interpreter (check with `which python` on Git Bash/Linux or `where python` on Windows)

### TensorFlow Installation Issues

**If TensorFlow installation fails:**
1. Verify Python version is 3.11.9: `python --version`
2. Upgrade pip: `pip install --upgrade pip`
3. Try: `pip install tensorflow --upgrade`
4. For Apple Silicon (M1/M2): Use `tensorflow-macos`
5. Check TensorFlow compatibility: TensorFlow 2.8+ supports Python 3.11.9

### Matplotlib Display Issues

If plots don't display:
- On Linux, you may need: `sudo apt-get install python3-tk`
- Or use: `plt.savefig()` instead of `plt.show()`

## Additional Resources

- [NumPy Documentation](https://numpy.org/doc/)
- [Pandas Documentation](https://pandas.pydata.org/docs/)
- [scikit-learn Documentation](https://scikit-learn.org/)
- [TensorFlow Documentation](https://www.tensorflow.org/)

## License

This tutorial is provided for educational purposes.

## Contributing

Feel free to experiment with the code and adapt it for your own projects!
