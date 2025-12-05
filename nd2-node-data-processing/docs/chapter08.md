# Chapter 8: Vibration Analysis for Predictive Maintenance

## Introduction to Vibration-Based Monitoring

**Vibration analysis** is one of the most powerful techniques for predictive maintenance in industrial settings. By monitoring the vibration signatures of rotating machinery, we can detect developing faults weeks or months before they lead to catastrophic failure.

### Why Vibration Analysis?

Rotating machinery (motors, pumps, fans, compressors, turbines) generates characteristic vibration patterns. When faults develop, these patterns change in predictable ways:

- **Bearing defects** → High-frequency impacts at specific fault frequencies
- **Imbalance** → Vibration at rotation frequency (1×)
- **Misalignment** → High 2× and 3× harmonics
- **Looseness** → Multiple harmonics with phase shifts
- **Gear problems** → Vibration at gear mesh frequency
- **Resonance** → Amplified vibration at natural frequencies

### Benefits of Predictive Maintenance

1. **Prevent unexpected failures** - Schedule maintenance before breakdown
2. **Reduce downtime** - Plan maintenance during scheduled shutdowns
3. **Extend equipment life** - Fix problems before they cause secondary damage
4. **Optimize maintenance** - Service only when needed, not on fixed schedules
5. **Cost savings** - Avoid emergency repairs and production losses

## Machine Vibration Fundamentals

### Rotating Machinery Components

A typical motor-driven system has several components, each contributing to the overall vibration signature:

1. **Motor rotor** - Rotating at motor speed (RPM)
2. **Motor bearings** - Support the rotor shaft
3. **Coupling** - Connects motor to driven equipment
4. **Driven equipment** - Pump, fan, compressor, etc.
5. **Foundation** - Structure supporting the equipment

### Key Frequencies

#### 1. Rotation Frequency (1×)

The fundamental frequency at which the shaft rotates:

$$
f_{rotation} = \frac{RPM}{60}
$$

**Example**: Motor running at 1800 RPM
$$
f_{rotation} = \frac{1800}{60} = 30 \text{ Hz}
$$

This is the most basic frequency and appears in almost all vibration spectra.

#### 2. Harmonics (2×, 3×, 4×, ...)

Multiples of the rotation frequency:

$$
f_{harmonic} = n \times f_{rotation}
$$

Where $n = 2, 3, 4, ...$ (harmonic order)

**Example**: For 1800 RPM motor (30 Hz):
- 2× = 60 Hz (second harmonic)
- 3× = 90 Hz (third harmonic)
- 4× = 120 Hz (fourth harmonic)

#### 3. Sidebands

Frequencies that appear on either side of a main frequency, spaced at the rotation frequency:

$$
f_{sideband} = f_{main} \pm n \times f_{rotation}
$$

Sidebands indicate modulation and are often associated with:
- Bearing defects
- Gear tooth problems
- Electrical issues in motors

## Bearing Fault Frequencies

Rolling element bearings are critical components that fail frequently. They generate specific fault frequencies that can be calculated from bearing geometry.

### Bearing Geometry Parameters

- $N_b$ = Number of rolling elements (balls or rollers)
- $d$ = Rolling element diameter
- $D$ = Pitch diameter (center of bearing)
- $\beta$ = Contact angle (typically 0° for deep groove bearings)
- $f_s$ = Shaft rotation frequency (Hz)

### Fundamental Bearing Frequencies

#### 1. Ball Pass Frequency Outer Race (BPFO)

Frequency at which rolling elements pass a point on the outer race:

$$
BPFO = \frac{N_b \times f_s}{2} \times \left(1 - \frac{d}{D} \cos\beta\right)
$$

**Fault signature**: Defect on outer race generates impacts at BPFO.

#### 2. Ball Pass Frequency Inner Race (BPFI)

Frequency at which rolling elements pass a point on the inner race:

