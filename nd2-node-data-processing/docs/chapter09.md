# Chapter 9: Real-Time Data Processing and Streaming

## Introduction to Real-Time Processing

In IoT and industrial applications, sensors generate continuous streams of data that must be processed in real-time. Unlike batch processing where all data is available upfront, **real-time processing** handles data as it arrives, providing immediate insights and enabling rapid response to changing conditions.

### Why Real-Time Processing?

**Benefits**:
- **Immediate anomaly detection** - Respond to faults within milliseconds
- **Continuous monitoring** - Always-on surveillance of equipment health
- **Low latency** - Minimal delay between data acquisition and actionable insights
- **Memory efficiency** - Process data incrementally without storing entire history
- **Adaptive control** - Real-time feedback for process optimization

**Applications**:
- Predictive maintenance alerts
- Process control systems
- Safety monitoring and emergency shutdown
- Quality control in manufacturing
- Energy management and optimization

### Challenges

1. **Limited memory** - Can't store infinite history
2. **Computational constraints** - Must process faster than data arrives
3. **Causality** - Can only use current and past data (no future information)
4. **Stationarity** - Signal characteristics may change over time
5. **Latency requirements** - Strict timing constraints

## Streaming Data Concepts

### Data Arrival Patterns

**Continuous streams**:
- Data arrives at regular intervals (e.g., every 10 ms)
- Timestamp for each sample
- May have occasional gaps or irregularities

**Event-driven**:
- Data arrives when events occur
- Irregular timing
- Must handle bursts and quiet periods

### Buffer Management

A **circular buffer** (ring buffer) is essential for real-time processing:

```
[s1][s2][s3][s4][s5][s6][s7][s8]
      ^                    ^
      read                write
```

- Fixed size (e.g., 1024 samples)
- Write pointer advances as new data arrives
- Read pointer indicates oldest data
- When full, oldest data is overwritten
- Constant memory usage

### Sliding Window Processing

Process data in overlapping windows:

```
Time: 0----1----2----3----4----5----6----7----8
      [==Window 1==]
           [==Window 2==]
                [==Window 3==]
                     [==Window 4==]
```

**Parameters**:
- **Window size**: Number of samples per window (e.g., 1024)
- **Hop size**: Samples to advance between windows (e.g., 256)
- **Overlap**: `(window_size - hop_size) / window_size` (e.g., 75%)

**Trade-offs**:
- Larger windows → Better frequency resolution, more latency
- Smaller hop → Smoother results, more computation
- Larger overlap → Better temporal resolution, redundant processing

## Real-Time Filtering

### Recursive Filters (IIR)

**Advantages for real-time**:
- Minimal memory (only need recent samples)
- Low computational cost
- Constant latency

**Example: 2nd Order Butterworth Low-Pass**

```typescript
interface FilterState {
  x: [number, number, number]; // Input history [x[n], x[n-1], x[n-2]]
  y: [number, number, number]; // Output history [y[n], y[n-1], y[n-2]]
  b: number[]; // Feedforward coefficients
  a: number[]; // Feedback coefficients
}

function filterSample(input: number, state: FilterState): number {
  // Shift input history
  state.x[2] = state.x[1];
  state.x[1] = state.x[0];
  state.x[0] = input;
  
  // Calculate output
  const output = 
    state.b[0] * state.x[0] +
    state.b[1] * state.x[1] +
    state.b[2] * state.x[2] -
    state.a[1] * state.y[1] -
    state.a[2] * state.y[2];
  
  // Shift output history
  state.y[2] = state.y[1];
  state.y[1] = state.y[0];
  state.y[0] = output;
  
  return output;
}
```

**Key point**: Each new sample requires only 5 multiplications and 4 additions—extremely efficient!

### Moving Averages

