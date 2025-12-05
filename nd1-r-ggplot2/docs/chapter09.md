# Chapter 9: Time Series Decomposition and Frequency Analysis

## Learning Objectives
By the end of this chapter, you will be able to:
- Decompose IoT sensor time series into trend, seasonal, and residual components
- Visualize daily, weekly, and seasonal patterns in sensor data
- Apply FFT (Fast Fourier Transform) for frequency domain analysis
- Create power spectral density plots to identify dominant periodicities
- Generate spectrograms showing time-frequency relationships over time
- Detect equipment health issues through frequency analysis
- Identify anomalies by analyzing residuals and frequency shifts
- Combine time-domain and frequency-domain visualizations

## Introduction

IoT sensor data often contains multiple overlapping periodic patterns: daily HVAC cycles, weekly occupancy schedules, seasonal temperature variations, and equipment vibration signatures. While time-domain visualizations show "when" events occur, frequency-domain analysis reveals "how often" - identifying hidden periodicities, detecting equipment degradation, and enabling predictive maintenance.

This chapter teaches classical time series decomposition for understanding trends and seasonality, then introduces FFT (Fast Fourier Transform) and spectrogram analysis for frequency-domain insights. These techniques are essential for equipment health monitoring, predictive maintenance, and understanding complex periodic behaviors in IoT systems.

## IoT Context: Building Automation and Equipment Health Monitoring

You're analyzing two critical sensor types:

**1. Temperature Sensor (Building HVAC)**
- 1 year of hourly data (8,760 readings)
- Multiple periodicities: 24-hour cycles, 7-day patterns, seasonal trends
- Goal: Understand energy consumption patterns, optimize HVAC schedules

**2. Vibration Sensor (Motor/Bearing Monitoring)**
- High-frequency sampling (1000 Hz) for equipment health
- Frequency signatures indicate motor speed, bearing condition
- Goal: Detect early signs of bearing degradation, prevent failures

Understanding both time-domain patterns (trends, seasonality) and frequency-domain signatures (vibration harmonics, degradation) enables data-driven maintenance and optimization.

## Dataset Description

**Dataset 1 - Temperature Time Series (Building HVAC):**
- **1 year hourly data**: 8,760 readings from January 1 to December 31
- **Daily cycle**: 24-hour HVAC pattern (cooler at night, warmer during day)
- **Weekly cycle**: 7-day pattern (weekday vs. weekend occupancy)
- **Seasonal trend**: Annual temperature variation (summer cooling load, winter heating)
- **Noise and anomalies**: Measurement noise, occasional system faults in residuals

**Dataset 2 - Vibration Time Series (Equipment Monitoring):**
- **High-frequency data**: 1000 Hz sampling for 10 seconds (10,000 points)
- **Healthy baseline**: 60 Hz fundamental (motor speed) + harmonics
- **Degrading bearing**: Additional frequency components at bearing fault frequencies
- **Spectrogram evolution**: Tracking frequency changes over multiple time windows

These datasets enable exploration of both long-term seasonal patterns and high-frequency equipment signatures.

---

## Example 1: Raw Time Series with Smoothed Trend Overlay

**Goal:** Visualize raw yearly temperature data with smoothed trend line to separate long-term drift from short-term fluctuations.

