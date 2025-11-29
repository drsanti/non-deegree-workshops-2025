# Python Matplotlib: Signal Generation and Visualization Workshops

A comprehensive collection of hands-on workshops for learning signal generation, noise analysis, filtering, and visualization using Python's NumPy and Matplotlib libraries.

## 📋 Project Description

This project provides a progressive learning path through **5 practical examples** that teach signal processing and visualization fundamentals. You'll learn to:

- Generate different types of signals (sine, square, sawtooth waves)
- Add and analyze noise in signals
- Apply filters to reduce noise
- Visualize signals in time and frequency domains using FFT
- Create publication-quality plots with advanced matplotlib techniques

### What You'll Learn

- **Signal Generation**: Create periodic waveforms using NumPy
- **Noise Analysis**: Understand and measure Signal-to-Noise Ratio (SNR)
- **Signal Filtering**: Apply filters to clean noisy signals
- **Frequency Analysis**: Use Fast Fourier Transform (FFT) for frequency domain analysis
- **Data Visualization**: Create professional plots with matplotlib
- **Code Organization**: Write modular, reusable functions

---

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd python-matplotlib
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Verify installation:**
   ```bash
   python example.py
   ```
   You should see a plot displaying a sine wave.

---

## 📁 Project Structure

```
python-matplotlib/
├── workshops/         # Python example scripts (example1.py - example5.py)
├── docs/              # Comprehensive documentation for each example
│   ├── example1.md   # Basic Sine Wave Generation
│   ├── example2.md   # Multiple Signal Types
│   ├── example3.md   # Adding Noise to Signals
│   ├── example4.md   # Signal Filtering and FFT
│   └── example5.md   # Advanced Visualization
├── example.py         # Basic matplotlib demonstration
├── requirements.txt   # Python dependencies
├── .gitignore        # Git ignore file
└── README.md         # This file
```

---

## 🎯 How to Run the Examples

### Important: Use the Virtual Environment

Always activate the virtual environment before running examples. The examples require packages installed in the virtual environment.

### Running Workshop Examples

1. **Make sure the virtual environment is activated** (you should see `(venv)` in your terminal prompt)

2. **Run any example from the workshops directory:**
   ```bash
   # From the python-matplotlib directory
   python workshops/example1.py
   python workshops/example2.py
   python workshops/example3.py
   python workshops/example4.py
   python workshops/example5.py
   ```

3. **Or use the virtual environment Python directly:**
   ```bash
   # On Windows
   venv\Scripts\python.exe workshops/example1.py
   
   # On macOS/Linux
   venv/bin/python workshops/example1.py
   ```

### What Each Example Does

- **Example 1**: Generates and displays a basic sine wave
- **Example 2**: Shows three different signal types (sine, square, sawtooth)
- **Example 3**: Adds noise to signals and calculates SNR
- **Example 4**: Applies filtering and performs FFT analysis
- **Example 5**: Comprehensive analysis with all signal types, noise, filtering, and statistics

---

## 📚 Table of Contents

Click on any example below to view its detailed documentation:

### [Example 1: Basic Sine Wave Generation and Visualization](docs/example1.md)

**Topics Covered:**
- Sine wave mathematics and formula
- Generating signals with NumPy
- Basic matplotlib plotting
- Time-domain visualization
- Signal parameters (frequency, amplitude, sample rate)

**Key Concepts:** Signal generation, time-domain plots, matplotlib basics

---

### [Example 2: Multiple Signal Types](docs/example2.md)

**Topics Covered:**
- Three waveform types: sine, square, and sawtooth waves
- NumPy-based signal generation (no external libraries)
- Creating subplots for comparison
- Waveform characteristics and mathematics
- Fourier series concepts

**Key Concepts:** Periodic signals, subplots, waveform comparison

---

### [Example 3: Adding Noise to Signals](docs/example3.md)

**Topics Covered:**
- White noise and Gaussian noise generation
- Signal-to-Noise Ratio (SNR) calculation
- Adding noise to clean signals
- Visualizing clean vs noisy signals
- SNR interpretation and quality metrics

**Key Concepts:** Noise types, SNR calculation, signal quality assessment

---

### [Example 4: Signal Filtering and Frequency Domain Analysis](docs/example4.md)

**Topics Covered:**
- Moving average filter implementation
- Fast Fourier Transform (FFT) for frequency analysis
- Time-domain vs frequency-domain visualization
- Filter effectiveness evaluation
- SNR improvement measurement

**Key Concepts:** Signal filtering, FFT, frequency domain analysis

---

### [Example 5: Advanced Signal Visualization and Analysis](docs/example5.md)

**Topics Covered:**
- Modular function design
- Advanced matplotlib layouts (GridSpec)
- Comprehensive multi-signal analysis
- Signal statistics calculation
- Export capabilities for publications
- Code organization best practices

**Key Concepts:** Advanced visualization, modular programming, statistics

---

## 📖 Learning Path

The workshops are designed to be followed **sequentially**, with each example building upon concepts from previous ones:

1. **Example 1** → Start here: Learn basic signal generation and plotting
2. **Example 2** → Explore different signal types and subplot creation
3. **Example 3** → Understand noise and signal quality metrics
4. **Example 4** → Master filtering and frequency analysis
5. **Example 5** → Apply all concepts in an advanced, comprehensive example

**Recommended Approach:**
1. Read the documentation for each example (in `docs/`)
2. Run the example script (in `workshops/`)
3. Modify parameters and experiment
4. Complete the exercises in the documentation
5. Move to the next example

---

## 📦 Dependencies

This project uses the following Python packages:

- **matplotlib** (>=3.8.0) - Core plotting library for data visualization
- **numpy** (>=1.26.0) - Numerical computing and array operations
- **pandas** (>=2.1.0) - Data manipulation (optional, for data analysis examples)

All dependencies are specified in `requirements.txt` and will be installed automatically when you run `pip install -r requirements.txt`.

---

## 💡 Tips for Success

1. **Always activate the virtual environment** before running examples
2. **Read the documentation** in `docs/` before running each example
3. **Experiment with parameters** to understand how they affect the results
4. **Complete the exercises** provided in each documentation file
5. **Follow the sequence** - examples build upon each other

---

## 🛠️ Troubleshooting

### "ModuleNotFoundError: No module named 'numpy'"

**Solution:** Make sure you've activated the virtual environment:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### Plots not displaying

**Solution:** Ensure you're running in an environment that supports GUI displays. If using SSH or headless mode, consider:
- Using `plt.savefig('output.png')` instead of `plt.show()`
- Setting matplotlib backend: `matplotlib.use('Agg')`

### Import errors

**Solution:** Reinstall dependencies:
```bash
pip install --upgrade -r requirements.txt
```

---

## 📚 Additional Resources

- [Matplotlib Documentation](https://matplotlib.org/stable/contents.html) - Complete matplotlib reference
- [Matplotlib Gallery](https://matplotlib.org/stable/gallery/index.html) - Plot examples and code
- [NumPy Documentation](https://numpy.org/doc/stable/) - NumPy reference guide
- [Signal Processing Basics](https://en.wikipedia.org/wiki/Signal_processing) - Signal processing concepts

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements, additional examples, or find bugs, please feel free to:
- Submit issues
- Create pull requests
- Provide feedback

---

## 📄 License

This project is part of the non-degree workshops series.

---

## 🎓 Getting Help

If you encounter any issues or have questions:

1. Check the documentation in the `docs/` folder for detailed explanations
2. Review the code comments in the example scripts
3. Consult the troubleshooting section above
4. Refer to the official documentation links in Additional Resources

**Happy Learning! 🚀**