**Simple Moving Average (SMA)**:
```typescript
class SMA {
  private buffer: number[];
  private sum: number = 0;
  private index: number = 0;
  
  constructor(private size: number) {
    this.buffer = new Array(size).fill(0);
  }
  
  update(value: number): number {
    this.sum -= this.buffer[this.index]; // Remove oldest
    this.buffer[this.index] = value;     // Add newest
    this.sum += value;
    this.index = (this.index + 1) % this.size; // Circular
    return this.sum / this.size;
  }
}
```

**Computational cost**: Only 3 operations per sample (subtract, add, divide) regardless of window size!

**Exponential Moving Average (EMA)**:
```typescript
class EMA {
  private value: number = 0;
  private alpha: number;
  
  constructor(span: number) {
    this.alpha = 2 / (span + 1); // Smoothing factor
  }
  
  update(newValue: number): number {
    this.value = this.alpha * newValue + (1 - this.alpha) * this.value;
    return this.value;
  }
}
```

**Advantage**: Even simpler—just 3 operations, no buffer needed!

## Real-Time FFT Analysis

### Sliding Window FFT

Process frequency content over time:

1. **Fill window** with recent samples (e.g., 1024)
2. **Apply window function** (Hann, Hamming)
3. **Compute FFT**
4. **Extract features** (peak frequencies, amplitudes)
5. **Advance window** by hop size
6. **Repeat**

### Computational Considerations

**FFT complexity**: $O(N \log N)$ where $N$ is FFT size

**Example timing** (1024-point FFT on modern CPU):
- Computation time: ~0.1 ms
- At 1 kHz sampling rate, new sample every 1 ms
- With 256-sample hop: new FFT every 256 ms
- Computational load: 0.1 ms / 256 ms = 0.04% CPU

**Conclusion**: Real-time FFT is very feasible on modern hardware!

### Short-Time Fourier Transform (STFT)

The **STFT** is the collection of FFTs from overlapping windows:

$$
STFT(t, f) = \sum_{n=0}^{N-1} x[n] \cdot w[n-t] \cdot e^{-j2\pi fn/N}
$$

Where:
- $x[n]$ = input signal
- $w[n]$ = window function centered at time $t$
- $f$ = frequency
- Result is 2D: time × frequency

**Visualization**: Spectrogram—color-coded time-frequency plot

### Feature Extraction

From each FFT, extract relevant features:

**Frequency domain**:
- Peak frequency (dominant component)
- Peak amplitude
- Spectral centroid (center of mass of spectrum)
- Spectral bandwidth
- Spectral rolloff (frequency below which X% of energy lies)

**Time domain** (from window):
- RMS value
- Peak value
- Crest factor (peak / RMS)
- Kurtosis (measure of impulsiveness)

**Trending**:
- Compare to baseline
- Rate of change
- Statistical process control (SPC) limits

## Memory Management Strategies

### Circular Buffer Implementation

```typescript
class CircularBuffer {
  private buffer: number[];
  private writeIndex: number = 0;
  private count: number = 0;
  
  constructor(private capacity: number) {
    this.buffer = new Array(capacity);
  }
  
  push(value: number): void {
    this.buffer[this.writeIndex] = value;
    this.writeIndex = (this.writeIndex + 1) % this.capacity;
    if (this.count < this.capacity) this.count++;
  }
  
  getWindow(size: number): number[] {
    if (size > this.count) return null; // Not enough data
    
    const window = new Array(size);
    let readIndex = (this.writeIndex - size + this.capacity) % this.capacity;
    
    for (let i = 0; i < size; i++) {
      window[i] = this.buffer[readIndex];
      readIndex = (readIndex + 1) % this.capacity;
    }
    
    return window;
  }
  
  isFull(): boolean {
    return this.count === this.capacity;
  }
}
```

### Memory Usage Optimization

**Fixed allocations**:
- Pre-allocate buffers at initialization
- Avoid `new Array()` or dynamic allocations in hot loops
- Reuse FFT input/output arrays

