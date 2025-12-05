# Node.js TypeScript Tutorial: IoT Sensor Data Processing

A comprehensive 10-chapter tutorial series on industrial IoT sensor data processing, signal analysis, and visualization using Node.js, TypeScript, and Vega.

## Overview

This tutorial covers the complete pipeline for processing industrial sensor data, from basic signal generation to advanced multi-sensor fusion and fault diagnosis. Each chapter builds on previous concepts with practical implementations and visualizations.

### Tutorial Structure

1. **Chapter 1: Signal Generation and Sampling** - Synthetic signals, digital sampling, time-domain visualization
2. **Chapter 2: Noise and Random Processes** - Gaussian noise, SNR analysis
3. **Chapter 3: Digital Filters - Butterworth Design** - IIR filters (lowpass, highpass), frequency response
4. **Chapter 4: Digital Filters - Advanced Applications** - Bandpass, bandstop, multi-stage filtering
5. **Chapter 5: Fourier Analysis Fundamentals** - FFT, windowing, spectrum analysis
6. **Chapter 6: Advanced FFT Applications** - PSD, spectrograms, time-frequency analysis
7. **Chapter 7: Vibration Analysis - Time Domain** - Bearing faults, RMS, crest factor, kurtosis
8. **Chapter 8: Vibration Analysis - Frequency Domain** - Defect frequencies, envelope analysis
9. **Chapter 9: Real-Time Data Processing** - Circular buffers, sliding window FFT, Canvas spectrograms
10. **Chapter 10: Multi-Sensor Fusion** - Multi-sensor systems, anomaly detection, fault diagnosis

## Features

- **Modern TypeScript**: ES2022 modules, type-safe development with tsx runtime
- **Signal Processing**: IIR filters, FFT, PSD, spectrograms, bearing fault detection
- **Data Visualization**: Vega-Lite 6 + Vega 5 for interactive SVG charts, Canvas for pixel-perfect rendering
- **Synthetic Data**: Realistic sensor simulations (vibration, temperature, current, acoustic)
- **Real-world Applications**: Predictive maintenance, condition monitoring, multi-sensor fusion

## Prerequisites

- Node.js v18+ (ES module support)
- npm or yarn package manager
- Basic understanding of signal processing concepts (helpful but not required)

## Installation

```bash
# Navigate to the workshop directory
cd non-deegree-workshops-2025/nd2-node-data-processing

# Install dependencies
npm install
```

## Usage

Run any chapter using npm scripts:

```bash
npm run chapter01  # Signal Generation and Sampling
npm run chapter02  # Noise and Random Processes
npm run chapter03  # Digital Filters - Butterworth Design
npm run chapter04  # Digital Filters - Advanced Applications
npm run chapter05  # Fourier Analysis Fundamentals
npm run chapter06  # Advanced FFT Applications
npm run chapter07  # Vibration Analysis - Time Domain
npm run chapter08  # Vibration Analysis - Frequency Domain
npm run chapter09  # Real-Time Data Processing
npm run chapter10  # Multi-Sensor Fusion
```

Or run directly with tsx:

```bash
tsx codes/chapter01.ts
```

## Project Structure

```
nd2-node-data-processing/
├── codes/             # TypeScript implementation files (.ts)
│   ├── chapter01.ts   # Signal generation and sampling
│   ├── chapter02.ts   # Noise and random processes
│   ├── chapter03.ts   # Butterworth filter design
│   ├── chapter04.ts   # Advanced filter applications
│   ├── chapter05.ts   # FFT fundamentals
│   ├── chapter06.ts   # Advanced FFT (PSD, spectrograms)
│   ├── chapter07.ts   # Vibration time-domain analysis
│   ├── chapter08.ts   # Vibration frequency-domain analysis
│   ├── chapter09.ts   # Real-time processing with spectrograms
│   └── chapter10.ts   # Multi-sensor fusion and diagnosis
├── docs/              # Markdown documentation (.md)
│   ├── chapter01.md   # Detailed explanations and theory
│   ├── ...
│   ├── chapter10.md
│   └── plan.md        # Tutorial series planning document
├── outputs/           # Generated visualizations (SVG/HTML/PNG)
│   ├── chapter01/     # Chapter-specific output folders
│   ├── ...
│   └── chapter10/
├── package.json       # Dependencies and npm scripts
├── tsconfig.json      # TypeScript ES2022 configuration
└── README.md          # This file
```

## Dependencies

