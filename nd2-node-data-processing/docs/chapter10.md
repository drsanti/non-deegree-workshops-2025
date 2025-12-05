# Chapter 10: Multi-Sensor Fusion and Advanced Processing

## Introduction to Multi-Sensor Systems

Modern IoT and industrial systems rarely rely on a single sensor. Instead, they deploy **multiple sensors** working together to provide comprehensive monitoring and robust fault detection. Multi-sensor systems offer several advantages over single-sensor approaches.

### Why Multiple Sensors?

**Redundancy and reliability**:
- Sensor failures don't cause complete system loss
- Cross-validation detects faulty sensors
- Voting mechanisms improve accuracy

**Complementary information**:
- Temperature + vibration → Better fault diagnosis
- Accelerometer (X, Y, Z) → Complete motion picture
- Current + voltage → Power analysis

**Spatial coverage**:
- Multiple locations on machine
- Before/after processing stages
- Different machine components

**Different physical phenomena**:
- Thermal behavior
- Mechanical vibration
- Electrical characteristics
- Acoustic emissions

### Typical Multi-Sensor Configurations

**Machine monitoring**:
- Vibration sensors at bearing locations (4-8 sensors)
- Temperature sensors at motor, bearings, gearbox
- Current sensor on power supply
- Acoustic sensor for noise monitoring

**Process monitoring**:
- Pressure sensors at multiple points
- Flow meters at inlet/outlet
- Temperature profile along process
- Quality sensors at critical points

**Building automation**:
- Temperature sensors per room/zone
- Occupancy sensors
- Air quality sensors (CO₂, VOC)
- Energy meters per circuit

## Sensor Data Fusion Fundamentals

**Data fusion** combines information from multiple sensors to produce more accurate, reliable, or complete information than any single sensor could provide.

### Fusion Levels

**1. Raw data fusion**:
- Combine sensor readings directly
- Example: Average of multiple temperature sensors
- Requires sensors measuring same quantity

**2. Feature-level fusion**:
- Extract features from each sensor
- Combine features for analysis
- Example: RMS vibration + peak temperature

**3. Decision-level fusion**:
- Each sensor makes independent decision
- Combine decisions (voting, weighting)
- Example: Multiple anomaly detectors vote on fault

### Fusion Architectures

**Centralized fusion**:
```
Sensor 1 ──┐
Sensor 2 ──┼──> Central Processor ──> Decision
Sensor 3 ──┘
```
- All raw data sent to central processor
- Maximum information available
- High bandwidth requirements

**Distributed fusion**:
```
Sensor 1 ──> Processor 1 ──┐
Sensor 2 ──> Processor 2 ──┼──> Fusion Center ──> Decision
Sensor 3 ──> Processor 3 ──┘
```
- Local processing at each sensor
- Only features/decisions transmitted
- Lower bandwidth, more robust

**Hierarchical fusion**:
```
S1 ──┐          Level 1
S2 ──┼──> F1 ──┐
S3 ──┘         │
               ├──> F3 ──> Decision   Level 2
S4 ──┐         │
S5 ──┼──> F2 ──┘
S6 ──┘
```
- Multi-stage fusion
- Scalable to many sensors
- Can incorporate domain knowledge at each level

## Synchronization and Time Alignment

When combining data from multiple sensors, **time synchronization** is critical.

### Timestamp Alignment

**Problem**: Sensors may have:
- Different sampling rates
- Different start times
- Clock drift
- Network delays

**Solution**: Interpolation and resampling

```typescript
function resampleToCommonTimeline(
  sensors: SensorData[],
  targetRate: number
): AlignedData {
  // Find common time range
  const startTime = Math.max(...sensors.map(s => s.timestamps[0]));
  const endTime = Math.min(...sensors.map(s => s.timestamps[s.timestamps.length - 1]));
  
  // Generate common timeline
  const numSamples = Math.floor((endTime - startTime) * targetRate);
  const commonTimeline = Array.from(
    { length: numSamples },
    (_, i) => startTime + i / targetRate
  );
  
  // Interpolate each sensor to common timeline
  const aligned = sensors.map(sensor =>
    interpolate(sensor.timestamps, sensor.values, commonTimeline)
  );
  
  return { timestamps: commonTimeline, sensors: aligned };
}
```

### Interpolation Methods