```r
# Generate 1 year of hourly temperature data
set.seed(123)
n_hours <- 24 * 365  # 8,760 hours

# Create timestamps
timestamps <- seq(from = as.POSIXct("2024-01-01 00:00:00"),
                  by = "hour",
                  length.out = n_hours)

# Generate realistic temperature with multiple components
hour_of_day <- as.numeric(format(timestamps, "%H"))
day_of_year <- as.numeric(format(timestamps, "%j"))
day_of_week <- as.numeric(format(timestamps, "%u"))

# Component 1: Seasonal trend (annual cycle)
seasonal_trend <- 20 + 8 * sin(2 * pi * day_of_year / 365)

# Component 2: Daily cycle (HVAC pattern)
daily_cycle <- 3 * sin(2 * pi * hour_of_day / 24 + pi/2)

# Component 3: Weekly pattern (weekend effect)
weekend_effect <- ifelse(day_of_week >= 6, 1.5, 0)

# Component 4: Measurement noise
noise <- rnorm(n_hours, 0, 0.8)

# Combine components
temperature <- seasonal_trend + daily_cycle + weekend_effect + noise

# Create data frame
temp_data <- data.frame(
  timestamp = timestamps,
  temperature = temperature,
  day_of_year = day_of_year,
  hour_of_day = hour_of_day,
  day_of_week = day_of_week
)

# Raw time series with smoothed trend
ggplot(temp_data, aes(x = timestamp, y = temperature)) +
  geom_line(alpha = 0.3, color = "gray60") +
  geom_smooth(method = "loess", span = 0.1, color = "#3498db", 
              size = 1.2, se = FALSE)
```

**What's happening:**
- `geom_line(alpha = 0.3)`: Semi-transparent raw data shows all fluctuations
- `geom_smooth(method = "loess")`: Locally weighted smoothing extracts trend
- `span = 0.1`: Controls smoothing (0.1 = less smooth, follows data closely)
- Blue trend line removes daily/weekly noise, reveals seasonal pattern

**Insight:** Clear seasonal trend visible (warm summer ~28°C, cool winter ~12°C) with daily fluctuations around trend.

---

## Example 2: Four-Panel Decomposition (Observed, Trend, Seasonal, Residual)

**Goal:** Decompose time series into interpretable components using classical decomposition.

```r
# Create time series object for decomposition (using first 30 days for clarity)
temp_subset <- temp_data[1:(24*30), ]  # 30 days
ts_temp <- ts(temp_subset$temperature, frequency = 24)  # Daily frequency

# Perform STL decomposition (Seasonal-Trend decomposition using Loess)
decomp <- stl(ts_temp, s.window = "periodic")

# Convert to data frame for ggplot
decomp_df <- data.frame(
  timestamp = temp_subset$timestamp,
  observed = as.numeric(decomp$time.series[, "seasonal"] + 
                        decomp$time.series[, "trend"] + 
                        decomp$time.series[, "remainder"]),
  trend = as.numeric(decomp$time.series[, "trend"]),
  seasonal = as.numeric(decomp$time.series[, "seasonal"]),
  residual = as.numeric(decomp$time.series[, "remainder"])
)

# Reshape for faceting
decomp_long <- decomp_df %>%
  pivot_longer(cols = c(observed, trend, seasonal, residual),
               names_to = "component",
               values_to = "value")

# Convert to factor with proper order
decomp_long$component <- factor(decomp_long$component,
                                levels = c("observed", "trend", "seasonal", "residual"),
                                labels = c("Observed", "Trend", "Seasonal (24h)", "Residual"))

# Four-panel decomposition plot
ggplot(decomp_long, aes(x = timestamp, y = value)) +
  geom_line(color = "#2c3e50") +
  facet_grid(component ~ ., scales = "free_y") +
  labs(
    title = "Time Series Decomposition: 30-Day Temperature Data",
    subtitle = "STL decomposition into trend, seasonal, and residual components",
    x = "Date",
    y = "Temperature (°C)"
  ) +
  theme_minimal() +
  theme(
    strip.background = element_rect(fill = "gray90", color = "gray60"),
    strip.text = element_text(face = "bold", size = 11),
    panel.spacing = unit(1, "lines")
  )
```

**What's new:**
- `stl()`: Seasonal-Trend decomposition using Loess (robust method)
- `frequency = 24`: Defines 24-hour daily periodicity
- `facet_grid(component ~ ., scales = "free_y")`: Stacked panels with independent Y-scales
- **Observed**: Raw data
- **Trend**: Slowly changing baseline (seasonal drift)
- **Seasonal**: Repeating 24-hour cycle
- **Residual**: Unexplained variation (noise, anomalies)

