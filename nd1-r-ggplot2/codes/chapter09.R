# ==============================================================================
# Chapter 9: Time Series Decomposition and Frequency Analysis
# R Code for all examples
# ==============================================================================

# Load required libraries
library(ggplot2)
library(dplyr)
library(tidyr)

# Set seed for reproducibility
set.seed(123)

# ==============================================================================
# DATA GENERATION
# ==============================================================================

cat("Generating time series data...\n")

# ------------------------------------------------------------------------------
# Dataset 1: One Year of Hourly Temperature Data
# ------------------------------------------------------------------------------
n_hours <- 24 * 365  # 8,760 hours

# Create timestamps
timestamps <- seq(from = as.POSIXct("2024-01-01 00:00:00"),
                  by = "hour",
                  length.out = n_hours)

# Extract time components
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

# Combine all components
temperature <- seasonal_trend + daily_cycle + weekend_effect + noise

# Create main data frame
temp_data <- data.frame(
  timestamp = timestamps,
  temperature = temperature,
  day_of_year = day_of_year,
  hour_of_day = hour_of_day,
  day_of_week = day_of_week
)

cat("Generated", nrow(temp_data), "hourly temperature readings\n")


# ==============================================================================
# EXAMPLE 1: Raw Time Series with Smoothed Trend Overlay
# ==============================================================================
cat("\n=== Example 1: Raw Time Series with Trend ===\n")

p1 <- ggplot(temp_data, aes(x = timestamp, y = temperature)) +
  geom_line(alpha = 0.3, color = "gray60") +
  geom_smooth(method = "loess", span = 0.1, color = "#3498db", 
              size = 1.2, se = FALSE) +
  labs(
    title = "One Year Temperature Time Series with Trend",
    subtitle = "Raw hourly data (gray) with LOESS smoothed trend (blue)",
    x = "Date",
    y = "Temperature (°C)"
  ) +
  theme_minimal()

print(p1)

# Save plot
ggsave("chapter09_example1_trend.png", p1, width = 12, height = 6, dpi = 300)
cat("Plot saved: chapter09_example1_trend.png\n")


# ==============================================================================
# EXAMPLE 2: Four-Panel Decomposition
# ==============================================================================
cat("\n=== Example 2: Time Series Decomposition ===\n")

# Use first 30 days for clearer visualization
temp_subset <- temp_data[1:(24*30), ]
ts_temp <- ts(temp_subset$temperature, frequency = 24)

# Perform STL decomposition
decomp <- stl(ts_temp, s.window = "periodic")

