# ==============================================================================
# Chapter 6: Bar Charts and Categorical Sensor Data
# R Code for all examples
# ==============================================================================

# Load required libraries
library(ggplot2)
library(dplyr)

# Set seed for reproducibility
set.seed(123)

# ==============================================================================
# DATA GENERATION
# ==============================================================================

# Generate sensor IDs (20 sensors)
sensor_ids <- paste0("TEMP_", sprintf("%03d", 1:20))

# Define zones
zones <- c("Server Room", "Office", "Warehouse", "Lab")

# ------------------------------------------------------------------------------
# Dataset 1: Basic Alert Counts
# ------------------------------------------------------------------------------
# Simulate alert counts (newer sensors = fewer alerts)
alert_counts <- data.frame(
  sensor_id = sensor_ids,
  alerts = c(
    rpois(5, lambda = 3),   # Sensors 1-5: new, few alerts
    rpois(5, lambda = 8),   # Sensors 6-10: moderate age
    rpois(5, lambda = 12),  # Sensors 11-15: aging
    rpois(5, lambda = 18)   # Sensors 16-20: old, many alerts
  )
)

# ------------------------------------------------------------------------------
# Dataset 2: Detailed Alert Breakdown
# ------------------------------------------------------------------------------
# Generate detailed alert data for top alert sensors
top_sensors <- paste0("TEMP_", sprintf("%03d", 13:20))

alert_details <- data.frame(
  sensor_id = rep(top_sensors, each = 3),
  status = rep(c("Normal", "Warning", "Critical"), times = 8),
  count = c(
    # TEMP_013
    20, 8, 2,
    # TEMP_014
    18, 10, 2,
    # TEMP_015
    15, 12, 3,
    # TEMP_016
    12, 15, 3,
    # TEMP_017
    10, 16, 4,
    # TEMP_018
    8, 18, 4,
    # TEMP_019
    6, 20, 4,
    # TEMP_020
    5, 18, 7
  )
)

# Convert status to factor with proper order
alert_details$status <- factor(alert_details$status, 
                               levels = c("Normal", "Warning", "Critical"))

# ------------------------------------------------------------------------------
# Dataset 3: Weekly Alert Data by Zone
# ------------------------------------------------------------------------------
set.seed(456)
weeks <- paste("Week", 1:4)

weekly_alerts <- expand.grid(
  zone = zones,
  week = weeks,
  status = c("Normal", "Warning", "Critical")
)

# Simulate realistic patterns (warehouse HVAC failure in Week 3)
weekly_alerts$count <- c(
  # Week 1
  120, 15, 5,   # Server Room: well controlled
  90, 30, 10,   # Office: moderate
  60, 50, 20,   # Warehouse: variable
  100, 25, 5,   # Lab: good control
  
  # Week 2 (warehouse HVAC issue starting)
  118, 17, 5,
  85, 35, 10,
  45, 60, 25,   # Warehouse degrading
  95, 30, 5,
  
  # Week 3 (warehouse critical)
  115, 20, 5,
  88, 32, 10,
  35, 55, 40,   # Warehouse critical spike
  98, 27, 5,
  
  # Week 4 (warehouse fixed)
  120, 15, 5,
  92, 28, 10,
  70, 45, 15,   # Warehouse improving
  100, 25, 5
)

weekly_alerts$status <- factor(weekly_alerts$status,
                               levels = c("Normal", "Warning", "Critical"))
weekly_alerts$week <- factor(weekly_alerts$week, levels = weeks)

# ------------------------------------------------------------------------------
# Dataset 4: Sensor Uptime Rankings
# ------------------------------------------------------------------------------
set.seed(789)
uptime_data <- data.frame(
  sensor_id = sensor_ids,
  uptime_pct = c(
    runif(5, 96, 99.5),   # New sensors: excellent uptime
    runif(5, 92, 96),     # Moderate age: good uptime
    runif(5, 85, 92),     # Aging: declining uptime
    runif(5, 75, 85)      # Old: poor uptime
  )
)

# Add performance category
uptime_data$performance <- cut(uptime_data$uptime_pct,
                               breaks = c(0, 85, 95, 100),
                               labels = c("Needs Attention", "Acceptable", "Excellent"))

# ------------------------------------------------------------------------------
# Dataset 5: Data Quality Metrics by Zone
# ------------------------------------------------------------------------------
set.seed(321)
quality_data <- data.frame(
  zone = rep(zones, each = 3),
  metric = rep(c("Valid", "Missing", "Out-of-Range"), times = 4),
  count = c(
    # Server Room: excellent quality
    4850, 100, 50,
    
    # Office: good quality  
    4700, 200, 100,
    
    # Warehouse: moderate quality (connectivity issues)
    4200, 600, 200,
    
    # Lab: good quality
    4750, 180, 70
  )
)