**Linear interpolation** (fast, good for smooth signals):
```typescript
function linearInterpolate(x: number[], y: number[], xi: number): number {
  // Find surrounding points
  let i = 0;
  while (i < x.length - 1 && x[i + 1] < xi) i++;
  
  if (i >= x.length - 1) return y[y.length - 1];
  
  // Linear interpolation
  const slope = (y[i + 1] - y[i]) / (x[i + 1] - x[i]);
  return y[i] + slope * (xi - x[i]);
}
```

**Nearest neighbor** (best for discrete events):
```typescript
function nearestNeighbor(x: number[], y: number[], xi: number): number {
  let minDist = Infinity;
  let nearest = y[0];
  
  for (let i = 0; i < x.length; i++) {
    const dist = Math.abs(x[i] - xi);
    if (dist < minDist) {
      minDist = dist;
      nearest = y[i];
    }
  }
  
  return nearest;
}
```

## Cross-Correlation Analysis

**Cross-correlation** measures similarity between two signals as a function of time lag.

### Concept

Given sensors A and B, cross-correlation answers:
- Are the sensors measuring related phenomena?
- Is there a time delay between them?
- How strong is the relationship?

### Mathematical Definition

$$
R_{AB}(\tau) = \int_{-\infty}^{\infty} A(t) \cdot B(t + \tau) \, dt
$$

**Discrete form**:
$$
R_{AB}[k] = \sum_{n=0}^{N-1} A[n] \cdot B[n + k]
$$

Where $\tau$ (or $k$) is the time lag.

### Implementation

```typescript
function crossCorrelation(a: number[], b: number[]): number[] {
  const N = a.length;
  const result: number[] = [];
  
  // Normalize signals
  const aMean = mean(a);
  const bMean = mean(b);
  const aStd = standardDeviation(a);
  const bStd = standardDeviation(b);
  
  const aNorm = a.map(v => (v - aMean) / aStd);
  const bNorm = b.map(v => (v - bMean) / bStd);
  
  // Compute correlation for each lag
  for (let lag = -N + 1; lag < N; lag++) {
    let sum = 0;
    let count = 0;
    
    for (let i = 0; i < N; i++) {
      const j = i + lag;
      if (j >= 0 && j < N) {
        sum += aNorm[i] * bNorm[j];
        count++;
      }
    }
    
    result.push(sum / count);
  }
  
  return result;
}
```

### Interpreting Results

**Peak at lag = 0**: Sensors are synchronized, measuring same phenomenon
**Peak at lag = k**: Signal B lags A by k samples (or vice versa)
**No clear peak**: Sensors are uncorrelated (measuring independent things)
**Negative peak**: Signals are anti-correlated (inverse relationship)

### Applications

**Fault propagation**:
- Fault detected in sensor A at t=0
- Related fault appears in sensor B at t=50ms
- Lag = 50ms reveals propagation delay

**Flow monitoring**:
- Upstream flow sensor A
- Downstream flow sensor B
- Time lag reveals flow velocity

**Bearing fault detection**:
- Vibration sensors at two bearings
- Correlation reveals coupled vibration
- Phase lag indicates propagation path

## Feature Extraction for Multi-Sensor Systems

Rather than processing raw sensor data, extract **features**—characteristic values that capture important signal properties.

### Time-Domain Features

**Statistical features** (per sensor):
```typescript
interface TimeFeatures {
  mean: number;          // DC level
  std: number;           // Variability
  rms: number;           // Root mean square
  peak: number;          // Maximum absolute value
  peakToPeak: number;    // Range
  crestFactor: number;   // peak / rms
  skewness: number;      // Asymmetry
  kurtosis: number;      // Impulsiveness (4 = normal, >4 = impulsive)
}

function extractTimeFeatures(signal: number[]): TimeFeatures {
  const n = signal.length;
  const mean = signal.reduce((a, b) => a + b, 0) / n;
  
  const deviations = signal.map(x => x - mean);
  const squares = deviations.map(x => x * x);
  const variance = squares.reduce((a, b) => a + b, 0) / n;
  const std = Math.sqrt(variance);
  
  const rms = Math.sqrt(signal.map(x => x * x).reduce((a, b) => a + b, 0) / n);
  const peak = Math.max(...signal.map(Math.abs));
  const crestFactor = peak / rms;
  
  // Skewness (3rd moment)
  const skewness = deviations.map(x => Math.pow(x / std, 3))
    .reduce((a, b) => a + b, 0) / n;
  
  // Kurtosis (4th moment)
  const kurtosis = deviations.map(x => Math.pow(x / std, 4))
    .reduce((a, b) => a + b, 0) / n;
  
  return {
    mean,
    std,
    rms,
    peak,
    peakToPeak: Math.max(...signal) - Math.min(...signal),
    crestFactor,
    skewness,
    kurtosis,
  };
}
```