$$
BPFI = \frac{N_b \times f_s}{2} \times \left(1 + \frac{d}{D} \cos\beta\right)
$$

**Fault signature**: Defect on inner race generates impacts at BPFI.

Note: BPFI > BPFO (inner race rotates, outer race is stationary)

#### 3. Ball Spin Frequency (BSF)

Frequency at which each rolling element rotates about its own axis:

$$
BSF = \frac{D \times f_s}{2d} \times \left[1 - \left(\frac{d}{D} \cos\beta\right)^2\right]
$$

**Fault signature**: Defect on a rolling element generates impacts at BSF.

#### 4. Fundamental Train Frequency (FTF)

Frequency at which the bearing cage rotates:

$$
FTF = \frac{f_s}{2} \times \left(1 - \frac{d}{D} \cos\beta\right)
$$

**Fault signature**: Cage defects, wear, or looseness show at FTF.

### Example Calculation

**Bearing specifications**:
- $N_b = 8$ balls
- $d = 12$ mm (ball diameter)
- $D = 60$ mm (pitch diameter)
- $\beta = 0°$ (deep groove bearing)
- Motor speed = 1500 RPM → $f_s = 25$ Hz

**Calculate fault frequencies**:

$$
BPFO = \frac{8 \times 25}{2} \times \left(1 - \frac{12}{60}\right) = 100 \times 0.8 = 80 \text{ Hz}
$$

$$
BPFI = \frac{8 \times 25}{2} \times \left(1 + \frac{12}{60}\right) = 100 \times 1.2 = 120 \text{ Hz}
$$

$$
BSF = \frac{60 \times 25}{2 \times 12} \times \left[1 - \left(\frac{12}{60}\right)^2\right] = 62.5 \times 0.96 = 60 \text{ Hz}
$$

$$
FTF = \frac{25}{2} \times \left(1 - \frac{12}{60}\right) = 12.5 \times 0.8 = 10 \text{ Hz}
$$

## Common Fault Signatures

### 1. Imbalance

**Cause**: Uneven mass distribution on rotor
- Accumulation of deposits (dirt, corrosion)
- Missing or loose parts
- Manufacturing tolerances

**Frequency signature**:
- Strong 1× component (rotation frequency)
- Phase angle changes by 180° across coupling

**Severity**:
- Low: 1× amplitude < 0.5 mm/s
- Moderate: 0.5 - 2.5 mm/s
- Severe: > 2.5 mm/s

### 2. Misalignment

**Cause**: Shaft centerlines not parallel or coincident
- Installation errors
- Thermal expansion
- Foundation settling

**Frequency signature**:
- High 2× component (twice rotation frequency)
- Significant 3× component
- Often radial and axial vibration

**Severity indicators**:
- 2× amplitude > 50% of 1× amplitude
- High axial vibration

### 3. Bearing Defects

**Cause**: Wear, fatigue, contamination, corrosion

**Frequency signature**:
- Peaks at bearing fault frequencies (BPFO, BPFI, BSF, FTF)
- Harmonics of fault frequencies (2×, 3×, 4×, ...)
- Sidebands spaced at rotation frequency
- Increased noise floor at high frequencies (>10 kHz)

**Progression stages**:
1. **Early**: Small peaks at fault frequencies, normal overall levels
2. **Moderate**: Clear fault frequency peaks with harmonics and sidebands
3. **Advanced**: Elevated broadband noise, multiple harmonics, high overall vibration
4. **Severe**: Extremely high levels, audible noise, elevated temperature

### 4. Looseness

**Cause**: Loose mounting bolts, worn bearings, excessive clearances

**Frequency signature**:
- Multiple harmonics (up to 10× or more)
- Non-synchronous peaks
- Phase measurements show instability

### 5. Resonance

**Cause**: Operating frequency matches natural frequency of structure

**Frequency signature**:
- Dramatically amplified vibration at specific frequency
- High vibration levels at machine or structure natural frequency
- Sharp peak in frequency spectrum