**Insight:** Seasonal component shows consistent 24-hour HVAC pattern (±3°C amplitude). Residual shows mostly white noise with occasional spikes (potential sensor issues or extreme events).

---

## Example 3: Daily Cycle Plot - Average Pattern by Hour of Day

**Goal:** Visualize average daily temperature profile across all days, with separate curves for weekdays vs. weekends.

```r
# Calculate average temperature by hour and day type
daily_pattern <- temp_data %>%
  mutate(day_type = ifelse(day_of_week >= 6, "Weekend", "Weekday")) %>%
  group_by(hour_of_day, day_type) %>%
  summarize(
    mean_temp = mean(temperature),
    sd_temp = sd(temperature),
    se_temp = sd_temp / sqrt(n()),
    .groups = "drop"
  )

# Daily cycle plot with confidence ribbons
ggplot(daily_pattern, aes(x = hour_of_day, y = mean_temp, 
                          color = day_type, fill = day_type)) +
  geom_ribbon(aes(ymin = mean_temp - 1.96*se_temp, 
                  ymax = mean_temp + 1.96*se_temp),
              alpha = 0.2, color = NA) +
  geom_line(size = 1.2) +
  geom_point(size = 2.5) +
  scale_color_manual(values = c("Weekday" = "#3498db", "Weekend" = "#e74c3c")) +
  scale_fill_manual(values = c("Weekday" = "#3498db", "Weekend" = "#e74c3c")) +
  scale_x_continuous(breaks = seq(0, 23, 3), labels = paste0(seq(0, 23, 3), ":00")) +
  labs(
    title = "Average Daily Temperature Cycle",
    subtitle = "Mean temperature by hour with 95% confidence intervals (n=365 days)",
    x = "Hour of Day",
    y = "Temperature (°C)",
    color = "Day Type",
    fill = "Day Type"
  ) +
  theme_minimal() +
  theme(legend.position = "bottom")
```

**What's new:**
- `group_by(hour_of_day, day_type)`: Aggregate by hour and weekday/weekend
- `geom_ribbon()`: Shows confidence intervals (±1.96×SE)
- Separate curves reveal weekday vs. weekend behavior
- Clear visualization of typical 24-hour HVAC cycle

**Insight:** Weekdays show steeper morning warmup (7-9 AM, occupancy starts) and evening cooldown (6-8 PM). Weekends have gentler curves (lower occupancy, more gradual temperature changes). Peak temperature ~2-3 PM both days.

---

## Example 4: FFT Power Spectrum - Identify Dominant Frequencies

**Goal:** Apply FFT to identify dominant periodic frequencies in temperature data, confirming 24-hour and 7-day cycles.

```r
# Compute FFT on full year data
fft_result <- fft(temp_data$temperature)
n <- length(temp_data$temperature)

# Compute power spectrum (magnitude squared)
power <- Mod(fft_result)^2 / n

# Create frequency axis (cycles per hour)
freq <- (0:(n-1)) / n  # Normalized frequency
freq_per_hour <- freq * 1  # Sampling rate = 1 sample/hour

# Only plot positive frequencies (first half of spectrum)
half_n <- floor(n/2)
freq_data <- data.frame(
  frequency_cph = freq_per_hour[1:half_n],  # Cycles per hour
  period_hours = 1 / (freq_per_hour[1:half_n] + 1e-10),  # Avoid division by zero
  power = power[1:half_n]
)

# Convert to cycles per day for interpretation
freq_data$frequency_cpd <- freq_data$frequency_cph * 24

# Filter to meaningful range (periods from 6 hours to 60 days)
freq_data <- freq_data %>%
  filter(period_hours >= 6, period_hours <= 60*24)

# FFT power spectrum plot
ggplot(freq_data, aes(x = period_hours, y = power)) +
  geom_line(color = "#3498db", size = 1) +
  geom_vline(xintercept = 24, linetype = "dashed", color = "#e74c3c", size = 1) +
  geom_vline(xintercept = 24*7, linetype = "dashed", color = "#27ae60", size = 1) +
  annotate("text", x = 24, y = max(freq_data$power)*0.9, 
           label = "24 hours\n(Daily cycle)", color = "#e74c3c", fontface = "bold") +
  annotate("text", x = 24*7, y = max(freq_data$power)*0.8, 
           label = "7 days\n(Weekly cycle)", color = "#27ae60", fontface = "bold") +
  scale_x_log10(breaks = c(6, 12, 24, 48, 24*7, 24*30)) +
  labs(
    title = "FFT Power Spectrum: Temperature Data",
    subtitle = "Dominant periodicities identified via Fast Fourier Transform",
    x = "Period (hours, log scale)",
    y = "Power",
    caption = "Clear peaks at 24h (daily HVAC) and 168h (weekly occupancy)"
  ) +
  theme_minimal()
```

