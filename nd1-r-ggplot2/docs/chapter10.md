# Chapter 10: Advanced Dashboard Layouts and Integrated Monitoring Systems

## Learning Objectives
By the end of this chapter, you will be able to:
- Combine multiple plot types into comprehensive IoT dashboards
- Use patchwork and cowplot packages for complex multi-plot layouts
- Integrate time-domain and frequency-domain visualizations
- Create equipment health monitoring dashboards with FFT analysis
- Apply consistent theming across multiple plots
- Build predictive maintenance dashboards combining trends, spectra, and alerts
- Design publication-quality multi-panel figures
- Export high-resolution dashboard layouts for reports

## Introduction

Professional IoT applications require dashboards that combine multiple visualization types: time series trends, statistical distributions, frequency analysis, correlation matrices, and alert summaries. Single plots tell part of the story; integrated dashboards provide complete situational awareness.

This chapter teaches advanced layout techniques using `patchwork` and `cowplot` packages, with special focus on combining classical time-domain monitoring (trends, distributions) with modern frequency-domain analysis (FFT spectra, spectrograms) for equipment health monitoring and predictive maintenance.

## IoT Context: Integrated Equipment Health Monitoring

You're building comprehensive monitoring dashboards for:

**1. Building HVAC System Monitoring**
- Real-time temperature status
- 24-hour trend visualization
- Statistical distribution comparison
- Alert history and maintenance events

**2. Predictive Maintenance Dashboard**
- Vibration time series (bearing health)
- FFT power spectrum (frequency analysis)
- Spectrogram (time-frequency evolution)
- Health scores and degradation trends
- Automated maintenance recommendations

These dashboards enable operators to quickly assess system status, identify issues, and make data-driven maintenance decisions.

## Dataset Description

**Comprehensive Monitoring Data:**
- **Real-time status**: Current readings from 12 sensors
- **Historical trends**: 7 days of temperature, vibration, energy consumption
- **Vibration data**: High-frequency (1000 Hz) motor/bearing signals
- **Frequency analysis**: FFT spectra, power spectral density
- **Spectrograms**: Time-frequency evolution over hours
- **Alert history**: 30 days of warnings and critical events
- **Performance metrics**: Uptime percentages, data quality scores
- **Correlation data**: Sensor relationships and redundancy

---

## Example 1: Two-Panel Dashboard - Current Status + 24-Hour Trend

**Goal:** Create simple two-panel horizontal layout showing current sensor readings and recent trend using patchwork.

```r
library(patchwork)

# Generate current status data
set.seed(123)
sensor_ids <- paste0("TEMP_", sprintf("%02d", 1:12))
current_status <- data.frame(
  sensor_id = sensor_ids,
  current_temp = rnorm(12, 25, 2),
  status = sample(c("Normal", "Warning"), 12, replace = TRUE, prob = c(0.8, 0.2))
)

# Panel 1: Current status bars
p_status <- ggplot(current_status, aes(x = sensor_id, y = current_temp, fill = status)) +
  geom_col() +
  geom_hline(yintercept = 25, linetype = "dashed", color = "blue") +
  scale_fill_manual(values = c("Normal" = "#27ae60", "Warning" = "#f39c12")) +
  labs(title = "Current Status", y = "Temperature (°C)", x = NULL) +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1),
        legend.position = "none")

# Generate 24-hour trend data
timestamps <- seq(from = Sys.time() - 24*3600, to = Sys.time(), by = "hour")
trend_data <- data.frame(
  timestamp = timestamps,
  temperature = 25 + 3*sin(2*pi*(1:25)/24) + rnorm(25, 0, 0.5)
)

# Panel 2: 24-hour trend
p_trend <- ggplot(trend_data, aes(x = timestamp, y = temperature)) +
  geom_line(color = "#3498db", size = 1) +
  geom_point(color = "#2c3e50", size = 2) +
  labs(title = "24-Hour Trend", y = "Temperature (°C)", x = "Time") +
  theme_minimal()

# Combine with patchwork
dashboard_simple <- p_status + p_trend +
  plot_annotation(
    title = "HVAC Monitoring Dashboard",
    subtitle = "Real-time status and recent trends"
  )

print(dashboard_simple)
```