### Frequency-Domain Features

**Spectral features** (from FFT):
```typescript
interface FrequencyFeatures {
  peakFrequency: number;      // Dominant frequency
  peakAmplitude: number;      // Amplitude at peak
  spectralCentroid: number;   // Center of mass of spectrum
  spectralSpread: number;     // Width of spectrum
  bandPower: number;          // Power in specific band
  harmonicRatio: number;      // Strength of harmonics
}

function extractFrequencyFeatures(
  frequencies: number[],
  magnitudes: number[],
  bandLow: number,
  bandHigh: number
): FrequencyFeatures {
  // Find peak
  let peakIdx = 0;
  for (let i = 1; i < magnitudes.length; i++) {
    if (magnitudes[i] > magnitudes[peakIdx]) peakIdx = i;
  }
  
  // Spectral centroid (center of mass)
  let sumWeighted = 0;
  let sumMag = 0;
  for (let i = 0; i < magnitudes.length; i++) {
    sumWeighted += frequencies[i] * magnitudes[i];
    sumMag += magnitudes[i];
  }
  const spectralCentroid = sumWeighted / sumMag;
  
  // Spectral spread (standard deviation around centroid)
  let sumSpread = 0;
  for (let i = 0; i < magnitudes.length; i++) {
    const diff = frequencies[i] - spectralCentroid;
    sumSpread += diff * diff * magnitudes[i];
  }
  const spectralSpread = Math.sqrt(sumSpread / sumMag);
  
  // Band power
  let bandPower = 0;
  for (let i = 0; i < frequencies.length; i++) {
    if (frequencies[i] >= bandLow && frequencies[i] <= bandHigh) {
      bandPower += magnitudes[i] * magnitudes[i];
    }
  }
  
  return {
    peakFrequency: frequencies[peakIdx],
    peakAmplitude: magnitudes[peakIdx],
    spectralCentroid,
    spectralSpread,
    bandPower,
    harmonicRatio: 0, // Computed separately
  };
}
```

### Feature Vector Construction

Combine features from all sensors into a single **feature vector**:

```typescript
interface MultiSensorFeatures {
  timestamp: number;
  features: Map<string, number>; // "sensor1_rms", "sensor2_peak", etc.
}

function buildFeatureVector(
  sensors: Map<string, number[]>,
  timestamp: number
): MultiSensorFeatures {
  const features = new Map<string, number>();
  
  sensors.forEach((signal, sensorName) => {
    const timeFeats = extractTimeFeatures(signal);
    features.set(`${sensorName}_mean`, timeFeats.mean);
    features.set(`${sensorName}_rms`, timeFeats.rms);
    features.set(`${sensorName}_crest`, timeFeats.crestFactor);
    features.set(`${sensorName}_kurtosis`, timeFeats.kurtosis);
    
    // Add frequency features if needed
    const fft = performFFT(signal);
    const freqFeats = extractFrequencyFeatures(
      fft.frequencies,
      fft.magnitudes,
      10, // band low
      100 // band high
    );
    features.set(`${sensorName}_peakFreq`, freqFeats.peakFrequency);
    features.set(`${sensorName}_bandPower`, freqFeats.bandPower);
  });
  
  return { timestamp, features };
}
```

## Anomaly Detection

Detecting abnormal behavior in multi-sensor systems.

### Statistical Approach

**Multivariate Gaussian**:

Assume features follow multivariate normal distribution:
$$
p(\mathbf{x}) = \frac{1}{(2\pi)^{n/2} |\Sigma|^{1/2}} \exp\left(-\frac{1}{2}(\mathbf{x}-\boldsymbol{\mu})^T \Sigma^{-1} (\mathbf{x}-\boldsymbol{\mu})\right)
$$

Where:
- $\mathbf{x}$ = feature vector
- $\boldsymbol{\mu}$ = mean vector (learned from normal data)
- $\Sigma$ = covariance matrix

**Mahalanobis distance**:
$$
D_M(\mathbf{x}) = \sqrt{(\mathbf{x}-\boldsymbol{\mu})^T \Sigma^{-1} (\mathbf{x}-\boldsymbol{\mu})}
$$

If $D_M > \text{threshold}$, declare anomaly.

### Implementation

