# Chapter 1: Introduction to IoT Sensor Data Visualization

## Learning Objectives

By the end of this chapter, you will be able to:
- Understand the basic ggplot2 syntax and the grammar of graphics
- Create line plots for IoT sensor time series data
- Visualize environmental sensor readings (temperature) over time
- Master basic aesthetics including color, size, and linetype
- Customize plot labels, titles, and themes for sensor dashboards
- Add reference lines for sensor thresholds and safety limits

## Introduction

Welcome to the first chapter of learning data visualization with ggplot2 for IoT applications! As an IoT developer, you work with continuous streams of sensor data from environmental monitors, industrial equipment, and automation systems. Visualizing this data effectively is crucial for monitoring system health, detecting anomalies, and making data-driven decisions.

In this chapter, we'll start with the fundamentals of visualizing **time series sensor data**—the most common data type in IoT systems. You'll learn to create professional visualizations for temperature sensors, which are ubiquitous in environmental monitoring, HVAC systems, industrial processes, and smart buildings.

The **ggplot2** package is built on the "Grammar of Graphics" principle, which means you build plots layer by layer. Think of it like creating a monitoring dashboard: you start with raw sensor readings, add visual context, and then refine the presentation for your specific use case.

### Key ggplot2 Concepts

1. **ggplot()**: Creates the base plot object
2. **aes()**: Aesthetic mappings (what data goes where)
3. **geom_*()**: Geometric objects (how data is displayed)
4. **theme()**: Visual styling and appearance
5. **labs()**: Labels for title, axes, and legends

## Dataset Description

### IoT Temperature Sensor Scenario

You're monitoring a **temperature sensor** deployed in a warehouse or industrial facility. The sensor collects readings continuously over one year (365 days). This is typical of:
- Environmental monitoring systems
- Cold chain logistics (food/pharmaceutical storage)
- Smart building HVAC systems
- Industrial process control
- Agricultural IoT applications

**Dataset Structure:**
- **day**: Day number (1-365) - useful for quick indexing
- **timestamp**: Actual date values - critical for IoT time series
- **temperature_c**: Temperature in Celsius from the sensor
- **sensor_id**: Sensor identifier (for future multi-sensor scenarios)

**Realistic Sensor Characteristics:**
- Seasonal variation pattern (annual HVAC cycle)
- Random measurement noise (±2°C, typical for industrial sensors)
- Sensor drift over time (common in long-term deployments)
- Operating range: 5°C to 30°C (typical warehouse environment)

## Examples

### Example 1: Minimal Sensor Data Plot

**Objective**: Create the simplest possible visualization of sensor readings.

**IoT Context**: Quick data check to verify sensor is operational and collecting data.

**What's new**:
- Basic `ggplot()` structure
- `aes()` for mapping sensor data to visual properties
- `geom_line()` to draw continuous sensor readings

**Code**: See `chapter01.R` - Example 1

**Key Points**:
- This is the minimum viable plot - raw sensor data as a line
- X-axis shows time (day numbers), Y-axis shows temperature readings
- Quick validation that sensor is working and data is being collected
- Useful for initial data exploration before building dashboards
- The plot is functional but lacks labels and context needed for operations

---

### Example 2: Dashboard-Ready Plot with Labels

**Objective**: Add essential information for IoT monitoring dashboards.

**IoT Context**: Prepare sensor data for display on monitoring screens, dashboards, or reports.

**What's new**:
- `labs()` function for sensor identification and context
- `theme_minimal()` for clean dashboard appearance

**Code**: See `chapter01.R` - Example 2

**Key Points**:
- `labs()` adds sensor ID, location, and measurement units
- Include subtitle with sensor location/zone information
- `theme_minimal()` creates clean look suitable for dashboards
- Clear axis labels with proper units (°C) - critical for industrial applications
- Professional monitoring systems always need proper labeling!

---

### Example 3: Customize Line for Better Visibility

**Objective**: Control the visual appearance of the sensor reading line for dashboard clarity.

**What's new**:
- `color` parameter in `geom_line()` to change line color
- `linewidth` to adjust thickness for better visibility
- `linetype` to change line style (useful for different sensors)

**Code**: See `chapter01.R` - Example 3

**Key Points**:
- Color coding helps distinguish sensor types (blue for temperature is intuitive)
- Line width should be thick enough to see trends clearly on dashboards
- Linetypes: "solid", "dashed", "dotted" can distinguish multiple sensors
- These are **fixed** aesthetics (not mapped to data)
- In multi-sensor systems, consistent color coding is essential

---

### Example 4: Optimize Grid for Sensor Reading Accuracy

**Objective**: Fine-tune the plot background and grid for precise sensor value reading.

**What's new**:
- `theme()` function for detailed customization
- `panel.grid.major` and `panel.grid.minor` settings for value precision
- `panel.background` and `plot.background` options for display optimization