**What's happening:**
- `patchwork` package: Use `+` operator to combine plots horizontally
- `plot_annotation()`: Adds overall title and subtitle
- Two independent ggplot objects placed side-by-side
- Automatic sizing (equal width by default)

**Result:** Clean two-panel dashboard showing current sensor health and recent system behavior.

---

## Example 2: Four-Panel Layout - Time Series, Distribution, Correlation, Alerts

**Goal:** Create 2×2 grid layout with diverse visualization types for comprehensive system overview.

```r
# Panel 1: Time series (already created as p_trend)

# Panel 2: Temperature distribution across sensors
p_distribution <- ggplot(current_status, aes(x = current_temp)) +
  geom_histogram(binwidth = 1, fill = "#3498db", alpha = 0.7) +
  geom_vline(xintercept = 25, linetype = "dashed", color = "#e74c3c") +
  labs(title = "Temperature Distribution", 
       x = "Temperature (°C)", y = "Count") +
  theme_minimal()

# Panel 3: Correlation heatmap (simplified 6×6)
set.seed(456)
cor_data <- expand.grid(
  sensor1 = sensor_ids[1:6],
  sensor2 = sensor_ids[1:6]
)
cor_data$correlation <- runif(36, 0.3, 0.95)
diag_idx <- which(cor_data$sensor1 == cor_data$sensor2)
cor_data$correlation[diag_idx] <- 1.0

p_correlation <- ggplot(cor_data, aes(x = sensor1, y = sensor2, fill = correlation)) +
  geom_tile() +
  scale_fill_gradient2(low = "white", high = "#e74c3c", mid = "#f39c12", 
                       midpoint = 0.65) +
  labs(title = "Sensor Correlation", x = NULL, y = NULL) +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))

# Panel 4: Alert summary
alert_data <- data.frame(
  alert_type = c("Normal", "Warning", "Critical"),
  count = c(250, 35, 5)
)

p_alerts <- ggplot(alert_data, aes(x = alert_type, y = count, fill = alert_type)) +
  geom_col() +
  scale_fill_manual(values = c("Normal" = "#27ae60", 
                                "Warning" = "#f39c12",
                                "Critical" = "#e74c3c")) +
  labs(title = "30-Day Alert Summary", x = NULL, y = "Count") +
  theme_minimal() +
  theme(legend.position = "none")

# Create 2×2 layout
dashboard_quad <- (p_trend + p_distribution) / (p_correlation + p_alerts) +
  plot_annotation(
    title = "Comprehensive System Dashboard",
    subtitle = "Multi-view monitoring: trends, statistics, relationships, alerts",
    theme = theme(plot.title = element_text(size = 16, face = "bold"))
  )

print(dashboard_quad)
```

**What's new:**
- `/` operator: Stacks rows vertically
- `+` operator: Places plots horizontally
- `(plot1 + plot2) / (plot3 + plot4)`: Creates 2×2 grid
- Diverse plot types: line, histogram, heatmap, bar chart
- Unified theme across all panels

**Result:** Comprehensive dashboard showing temporal, statistical, relational, and alert perspectives in single view.

---

## Example 3: Six-Panel Equipment Health Dashboard with FFT

**Goal:** Integrate time-domain and frequency-domain analysis for predictive maintenance monitoring.