- **tsx** (v4.21.0): Fast TypeScript execution without compilation
- **typescript** (v5.7.2): TypeScript compiler and type definitions
- **vega** (v5.31.0): Declarative visualization grammar
- **vega-lite** (v5.22.1): High-level visualization specification
- **@types/node**: Node.js type definitions
- **fft.js** (v4.0.4): Fast Fourier Transform library
- **canvas** (v2.11.2): Node.js Canvas for pixel-perfect rendering

## Output Formats

All chapters generate visualizations in multiple formats:

- **SVG files**: Scalable vector graphics for publications and presentations
- **HTML files**: Interactive visualizations (open in web browser with Vega-Embed)
- **PNG files**: Raster images (Chapter 9 spectrograms only)

Outputs are organized in `outputs/chapter##/` directories.

## Key Concepts Covered

### Signal Processing Fundamentals
- Digital sampling and Nyquist theorem
- Gaussian noise generation (Box-Muller transform)
- IIR filter design (Butterworth, coefficients calculation)
- Frequency response analysis (Bode plots)
- FFT and spectrum analysis
- Windowing functions (Hann, Hamming)

### Vibration Analysis
- Bearing fault signatures (BPFO, BPFI, BSF, FTF)
- Time-domain features (RMS, peak, crest factor, kurtosis)
- Frequency-domain features (peak detection, envelope analysis)
- Spectrogram interpretation for transient events
- Real-time monitoring with circular buffers

### Advanced Techniques
- Sliding window analysis with high overlap
- Canvas-based pixel-perfect spectrogram rendering
- Multi-sensor time synchronization
- Cross-correlation for sensor relationships
- Feature extraction (26 features from 4 sensors)
- Anomaly detection (Mahalanobis distance, 3-sigma)
- Fault diagnosis (decision voting system)

## Chapter Highlights

### Chapter 9: Real-Time Processing
- **Circular Buffer**: Memory-efficient 512-sample ring buffer
- **Dual Buffers**: Separate raw (FFT) and filtered (display) streams
- **Spectrogram**: Canvas-based 1000×500 pixel PNG with turbo colormap
- **High Overlap**: 93.75% overlap (256-sample window, 16-sample hop)
- **SVG Wrapper**: Procedurally generated axis labels and tick marks

### Chapter 10: Multi-Sensor Fusion
- **4 Sensors**: Vibration, temperature, current, acoustic (synchronized)
- **26 Features**: Time-domain + frequency-domain from each sensor
- **Anomaly Detection**: Statistical Mahalanobis distance with baseline training
- **Fault Diagnosis**: Rule-based voting for bearing wear, unbalance, misalignment, electrical faults
- **Correlation Matrix**: Pearson coefficients reveal sensor relationships
- **5 Visualizations**: Multi-sensor time series, correlation heatmap, anomaly timeline, fault diagnosis, feature evolution

## Example Results

### Chapter 8: Bearing Defect Frequencies
```
Motor Speed: 1800 RPM (30 Hz)
Bearing: SKF 6205
  Ball Diameter: 7.5 mm
  Pitch Diameter: 39.0 mm
  Number of Balls: 9
  Contact Angle: 0°

Calculated Frequencies:
  BPFO = 107.38 Hz (Outer race defect)
  BPFI = 161.62 Hz (Inner race defect)
  BSF = 53.11 Hz (Ball spin)
  FTF = 11.93 Hz (Cage frequency)
```

### Chapter 10: Multi-Sensor Fusion Results
```
Simulated System:
  Duration: 60 seconds
  Sampling Rate: 200 Hz
  Total Samples: 12,000 per sensor
  Feature Vectors: 89 (512-sample windows, 128-sample hop)

Anomaly Detection:
  Training: 30 normal samples (first 20 seconds)
  Detected: 61 anomalies (68.5% of test data)
  Fault Onset: t=20s (correctly identified)

Fault Diagnosis:
  Bearing Wear: 59 windows (66.3%)
  Normal: 30 windows (33.7%)

Sensor Correlations:
  vibration ↔ acoustic: 0.365 (moderate positive)
  temperature ↔ current: -0.112 (weak negative)
```

## Practical Applications

- **Predictive Maintenance**: Early detection of bearing faults, unbalance, misalignment
- **Condition Monitoring**: Continuous health assessment of rotating machinery
- **Quality Control**: Vibration analysis in manufacturing processes
- **IoT Edge Computing**: Real-time processing on embedded devices
- **Research & Development**: Algorithm validation for industrial diagnostics

## Performance Notes

- **Memory Efficiency**: Circular buffers maintain constant O(n) memory
- **Computational Complexity**: FFT O(n log n), feature extraction O(n)
- **Visualization**: Vega for interactive charts, Canvas for pixel-perfect rendering
- **Processing Time**: Chapter 10 completes in ~5 seconds (60s simulation, 12,000 samples, 89 feature vectors)