**Example for 1 kHz sensor**:
- Circular buffer: 4096 samples × 8 bytes = 32 KB
- FFT input: 2048 samples × 8 bytes = 16 KB
- FFT output: 2048 complex values × 16 bytes = 32 KB
- **Total**: ~80 KB per sensor (very manageable)

**For 100 sensors**: 8 MB total (easily fits in RAM)

### Downsampling for Long-Term Storage

For historical trending, downsample processed results:

```
High-rate: 1 kHz → Store RMS every 1 sec → 86,400 values/day
Moderate:  10 Hz → Store RMS every 10 sec → 8,640 values/day
Low:       0.1 Hz → Store RMS every 100 sec → 864 values/day
```

**Multi-resolution storage**:
- Real-time: 1 kHz, keep 10 seconds (10,000 values)
- Recent: 1 Hz, keep 1 hour (3,600 values)
- Historical: 0.01 Hz, keep forever (864 values/day)

## Latency Considerations

### Sources of Latency

1. **Sensor sampling** - Time to acquire signal (e.g., 1 ms @ 1 kHz)
2. **Buffer filling** - Wait for full window (e.g., 512 ms for 512 samples)
3. **Processing time** - Computation (e.g., 0.1 ms for FFT)
4. **Communication** - Network delay (e.g., 10-100 ms)
5. **Display/action** - Update visualization or control (e.g., 10 ms)

**Total latency**: Sum of all components

**Example**:
- Buffer: 512 samples @ 1 kHz = 512 ms
- Processing: 0.1 ms
- Network: 50 ms
- **Total**: ~560 ms

### Reducing Latency

**Smaller windows**:
- 512 samples → 512 ms
- 256 samples → 256 ms
- 128 samples → 128 ms
- Trade-off: Reduced frequency resolution

**Smaller hop size**:
- Update more frequently
- Higher computational load
- Smoother results

**Edge processing**:
- Compute features on sensor device
- Send only results, not raw data
- Reduces network latency

## Practical Implementation

### Simulated Streaming

For development and testing with time-varying signal characteristics:

```typescript
class SensorSimulator {
  private sampleIndex: number = 0;
  private samplingRate: number;
  
  constructor(samplingRate: number) {
    this.samplingRate = samplingRate;
  }
  
  generateSample(): number {
    const t = this.sampleIndex / this.samplingRate;
    let signal = 0;
    
    // Chirp 1: Linear frequency sweep from 5 Hz to 30 Hz
    const chirp1_f0 = 5, chirp1_f1 = 30;
    const chirp1_rate = (chirp1_f1 - chirp1_f0) / 5.0;
    const chirp1_phase = 2 * Math.PI * (chirp1_f0 * t + 0.5 * chirp1_rate * t * t);
    signal += 3.0 * Math.sin(chirp1_phase);
    
    // Chirp 2: Secondary sweep from 10 Hz to 35 Hz
    const chirp2_f0 = 10, chirp2_f1 = 35;
    const chirp2_rate = (chirp2_f1 - chirp2_f0) / 5.0;
    const chirp2_phase = 2 * Math.PI * (chirp2_f0 * t + 0.5 * chirp2_rate * t * t);
    signal += 1.5 * Math.sin(chirp2_phase);
    
    // Transient bursts at specific times (creates vertical features in spectrogram)
    const burstTimes = [0.8, 1.6, 2.4, 3.2, 4.0];
    for (const burstTime of burstTimes) {
      const dt = t - burstTime;
      if (dt >= 0 && dt < 0.15) {
        const envelope = Math.exp(-30 * dt);
        signal += 2.0 * envelope * Math.sin(2 * Math.PI * 20 * dt);
        signal += 1.5 * envelope * Math.sin(2 * Math.PI * 40 * dt);
        signal += 1.0 * envelope * Math.sin(2 * Math.PI * 60 * dt);
      }
    }
    
    // Broadband noise to fill background
    for (let f = 5; f <= 50; f += 5) {
      signal += 0.15 * (Math.random() - 0.5) * Math.sin(2 * Math.PI * f * t + Math.random() * 2 * Math.PI);
    }
    signal += 0.3 * (Math.random() - 0.5); // White noise
    
    this.sampleIndex++;
    return signal;
  }
}
```

