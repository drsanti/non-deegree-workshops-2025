# Chapter 5: Faceting and Small Multiples for Sensor Arrays

## Learning Objectives

By the end of this chapter, you will be able to:
- Create small multiples to visualize many sensors simultaneously
- Use `facet_wrap()` to create grid layouts for sensor arrays
- Use `facet_grid()` for hierarchical two-dimensional organization
- Control axis scales (fixed vs. free) based on sensor characteristics
- Customize facet labels with sensor metadata and location information
- Style facet headers for professional monitoring dashboards
- Compare sensor variability using faceted distributions

## Introduction

As IoT deployments scale from a few sensors (Chapters 1-2) to **sensor arrays with dozens of devices**, visualizing all sensors on a single plot becomes cluttered and unreadable. You need techniques to **systematically organize and compare many sensors** while maintaining clarity.

**Faceting** (creating small multiples) is the solution. Instead of overlaying 10+ sensors on one plot, you create a **grid of subplots**—one panel per sensor—sharing common axes and styling. This approach allows you to:

- **Scan quickly**: Identify which sensors show anomalies or unusual patterns
- **Compare systematically**: See relative performance across zones or floors
- **Maintain detail**: Each sensor gets its own space without line overlap
- **Scale efficiently**: Handle 8, 12, 20+ sensors in one visualization
- **Organize hierarchically**: Group sensors by floor, zone, type, or manufacturer

This chapter focuses on **faceting techniques** for large-scale sensor monitoring, building on the multi-sensor skills from Chapter 2 but scaling to building-wide or campus-wide deployments.

### Key ggplot2 Concepts

Building on previous chapters, we'll introduce:

1. **facet_wrap()**: Create grid of panels from one categorical variable
2. **facet_grid()**: Create 2D grid from two categorical variables (rows × columns)
3. **scales = "fixed"**: All panels share same axis ranges (default)
4. **scales = "free"**: Each panel optimizes its own axis range
5. **scales = "free_y"**: Free Y-axis, shared X-axis (common for time series)
6. **ncol / nrow**: Control grid layout dimensions
7. **labeller**: Customize facet strip labels with metadata
8. **strip.text**: Theme element for styling facet headers
9. **strip.background**: Theme element for facet header backgrounds

## Dataset Description

### Scenario: Building-Wide Temperature Sensor Array

You're managing an **8-sensor temperature monitoring system** deployed across a multi-floor office building. The sensors are organized hierarchically:

**Building Structure:**
- **2 Floors**: Ground floor and First floor
- **4 Zones per floor**: Server Room, Office, Lab, Common Area
- **8 Total sensors**: TEMP_F0_SRV, TEMP_F0_OFF, TEMP_F0_LAB, TEMP_F0_COM, TEMP_F1_SRV, TEMP_F1_OFF, TEMP_F1_LAB, TEMP_F1_COM

**Monitoring Details:**
- **Duration**: 7 days continuous monitoring (168 hours per sensor)
- **Sampling rate**: 1 reading per hour
- **Total readings**: 1,344 (168 hours × 8 sensors)

**Realistic Sensor Characteristics:**

1. **Server Rooms (F0_SRV, F1_SRV)**:
   - Tight temperature control: 20°C ± 1°C
   - Minimal daily variation (24/7 HVAC)
   - Low noise, high reliability

2. **Offices (F0_OFF, F1_OFF)**:
   - Moderate control: 22°C ± 2°C
   - Strong daily cycle (occupied vs. unoccupied)
   - Weekend setback (energy saving)

3. **Labs (F0_LAB, F1_LAB)**:
   - Strict control: 21°C ± 1.5°C
   - Reduced weekend activity
   - Process equipment heat loads

4. **Common Areas (F0_COM, F1_COM)**:
   - Loose control: 20°C ± 3°C
   - Influenced by outdoor conditions
   - Higher variability

**Sensor Issues to Detect:**
- **F0_COM**: Calibration drift (+1.5°C bias)
- **F1_OFF**: Increased noise (aging sensor)
- **F0_LAB**: Weekend HVAC failure (one day)

**Dataset Structure:**
- **timestamp**: Date and time of reading
- **hour**: Hour number (1-168)
- **sensor_id**: Sensor identifier (e.g., TEMP_F0_SRV)
- **floor**: Floor number (0 or 1)
- **zone**: Zone type (Server, Office, Lab, Common)
- **temperature**: Temperature reading in °C
- **location**: Human-readable location name

## Examples

### Example 1: Basic Faceted View - All Sensors with Shared Axis

**Objective**: Visualize all 8 sensors simultaneously to identify outliers and patterns.

**IoT Context**: Quick health check of entire sensor array—which sensors need attention?