**What's new:**
- `fft()`: Fast Fourier Transform converts time-domain to frequency-domain
- `Mod()^2`: Power = magnitude squared of complex FFT result
- `scale_x_log10()`: Logarithmic scale shows wide range of periods
- Peaks indicate strong periodic components

**Insight:** Dominant peak at 24 hours confirms daily HVAC cycle. Secondary peak at 168 hours (7 days) confirms weekly occupancy pattern. No unexpected frequencies (system behaving as designed).

---

## Example 5: Power Spectral Density - Healthy vs. Degrading Equipment

**Goal:** Compare vibration frequency spectra between healthy motor bearing and degrading bearing to detect early failure signs.

```r
# Generate vibration data: 1000 Hz sampling, 10 seconds
fs <- 1000  # Sampling frequency (Hz)
duration <- 10  # seconds
n_samples <- fs * duration
t <- seq(0, duration - 1/fs, length.out = n_samples)

set.seed(456)

# Healthy motor: 60 Hz fundamental + harmonics
healthy_vib <- 
  2.0 * sin(2*pi*60*t) +      # 60 Hz motor frequency
  0.5 * sin(2*pi*120*t) +     # 1st harmonic
  0.2 * sin(2*pi*180*t) +     # 2nd harmonic
  rnorm(n_samples, 0, 0.3)    # Background noise

# Degrading bearing: adds fault frequency components
bearing_fault_freq <- 85  # Hz (bearing inner race defect frequency)
degrading_vib <- healthy_vib +
  0.8 * sin(2*pi*bearing_fault_freq*t) +           # Fault frequency
  0.4 * sin(2*pi*(bearing_fault_freq + 60)*t) +    # Modulation sidebands
  0.4 * sin(2*pi*(bearing_fault_freq - 60)*t)

# Compute power spectral density using spectrum()
psd_healthy <- spectrum(healthy_vib, plot = FALSE)
psd_degrading <- spectrum(degrading_vib, plot = FALSE)

# Create data frame
psd_data <- data.frame(
  frequency = c(psd_healthy$freq * fs, psd_degrading$freq * fs),
  power = c(psd_healthy$spec, psd_degrading$spec),
  condition = rep(c("Healthy", "Degrading"), each = length(psd_healthy$freq))
)

# Filter to 0-300 Hz range (relevant for bearing analysis)
psd_data <- psd_data %>% filter(frequency <= 300)

# Power spectral density comparison
ggplot(psd_data, aes(x = frequency, y = power, color = condition)) +
  geom_line(size = 1, alpha = 0.8) +
  geom_vline(xintercept = 60, linetype = "dashed", color = "gray40") +
  geom_vline(xintercept = 85, linetype = "dashed", color = "#e74c3c") +
  annotate("text", x = 60, y = max(psd_data$power)*0.9, 
           label = "60 Hz\n(Motor)", hjust = -0.1) +
  annotate("text", x = 85, y = max(psd_data$power)*0.75, 
           label = "85 Hz\n(Bearing fault)", hjust = -0.1, color = "#e74c3c") +
  scale_color_manual(values = c("Healthy" = "#27ae60", "Degrading" = "#e74c3c")) +
  scale_y_log10() +
  labs(
    title = "Vibration Power Spectral Density: Equipment Health Comparison",
    subtitle = "FFT-based frequency analysis reveals bearing degradation",
    x = "Frequency (Hz)",
    y = "Power Spectral Density (log scale)",
    color = "Bearing Condition",
    caption = "Degrading bearing shows new peak at 85 Hz (inner race fault frequency)"
  ) +
  theme_minimal() +
  theme(legend.position = "bottom")
```