quality_data$metric <- factor(quality_data$metric,
                              levels = c("Valid", "Missing", "Out-of-Range"))

# ------------------------------------------------------------------------------
# Dataset 6: Maintenance Response Times
# ------------------------------------------------------------------------------
set.seed(654)
maintenance_data <- data.frame(
  zone = zones,
  avg_response_hours = c(2.5, 4.2, 6.8, 3.1),
  incident_count = c(5, 12, 28, 8)
)

# Add status based on response time threshold (4 hours SLA)
maintenance_data$status <- ifelse(maintenance_data$avg_response_hours <= 4,
                                  "Meets SLA", "Exceeds SLA")

# Calculate bar positions for labels
maintenance_data$label_y <- maintenance_data$avg_response_hours + 0.3


# ==============================================================================
# EXAMPLE 1: Basic Bar Chart - Alert Counts by Sensor
# ==============================================================================
cat("\n=== Example 1: Basic Bar Chart ===\n")

p1 <- ggplot(alert_counts, aes(x = sensor_id, y = alerts)) +
  geom_col()

print(p1)

# Save plot
ggsave("chapter06_example1_basic_bar.png", p1, width = 10, height = 6, dpi = 300)
cat("Plot saved: chapter06_example1_basic_bar.png\n")


# ==============================================================================
# EXAMPLE 2: Grouped Bars - Compare Alert Types Across Sensors
# ==============================================================================
cat("\n=== Example 2: Grouped Bars ===\n")

p2 <- ggplot(alert_details, aes(x = sensor_id, y = count, fill = status)) +
  geom_col(position = "dodge") +
  scale_fill_manual(values = c("Normal" = "#2ecc71",    # Green
                                "Warning" = "#f39c12",   # Orange
                                "Critical" = "#e74c3c")) + # Red
  labs(
    title = "Alert Breakdown by Sensor",
    subtitle = "30-day operational status comparison",
    x = "Sensor ID",
    y = "Alert Count",
    fill = "Status"
  ) +
  theme_minimal()

print(p2)

# Save plot
ggsave("chapter06_example2_grouped_bars.png", p2, width = 10, height = 6, dpi = 300)
cat("Plot saved: chapter06_example2_grouped_bars.png\n")


# ==============================================================================
# EXAMPLE 3: Stacked Bars - Sensor Status Composition Over Time
# ==============================================================================
cat("\n=== Example 3: Stacked Bars ===\n")

p3 <- ggplot(weekly_alerts, aes(x = week, y = count, fill = status)) +
  geom_col(position = "stack") +
  facet_wrap(~ zone, ncol = 2) +
  scale_fill_manual(values = c("Normal" = "#2ecc71",
                                "Warning" = "#f39c12",
                                "Critical" = "#e74c3c")) +
  labs(
    title = "Weekly Alert Composition by Zone",
    subtitle = "Warehouse HVAC failure visible in Week 3",
    x = "Week",
    y = "Total Alerts",
    fill = "Status"
  ) +
  theme_minimal() +
  theme(
    strip.background = element_rect(fill = "gray90", color = "gray60"),
    strip.text = element_text(face = "bold")
  )

print(p3)

# Save plot
ggsave("chapter06_example3_stacked_bars.png", p3, width = 10, height = 8, dpi = 300)
cat("Plot saved: chapter06_example3_stacked_bars.png\n")


# ==============================================================================
# EXAMPLE 4: Horizontal Bars - Sensor Uptime Ranking
# ==============================================================================
cat("\n=== Example 4: Horizontal Bars ===\n")

p4 <- ggplot(uptime_data, aes(x = reorder(sensor_id, uptime_pct), 
                              y = uptime_pct, 
                              fill = performance)) +
  geom_col() +
  coord_flip() +
  scale_fill_manual(values = c("Needs Attention" = "#e74c3c",
                                "Acceptable" = "#f39c12",
                                "Excellent" = "#2ecc71")) +
  geom_hline(yintercept = 95, linetype = "dashed", color = "blue", size = 0.8) +
  annotate("text", x = 19, y = 96, label = "95% Target", 
           hjust = 0, color = "blue", size = 3.5) +
  labs(
    title = "Sensor Uptime Performance Ranking",
    subtitle = "30-day operational availability (sorted best to worst)",
    x = "Sensor ID",
    y = "Uptime (%)",
    fill = "Performance"
  ) +
  theme_minimal() +
  theme(
    panel.grid.major.y = element_blank(),
    axis.text.y = element_text(size = 8)
  )