```typescript
class AnomalyDetector {
  private mean: number[];
  private covInv: number[][];
  private threshold: number;
  
  train(normalData: number[][]): void {
    // Compute mean
    const n = normalData.length;
    const d = normalData[0].length;
    this.mean = new Array(d).fill(0);
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < d; j++) {
        this.mean[j] += normalData[i][j];
      }
    }
    this.mean = this.mean.map(x => x / n);
    
    // Compute covariance matrix
    const cov = Array.from({ length: d }, () => new Array(d).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < d; j++) {
        for (let k = 0; k < d; k++) {
          cov[j][k] += (normalData[i][j] - this.mean[j]) * 
                       (normalData[i][k] - this.mean[k]);
        }
      }
    }
    
    for (let j = 0; j < d; j++) {
      for (let k = 0; k < d; k++) {
        cov[j][k] /= n;
      }
    }
    
    // Compute inverse (simplified for 2D case)
    this.covInv = this.invertMatrix(cov);
    
    // Set threshold (e.g., 99th percentile of training distances)
    const distances = normalData.map(x => this.mahalanobisDistance(x));
    distances.sort((a, b) => a - b);
    this.threshold = distances[Math.floor(0.99 * distances.length)];
  }
  
  detect(sample: number[]): { isAnomaly: boolean; score: number } {
    const score = this.mahalanobisDistance(sample);
    return {
      isAnomaly: score > this.threshold,
      score,
    };
  }
  
  private mahalanobisDistance(x: number[]): number {
    const diff = x.map((xi, i) => xi - this.mean[i]);
    
    // D² = diff^T * covInv * diff
    let sum = 0;
    for (let i = 0; i < diff.length; i++) {
      for (let j = 0; j < diff.length; j++) {
        sum += diff[i] * this.covInv[i][j] * diff[j];
      }
    }
    
    return Math.sqrt(sum);
  }
  
  private invertMatrix(matrix: number[][]): number[][] {
    // Simple 2×2 inversion (extend for higher dimensions)
    const n = matrix.length;
    if (n === 2) {
      const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
      return [
        [matrix[1][1] / det, -matrix[0][1] / det],
        [-matrix[1][0] / det, matrix[0][0] / det],
      ];
    }
    // For larger matrices, use proper linear algebra library
    throw new Error("Matrix inversion not implemented for n > 2");
  }
}
```

### Rule-Based Anomaly Detection

For explainable decisions:

```typescript
interface AnomalyRule {
  sensor: string;
  feature: string;
  min?: number;
  max?: number;
  condition: (value: number) => boolean;
}

class RuleBasedDetector {
  private rules: AnomalyRule[];
  
  constructor(rules: AnomalyRule[]) {
    this.rules = rules;
  }
  
  detect(features: Map<string, number>): {
    isAnomaly: boolean;
    triggeredRules: string[];
  } {
    const triggered: string[] = [];
    
    this.rules.forEach((rule, idx) => {
      const key = `${rule.sensor}_${rule.feature}`;
      const value = features.get(key);
      
      if (value !== undefined) {
        if (rule.condition(value)) {
          triggered.push(`Rule ${idx}: ${key} = ${value.toFixed(2)}`);
        }
      }
    });
    
    return {
      isAnomaly: triggered.length > 0,
      triggeredRules: triggered,
    };
  }
}

// Example rules
const rules: AnomalyRule[] = [
  {
    sensor: "vibration1",
    feature: "rms",
    condition: (v) => v > 5.0, // RMS > 5 m/s²
  },
  {
    sensor: "temperature1",
    feature: "mean",
    condition: (v) => v > 85.0, // Temp > 85°C
  },
  {
    sensor: "vibration1",
    feature: "kurtosis",
    condition: (v) => v > 8.0, // High impulsiveness
  },
];
```

## Sensor Fusion for Fault Diagnosis

Combining multiple sensor types for robust fault detection.

### Example: Motor Fault Diagnosis

**Sensors**:
1. Vibration (accelerometer at bearing)
2. Temperature (motor housing)
3. Current (supply line)
4. Acoustic (microphone)

**Fault types and signatures**:

| Fault | Vibration | Temperature | Current | Acoustic |
|-------|-----------|-------------|---------|----------|
| **Bearing wear** | ↑ High-freq | ↑ Slow rise | → | ↑ Broadband |
| **Unbalance** | ↑ 1× RPM | ↑ Gradual | ↑ Slight | → |
| **Misalignment** | ↑ 2× RPM | ↑ Local hot | → | ↑ Tonal |
| **Electrical fault** | → | ↑ Rapid | ↑ Large | ↑ Humming |
| **Looseness** | ↑ Harmonics | → | → | ↑ Impact |