```r
# Generate vibration time series
set.seed(789)
fs <- 1000
t <- seq(0, 1, length.out = fs)

# Healthy vs current vibration
healthy_vib <- 2*sin(2*pi*60*t) + 0.5*sin(2*pi*120*t) + rnorm(fs, 0, 0.2)
current_vib <- healthy_vib + 0.6*sin(2*pi*85*t) + rnorm(fs, 0, 0.3)

vib_data <- data.frame(
  time_ms = t * 1000,
  healthy = healthy_vib,
  current = current_vib
) %>% pivot_longer(cols = c(healthy, current), 
                   names_to = "condition", values_to = "amplitude")

# Panel 1: Vibration time series
p_vib_time <- ggplot(vib_data %>% filter(time_ms <= 100), 
                     aes(x = time_ms, y = amplitude, color = condition)) +
  geom_line(size = 0.7) +
  scale_color_manual(values = c("healthy" = "#27ae60", "current" = "#e74c3c")) +
  labs(title = "Vibration Signal (100ms)", 
       x = "Time (ms)", y = "Amplitude") +
  theme_minimal() +
  theme(legend.position = "bottom")

# Panel 2: FFT spectrum comparison
fft_healthy <- fft(healthy_vib)
fft_current <- fft(current_vib)
freq <- (0:(fs/2-1)) * 1  # Frequency in Hz

spectrum_data <- data.frame(
  frequency = rep(freq, 2),
  power = c(Mod(fft_healthy[1:(fs/2)])^2, Mod(fft_current[1:(fs/2)])^2),
  condition = rep(c("Healthy", "Current"), each = fs/2)
) %>% filter(frequency <= 200)

p_spectrum <- ggplot(spectrum_data, aes(x = frequency, y = power, color = condition)) +
  geom_line(size = 1) +
  geom_vline(xintercept = 85, linetype = "dashed", color = "#e74c3c", alpha = 0.5) +
  annotate("text", x = 85, y = max(spectrum_data$power)*0.8, 
           label = "Bearing\nfault", color = "#e74c3c", size = 3) +
  scale_color_manual(values = c("Healthy" = "#27ae60", "Current" = "#e74c3c")) +
  scale_y_log10() +
  labs(title = "FFT Power Spectrum", x = "Frequency (Hz)", y = "Power (log)") +
  theme_minimal() +
  theme(legend.position = "bottom")

# Panel 3: Bearing health score trend
health_trend <- data.frame(
  day = 1:30,
  health_score = 100 - (1:30)*2 - rnorm(30, 0, 3)
)

p_health <- ggplot(health_trend, aes(x = day, y = health_score)) +
  geom_line(color = "#3498db", size = 1) +
  geom_point(color = "#2c3e50", size = 2) +
  geom_hline(yintercept = 70, linetype = "dashed", color = "#e74c3c") +
  annotate("text", x = 25, y = 72, label = "Maintenance\nthreshold", 
           color = "#e74c3c") +
  labs(title = "Bearing Health Score (30d)", x = "Day", y = "Health Score") +
  theme_minimal()

# Panel 4: Frequency band power evolution
band_data <- data.frame(
  day = rep(1:30, 3),
  band = rep(c("60 Hz (Motor)", "85 Hz (Fault)", "120 Hz (Harmonic)"), each = 30),
  power = c(
    rep(100, 30) + rnorm(30, 0, 5),                    # Motor stable
    seq(10, 80, length.out = 30) + rnorm(30, 0, 8),  # Fault growing
    rep(25, 30) + rnorm(30, 0, 3)                     # Harmonic stable
  )
)

p_bands <- ggplot(band_data, aes(x = day, y = power, color = band)) +
  geom_line(size = 1) +
  scale_color_manual(values = c("60 Hz (Motor)" = "#27ae60",
                                 "85 Hz (Fault)" = "#e74c3c",
                                 "120 Hz (Harmonic)" = "#3498db")) +
  labs(title = "Frequency Band Evolution", 
       x = "Day", y = "Relative Power", color = NULL) +
  theme_minimal() +
  theme(legend.position = "bottom")

# Panel 5: Statistical summary
stats_data <- data.frame(
  metric = c("RMS", "Peak", "Crest Factor", "Kurtosis"),
  value = c(2.3, 8.5, 3.7, 4.2),
  threshold = c(2.5, 10, 4, 5),
  status = c("OK", "OK", "OK", "OK")
)

p_stats <- ggplot(stats_data, aes(x = metric, y = value)) +
  geom_col(fill = "#3498db", alpha = 0.7) +
  geom_point(aes(y = threshold), color = "#e74c3c", size = 4, shape = 18) +
  geom_hline(yintercept = 0) +
  labs(title = "Vibration Statistics", x = NULL, y = "Value") +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))

# Panel 6: Maintenance recommendations
recommendations <- data.frame(
  action = c("Monitor", "Schedule\nInspection", "Urgent\nMaintenance"),
  priority = c(2, 5, 1),
  days_until = c(NA, 14, NA)
)

p_actions <- ggplot(recommendations, aes(x = reorder(action, -priority), 
                                         y = priority, fill = action)) +
  geom_col() +
  geom_text(aes(label = ifelse(!is.na(days_until), 
                                paste0(days_until, " days"), "")),
            vjust = -0.5, fontface = "bold") +
  scale_fill_manual(values = c("Monitor" = "#95a5a6",
                                "Schedule\nInspection" = "#f39c12",
                                "Urgent\nMaintenance" = "#e74c3c")) +
  labs(title = "Recommended Actions", x = NULL, y = "Priority") +
  ylim(0, 6) +
  theme_minimal() +
  theme(legend.position = "none")

# Complex layout: 3 rows with different heights
dashboard_equipment <- 
  (p_vib_time + p_spectrum) / 
  (p_health + p_bands) / 
  (p_stats + p_actions) +
  plot_layout(heights = c(1.2, 1, 0.8)) +
  plot_annotation(
    title = "Equipment Health Monitoring Dashboard",
    subtitle = "Bearing condition analysis with time and frequency domain diagnostics",
    caption = "Dashboard generated: 2024-12-05 | Next update: 15 minutes",
    theme = theme(
      plot.title = element_text(size = 16, face = "bold", color = "#2c3e50"),
      plot.subtitle = element_text(size = 11, color = "#7f8c8d"),
      plot.caption = element_text(size = 8, hjust = 1, color = "#95a5a6")
    )
  )

print(dashboard_equipment)
```

