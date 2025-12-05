################################################################################
# Chapter 10: Advanced Dashboard Layouts and Integrated Monitoring Systems
# R ggplot2 Tutorial with IoT Sensor Data Focus
#
# This script demonstrates advanced multi-panel dashboard creation combining
# time-domain and frequency-domain visualizations for comprehensive IoT
# equipment health monitoring and predictive maintenance.
#
# Required packages: ggplot2, dplyr, tidyr, patchwork, cowplot, viridis
################################################################################

# Load required packages
library(ggplot2)
library(dplyr)
library(tidyr)
library(patchwork)
library(cowplot)
library(viridis)

# Set random seed for reproducibility
set.seed(123)

cat("Chapter 10: Advanced Dashboard Layouts\n")
cat("=======================================\n\n")

################################################################################
# Example 1: Two-Panel Dashboard - Current Status + 24-Hour Trend
################################################################################

cat("Example 1: Simple Two-Panel Horizontal Layout\n")

# Generate current status data
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

# Save
ggsave("chapter10_example1_two_panel.png", dashboard_simple, 
       width = 12, height = 5, dpi = 300)
cat("✓ Saved: chapter10_example1_two_panel.png\n\n")

################################################################################
# Example 2: Four-Panel Layout - Time Series, Distribution, Correlation, Alerts
################################################################################

cat("Example 2: Comprehensive Four-Panel Grid Layout\n")

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

# Save
ggsave("chapter10_example2_quad_panel.png", dashboard_quad, 
       width = 12, height = 10, dpi = 300)
cat("✓ Saved: chapter10_example2_quad_panel.png\n\n")

################################################################################
# Example 3: Six-Panel Equipment Health Dashboard with FFT
################################################################################

cat("Example 3: Equipment Health Dashboard with Frequency Analysis\n")

# Generate vibration time series
set.seed(789)
fs <- 1000  # Sampling frequency
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

# Save
ggsave("chapter10_example3_equipment_health.png", dashboard_equipment, 
       width = 14, height = 12, dpi = 300)
cat("✓ Saved: chapter10_example3_equipment_health.png\n\n")

################################################################################
# Example 4: Complex Dashboard with Mixed Plot Sizes (cowplot)
################################################################################

cat("Example 4: Asymmetric Layout with Featured Plot + KPIs\n")

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

# Small supporting plots - KPIs
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

# Save
ggsave("chapter10_example4_executive_dashboard.png", dashboard_final, 
       width = 12, height = 10, dpi = 300)
cat("✓ Saved: chapter10_example4_executive_dashboard.png\n\n")

################################################################################
# Example 5: Publication-Quality Multi-Building Comparison
################################################################################

cat("Example 5: Publication-Ready Figure with Custom Theme\n")

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
ggsave("chapter10_example5_publication_figure.png", figure_publication, 
       width = 10, height = 8, dpi = 600)
cat("✓ Saved: chapter10_example5_publication_figure.png (600 DPI)\n\n")

################################################################################
# Example 6: Comprehensive 8-Panel Multi-Domain Monitoring Dashboard
################################################################################

cat("Example 6: Complete Integrated Building Management System Dashboard\n")

# Reset theme
theme_set(theme_minimal())

# Generate comprehensive dataset

# 1. Real-time sensor map (spatial)
set.seed(999)
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

# 7. Power consumption (7 days)
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

# Assemble complete dashboard (reuse p_trend, p_spectrum, p_health from Example 3)
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
ggsave("chapter10_example6_complete_dashboard.png", dashboard_complete,
       width = 16, height = 12, dpi = 300)
cat("✓ Saved: chapter10_example6_complete_dashboard.png\n\n")

################################################################################
# Summary Statistics
################################################################################

cat("\n" %+% strrep("=", 70) %+% "\n")
cat("CHAPTER 10 SUMMARY\n")
cat(strrep("=", 70) %+% "\n\n")

cat("Dashboard Layouts Created:\n")
cat("  • Two-panel horizontal layout (patchwork)\n")
cat("  • Four-panel 2×2 grid (diverse visualizations)\n")
cat("  • Six-panel equipment health (time + frequency domains)\n")
cat("  • Mixed-size layout (cowplot: featured + KPIs)\n")
cat("  • Publication-quality three-panel figure (600 DPI)\n")
cat("  • Eight-panel comprehensive monitoring system\n\n")

cat("Key Techniques:\n")
cat("  • patchwork operators: +, /, plot_layout(), plot_annotation()\n")
cat("  • cowplot: plot_grid(), rel_heights, panel labels\n")
cat("  • Custom themes: theme_publication()\n")
cat("  • Mixed visualizations: time series, FFT, heatmaps, KPIs\n")
cat("  • High-resolution export: dpi = 300-600\n\n")

cat("IoT Applications:\n")
cat("  • Real-time HVAC monitoring dashboards\n")
cat("  • Predictive maintenance with FFT analysis\n")
cat("  • Equipment health scoring and alerts\n")
cat("  • Multi-building energy management\n")
cat("  • Executive KPI summaries\n")
cat("  • Integrated spatial-temporal-frequency monitoring\n\n")

cat("All 6 examples completed successfully!\n")
cat("All plots saved to current working directory.\n\n")

cat(strrep("=", 70) %+% "\n")
cat("END OF CHAPTER 10\n")
cat(strrep("=", 70) %+% "\n")
