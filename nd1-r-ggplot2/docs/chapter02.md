# Chapter 2: Multi-Sensor IoT Data Visualization

## Learning Objectives

By the end of this chapter, you will be able to:
- Visualize multiple sensor streams simultaneously on one plot
- Use aesthetic mappings (color, linetype, shape) to distinguish data sources
- Customize legends for clear sensor identification
- Combine geom layers (points + lines) for sparse or irregular sensor data
- Highlight specific time periods (working hours, maintenance windows, events)
- Handle sensor metadata and naming conventions common in IoT systems
- Preview faceting techniques for multi-sensor comparisons

## Introduction

In real-world IoT deployments, you rarely monitor just one sensor. Most systems involve **networks of sensors** distributed across multiple locations, each collecting the same type of measurement. As an IoT developer, you need to compare readings across sensors to:

- **Detect anomalies**: Is one sensor behaving differently from the others?
- **Identify calibration issues**: Are all sensors reading consistently?
- **Monitor spatial variations**: How do conditions differ across zones?
- **Validate redundancy**: Are backup sensors working correctly?

This chapter extends the single-sensor visualization techniques from Chapter 1 to handle **multi-sensor systems**. You'll learn to plot multiple time series on the same graph, distinguish them visually, and add contextual information that helps operators understand the data at a glance.

### Key ggplot2 Concepts

Building on Chapter 1, we'll introduce:

1. **aes(color = variable)**: Map sensor ID to color automatically
2. **scale_color_manual()**: Define custom colors for specific sensors
3. **scale_color_brewer()**: Use professional color palettes
4. **Legend customization**: Position, title, labels
5. **geom_point()**: Add markers for actual readings
6. **geom_rect()**: Highlight time periods or events
7. **facet_wrap()**: Preview of small multiples (detailed in Chapter 5)

## Dataset Description

### Scenario: Smart Building Environmental Monitoring

You're managing an **environmental monitoring system** for a smart office building. Three temperature sensors are deployed in different zones:

- **TEMP_SRV_001**: Server Room (requires tight temperature control)
- **TEMP_OFF_002**: Open Office Area (comfort zone for workers)
- **TEMP_WH_003**: Warehouse/Storage (less critical, wider acceptable range)

Each sensor records temperature every hour for 7 days (168 readings per sensor, 504 total readings).

**Dataset Structure:**
- **timestamp**: Date and time of reading (POSIXct format)
- **hour**: Hour number for plotting (1-168)
- **temperature**: Temperature in Celsius (°C)
- **sensor_id**: Sensor identifier (TEMP_SRV_001, TEMP_OFF_002, TEMP_WH_003)
- **location**: Human-readable location name
- **zone_type**: Classification (server_room, office, warehouse)

**Realistic IoT Characteristics:**

1. **Server Room (TEMP_SRV_001)**:
   - Baseline: 20°C (maintained by HVAC)
   - Variation: ±1°C (tight control)
   - Pattern: Very stable, minimal daily cycle
   - Critical for equipment health

2. **Office Area (TEMP_OFF_002)**:
   - Baseline: 22°C (comfort temperature)
   - Variation: ±2°C (moderate control)
   - Pattern: Warmer during business hours (9 AM - 5 PM), cooler at night
   - Lower on weekends (HVAC setback)

3. **Warehouse (TEMP_WH_003)**:
   - Baseline: 18°C (minimal conditioning)
   - Variation: ±3°C (loose control)
   - Pattern: More influenced by external weather
   - Greater daily swings

## Examples

### Example 1: Basic Multi-Sensor Line Plot

**Objective**: Plot all three sensors on the same graph with automatic color coding.

**IoT Context**: Quick visual comparison to see if all sensors are operational and detecting similar conditions.

**What's new**:
- `aes(color = sensor_id)` maps sensor IDs to colors automatically
- ggplot2 creates a legend automatically
- All sensors use the same line style

**Code**: See `chapter02.R` - Example 1

**Key Points**:
- Each sensor gets a different color automatically
- Legend shows sensor IDs
- Easy to spot which sensors are reading higher/lower
- Can quickly identify if any sensor is malfunctioning
- Default colors may not be ideal for dashboards

---

### Example 2: Custom Colors and Legend Positioning

**Objective**: Assign specific colors to each sensor and optimize legend placement.

**IoT Context**: Use color coding that matches your monitoring system conventions (e.g., red for critical areas, blue for normal zones).

**What's new**:
- `scale_color_manual()` to define specific colors for each sensor
- `theme(legend.position)` to move legend to optimal location
- Custom legend title with `labs(color = "...")`
- Include location names in legend

**Code**: See `chapter02.R` - Example 2

**Key Points**:
- Manual color assignment: server room (red), office (green), warehouse (blue)
- Legend positioned at "top" for horizontal display (saves horizontal space)
- Legend title changed from "sensor_id" to more descriptive text
- Colors chosen for meaning: red (critical), green (comfortable), blue (cool)
- Professional appearance for operational dashboards

---

### Example 3: Add Data Points to Identify Readings

**Objective**: Combine lines and points to show actual measurement times.

**IoT Context**: Useful for identifying sampling intervals, missing data, or irregular readings.

**What's new**:
- `geom_point()` added to `geom_line()`
- Points inherit color mapping from aesthetics
- Adjust point size and transparency
- Layer order matters (points on top of lines)

**Code**: See `chapter02.R` - Example 3