**What's new:**
- `plot_layout(heights = c(1.2, 1, 0.8))`: Custom row heights
- Three-row layout with different emphasis
- Integration of time-domain (vibration signal) and frequency-domain (FFT) analysis
- Health scores, trend tracking, and actionable recommendations
- Professional caption with timestamp

**Advanced insight:** Dashboard reveals bearing degradation:
- Time series shows increased amplitude
- FFT spectrum shows 85 Hz fault peak
- Health score declining (now at 40, threshold 70)
- Fault frequency power growing exponentially
- Recommendation: Schedule inspection within 14 days

---

## Example 4: Complex Dashboard with Mixed Plot Sizes

**Goal:** Create asymmetric layout with featured plot (large) + supporting plots (smaller) using cowplot.

```r
library(cowplot)

# Large featured plot: Spectrogram
set.seed(101)
spec_data <- expand.grid(
  time = 1:50,
  frequency = seq(0, 200, length.out = 100)
)
spec_data$power <- with(spec_data, 
  exp(-((frequency-60)^2)/100) +  # Motor peak
  0.5*exp(-((frequency-85)^2)/100) * (time/50)  # Growing fault
) + rnorm(nrow(spec_data), 0, 0.1)

p_featured <- ggplot(spec_data, aes(x = time, y = frequency, fill = power)) +
  geom_raster() +
  scale_fill_viridis_c(option = "inferno") +
  geom_hline(yintercept = c(60, 85), linetype = "dashed", 
             color = "white", alpha = 0.5) +
  labs(title = "Bearing Degradation Spectrogram (50 seconds)",
       x = "Time (s)", y = "Frequency (Hz)") +
  theme_minimal() +
  theme(legend.position = "right")

# Small supporting plots
p_kpi1 <- ggplot(data.frame(x=1, y=92), aes(x, y)) +
  geom_text(aes(label = paste0(y, "%")), size = 15, fontface = "bold", 
            color = "#e74c3c") +
  labs(title = "Alert Rate") +
  ylim(0, 100) +
  theme_void() +
  theme(plot.title = element_text(hjust = 0.5, face = "bold"))

p_kpi2 <- ggplot(data.frame(x=1, y=87), aes(x, y)) +
  geom_text(aes(label = paste0(y, "%")), size = 15, fontface = "bold", 
            color = "#27ae60") +
  labs(title = "Uptime") +
  ylim(0, 100) +
  theme_void() +
  theme(plot.title = element_text(hjust = 0.5, face = "bold"))

p_kpi3 <- ggplot(data.frame(x=1, y=45), aes(x, y)) +
  geom_text(aes(label = y), size = 15, fontface = "bold", 
            color = "#f39c12") +
  labs(title = "Health Score") +
  ylim(0, 100) +
  theme_void() +
  theme(plot.title = element_text(hjust = 0.5, face = "bold"))

p_kpi4 <- ggplot(data.frame(x=1, y=14), aes(x, y)) +
  geom_text(aes(label = paste(y, "days")), size = 10, fontface = "bold", 
            color = "#3498db") +
  labs(title = "Until Maintenance") +
  theme_void() +
  theme(plot.title = element_text(hjust = 0.5, face = "bold"))

# Assemble with cowplot
kpi_grid <- plot_grid(p_kpi1, p_kpi2, p_kpi3, p_kpi4, ncol = 2)

dashboard_mixed <- plot_grid(
  p_featured,
  kpi_grid,
  ncol = 1,
  rel_heights = c(3, 1),
  labels = c("A", "B"),
  label_size = 14
)

# Add title
title <- ggdraw() + 
  draw_label("Predictive Maintenance Executive Dashboard", 
             fontface = 'bold', size = 16)

dashboard_final <- plot_grid(title, dashboard_mixed, ncol = 1, 
                             rel_heights = c(0.1, 1))

print(dashboard_final)
```