**Signal features**:
- **Chirp sweeps**: Create diagonal lines in spectrogram showing frequency modulation over time
- **Transient bursts**: Create vertical streaks showing broadband events
- **Background noise**: Creates realistic texture throughout frequency range

### Processing Pipeline

```typescript
class RealtimeProcessor {
  private rawBuffer: CircularBuffer;      // Stores raw signal for FFT
  private filteredBuffer: CircularBuffer; // Stores filtered signal for display
  private filterState: FilterState;
  private windowSize: number = 256;       // FFT window size
  private hopSize: number = 16;           // 93.75% overlap for smooth spectrogram
  private samplesProcessed: number = 0;
  private fftSnapshots: FFTSnapshot[] = [];
  
  constructor(bufferSize: number, filterCoeffs: FilterCoefficients) {
    this.rawBuffer = new CircularBuffer(bufferSize);
    this.filteredBuffer = new CircularBuffer(bufferSize);
    this.filterState = initializeFilterState(filterCoeffs);
  }
  
  processSample(raw: number, time: number): { filtered: number; fftReady: boolean } {
    // 1. Apply real-time IIR filter
    const filtered = filterSample(raw, this.filterState, this.filterCoeffs);
    
    // 2. Store in both buffers (raw for FFT, filtered for display)
    this.rawBuffer.push(raw);
    this.filteredBuffer.push(filtered);
    this.samplesProcessed++;
    
    // 3. Check if time for FFT (every hop samples)
    const fftReady = this.samplesProcessed % this.hopSize === 0 && this.rawBuffer.isFull();
    
    if (fftReady) {
      this.performFFT(time);
    }
    
    return { filtered, fftReady };
  }
  
  private performFFT(centerTime: number): void {
    // Use raw signal for FFT (not filtered) for better spectrogram
    const window = this.rawBuffer.getWindow(this.windowSize);
    if (!window) return;
    
    // Apply Hann window
    const windowed = window.map((val, i) => 
      val * 0.5 * (1 - Math.cos((2 * Math.PI * i) / (this.windowSize - 1)))
    );
    
    // Perform FFT
    const fft = new FFT(this.windowSize);
    const out = fft.createComplexArray();
    fft.realTransform(out, windowed);
    fft.completeSpectrum(out);
    
    // Calculate magnitudes
    const frequencies: number[] = [];
    const magnitudes: number[] = [];
    
    for (let i = 0; i < this.windowSize / 2; i++) {
      const freq = (i * 200) / this.windowSize; // 200 Hz sampling rate
      const real = out[2 * i];
      const imag = out[2 * i + 1];
      const magnitude = (Math.sqrt(real * real + imag * imag) / this.windowSize) * 2;
      
      frequencies.push(freq);
      magnitudes.push(magnitude);
    }
    
    this.fftSnapshots.push({
      windowIndex: Math.floor(this.samplesProcessed / this.hopSize),
      centerTime,
      frequencies,
      magnitudes,
    });
  }
}
```

**Key implementation details**:
- **Dual buffers**: Raw signal for FFT (preserves all frequency content), filtered signal for display
- **93.75% overlap**: 16-sample hop with 256-sample window for very smooth spectrogram
- **Hann windowing**: Reduces spectral leakage in FFT
- **Normalized magnitudes**: Scaled for proper amplitude representation

## Visualization of Streaming Data

### Time-Series Plot

Show recent history (e.g., last 5 seconds):
- Scrolling plot (oldest data drops off left)
- Fixed time axis
- Update at reasonable rate (10-30 Hz)

### Frequency Spectrum

Update spectrum in real-time:
- Each FFT updates the plot
- Highlight peaks
- Track peak changes over time