**Key Points**:
- Points make individual hourly readings visible
- Helpful for spotting data gaps (missing readings)
- Can reveal sensor sampling synchronization
- Small points (`size = 1.5`) avoid cluttering
- `alpha = 0.7` provides slight transparency for overlapping points
- Particularly useful for sparse sensor data (e.g., daily instead of hourly)

---

### Example 4: Different Line Types and Accessibility

**Objective**: Use multiple visual channels (color + linetype) for better accessibility.

**IoT Context**: Some monitoring displays may be viewed in grayscale or by color-blind users.

**What's new**:
- `aes(linetype = sensor_id)` adds line style variation
- Combines color AND linetype for redundancy
- `scale_linetype_manual()` to specify patterns
- Better accessibility for all viewers

**Code**: See `chapter02.R` - Example 4

**Key Points**:
- Color + linetype provides redundant encoding
- Accessible to color-blind users
- Works on monochrome displays or printouts
- Solid line for most critical sensor (server room)
- Dashed for office, dotted for warehouse
- Professional compliance with accessibility standards

---

### Example 5: Highlight Working Hours and Events

**Objective**: Add context by highlighting business hours and marking maintenance events.

**IoT Context**: Show when HVAC systems change setpoints, or when maintenance occurred.

**What's new**:
- `geom_rect()` to shade working hours (9 AM - 5 PM weekdays)
- `annotate()` for marking specific events
- Layering: shading → lines → annotations
- Time-based conditional highlighting

**Code**: See `chapter02.R` - Example 5

**Key Points**:
- Gray shading shows business hours (higher HVAC load)
- Vertical line marks maintenance event
- Notice office temperature increases during working hours
- Server room stays stable regardless of time
- Warehouse shows different pattern on weekends
- Essential for correlating sensor readings with building operations
- Helps explain temperature variations

---

### Example 6 (Bonus): Faceted Sensor Comparison

**Objective**: Preview faceting - separate panels for each sensor.

**IoT Context**: Detailed inspection of individual sensor behaviors without overlapping lines.

**What's new**:
- `facet_wrap(~ sensor_id)` creates separate panels
- Each sensor in its own subplot with shared axes
- Preview of Chapter 5 techniques
- Option for free scales (`scales = "free_y"`)

**Code**: See `chapter02.R` - Example 6

**Key Points**:
- Each sensor gets its own panel for clarity
- Shared x-axis for time comparison
- Can compare patterns without line overlap
- Useful when sensors have very different ranges
- Option: `scales = "free_y"` if ranges differ greatly
- Better for detailed analysis, less good for quick comparison
- Full faceting techniques covered in Chapter 5

---

## Summary

In this chapter, you learned to visualize **multiple IoT sensors** on the same plot:

1. **Automatic color mapping**: `aes(color = sensor_id)`
2. **Custom colors**: `scale_color_manual()` for brand/convention alignment
3. **Combined geoms**: `geom_line()` + `geom_point()` for complete visualization
4. **Accessibility**: Using color + linetype together
5. **Contextual highlighting**: `geom_rect()` for time periods and events
6. **Faceting preview**: `facet_wrap()` for separate sensor panels

### ggplot2 Functions Introduced

| Function | Purpose |
|----------|---------|
| `aes(color = var)` | Map variable to color aesthetic |
| `scale_color_manual()` | Define specific colors for categories |
| `scale_color_brewer()` | Use professional color palettes |
| `scale_linetype_manual()` | Define specific line patterns |
| `theme(legend.position)` | Control legend location |
| `labs(color = "...")` | Custom legend title |
| `geom_point()` | Add data point markers |
| `geom_rect()` | Highlight rectangular regions |
| `facet_wrap()` | Create small multiples (preview) |

### Multi-Sensor Best Practices

1. **Use meaningful colors**: Match your organization's color conventions
2. **Add context**: Show working hours, events, maintenance windows
3. **Consider accessibility**: Use color + shape/linetype together
4. **Label clearly**: Include sensor locations, not just IDs
5. **Choose visualization type**: Overlaid lines for comparison, facets for details

### Comparison: When to Use Each Approach

| Approach | Best For | Limitations |
|----------|----------|-------------|
| **Overlaid lines** | Quick comparison, spotting outliers | Can be cluttered with many sensors |
| **Lines + points** | Showing sampling rate, finding gaps | More ink, potentially busy |
| **Color + linetype** | Accessibility, grayscale printing | More legend space needed |
| **Faceted panels** | Detailed individual analysis | Harder to compare absolute values |

## Practice Exercises

Try modifying the code to:

1. **Add a 4th sensor**: Generate data for a new sensor and add it to the plots
2. **Change color palette**: Use `scale_color_brewer(palette = "Set1")` or other palettes
3. **Highlight weekends**: Shade Saturday and Sunday differently from weekdays
4. **Add threshold lines**: Show different acceptable ranges for each zone type
5. **Combine techniques**: Create a plot with points, custom colors, highlighted periods, and annotations
6. **Alert visualization**: Color-code sensors by whether they're in acceptable range

## Next Chapter Preview

In Chapter 3, we'll shift from time series to **distributions**, learning:
- Histograms for sensor reading distributions
- Comparing distributions across multiple sensors
- Understanding measurement variability
- Identifying calibration issues through distribution analysis

---

**Files for this chapter**:
- 📄 `docs/chapter02.md` - This documentation
- 💻 `codes/chapter02.R` - Executable R code with all examples