**What's new:**
- `cowplot::plot_grid()`: Precise control over layout
- `rel_heights = c(3, 1)`: Featured plot 3× taller than KPIs
- `labels = c("A", "B")`: Panel labels for publications
- `ggdraw() + draw_label()`: Custom title panel
- Nested grids: KPIs in 2×2, then combined with main plot

**Result:** Executive-friendly dashboard with prominent spectrogram and key metrics at a glance.

---

## Example 5: Publication-Quality Multi-Building Comparison

**Goal:** Create polished figure suitable for technical publications with consistent theming and annotations.

```r
# Create custom theme
theme_publication <- function() {
  theme_minimal() +
    theme(
      plot.title = element_text(size = 12, face = "bold", color = "#2c3e50"),
      plot.subtitle = element_text(size = 10, color = "#7f8c8d"),
      axis.title = element_text(size = 10, face = "bold"),
      axis.text = element_text(size = 9),
      legend.title = element_text(size = 10, face = "bold"),
      legend.text = element_text(size = 9),
      panel.grid.minor = element_blank(),
      strip.text = element_text(size = 10, face = "bold"),
      strip.background = element_rect(fill = "gray90", color = "gray60")
    )
}

# Set theme globally
theme_set(theme_publication())

# Generate data for 3 buildings
set.seed(202)
buildings <- c("Building A", "Building B", "Building C")
building_data <- data.frame()

for (bldg in buildings) {
  energy <- data.frame(
    building = bldg,
    hour = 0:23,
    consumption = 100 + 50*sin(2*pi*(0:23)/24 + pi/2) + rnorm(24, 0, 10)
  )
  building_data <- rbind(building_data, energy)
}

# Panel A: Energy consumption profiles
p_energy <- ggplot(building_data, aes(x = hour, y = consumption, 
                                      color = building)) +
  geom_line(size = 1) +
  geom_point(size = 2) +
  scale_color_brewer(palette = "Set1") +
  labs(title = "A) Daily Energy Consumption Profiles",
       x = "Hour of Day", y = "Consumption (kWh)",
       color = NULL) +
  theme(legend.position = "bottom")

# Panel B: Efficiency comparison
efficiency_data <- data.frame(
  building = buildings,
  efficiency = c(85, 78, 92),
  target = 80
)

p_efficiency <- ggplot(efficiency_data, aes(x = building, y = efficiency)) +
  geom_col(fill = "#3498db", alpha = 0.7) +
  geom_hline(yintercept = 80, linetype = "dashed", color = "#e74c3c", size = 1) +
  geom_text(aes(label = paste0(efficiency, "%")), vjust = -0.5, 
            fontface = "bold", size = 4) +
  annotate("text", x = 2.5, y = 82, label = "Target: 80%", 
           color = "#e74c3c", fontface = "italic") +
  labs(title = "B) Energy Efficiency Ratings",
       x = NULL, y = "Efficiency (%)") +
  ylim(0, 100)

# Panel C: Cost analysis
cost_data <- data.frame(
  building = rep(buildings, each = 3),
  category = rep(c("Electricity", "HVAC", "Lighting"), 3),
  cost = c(
    45, 30, 15,  # Building A
    50, 35, 18,  # Building B
    38, 25, 12   # Building C
  )
)

p_costs <- ggplot(cost_data, aes(x = building, y = cost, fill = category)) +
  geom_col(position = "stack") +
  scale_fill_brewer(palette = "Set2") +
  labs(title = "C) Monthly Operating Costs",
       x = NULL, y = "Cost ($1000s)", fill = "Category") +
  theme(legend.position = "bottom")

# Combine with publication layout
figure_publication <- p_energy / (p_efficiency + p_costs) +
  plot_layout(heights = c(1.5, 1)) +
  plot_annotation(
    title = "Multi-Building Energy Management Analysis",
    caption = "Figure 1: Comparative analysis of energy consumption, efficiency, and costs across three buildings.\nData collected: January 2024 | Analysis method: Hourly consumption monitoring with real-time efficiency calculation.",
    theme = theme(
      plot.title = element_text(size = 14, face = "bold", hjust = 0),
      plot.caption = element_text(size = 8, hjust = 0, lineheight = 1.2)
    )
  )

print(figure_publication)

# Save high-resolution version
ggsave("publication_figure1.png", figure_publication, 
       width = 10, height = 8, dpi = 600)
```