### Spectrogram (Waterfall)

**Canvas-based pixel-perfect rendering** for smooth visualization:

```typescript
async function saveSpectrogramImage(
  fftSnapshots: FFTSnapshot[],
  maxFreq: number,
  outputDir: string
): Promise<void> {
  const width = 1000, height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  
  // Calculate dB range (40 dB dynamic range for good contrast)
  let minDB = Infinity, maxDB = -Infinity;
  fftSnapshots.forEach(snapshot => {
    snapshot.magnitudes.forEach(mag => {
      if (mag > 0) {
        const db = 20 * Math.log10(mag);
        minDB = Math.min(minDB, db);
        maxDB = Math.max(maxDB, db);
      }
    });
  });
  
  const clippedMinDB = Math.max(minDB, maxDB - 40);
  
  // Draw each pixel
  const pixelWidth = width / fftSnapshots.length;
  const pixelHeight = height / numFreqs;
  
  fftSnapshots.forEach((snapshot, timeIdx) => {
    snapshot.frequencies.forEach((freq, freqIdx) => {
      if (freq > 0 && freq <= maxFreq) {
        const mag = snapshot.magnitudes[freqIdx];
        const db = mag > 0 ? 20 * Math.log10(mag) : clippedMinDB;
        const clippedDB = Math.max(clippedMinDB, Math.min(maxDB, db));
        
        // Normalize to 0-1 and apply turbo colormap
        const normalized = (clippedDB - clippedMinDB) / (maxDB - clippedMinDB);
        const [r, g, b] = turboColormap(normalized);
        
        // Draw pixel (y-axis flipped so low freq at bottom)
        const x = timeIdx * pixelWidth;
        const y = height - (freqIdx / numFreqs) * height - pixelHeight;
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, Math.ceil(pixelWidth) + 1, Math.ceil(pixelHeight) + 1);
      }
    });
  });
  
  // Save as PNG
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(path.join(outputDir, "spectrogram.png"), buffer);
}
```

**SVG wrapper with axis labels**:
- X-axis: Time (0.0 - 5.0 seconds) with ticks every 0.5s
- Y-axis: Frequency (0 - 50 Hz) with ticks every 10 Hz
- Embedded PNG image with proper margins
- Black axis lines and tick marks
- Bold axis titles

**Advantages**:
- Pixel-perfect rendering (no gaps or overlaps)
- Turbo colormap for excellent contrast
- Smooth diagonal chirp lines visible
- Vertical transient bursts clearly shown
- Textured noise background throughout

### Trend Plots

Track extracted features over time:
- Overall RMS level
- Peak frequency
- Specific frequency band power
- Statistical limits (mean ± 3σ)

## Performance Optimization

### Vectorization

Use typed arrays for performance:

```typescript
const buffer = new Float64Array(1024); // Faster than number[]
```

### Avoid Allocations

```typescript
// Bad: Creates new array each time
function process(data: number[]): number[] {
  return data.map(x => x * 2);
}

// Good: Reuses existing array
function process(data: Float64Array, output: Float64Array): void {
  for (let i = 0; i < data.length; i++) {
    output[i] = data[i] * 2;
  }
}
```

### Web Workers (Browser)

For heavy processing, use Web Workers:
- Offload FFT to separate thread
- Avoid blocking UI
- Parallel processing

### Profiling

Measure performance:
```typescript
const start = performance.now();
performFFT(data);
const elapsed = performance.now() - start;
console.log(`FFT took ${elapsed.toFixed(2)} ms`);
```

## Anomaly Detection in Real-Time

### Statistical Thresholds

Set limits based on historical data:

**Normal operation**: Mean ± 3σ