### Decision Fusion

**Voting system**:
```typescript
enum FaultType {
  Normal = "Normal",
  BearingWear = "Bearing Wear",
  Unbalance = "Unbalance",
  Misalignment = "Misalignment",
  Electrical = "Electrical Fault",
  Looseness = "Looseness",
}

class FaultDiagnosisSystem {
  detectFault(features: MultiSensorFeatures): {
    fault: FaultType;
    confidence: number;
  } {
    const votes = new Map<FaultType, number>();
    
    // Initialize votes
    Object.values(FaultType).forEach(ft => votes.set(ft as FaultType, 0));
    
    // Vibration analysis
    const vibRms = features.features.get("vibration_rms") || 0;
    const vibKurtosis = features.features.get("vibration_kurtosis") || 0;
    const vibPeakFreq = features.features.get("vibration_peakFreq") || 0;
    
    if (vibRms > 5.0 && vibKurtosis > 6.0) {
      votes.set(FaultType.BearingWear, votes.get(FaultType.BearingWear)! + 2);
    }
    
    if (vibPeakFreq > 25 && vibPeakFreq < 35) { // 1× RPM at 30 Hz
      votes.set(FaultType.Unbalance, votes.get(FaultType.Unbalance)! + 1);
    }
    
    if (vibPeakFreq > 55 && vibPeakFreq < 65) { // 2× RPM
      votes.set(FaultType.Misalignment, votes.get(FaultType.Misalignment)! + 1);
    }
    
    // Temperature analysis
    const temp = features.features.get("temperature_mean") || 0;
    if (temp > 85) {
      votes.set(FaultType.BearingWear, votes.get(FaultType.BearingWear)! + 1);
      votes.set(FaultType.Unbalance, votes.get(FaultType.Unbalance)! + 1);
    }
    
    // Current analysis
    const currentRms = features.features.get("current_rms") || 0;
    if (currentRms > 12.0) {
      votes.set(FaultType.Electrical, votes.get(FaultType.Electrical)! + 2);
    }
    
    // Find fault with most votes
    let maxVotes = 0;
    let detectedFault = FaultType.Normal;
    
    votes.forEach((count, fault) => {
      if (count > maxVotes) {
        maxVotes = count;
        detectedFault = fault;
      }
    });
    
    const totalVotes = Array.from(votes.values()).reduce((a, b) => a + b, 0);
    const confidence = totalVotes > 0 ? maxVotes / totalVotes : 0;
    
    return { fault: detectedFault, confidence };
  }
}
```

## Visualization for Multi-Sensor Systems

Effective visualization is crucial for understanding multi-sensor data.

### Dashboard Layout

**Components**:
1. **Time-series panel**: All sensors on synchronized timeline
2. **Feature heatmap**: Evolution of features over time
3. **Correlation matrix**: Cross-correlations between sensors
4. **Anomaly indicators**: Timeline of detected anomalies
5. **Fault probability**: Real-time probability of each fault type

### Synchronized Multi-Sensor Plot

```typescript
function createMultiSensorTimeSeriesSpec(
  sensors: Map<string, { times: number[]; values: number[] }>,
  anomalies?: { time: number; type: string }[]
): any {
  const data: any[] = [];
  
  sensors.forEach((sensor, name) => {
    sensor.times.forEach((t, i) => {
      data.push({
        time: t,
        value: sensor.values[i],
        sensor: name,
      });
    });
  });
  
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Multi-Sensor Time Series",
    data: { values: data },
    facet: {
      row: {
        field: "sensor",
        type: "nominal",
        title: null,
      },
    },
    spec: {
      width: 800,
      height: 100,
      mark: { type: "line", strokeWidth: 1.5 },
      encoding: {
        x: {
          field: "time",
          type: "quantitative",
          title: "Time (s)",
          axis: { grid: false },
        },
        y: {
          field: "value",
          type: "quantitative",
          scale: { zero: false },
          axis: { grid: true, gridOpacity: 0.3 },
        },
        color: {
          field: "sensor",
          type: "nominal",
          legend: null,
        },
      },
    },
  };
}
```

### Feature Correlation Heatmap