# Convert to data frame
decomp_df <- data.frame(
  timestamp = temp_subset$timestamp,
  observed = as.numeric(ts_temp),
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

# Four-panel plot
p2 <- ggplot(decomp_long, aes(x = timestamp, y = value)) +
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

print(p2)

# Save plot
ggsave("chapter09_example2_decomposition.png", p2, width = 12, height = 10, dpi = 300)
cat("Plot saved: chapter09_example2_decomposition.png\n")


# ==============================================================================
# EXAMPLE 3: Daily Cycle Plot
# ==============================================================================
cat("\n=== Example 3: Daily Cycle Plot ===\n")

# Calculate average by hour and day type
daily_pattern <- temp_data %>%
  mutate(day_type = ifelse(day_of_week >= 6, "Weekend", "Weekday")) %>%
  group_by(hour_of_day, day_type) %>%
  summarize(
    mean_temp = mean(temperature),
    sd_temp = sd(temperature),
    se_temp = sd_temp / sqrt(n()),
    .groups = "drop"
  )

# Daily cycle plot
p3 <- ggplot(daily_pattern, aes(x = hour_of_day, y = mean_temp, 
                                color = day_type, fill = day_type)) +
  geom_ribbon(aes(ymin = mean_temp - 1.96*se_temp, 
                  ymax = mean_temp + 1.96*se_temp),
              alpha = 0.2, color = NA) +
  geom_line(size = 1.2) +
  geom_point(size = 2.5) +
  scale_color_manual(values = c("Weekday" = "#3498db", "Weekend" = "#e74c3c")) +
  scale_fill_manual(values = c("Weekday" = "#3498db", "Weekend" = "#e74c3c")) +
  scale_x_continuous(breaks = seq(0, 23, 3), 
                    labels = paste0(seq(0, 23, 3), ":00")) +
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

print(p3)

# Save plot
ggsave("chapter09_example3_daily_cycle.png", p3, width = 10, height = 6, dpi = 300)
cat("Plot saved: chapter09_example3_daily_cycle.png\n")


# ==============================================================================
# EXAMPLE 4: FFT Power Spectrum
# ==============================================================================
cat("\n=== Example 4: FFT Power Spectrum ===\n")

# Compute FFT
fft_result <- fft(temp_data$temperature)
n <- length(temp_data$temperature)

# Compute power spectrum
power <- Mod(fft_result)^2 / n

# Create frequency axis
freq <- (0:(n-1)) / n
freq_per_hour <- freq * 1  # Sampling rate = 1/hour

# Only positive frequencies
half_n <- floor(n/2)
freq_data <- data.frame(
  frequency_cph = freq_per_hour[1:half_n],
  period_hours = 1 / (freq_per_hour[1:half_n] + 1e-10),
  power = power[1:half_n]
)

# Filter to meaningful range
freq_data <- freq_data %>%
  filter(period_hours >= 6, period_hours <= 60*24)

# FFT power spectrum
p4 <- ggplot(freq_data, aes(x = period_hours, y = power)) +
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

print(p4)

# Save plot
ggsave("chapter09_example4_fft_spectrum.png", p4, width = 10, height = 6, dpi = 300)
cat("Plot saved: chapter09_example4_fft_spectrum.png\n")

cat("\nTop frequency components:\n")
top_freqs <- freq_data %>%
  arrange(desc(power)) %>%
  head(5) %>%
  select(period_hours, power)
print(top_freqs)


# ==============================================================================
# EXAMPLE 5: Power Spectral Density - Healthy vs Degrading
# ==============================================================================
cat("\n=== Example 5: Vibration PSD Comparison ===\n")

# Generate vibration data
set.seed(456)
fs <- 1000  # Sampling frequency (Hz)
duration <- 10
n_samples <- fs * duration
t <- seq(0, duration - 1/fs, length.out = n_samples)

# Healthy motor vibration
healthy_vib <- 
  2.0 * sin(2*pi*60*t) +      # 60 Hz motor
  0.5 * sin(2*pi*120*t) +     # 1st harmonic
  0.2 * sin(2*pi*180*t) +     # 2nd harmonic
  rnorm(n_samples, 0, 0.3)

# Degrading bearing
bearing_fault_freq <- 85
degrading_vib <- healthy_vib +
  0.8 * sin(2*pi*bearing_fault_freq*t) +
  0.4 * sin(2*pi*(bearing_fault_freq + 60)*t) +
  0.4 * sin(2*pi*(bearing_fault_freq - 60)*t)

# Compute PSD
psd_healthy <- spectrum(healthy_vib, plot = FALSE)
psd_degrading <- spectrum(degrading_vib, plot = FALSE)

# Create data frame
psd_data <- data.frame(
  frequency = c(psd_healthy$freq * fs, psd_degrading$freq * fs),
  power = c(psd_healthy$spec, psd_degrading$spec),
  condition = rep(c("Healthy", "Degrading"), each = length(psd_healthy$freq))
)

# Filter to relevant range
psd_data <- psd_data %>% filter(frequency <= 300)

# PSD comparison plot
p5 <- ggplot(psd_data, aes(x = frequency, y = power, color = condition)) +
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

print(p5)

# Save plot
ggsave("chapter09_example5_psd_comparison.png", p5, width = 10, height = 6, dpi = 300)
cat("Plot saved: chapter09_example5_psd_comparison.png\n")


# ==============================================================================
# EXAMPLE 6 (BONUS): Spectrogram - Time-Frequency Evolution
# ==============================================================================
cat("\n=== Example 6: Spectrogram Heatmap ===\n")

# Simulate progressive degradation
set.seed(789)
fs <- 1000
window_duration <- 1
n_windows <- 100
window_samples <- fs * window_duration

all_vib_data <- data.frame()

cat("Computing spectrogram (100 windows)...\n")

for (i in 1:n_windows) {
  t_window <- seq(0, window_duration - 1/fs, length.out = window_samples)
  
  # Fault amplitude grows over time
  fault_amplitude <- 0.1 + 0.02 * i
  
  # Generate vibration signal
  vib_signal <- 
    2.0 * sin(2*pi*60*t_window) +
    fault_amplitude * sin(2*pi*85*t_window) +
    fault_amplitude * 0.5 * sin(2*pi*(85+60)*t_window) +
    rnorm(window_samples, 0, 0.3)
  
  # FFT for this window
  fft_window <- fft(vib_signal)
  power_window <- Mod(fft_window[1:(window_samples/2)])^2
  freq_window <- (0:(window_samples/2-1)) * fs / window_samples
  
  all_vib_data <- rbind(all_vib_data, data.frame(
    time_window = i,
    frequency = freq_window,
    power = power_window
  ))
}

# Filter to 0-200 Hz
all_vib_data <- all_vib_data %>% filter(frequency <= 200)

# Spectrogram heatmap
p6 <- ggplot(all_vib_data, aes(x = time_window, y = frequency, 
                               fill = log10(power + 1))) +
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

print(p6)

# Save plot
ggsave("chapter09_example6_spectrogram.png", p6, width = 12, height = 7, dpi = 300)
cat("Plot saved: chapter09_example6_spectrogram.png\n")


# ==============================================================================
# SUMMARY STATISTICS
# ==============================================================================
cat("\n=== Chapter 9 Summary Statistics ===\n")

cat("\nTemperature data summary:\n")
cat("Total readings:", nrow(temp_data), "\n")
cat("Date range:", format(min(temp_data$timestamp), "%Y-%m-%d"), "to",
    format(max(temp_data$timestamp), "%Y-%m-%d"), "\n")
cat("Mean temperature:", round(mean(temp_data$temperature), 2), "°C\n")
cat("SD:", round(sd(temp_data$temperature), 2), "°C\n")
cat("Range:", round(min(temp_data$temperature), 2), "to",
    round(max(temp_data$temperature), 2), "°C\n")

cat("\nDecomposition statistics (30-day sample):\n")
cat("Trend range:", round(min(decomp_df$trend), 2), "to",
    round(max(decomp_df$trend), 2), "°C\n")
cat("Seasonal amplitude:", round(max(decomp_df$seasonal) - min(decomp_df$seasonal), 2), 
    "°C (peak-to-peak)\n")
cat("Residual SD:", round(sd(decomp_df$residual), 2), "°C\n")

cat("\nDaily pattern summary:\n")
print(daily_pattern %>% 
      group_by(day_type) %>%
      summarize(
        min_temp = min(mean_temp),
        max_temp = max(mean_temp),
        range = max_temp - min_temp,
        .groups = "drop"
      ))

cat("\n=== All examples completed successfully ===\n")