**Solution**: Change operating speed, add damping, modify structure stiffness

## FFT-Based Fault Detection Strategy

### 1. Baseline Measurement

When equipment is new or after maintenance:
- Record vibration spectrum
- Document operating conditions (load, temperature, speed)
- Save as reference "fingerprint"

### 2. Periodic Monitoring

Regular measurements (weekly, monthly):
- Measure at same locations and directions
- Use same sensor types and mounting
- Consistent operating conditions

### 3. Trend Analysis

Track key parameters over time:
- Overall vibration level (RMS, peak)
- Specific frequency amplitudes (1×, 2×, bearing frequencies)
- Rate of change

### 4. Alarm Thresholds

Set limits based on:
- ISO 20816 (formerly ISO 10816) standards
- Manufacturer recommendations
- Historical data from similar machines

**Example thresholds (velocity, mm/s RMS)**:
| Machine Class | Good | Acceptable | Unsatisfactory | Unacceptable |
|---------------|------|------------|----------------|--------------|
| Small (< 15 kW) | < 2.3 | 2.3 - 7.1 | 7.1 - 11.2 | > 11.2 |
| Medium (15-75 kW) | < 3.5 | 3.5 - 7.1 | 7.1 - 11.2 | > 11.2 |
| Large (> 75 kW) | < 4.5 | 4.5 - 11.2 | 11.2 - 18 | > 18 |

### 5. Diagnostic Decision Making

When vibration increases:
1. **Compare to baseline** - What changed?
2. **Identify frequency peaks** - Which fault?
3. **Check harmonics and sidebands** - Severity?
4. **Correlate with operating conditions** - Process-related?
5. **Schedule maintenance** - How urgent?

## Data Acquisition Best Practices

### Sensor Selection

**Accelerometers**:
- Broad frequency range (0.5 Hz - 10 kHz or higher)
- Good for high-frequency bearing defects
- Sensitive to mounting method

**Velocity sensors**:
- Good for general machinery (10 Hz - 1 kHz)
- Direct velocity output (mm/s)
- Less mounting sensitivity

**Proximity probes**:
- Direct shaft displacement measurement
- Excellent for low frequencies (< 10 Hz)
- Requires target surface on shaft

### Measurement Locations

**Typical points** (for each bearing):
1. **Horizontal** (radial, X-axis)
2. **Vertical** (radial, Y-axis)
3. **Axial** (parallel to shaft)

### Measurement Parameters

**Sampling rate**:
- Must exceed 2× highest frequency of interest (Nyquist)
- Typical: 10 - 25 kHz for bearing analysis
- Lower (1 - 5 kHz) for general machinery

**FFT parameters**:
- **Lines of resolution**: 400, 800, 1600, 3200 (frequency bins)
- **Frequency range**: 0 - Fmax (often 0 - 1 kHz for general, 0 - 5 kHz for bearings)
- **Window function**: Hann window (general purpose)
- **Averaging**: 4 - 16 averages to reduce noise

## Practical Implementation Steps

### Step 1: Simulate Healthy Machine

Generate baseline vibration signal:
- Rotation frequency (1×)
- Low harmonics (2×, 3×)
- Small bearing frequency components (normal)
- Random noise (structural vibration)

### Step 2: Simulate Faulty Conditions

Add fault signatures to baseline:
- **Imbalance**: Increase 1× amplitude
- **Misalignment**: Increase 2× and 3× amplitudes
- **Bearing defect**: Add clear BPFO peaks with harmonics and sidebands
- **Looseness**: Add multiple harmonics

### Step 3: Perform FFT Analysis

Convert time-domain vibration to frequency domain:
- Apply window function
- Compute FFT
- Calculate magnitude spectrum
- Identify peaks

### Step 4: Compare Spectra

Create visualizations:
- Overlay healthy vs faulty spectra
- Mark expected fault frequencies
- Show amplitude changes
- Calculate severity metrics

### Step 5: Generate Alerts