**What's new:**
- Custom `theme_publication()`: Consistent professional styling
- `theme_set()`: Apply theme to all subsequent plots
- Panel labels (A, B, C) in titles
- Detailed caption with methods
- `dpi = 600`: High resolution for print publication
- Color schemes from `RColorBrewer` (colorblind-friendly)

**Result:** Publication-ready figure suitable for journals, reports, or conference presentations.

---

## Example 6 (Bonus): Automated Multi-Domain Monitoring Dashboard

**Goal:** Create comprehensive 8-panel dashboard combining all monitoring domains: time, frequency, spatial, statistical, with automated layout.

```r
# This example integrates all previous concepts

# Generate comprehensive dataset
set.seed(999)

# 1. Real-time sensor map (spatial)
sensor_locations <- data.frame(
  sensor_id = 1:12,
  x = c(1,2,3,4, 1,2,3,4, 1,2,3,4),
  y = c(1,1,1,1, 2,2,2,2, 3,3,3,3),
  status = sample(c("Normal", "Warning", "Critical"), 12, 
                  replace = TRUE, prob = c(0.7, 0.25, 0.05)),
  temperature = rnorm(12, 25, 3)
)

p1_spatial <- ggplot(sensor_locations, aes(x = x, y = y, fill = temperature, 
                                           shape = status)) +
  geom_point(size = 8) +
  scale_fill_gradient2(low = "blue", mid = "white", high = "red", 
                       midpoint = 25) +
  scale_shape_manual(values = c("Normal" = 21, "Warning" = 24, 
                                "Critical" = 25)) +
  labs(title = "Sensor Network Status", x = NULL, y = NULL) +
  coord_fixed() +
  theme_minimal() +
  theme(axis.text = element_blank(), panel.grid = element_blank())

# 2-4: Use previously created plots (trend, spectrum, health)
# 5. Alert timeline
alert_timeline <- data.frame(
  day = 1:30,
  alerts = rpois(30, lambda = 2)
)

p5_alerts <- ggplot(alert_timeline, aes(x = day, y = alerts)) +
  geom_col(fill = "#e74c3c", alpha = 0.7) +
  geom_smooth(method = "loess", se = FALSE, color = "#2c3e50") +
  labs(title = "Alert Frequency", x = "Day", y = "Alerts") +
  theme_minimal()

# 6. System uptime
uptime_data <- data.frame(
  system = c("HVAC", "Lighting", "Security", "Network"),
  uptime = c(99.2, 99.8, 98.5, 99.9)
)

p6_uptime <- ggplot(uptime_data, aes(x = reorder(system, uptime), y = uptime)) +
  geom_col(fill = "#27ae60", alpha = 0.7) +
  geom_hline(yintercept = 99, linetype = "dashed", color = "#e74c3c") +
  coord_flip() +
  labs(title = "System Uptime (%)", x = NULL, y = "Uptime (%)") +
  ylim(95, 100) +
  theme_minimal()

# 7. Power consumption
power_data <- data.frame(
  timestamp = seq(Sys.time() - 7*24*3600, Sys.time(), by = "hour"),
  power_kw = 100 + 30*sin(2*pi*(1:169)/24) + rnorm(169, 0, 10)
)

p7_power <- ggplot(power_data, aes(x = timestamp, y = power_kw)) +
  geom_line(color = "#3498db") +
  geom_smooth(method = "loess", se = TRUE, color = "#e74c3c", span = 0.2) +
  labs(title = "7-Day Power Consumption", x = NULL, y = "Power (kW)") +
  theme_minimal()

# 8. Executive summary table
summary_data <- data.frame(
  metric = c("Sensors Online", "Avg Temperature", "Active Alerts", 
             "Overall Health"),
  value = c("12/12", "24.8°C", "3", "92%")
)

p8_summary <- ggplot(summary_data, aes(x = 1, y = 4:1, label = value)) +
  geom_text(size = 6, fontface = "bold", color = "#2c3e50") +
  geom_text(aes(x = 0.3, label = metric), hjust = 1, size = 4) +
  xlim(0, 2) +
  labs(title = "System Summary") +
  theme_void() +
  theme(plot.title = element_text(hjust = 0.5, face = "bold"))

# Assemble complete dashboard
dashboard_complete <- 
  (p1_spatial + p_trend) /
  (p_spectrum + p_health) /
  (p5_alerts + p6_uptime) /
  (p7_power + p8_summary) +
  plot_layout(heights = c(1, 1.2, 0.8, 1)) +
  plot_annotation(
    title = "Integrated Building Management System Dashboard",
    subtitle = "Real-time monitoring across spatial, temporal, and frequency domains",
    caption = "Auto-generated dashboard | Update frequency: 5 minutes | Last update: 2024-12-05 14:30:00",
    theme = theme(
      plot.title = element_text(size = 16, face = "bold"),
      plot.subtitle = element_text(size = 11),
      plot.caption = element_text(size = 8, hjust = 1)
    )
  )

print(dashboard_complete)

# Save dashboard
ggsave("complete_monitoring_dashboard.png", dashboard_complete,
       width = 16, height = 12, dpi = 300)
```