**Code**: See `chapter01.R` - Example 4

**Key Points**:
- Major gridlines help operators read exact temperature values
- Minor gridlines add precision for detecting small fluctuations
- `element_line()` controls line properties (color, size, linetype)
- `element_rect()` controls rectangular elements (backgrounds)
- Light backgrounds work better for continuous monitoring displays
- Grid density should match the precision required for your monitoring task

---

### Example 5: Production-Ready IoT Dashboard Styling

**Objective**: Create a polished, production-ready sensor monitoring plot.

**What's new**:
- Combining multiple theme elements for professional dashboards
- Axis text and title formatting for readability
- Plot margins and spacing optimized for displays
- Color coordination across elements for consistent branding

**Code**: See `chapter01.R` - Example 5

**Key Points**:
- `axis.text` controls tick mark labels (important for quick value reading)
- `axis.title` controls axis label appearance
- `plot.title` should include sensor ID and location for identification
- `element_text()` for text properties (size, face, color, angle)
- Professional IoT dashboards need consistent styling across all visualizations
- Consider your display environment (bright factory floor vs. dark control room)

---

### Example 6 (Bonus): Add Threshold Lines and Alerts

**Objective**: Create an IoT monitoring plot with safety limits and alert zones.

**IoT Context**: Industrial sensors often have critical thresholds. Exceeding limits triggers alerts, maintenance, or automated responses (HVAC adjustment, alarms, etc.).

**What's new**:
- `geom_hline()` for threshold/safety limit lines
- `geom_rect()` for alert zones (warning/critical regions)
- `annotate()` for threshold labels and alert markers
- Highlighting threshold violations

**Code**: See `chapter01.R` - Example 6

**Key Points**:
- Reference lines mark operational thresholds (e.g., max safe temperature)
- Colored zones indicate normal operation (green), warning (yellow), critical (red)
- Annotations identify when thresholds were exceeded
- Essential for regulatory compliance and safety monitoring
- `annotate()` adds labels without creating legend entries
- In real systems, threshold violations would trigger automated alerts
- This visualization style is common in SCADA and industrial IoT dashboards

---

## Summary

In this chapter, you learned how to visualize IoT sensor data:

1. **Basic ggplot2 structure**: `ggplot() + aes() + geom_*()` for sensor streams
2. **Line plots** for time series sensor data: `geom_line()`
3. **Labels and titles**: `labs()` with sensor identification
4. **Themes**: From simple (`theme_minimal()`) to production dashboard styling
5. **Visual aesthetics**: Color coding, line width, and styles for IoT dashboards
6. **Threshold monitoring**: Horizontal lines, alert zones, and annotations for operational limits

### ggplot2 Functions Used

| Function | Purpose |
|----------|---------|
| `ggplot()` | Initialize plot object |
| `aes()` | Map data to visual properties |
| `geom_line()` | Draw line plot |
| `labs()` | Add labels (title, axes, etc.) |
| `theme_minimal()` | Apply minimalist theme |
| `theme()` | Customize specific theme elements |
| `geom_hline()` | Add horizontal line |
| `geom_vline()` | Add vertical line |
| `annotate()` | Add single annotation |
| `element_text()` | Style text elements |
| `element_line()` | Style line elements |
| `element_rect()` | Style rectangular elements |

### Progressive Complexity

Notice how we built up the plot:
1. Raw data → 2. Labels → 3. Aesthetics → 4. Grid/Background → 5. Polish → 6. Annotations

This is the ggplot2 way: start simple, add layers, refine details.

## Practice Exercises

Try modifying the code to simulate different IoT scenarios:

1. Change the sensor color to match your company's branding
2. Create a dashed line to represent predicted vs. actual readings
3. Add threshold lines at your facility's min/max operating temperatures (e.g., 18°C and 28°C)
4. Change the theme to `theme_bw()` for a high-contrast control room display
5. Add a subtitle with the sensor location (e.g., "Server Room - Rack A3")
6. Add vertical lines to mark maintenance events or system restarts
7. Create danger zones using `geom_rect()` for out-of-range temperatures
8. Calculate and display uptime percentage (time within acceptable range)

## Next Chapter Preview

In Chapter 2, we'll extend these concepts to **multiple IoT sensors** on the same dashboard, introducing:
- Visualizing multiple sensor streams (temperature, humidity, pressure)
- Color and linetype mappings for different sensors
- Legends and their customization for sensor identification
- Combining points and lines for sparse vs. continuous data
- Highlighting sensor correlation and system-wide events
- Comparing sensor arrays across different zones or equipment

---

**Files for this chapter**:
- 📄 `docs/chapter01.md` - This documentation
- 💻 `codes/chapter01.R` - Executable R code with all examples