**What's new**:
- `facet_wrap(~ sensor_id)` to create 8 separate panels
- All panels share the same Y-axis range for direct comparison
- Grid layout automatically determined by ggplot2

**Code**: See `chapter05.R` - Example 1

**Key Points**:
- Each panel shows one sensor's time series
- Shared Y-axis (15-27°C) allows direct comparison of absolute values
- Immediately see which sensors read higher/lower than others
- F0_COM shows higher readings (calibration drift visible)
- F1_OFF shows more scatter (noisy sensor)
- Server rooms show tightest control (flat lines)
- Common areas show highest variability
- Weekend patterns visible in offices (lower temperatures)
- Grid layout automatically wraps to fit display

---

### Example 2: Free Y-Scales for Different Sensor Ranges

**Objective**: Optimize each panel's Y-axis to see detail within each sensor's range.

**IoT Context**: Focus on each sensor's own variability rather than absolute comparisons.

**What's new**:
- `scales = "free_y"` allows each panel to optimize its Y-axis
- Better for sensors with non-overlapping operating ranges
- X-axis (time) remains shared for temporal alignment

**Code**: See `chapter05.R` - Example 2

**Key Points**:
- Each sensor's Y-axis spans only its actual data range
- Reveals patterns that were compressed in Example 1
- Can now see daily cycles clearly in all sensors
- F0_COM's drift more obvious (consistently higher than target)
- F1_OFF's noise more visible (jagged pattern)
- Server rooms still show tight control (small Y-axis range)
- Trade-off: lose direct amplitude comparison
- Use when absolute comparison less important than pattern detection
- Best for quality control and anomaly detection

---

### Example 3: Hierarchical Faceting by Floor and Zone

**Objective**: Organize sensors in 2D grid reflecting building structure.

**IoT Context**: Compare performance across floors and zone types systematically.

**What's new**:
- `facet_grid(floor ~ zone)` creates 2D grid (rows = floors, columns = zones)
- Hierarchical organization matches physical layout
- Easier to identify floor-wide or zone-wide issues

**Code**: See `chapter05.R` - Example 3

**Key Points**:
- Rows represent floors (Floor 0 on top, Floor 1 on bottom)
- Columns represent zones (Server, Office, Lab, Common left to right)
- Vertical comparison: same zone across floors (is F1 hotter than F0?)
- Horizontal comparison: different zones on same floor (server vs. office)
- Reveals systematic patterns: all offices show weekend setback
- Server rooms most similar across floors (good HVAC design)
- Common areas most variable (both floors affected by weather)
- Professional layout for building management reports
- Empty cells possible if not all floor-zone combinations exist

---

### Example 4: Custom Facet Labels with Sensor Metadata

**Objective**: Replace cryptic sensor IDs with descriptive location names.

**IoT Context**: Make dashboards readable for facility managers without technical training.

**What's new**:
- `labeller = labeller()` with custom label function
- Display human-readable names instead of sensor IDs
- Include floor and zone information in strip labels

**Code**: See `chapter05.R` - Example 4

**Key Points**:
- Strip labels now show "Floor 0 - Server Room" instead of "TEMP_F0_SRV"
- Easier for non-technical users to understand
- Can include sensor health status in labels (e.g., "⚠ Lab (Noisy)")
- Useful for client presentations and management dashboards
- Labels can be dynamically generated from metadata database
- Consider length—too long labels may wrap or overlap
- Can include icons or symbols for quick status indication

---

### Example 5: Styled Facet Headers for Professional Dashboards

**Objective**: Create polished, branded monitoring dashboard with custom styling.

**IoT Context**: Production dashboard for facilities team or client portal.

**What's new**:
- `strip.text` theme element for label styling (bold, larger font)
- `strip.background` for colored headers by zone type
- Professional color scheme for operational dashboards

**Code**: See `chapter05.R` - Example 5

**Key Points**:
- Bold, larger strip labels improve readability on monitoring screens
- Background colors indicate zone type (red = server, blue = office, etc.)
- Color coding provides instant visual grouping
- Consistent with dashboard design best practices
- Font size optimized for wall-mounted displays
- Can match corporate branding colors
- Border styling for clean panel separation
- Suitable for 24/7 monitoring rooms or NOC displays

---

### Example 6 (BONUS): Faceted Distributions for Sensor Variability Comparison

**Objective**: Compare sensor quality using distributions instead of time series.

**IoT Context**: Sensor calibration assessment—which sensors have excessive variability?

**What's new**:
- Faceting combined with histograms/density plots
- Statistical view rather than temporal view
- Quickly identify sensors with drift, bias, or noise issues

**Code**: See `chapter05.R` - Example 6