print(p4)

# Save plot
ggsave("chapter06_example4_horizontal_bars.png", p4, width = 10, height = 8, dpi = 300)
cat("Plot saved: chapter06_example4_horizontal_bars.png\n")


# ==============================================================================
# EXAMPLE 5: Percentage Bars - Data Quality Metrics
# ==============================================================================
cat("\n=== Example 5: Percentage Bars ===\n")

p5 <- ggplot(quality_data, aes(x = zone, y = count, fill = metric)) +
  geom_col(position = "fill") +
  scale_y_continuous(labels = scales::percent) +
  scale_fill_manual(values = c("Valid" = "#2ecc71",
                                "Missing" = "#95a5a6",
                                "Out-of-Range" = "#e74c3c")) +
  labs(
    title = "Data Quality Comparison by Zone",
    subtitle = "Proportion of valid, missing, and invalid readings",
    x = "Zone",
    y = "Percentage",
    fill = "Data Quality"
  ) +
  theme_minimal() +
  theme(
    panel.grid.major.x = element_blank(),
    legend.position = "bottom"
  )

print(p5)

# Save plot
ggsave("chapter06_example5_percentage_bars.png", p5, width = 10, height = 6, dpi = 300)
cat("Plot saved: chapter06_example5_percentage_bars.png\n")


# ==============================================================================
# EXAMPLE 6 (BONUS): Annotated Performance Dashboard
# ==============================================================================
cat("\n=== Example 6: Annotated Performance Dashboard ===\n")

p6 <- ggplot(maintenance_data, aes(x = reorder(zone, -avg_response_hours), 
                                   y = avg_response_hours, 
                                   fill = status)) +
  geom_col(width = 0.7) +
  geom_hline(yintercept = 4, linetype = "dashed", color = "#34495e", size = 1) +
  geom_text(aes(label = sprintf("%.1f hrs\n(%d incidents)", 
                                avg_response_hours, incident_count)),
            vjust = -0.3, size = 3.5, fontface = "bold") +
  scale_fill_manual(values = c("Meets SLA" = "#27ae60",
                                "Exceeds SLA" = "#e67e22")) +
  annotate("text", x = 3.5, y = 4.2, 
           label = "4-hour SLA Target", 
           hjust = 0, color = "#34495e", size = 4, fontface = "italic") +
  labs(
    title = "Maintenance Response Time Performance",
    subtitle = "Average response time by zone with incident counts",
    x = "Zone",
    y = "Average Response Time (hours)",
    fill = "SLA Status",
    caption = "Data: 30-day operational period | Target: 4 hours"
  ) +
  ylim(0, 8) +
  theme_minimal() +
  theme(
    plot.title = element_text(size = 16, face = "bold", color = "#2c3e50"),
    plot.subtitle = element_text(size = 11, color = "#7f8c8d"),
    plot.caption = element_text(size = 8, color = "#95a5a6", hjust = 0),
    axis.title = element_text(size = 11, face = "bold"),
    axis.text = element_text(size = 10),
    legend.position = "bottom",
    legend.title = element_text(face = "bold"),
    panel.grid.major.x = element_blank(),
    panel.grid.minor.y = element_blank()
  )

print(p6)

# Save plot
ggsave("chapter06_example6_annotated_dashboard.png", p6, width = 10, height = 6, dpi = 300)
cat("Plot saved: chapter06_example6_annotated_dashboard.png\n")


# ==============================================================================
# SUMMARY STATISTICS
# ==============================================================================
cat("\n=== Chapter 6 Summary Statistics ===\n")

cat("\nAlert Count Summary:\n")
print(summary(alert_counts$alerts))

cat("\nSensors exceeding 15 alerts:", 
    sum(alert_counts$alerts > 15), "out of", nrow(alert_counts), "\n")

cat("\nUptime Performance Summary:\n")
print(table(uptime_data$performance))

cat("\nZones below 95% uptime target:", 
    sum(uptime_data$uptime_pct < 95), "sensors\n")

cat("\nData Quality by Zone (% valid):\n")
quality_pct <- quality_data %>%
  group_by(zone) %>%
  summarize(
    valid_pct = count[metric == "Valid"] / sum(count) * 100
  )
print(quality_pct)

cat("\nMaintenance SLA Compliance:\n")
print(table(maintenance_data$status))

cat("\n=== All examples completed successfully ===\n")