## Educational Progression

```
Foundation (Ch 1-2)
    ↓
Filtering (Ch 3-4)
    ↓
Frequency Analysis (Ch 5-6)
    ↓
Vibration Analysis (Ch 7-8)
    ↓
Real-Time Processing (Ch 9)
    ↓
Multi-Sensor Fusion (Ch 10)
```

## Future Extensions

Possible enhancements for advanced learners:

1. **Machine Learning Integration**: Replace rule-based diagnosis with ML classifiers (SVM, Random Forest, Neural Networks)
2. **Adaptive Filtering**: Implement LMS/RLS algorithms for time-varying noise cancellation
3. **Wavelet Analysis**: Add continuous/discrete wavelet transforms for non-stationary signals
4. **Hardware Integration**: Interface with actual sensors (MEMS accelerometers, thermocouples, current clamps)
5. **Database Storage**: InfluxDB or TimescaleDB for time-series data persistence
6. **Real-Time Dashboard**: WebSocket-based live monitoring with React/Vue frontend
7. **Edge Deployment**: Optimize for Raspberry Pi or industrial PLCs

## Troubleshooting

### Common Issues

**Issue**: `Cannot find module 'canvas'`  
**Solution**: Install native dependencies: `npm install canvas` (requires Python and C++ build tools on Windows)

**Issue**: SVG files not displaying properly  
**Solution**: Open the corresponding `.html` file in a web browser instead

**Issue**: FFT size warnings  
**Solution**: Ensure signal length is sufficient for the FFT window size (minimum 256 samples recommended)

## References

- **Signal Processing**: Oppenheim & Schafer, *Discrete-Time Signal Processing* (Prentice Hall)
- **Vibration Analysis**: Harris & Crede, *Shock and Vibration Handbook* (McGraw-Hill)
- **FFT Algorithm**: Cooley & Tukey, "An Algorithm for the Machine Calculation of Complex Fourier Series" (1965)
- **Bearing Diagnostics**: ISO 10816, ISO 20816 (Mechanical vibration measurement standards)
- **Anomaly Detection**: Chandola et al., "Anomaly Detection: A Survey" (ACM Computing Surveys, 2009)

## Contributing

This tutorial is designed for educational purposes. Contributions are welcome:

- **Bug Fixes**: Submit issues or pull requests for corrections
- **Documentation**: Improve clarity, add examples, fix typos
- **New Chapters**: Propose additional topics (wavelet analysis, ML integration, etc.)
- **Real Datasets**: Contribute actual industrial sensor data examples

## License

Educational use only. Attribution required for derivative works.

## Author

Created for **Non-Degree Workshops 2025**  
Workshop Series: *Sensor Data Processing for Industrial IoT*

## Contact

For questions, feedback, or collaboration:
- Open an issue in the GitHub repository
- Submit pull requests with improvements
- Share your implementations and results

---

**🚀 Happy Learning!**

*Master industrial sensor data processing with hands-on TypeScript implementations and real-world applications.*

---

## Quick Start Example

```bash
# Run all chapters in sequence
npm run chapter01 && \
npm run chapter02 && \
npm run chapter03 && \
npm run chapter04 && \
npm run chapter05 && \
npm run chapter06 && \
npm run chapter07 && \
npm run chapter08 && \
npm run chapter09 && \
npm run chapter10

# View results
open outputs/chapter10/multi-sensor-time-series.html
open outputs/chapter10/fault-diagnosis.html
open outputs/chapter09/spectrogram.html
```

**Total Runtime**: ~30-40 seconds for all 10 chapters  
**Total Visualizations**: 40+ SVG/HTML files  
**Lines of Code**: ~3,500 (including documentation)

---

## Acknowledgments

Special thanks to:
- **Vega Team**: Declarative visualization grammar
- **Node.js Community**: TypeScript and modern JavaScript tooling
- **Industrial IoT Practitioners**: Real-world feedback on predictive maintenance applications
- **Students and Educators**: Testing and improving this tutorial series

**Version**: 1.0.0 (January 2025)  
**Status**: ✅ Complete (10/10 chapters)

- **TypeScript**: Type-safe JavaScript
- **tsx**: Execute TypeScript files directly
- **Vega + Vega-Lite**: Data visualization
- **canvas**: Render visualizations to images
- **fft.js**: Fast Fourier Transform implementation

## Learning Path

1. Start with Chapter 1 to understand sensor data basics
2. Progress through chapters sequentially
3. Each chapter builds on previous concepts
4. Experiment with parameters and code
5. Check the `outputs/` directory for visualizations

## License

ISC