Based on thresholds:
- Green: Normal operation
- Yellow: Monitor closely
- Orange: Schedule maintenance
- Red: Urgent maintenance required

## Visualization Guidelines

### Time Domain Plot
- Show 1-2 seconds of data
- Multiple waveforms for comparison
- Clear labels for healthy vs faulty

### Frequency Domain Plot
- Linear or log scale (dB)
- 0 to 500 Hz or 0 to 1000 Hz range
- Mark key frequencies with vertical lines:
  - Rotation frequency (1×)
  - Harmonics (2×, 3×)
  - Bearing fault frequencies (BPFO, BPFI, BSF, FTF)
- Use different colors for healthy vs faulty
- Show legend with amplitudes

### Waterfall Plot (Advanced)
- 3D visualization: frequency × time × amplitude
- Shows how spectrum changes over time
- Useful for transient conditions (startup, shutdown)

## Case Study Example

**Equipment**: Electric motor driving centrifugal pump
- Motor: 30 kW, 1500 RPM (25 Hz)
- Bearing: SKF 6208 (Nb=8, d=12mm, D=60mm)

**Calculated frequencies**:
- 1× = 25 Hz
- 2× = 50 Hz
- 3× = 75 Hz
- BPFO = 80 Hz
- BPFI = 120 Hz
- BSF = 60 Hz
- FTF = 10 Hz

**Observed fault signature**:
- BPFO peak at 80 Hz: 3.5 mm/s (normally < 0.5 mm/s)
- Harmonics at 160 Hz, 240 Hz visible
- Sidebands at 80±25 Hz, 80±50 Hz
- Overall vibration: 8.5 mm/s (was 2.5 mm/s)

**Diagnosis**: Outer race bearing defect (BPFO)

**Action**: Schedule bearing replacement within 2 weeks

**Outcome**: Bearing replaced during planned shutdown, no failure, no production loss

## Summary

Vibration analysis is a cornerstone of predictive maintenance:

- **FFT reveals fault signatures** hidden in time-domain waveforms
- **Bearing fault frequencies** are calculated from geometry
- **Trending over time** shows fault progression
- **Early detection** enables planned maintenance
- **Cost savings** from avoided failures and optimized maintenance

In the next chapter, we'll explore real-time data processing and streaming techniques for continuous monitoring systems.

## Key Formulas Reference

| Parameter | Formula | Notes |
|-----------|---------|-------|
| **Rotation Frequency** | $f_s = RPM / 60$ | Fundamental frequency |
| **BPFO** | $\frac{N_b f_s}{2}(1 - \frac{d}{D}\cos\beta)$ | Outer race defect |
| **BPFI** | $\frac{N_b f_s}{2}(1 + \frac{d}{D}\cos\beta)$ | Inner race defect |
| **BSF** | $\frac{D f_s}{2d}[1 - (\frac{d}{D}\cos\beta)^2]$ | Ball/roller defect |
| **FTF** | $\frac{f_s}{2}(1 - \frac{d}{D}\cos\beta)$ | Cage defect |
| **Sidebands** | $f_{main} \pm n \times f_s$ | Modulation |

## Running the Code

```bash
# Using npm script
npm run chapter08

# Or directly with tsx
tsx codes/chapter08.ts
```

The output visualizations will be saved to:
- `outputs/chapter08/time-domain-comparison.svg` and `.html`
- `outputs/chapter08/frequency-spectrum-comparison.svg` and `.html`
- `outputs/chapter08/multi-condition-comparison.svg` and `.html`

## Further Reading

- ISO 20816: Mechanical vibration - Measurement and evaluation of machine vibration
- SKF Bearing Maintenance Handbook
- Mobius Institute vibration analysis certification (CAT I-IV)
- "Vibration Analysis for Electronic Equipment" by Dave S. Steinberg
- "Practical Machinery Vibration Analysis and Predictive Maintenance" by Cornelius Scheffer