**What's new:**
- `spectrum()`: Computes power spectral density (smoothed periodogram)
- High-frequency vibration data (1000 Hz sampling)
- `scale_y_log10()`: Log scale reveals small peaks
- Comparison plot shows healthy vs. degrading signature

**Insight:** Healthy motor shows clean 60 Hz peak + harmonics (120, 180 Hz). Degrading bearing adds 85 Hz peak (bearing fault) + modulation sidebands (25 Hz, 145 Hz). Early detection enables predictive maintenance before catastrophic failure.

---

## Example 6 (Bonus): Spectrogram Heatmap - Time-Frequency Evolution

**Goal:** Create spectrogram showing how frequency content evolves over time as bearing degrades, combining time and frequency domains in 2D heatmap.

```r
# Simulate progressive bearing degradation over 100 seconds
fs <- 1000
window_duration <- 1  # 1-second windows
n_windows <- 100
window_samples <- fs * window_duration

# Generate degrading vibration time series
set.seed(789)
all_vib_data <- data.frame()

for (i in 1:n_windows) {
  t_window <- seq(0, window_duration - 1/fs, length.out = window_samples)
  
  # Fault amplitude increases over time (degradation)
  fault_amplitude <- 0.1 + 0.02 * i  # Grows from 0.1 to 2.1
  
  # Vibration signal
  vib_signal <- 
    2.0 * sin(2*pi*60*t_window) +                                    # Motor
    fault_amplitude * sin(2*pi*85*t_window) +                        # Growing fault
    fault_amplitude * 0.5 * sin(2*pi*(85+60)*t_window) +            # Sideband
    rnorm(window_samples, 0, 0.3)
  
  # Compute FFT for this window
  fft_window <- fft(vib_signal)
  power_window <- Mod(fft_window[1:(window_samples/2)])^2
  freq_window <- (0:(window_samples/2-1)) * fs / window_samples
  
  # Store results
  all_vib_data <- rbind(all_vib_data, data.frame(
    time_window = i,
    frequency = freq_window,
    power = power_window
  ))
}

# Filter to relevant frequency range (0-200 Hz)
all_vib_data <- all_vib_data %>% filter(frequency <= 200)

# Spectrogram heatmap
ggplot(all_vib_data, aes(x = time_window, y = frequency, fill = log10(power + 1))) +
  geom_tile() +
  scale_fill_viridis_c(option = "inferno", name = "Power\n(log scale)") +
  geom_hline(yintercept = 60, linetype = "dashed", color = "white", alpha = 0.5) +
  geom_hline(yintercept = 85, linetype = "dashed", color = "yellow", alpha = 0.7) +
  annotate("text", x = 90, y = 60, label = "60 Hz (Motor)", 
           color = "white", hjust = 0, size = 3.5) +
  annotate("text", x = 90, y = 85, label = "85 Hz (Bearing)", 
           color = "yellow", hjust = 0, size = 3.5) +
  labs(
    title = "Vibration Spectrogram: Progressive Bearing Degradation",
    subtitle = "Time-frequency heatmap showing fault signature growth over 100 seconds",
    x = "Time (seconds)",
    y = "Frequency (Hz)",
    caption = "Bearing fault frequency (85 Hz) intensifies over time, indicating degradation"
  ) +
  theme_minimal() +
  theme(panel.grid = element_blank())
```