```typescript
function createCorrelationHeatmap(
  correlationMatrix: number[][],
  labels: string[]
): any {
  const data: any[] = [];
  
  for (let i = 0; i < labels.length; i++) {
    for (let j = 0; j < labels.length; j++) {
      data.push({
        sensor1: labels[i],
        sensor2: labels[j],
        correlation: correlationMatrix[i][j],
      });
    }
  }
  
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    title: "Sensor Cross-Correlation Matrix",
    width: 400,
    height: 400,
    data: { values: data },
    mark: "rect",
    encoding: {
      x: {
        field: "sensor1",
        type: "nominal",
        title: null,
      },
      y: {
        field: "sensor2",
        type: "nominal",
        title: null,
      },
      color: {
        field: "correlation",
        type: "quantitative",
        scale: {
          scheme: "redblue",
          domain: [-1, 1],
          reverse: true,
        },
        legend: { title: "Correlation" },
      },
      tooltip: [
        { field: "sensor1" },
        { field: "sensor2" },
        { field: "correlation", format: ".3f" },
      ],
    },
  };
}
```

## Performance Considerations

### Computational Complexity

**Per time step** (assuming N sensors, M samples each):
- Feature extraction: O(N × M × log M) if FFT included
- Correlation: O(N² × M) for all pairs
- Anomaly detection: O(N × D²) where D = feature dimensions

**Optimization strategies**:
1. **Batch processing**: Process multiple samples together
2. **Incremental updates**: Update statistics incrementally
3. **Feature selection**: Use only most relevant features
4. **Parallel processing**: Process sensors independently
5. **Edge computing**: Extract features locally, transmit only features

### Memory Management

```typescript
class RollingBuffer {
  private buffer: number[][];
  private index: number = 0;
  private full: boolean = false;
  
  constructor(private capacity: number, private numSensors: number) {
    this.buffer = Array.from({ length: capacity }, () => 
      new Array(numSensors).fill(0)
    );
  }
  
  push(sample: number[]): void {
    this.buffer[this.index] = sample;
    this.index = (this.index + 1) % this.capacity;
    if (this.index === 0) this.full = true;
  }
  
  getRecent(n: number): number[][] {
    if (!this.full && this.index < n) {
      return this.buffer.slice(0, this.index);
    }
    
    const result: number[][] = [];
    let i = (this.index - n + this.capacity) % this.capacity;
    
    for (let count = 0; count < n; count++) {
      result.push([...this.buffer[i]]);
      i = (i + 1) % this.capacity;
    }
    
    return result;
  }
}
```

## Summary

Multi-sensor fusion enables robust, accurate monitoring and fault diagnosis:

**Key techniques**:
- **Time alignment**: Synchronize sensors with different sampling rates
- **Cross-correlation**: Find relationships and time delays between sensors
- **Feature extraction**: Reduce dimensionality while preserving information
- **Anomaly detection**: Statistical and rule-based approaches
- **Decision fusion**: Combine evidence from multiple sources
- **Visualization**: Dashboards for comprehensive system view

**Benefits**:
- **Improved accuracy**: Complementary information reduces false alarms
- **Robustness**: Redundancy handles sensor failures
- **Earlier detection**: Multiple symptoms appear before catastrophic failure
- **Diagnosis capability**: Distinguishes between fault types
- **Reduced uncertainty**: Confidence increases with more evidence

**Implementation considerations**:
- Computational cost scales with number of sensors
- Synchronization is critical for time-sensitive analysis
- Feature selection reduces dimensionality
- Real-time constraints may limit complexity
- Visualization helps operators understand system state

Multi-sensor systems represent the state-of-the-art in industrial monitoring, enabling predictive maintenance, quality assurance, and process optimization across manufacturing, energy, transportation, and other critical industries.

## Running the Code

```bash
# Using npm script
npm run chapter10

# Or directly with tsx
tsx codes/chapter10.ts
```

The output visualizations will be saved to:
- `outputs/chapter10/multi-sensor-time-series.svg` and `.html`
- `outputs/chapter10/correlation-heatmap.svg` and `.html`
- `outputs/chapter10/anomaly-timeline.svg` and `.html`
- `outputs/chapter10/fault-diagnosis.svg` and `.html`

## Further Reading

- **Sensor Fusion**: Khaleghi et al., "Multisensor data fusion: A review of the state-of-the-art"
- **Anomaly Detection**: Chandola et al., "Anomaly detection: A survey"
- **Predictive Maintenance**: Lee et al., "Prognostics and health management design for rotary machinery systems"
- **Machine Learning**: Scikit-learn documentation for preprocessing and anomaly detection
- **Time Series Analysis**: "Time Series Analysis and Its Applications" by Shumway and Stoffer
- **Industrial IoT**: "Industrial Internet of Things" by Alasdair Gilchrist