**Key Points**:
- Each panel shows temperature distribution for one sensor
- Narrow distributions = tight control (server rooms)
- Wide distributions = poor control or noise (common areas, F1_OFF)
- Shifted distributions indicate calibration bias (F0_COM)
- Can overlay target range or specification limits
- Combines Chapter 3 (distributions) with Chapter 5 (faceting)
- Essential for sensor quality control and validation
- Reveals long-term sensor behavior better than time series
- Can add reference lines for acceptable variability limits

---

## Summary

In this chapter, you learned to **scale sensor visualization** from few sensors to large arrays:

1. **facet_wrap()**: Create grids from one variable (sensor ID)
2. **facet_grid()**: Create 2D grids from two variables (floor × zone)
3. **Scale control**: Fixed vs. free axes for different analysis goals
4. **Custom labels**: Replace IDs with human-readable names
5. **Professional styling**: Themed headers for production dashboards
6. **Statistical faceting**: Combine distributions with small multiples

### ggplot2 Functions Introduced

| Function | Purpose |
|----------|---------|
| `facet_wrap(~ variable)` | Create grid of panels from one categorical variable |
| `facet_grid(rows ~ cols)` | Create 2D grid from two categorical variables |
| `scales = "fixed"` | All panels share same axis ranges (default) |
| `scales = "free"` | Each panel optimizes both axes independently |
| `scales = "free_y"` | Free Y-axis, shared X-axis (common for time series) |
| `ncol` / `nrow` | Control number of columns/rows in facet_wrap |
| `labeller` | Customize facet strip labels |
| `strip.text` | Theme element for styling facet labels |
| `strip.background` | Theme element for facet header backgrounds |

### Faceting Strategy Guide

| Scenario | Recommended Approach | Scales Setting |
|----------|---------------------|----------------|
| **Quick anomaly scan** | facet_wrap(), all sensors visible | fixed (compare amplitudes) |
| **Pattern detection** | facet_wrap() or facet_grid() | free_y (see patterns clearly) |
| **Hierarchical organization** | facet_grid(floor ~ zone) | fixed (compare across structure) |
| **Mixed sensor types** | facet_wrap() by sensor type | free (different ranges/units) |
| **Quality comparison** | Faceted distributions | fixed (compare variability) |
| **Client dashboard** | Custom labels + styled strips | depends on use case |

### When to Use Faceting vs. Overlaying

| Use Faceting When | Use Overlaying When |
|-------------------|---------------------|
| **5+ sensors** to compare | **2-4 sensors** with similar ranges |
| **Pattern comparison** more important than absolute values | **Absolute comparison** needed |
| **Hierarchical organization** exists (floor/zone) | **Correlation** between sensors is focus |
| **Different sensor ranges** or units | **Same scale** for all sensors |
| **Sensor quality assessment** (variability) | **Real-time monitoring** (current values) |
| **Report/presentation** format | **Interactive exploration** |

## Practice Exercises

Try modifying the code to deepen your understanding:

1. **Add More Sensors**:
   - Expand to 12 sensors (3 floors × 4 zones)
   - Use `ncol = 4` to maintain 4 columns
   - Observe how facet_grid scales

2. **Color by Sensor Health**:
   - Add a "health_status" column (Normal, Warning, Critical)
   - Color each sensor's line by its health status
   - Use `scale_color_manual()` with red/yellow/green

3. **Highlight Problem Periods**:
   - Add `geom_rect()` to shade weekend periods
   - Apply to all facets simultaneously
   - Shows HVAC setback schedule across building

4. **Mixed Visualization**:
   - Create faceted plots with both line (time series) and histogram (distribution)
   - Use `facet_grid(plot_type ~ sensor_id)`
   - Combine temporal and statistical views

5. **Dynamic Labels**:
   - Create labeller function that includes current temperature
   - Format: "Server Room (Current: 20.5°C)"
   - Update labels with latest sensor reading

6. **Threshold Lines**:
   - Add `geom_hline()` with different thresholds per zone type
   - Server rooms: ±1°C from setpoint
   - Offices: ±2°C from setpoint
   - Use data frame with zone-specific limits

7. **Free Both Axes**:
   - Try `scales = "free"` (both X and Y free)
   - When is this useful? (sensors with different timeframes)
   - When does it confuse temporal comparison?

## Next Chapter Preview

In Chapter 6, we'll shift focus to **categorical sensor data**:
- Bar charts for sensor states (ON/OFF, Normal/Warning/Critical)
- Alert frequency and downtime statistics
- Grouped and stacked bars for multi-category comparisons
- Horizontal bars for sensor ranking by performance
- Visualizing sensor fleet operational metrics
- Creating status dashboards with counts and percentages

These techniques complement time series analysis by showing **aggregate statistics** and **categorical states** essential for fleet management.

---

**Files for this chapter**:
- 📄 `docs/chapter05.md` - This documentation
- 💻 `codes/chapter05.R` - Executable R code with all examples