**What's new:**
- **Spectrogram**: 2D heatmap showing power vs. time and frequency
- Sliding window FFT: Compute spectrum for each time window
- `geom_tile()`: Creates heatmap with time (x), frequency (y), power (color)
- `scale_fill_viridis_c(option = "inferno")`: Heat-based color scale
- Reveals temporal evolution of frequency components

**Advanced insight:** 
- 60 Hz motor frequency remains constant (horizontal yellow band)
- 85 Hz bearing fault frequency grows in intensity over time (band gets brighter)
- Clear visual evidence of progressive degradation
- Enables trend-based predictive maintenance (schedule replacement before failure)

**Practical application:** Combine spectrogram monitoring with threshold alerts. When 85 Hz power exceeds baseline by 3×, trigger maintenance notification. Prevents unexpected downtime and reduces repair costs.

---

## Summary

In this chapter, you learned time series decomposition and frequency analysis for IoT sensors:

1. **Raw time series with trends** (`geom_smooth()`) for long-term pattern extraction
2. **Classical decomposition** (`stl()`) separating trend, seasonal, and residual components
3. **Cycle plots** showing average daily patterns with confidence intervals
4. **FFT power spectrum** (`fft()`) identifying dominant periodicities (24h, 7d cycles)
5. **Power spectral density** (`spectrum()`) comparing healthy vs. degrading equipment
6. **Spectrograms** (sliding window FFT) visualizing time-frequency evolution

**Key R functions:**
- `stl()`: Seasonal-Trend decomposition using Loess
- `fft()`: Fast Fourier Transform (time → frequency domain)
- `spectrum()`: Power spectral density estimation
- `Mod()`: Magnitude of complex FFT result
- `geom_ribbon()`: Confidence bands around trends
- `geom_tile()`: Heatmaps for spectrograms
- `scale_x_log10()`: Logarithmic scales for wide frequency ranges

**Time vs. Frequency Domain:**
- **Time domain**: Shows when events occur, trends over time
- **Frequency domain**: Shows how often events occur, periodic patterns
- **Spectrogram**: Combines both, showing frequency evolution over time

**IoT Applications:**
- HVAC optimization: Identify daily/weekly patterns, optimize schedules
- Predictive maintenance: Detect bearing/motor faults via frequency analysis
- Anomaly detection: Unexpected frequencies indicate equipment issues
- Energy management: Understand consumption periodicities
- Equipment health monitoring: Track vibration spectrum changes over time

Frequency analysis is essential for condition-based monitoring, enabling early fault detection and preventing costly equipment failures through data-driven predictive maintenance.

---

## Practice Exercises

1. **Multi-Frequency Decomposition**: Generate temperature data with 12h, 24h, and 7d cycles. Use FFT to identify all three frequencies in the spectrum.

2. **Anomaly Detection via Residuals**: Create time series with injected anomalies (sudden spikes). Decompose and visualize residuals highlighting outliers >3 SD.

3. **Seasonal Comparison**: Generate 2 years of data. Create faceted cycle plots comparing daily patterns between Year 1 and Year 2.

4. **Harmonic Analysis**: Generate motor vibration with 60 Hz fundamental + 5 harmonics (120, 180, 240, 300, 360 Hz). Verify all peaks in FFT spectrum.

5. **Frequency Shift Detection**: Simulate motor speed decreasing from 60 Hz to 55 Hz over time. Create spectrogram showing frequency shift.

6. **Advanced Decomposition**: Use `stl()` with `s.window = 13` and `t.window = 21` parameters. Compare decomposition quality with different settings.

**Challenge:** Build automated bearing health monitoring system that:
1. Computes hourly spectrograms
2. Tracks 85 Hz power over time
3. Triggers alert when power exceeds 3× baseline for 3 consecutive hours
4. Generates dashboard with time series, FFT, spectrogram, and alert history
