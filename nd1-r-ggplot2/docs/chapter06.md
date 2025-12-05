# Chapter 6: Bar Charts and Categorical Sensor Data

## Learning Objectives
By the end of this chapter, you will be able to:
- Visualize categorical sensor data and operational states
- Create bar charts for sensor status counts and summaries
- Compare sensor performance metrics across multiple devices
- Visualize alert frequencies and downtime statistics
- Use grouped and stacked bars for multi-category comparisons
- Create horizontal bars for sensor rankings and comparisons
- Apply effective color schemes for status indicators

## Introduction

While previous chapters focused on continuous numerical data (temperature readings, correlations), IoT systems also generate substantial categorical data: sensor states (ON/OFF, Normal/Warning/Critical), alert types, maintenance events, and performance classifications. Bar charts are the ideal tool for visualizing these categorical relationships and comparing counts or metrics across sensors.

In sensor fleet management, understanding which sensors generate the most alerts, which zones require maintenance attention, and how data quality varies across devices is crucial for operational efficiency. This chapter teaches you to create effective bar chart visualizations for these categorical scenarios.

## IoT Context: Sensor Fleet Management

You're managing a facility with 20 environmental sensors distributed across different zones. Your monitoring system tracks:
- **Operational states**: Normal, Warning, Critical alerts over 30 days
- **Uptime metrics**: Operating hours vs. downtime per sensor
- **Data quality**: Percentage of valid, missing, and out-of-range readings
- **Maintenance events**: Response times and issue types by zone
- **Performance categories**: Rankings by sensor type and age

Understanding these categorical patterns helps identify problematic sensors, optimize maintenance schedules, and improve overall system reliability.

## Dataset Description

**Sensor Fleet Operational Data:**
- **20 sensors** across facility (TEMP_001 through TEMP_020)
- **30 days** of operational monitoring
- **Alert categories**: Normal (green), Warning (yellow), Critical (red)
- **Zones**: Server Room, Office, Warehouse, Lab (5 sensors each)
- **Data quality metrics**: Valid readings, missing data, out-of-range values
- **Realistic patterns**: 
  - Newer sensors (001-005): fewer alerts, better uptime
  - Older sensors (016-020): more warnings, occasional critical states
  - Zone effects: Server rooms well-controlled, warehouses more variable
  - Maintenance response times vary by zone accessibility

The dataset simulates real-world sensor fleet management challenges with varying sensor ages, environmental conditions, and operational contexts.

---

## Example 1: Basic Bar Chart - Alert Counts by Sensor

**Goal:** Create a simple bar chart showing total alert count per sensor to identify which devices generate the most issues.

```r
# Generate sensor alert data
set.seed(123)
sensor_ids <- paste0("TEMP_", sprintf("%03d", 1:20))

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

# Basic bar chart
ggplot(alert_counts, aes(x = sensor_id, y = alerts)) +
  geom_col()
```

**What's happening:**
- `geom_col()`: Creates bars with heights from the data (use `geom_bar()` for counts)
- X-axis shows all 20 sensor IDs
- Y-axis shows alert counts
- Default styling with gray bars

**Insight:** Sensors 16-20 clearly show elevated alert frequencies, indicating aging sensors requiring attention.

---

## Example 2: Grouped Bars - Compare Alert Types Across Sensors

**Goal:** Show breakdown of Normal/Warning/Critical states for top 8 sensors using side-by-side grouped bars.

```r
# Generate detailed alert data for top alert sensors
set.seed(123)
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

# Grouped bar chart
ggplot(alert_details, aes(x = sensor_id, y = count, fill = status)) +
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
```

**What's new:**
- `position = "dodge"`: Places bars side-by-side instead of stacked
- `scale_fill_manual()`: Custom colors matching traffic light convention
- `fill = status`: Colors bars by alert severity
- Factor ordering ensures consistent legend order

**Insight:** TEMP_020 shows concerning pattern with high critical alerts (7) and low normal states (5), indicating serious degradation.

---

## Example 3: Stacked Bars - Sensor Status Composition Over Time

**Goal:** Visualize how alert composition changes week-by-week across facility zones using stacked bars.

```r
# Generate weekly alert data by zone
set.seed(456)
zones <- c("Server Room", "Office", "Warehouse", "Lab")
weeks <- paste("Week", 1:4)

weekly_alerts <- expand.grid(
  zone = zones,
  week = weeks,
  status = c("Normal", "Warning", "Critical")
)

# Simulate realistic patterns
weekly_alerts$count <- c(
  # Week 1
  120, 15, 5,   # Server Room: well controlled
  90, 30, 10,   # Office: moderate
  60, 50, 20,   # Warehouse: variable
  100, 25, 5,   # Lab: good control
  
  # Week 2 (warehouse HVAC issue)
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

# Stacked bar chart
ggplot(weekly_alerts, aes(x = week, y = count, fill = status)) +
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
```

**What's new:**
- `position = "stack"`: Bars stack vertically showing composition
- `facet_wrap(~ zone)`: Separate panel per zone for comparison
- Stacked height shows total alert volume
- Color segments show status distribution

**Insight:** Warehouse zone shows clear deterioration in Week 3 (large red segment), then improvement after maintenance in Week 4.

---

## Example 4: Horizontal Bars - Sensor Uptime Ranking

**Goal:** Create horizontal bar chart ranking sensors by uptime percentage, sorted from best to worst performers.