```typescript
class AnomalyDetector {
  private mean: number = 0;
  private variance: number = 0;
  private count: number = 0;
  
  updateStatistics(value: number): void {
    this.count++;
    const delta = value - this.mean;
    this.mean += delta / this.count;
    const delta2 = value - this.mean;
    this.variance += delta * delta2;
  }
  
  checkAnomaly(value: number, sigma: number = 3): boolean {
    if (this.count < 30) return false; // Need baseline
    
    const stdDev = Math.sqrt(this.variance / this.count);
    const threshold = this.mean + sigma * stdDev;
    
    return Math.abs(value - this.mean) > threshold;
  }
}
```

### Rate of Change

Monitor rapid changes:

```typescript
class RateMonitor {
  private previous: number = 0;
  
  checkRateOfChange(value: number, maxRate: number): boolean {
    const rate = Math.abs(value - this.previous);
    this.previous = value;
    return rate > maxRate;
  }
}
```

### Frequency-Based Alerts

Detect unexpected frequency components:
- Motor bearing fault frequencies appear
- Resonance frequencies show increased energy
- Harmonic pattern changes

## Summary

Real-time data processing is essential for modern IoT systems:

- **Sliding windows** enable continuous FFT analysis with high temporal resolution
- **Circular buffers** provide efficient memory management with constant memory usage
- **IIR filters** are ideal for real-time filtering with minimal latency (sample-by-sample processing)
- **Dual-buffer architecture** preserves raw signal for accurate FFT while providing filtered output for display
- **High overlap** (93.75%) ensures smooth spectral evolution in spectrograms
- **Canvas-based rendering** creates pixel-perfect spectrograms with proper axis labels
- **Time-varying signals** (chirps, transients) demonstrate real-world behavior in visualizations
- **Feature extraction** reduces data volume for trending and anomaly detection
- **Careful optimization** ensures processing keeps pace with data arrival

**Implementation results**:
- 31 FFT snapshots from 5-second signal (1000 samples @ 200 Hz)
- 256-sample windows with 16-sample hop (80 ms update rate)
- Clear visualization of chirp sweeps (diagonal lines) and transient events (vertical streaks)
- Memory-efficient processing suitable for embedded systems

In the next chapter, we'll explore multi-sensor fusion and advanced processing techniques for extracting deeper insights from multiple data streams.

## Key Concepts Reference

| Concept | Description | Implementation Values |
|---------|-------------|----------------------|
| **Circular Buffer** | Fixed-size ring buffer | 512 samples |
| **Window Size** | Samples per FFT | 256 samples (1280 ms @ 200 Hz) |
| **Hop Size** | Samples between FFTs | 16 samples (80 ms @ 200 Hz) |
| **Overlap** | `1 - (hop / window)` | 93.75% (very smooth) |
| **Sampling Rate** | Signal acquisition rate | 200 Hz |
| **Duration** | Total simulation time | 5 seconds (1000 samples) |
| **FFT Snapshots** | Total FFTs computed | 31 snapshots |
| **Frequency Range** | Spectrogram display | 0-50 Hz |
| **Dynamic Range** | dB range displayed | 40 dB (clipped) |
| **Colormap** | Visualization colors | Turbo (blue→cyan→green→yellow→red) |
| **Resolution** | Spectrogram image size | 1000×500 pixels |

## Running the Code

```bash
# Using npm script
npm run chapter09

# Or directly with tsx
tsx codes/chapter09.ts
```

The output visualizations will be saved to:
- `outputs/chapter09/streaming-time-series.svg` and `.html`
- `outputs/chapter09/sliding-window-fft.svg` and `.html`
- `outputs/chapter09/spectrogram.svg` and `.html`

## Further Reading

- **Stream Processing Frameworks**: Apache Kafka, Apache Flink, Apache Storm
- **Real-Time Operating Systems (RTOS)**: FreeRTOS, Zephyr, RT-Thread
- **Edge Computing**: Processing on IoT devices vs cloud
- **Time-Series Databases**: InfluxDB, TimescaleDB, OpenTSDB
- **WebSockets**: For real-time browser-based visualization