**What's new:**
- 8-panel comprehensive layout
- Mixed visualization types: spatial, temporal, frequency, statistical
- Automated layout with custom heights
- Executive summary panel
- Complete system overview in single dashboard
- Auto-update capability (caption with timestamp)

**Practical deployment:**
This dashboard template can be automated with:
1. Real-time data feeds from IoT sensors
2. Scheduled R script execution (every 5 minutes)
3. Auto-refresh web display (Shiny dashboard)
4. Email alerts when critical thresholds exceeded
5. PDF report generation for daily summaries

---

## Summary

In this chapter, you learned advanced dashboard layout techniques:

1. **Two-panel layouts** (`+` operator) for simple side-by-side views
2. **Grid layouts** (`/` for rows, `+` for columns) with patchwork
3. **Complex equipment dashboards** integrating time and frequency analysis
4. **Mixed-size layouts** with `rel_heights` and `cowplot::plot_grid()`
5. **Publication-quality figures** with custom themes and captions
6. **Comprehensive monitoring systems** combining 8+ visualization types

**Key packages and functions:**
- `patchwork`: `+`, `/`, `|`, `plot_layout()`, `plot_annotation()`
- `cowplot`: `plot_grid()`, `ggdraw()`, `draw_label()`
- `ggsave()`: High-resolution export (dpi = 300-600)
- `theme_set()`: Global theme application
- Custom themes for consistent branding