```r
# Generate uptime data for all sensors
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

# Horizontal bar chart with sorting
ggplot(uptime_data, aes(x = reorder(sensor_id, uptime_pct), 
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
```

**What's new:**
- `coord_flip()`: Rotates to horizontal orientation
- `reorder(sensor_id, uptime_pct)`: Sorts bars by value
- Horizontal layout better for many categories (20 sensors)
- `geom_hline()`: Adds target threshold line
- Color coding by performance tier

**Insight:** 8 sensors fall below 95% uptime target (sensors 12-20), requiring maintenance prioritization.

---

## Example 5: Percentage Bars - Data Quality Metrics

**Goal:** Compare data quality across zones using normalized 100% stacked bars showing proportions of valid/missing/invalid readings.

```r
# Generate data quality metrics by zone
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

# Calculate percentages for annotation
quality_summary <- quality_data %>%
  group_by(zone) %>%
  mutate(
    total = sum(count),
    percentage = count / total * 100
  )

# 100% stacked bar chart
ggplot(quality_data, aes(x = zone, y = count, fill = metric)) +
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
```

**What's new:**
- `position = "fill"`: Normalizes bars to 100% for proportion comparison
- `scale_y_continuous(labels = scales::percent)`: Shows axis as percentages
- All bars same height, segments show relative proportions
- Focuses on composition, not absolute counts

**Insight:** Warehouse shows significantly lower data quality (84% valid) compared to Server Room (97% valid), indicating connectivity or environmental issues.

---

## Example 6 (Bonus): Annotated Performance Dashboard

**Goal:** Create professional dashboard with value labels, threshold indicators, and comprehensive styling for management reporting.

```r
# Generate maintenance response time data
set.seed(654)
maintenance_data <- data.frame(
  zone = zones,
  avg_response_hours = c(2.5, 4.2, 6.8, 3.1),
  incident_count = c(5, 12, 28, 8)
)

# Add status based on response time threshold
maintenance_data$status <- ifelse(maintenance_data$avg_response_hours <= 4,
                                  "Meets SLA", "Exceeds SLA")

# Calculate bar positions for labels
maintenance_data$label_y <- maintenance_data$avg_response_hours + 0.3

# Professional annotated bar chart
ggplot(maintenance_data, aes(x = reorder(zone, -avg_response_hours), 
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
```

**What's new:**
- `geom_text()`: Adds value labels directly on bars
- `sprintf()`: Formats labels with response time and incident count
- `vjust = -0.3`: Positions labels above bars
- Comprehensive theme customization for professional appearance
- `caption`: Adds data source and methodology notes
- Multiple annotations for context

**Professional elements:**
- Clear SLA threshold line with label
- Value labels showing both metrics
- Color coding for SLA compliance
- Polished typography and spacing
- Management-ready presentation

**Insight:** Warehouse zone exceeds SLA by 70% (6.8 vs 4.0 hours) despite high incident volume, indicating need for dedicated maintenance resources or improved access.

---

## Summary

In this chapter, you learned to visualize categorical IoT sensor data using bar charts:

1. **Basic bar charts** (`geom_col()`) for comparing counts across sensors
2. **Grouped bars** (`position = "dodge"`) for multi-category side-by-side comparison
3. **Stacked bars** (`position = "stack"`) for showing composition and totals
4. **Horizontal bars** (`coord_flip()` + `reorder()`) for rankings and many categories
5. **Percentage bars** (`position = "fill"`) for normalized proportion comparisons
6. **Annotated dashboards** with labels, thresholds, and professional styling

**Key ggplot2 functions:**
- `geom_col()` / `geom_bar()`: Create bar charts
- `position`: Control bar arrangement (dodge/stack/fill)
- `coord_flip()`: Horizontal orientation
- `reorder()`: Sort bars by values
- `geom_text()`: Add value labels
- `scale_fill_manual()`: Custom color schemes
- `geom_hline()`: Add reference thresholds

**IoT Applications:**
- Alert frequency monitoring and sensor health tracking
- Uptime rankings and performance comparisons
- Data quality assessment across zones
- Maintenance SLA compliance visualization
- Operational status dashboards for management

Bar charts are essential for communicating categorical sensor patterns to stakeholders, enabling data-driven decisions about maintenance priorities, resource allocation, and system optimization.

---

## Practice Exercises

1. **Alert Type Analysis**: Create a grouped bar chart comparing different alert types (Temperature, Humidity, Connectivity) across 10 sensors. Color code by severity.

2. **Monthly Trend**: Generate stacked bars showing alert composition for each month of the year. Identify seasonal patterns in sensor behavior.

3. **Sensor Ranking Dashboard**: Create horizontal bars ranking all 20 sensors by data quality percentage. Add threshold lines at 90% and 95%.

4. **Zone Comparison**: Build a 100% stacked bar chart comparing time spent in Normal/Warning/Critical states across 5 zones. Which zone needs attention?

5. **Manufacturer Analysis**: Compare sensor reliability across 3 manufacturers using grouped bars (uptime, alert frequency, data quality). Add value labels.

6. **Advanced Dashboard**: Combine multiple bar charts (alert counts, uptime ranking, data quality) into a single faceted view for comprehensive sensor fleet status.

**Challenge:** Create an automated weekly report that generates bar charts for top 5 problematic sensors, highlighting which metrics triggered their inclusion (alerts, downtime, or data quality).