**Layout operators (patchwork):**
- `plot1 + plot2`: Horizontal (side-by-side)
- `plot1 / plot2`: Vertical (stacked)
- `(p1 + p2) / (p3 + p4)`: 2×2 grid
- `plot_layout(widths = ..., heights = ...)`: Custom sizing

**IoT Dashboard Applications:**
- Real-time monitoring: Current status + recent trends
- Predictive maintenance: Time + frequency + health scores
- Equipment diagnostics: FFT spectra + spectrograms
- Multi-building management: Comparative analytics
- Executive summaries: KPIs + visualizations
- Automated reporting: Scheduled PDF/PNG generation

**Best practices:**
1. Limit to 4-8 panels (avoid overwhelming users)
2. Group related visualizations
3. Use consistent color schemes
4. Include timestamps and update frequency
5. Provide actionable insights (not just data)
6. Test dashboard on target display size
7. Optimize plot rendering (use `geom_raster()` for large heatmaps)

Modern IoT monitoring requires integrating multiple perspectives: temporal trends, frequency analysis, spatial relationships, and statistical summaries. Advanced dashboard layouts enable operators to quickly assess system health, identify issues, and make informed maintenance decisions.

---

## Practice Exercises

1. **Three-Panel Trend Dashboard**: Create layout with 7-day, 24-hour, and 1-hour trends side-by-side. Use `patchwork` with custom widths.

2. **Frequency Monitoring**: Build 4-panel dashboard showing: time series, FFT spectrum, spectrogram, and frequency band trends. Apply consistent color scheme.

3. **Multi-Sensor Comparison**: Generate grid layout (3×4) comparing 12 sensors. Each panel shows mini-trend + current value. Use faceting or patchwork.

4. **Executive KPI Dashboard**: Create mobile-friendly vertical layout (1 column) with 6 large KPI cards showing key metrics with trends.

5. **Nested Layout**: Build dashboard with 1 large featured plot (spectrogram) + 2 rows of 3 small supporting plots each (6 total).

6. **Animated Dashboard**: Modify complete dashboard to accept time parameter. Create series of PNG files for animation showing system evolution over 24 hours.

**Challenge:** Build production-ready automated monitoring system that:
1. Connects to real sensor data streams (MQTT or REST API)
2. Updates dashboard every 5 minutes
3. Computes FFT and spectrogram in real-time
4. Triggers email alerts when health scores drop
5. Generates daily PDF reports with 24-hour summary
6. Hosts dashboard on web server (Shiny or Dash)
7. Includes data quality checks and error handling
