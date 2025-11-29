# Workshop 06: Data Visualization with ggplot2

**Duration:** 90-120 minutes  
**Level:** Intermediate

## Introduction

Data visualization is crucial for understanding patterns, trends, and relationships in your data. `ggplot2` is R's premier visualization package, based on the Grammar of Graphics. This workshop teaches you how to create publication-quality visualizations, from basic plots to complex multi-panel graphics.

## What You'll Learn

- Understanding the grammar of graphics
- Creating basic plots (scatter, line, bar)
- Customizing aesthetics (colors, shapes, sizes)
- Adding layers and facets
- Working with themes and styling
- Creating publication-ready visualizations
- Saving plots to files

## Prerequisites

Before starting, you should have:
- Completed Workshop 02: Data Structures in R
- Completed Workshop 05: Data Manipulation with dplyr
- Understanding of data frames

## Required Packages

```r
install.packages("ggplot2")
library(ggplot2)
```

## Step-by-Step Instructions

### Step 1: Introduction to ggplot2

ggplot2 uses a layered approach to building plots:

```r
library(ggplot2)

# Basic structure
ggplot(data = your_data, aes(x = x_var, y = y_var)) +
  geom_point()
```

### Step 2: Scatter Plots

Create scatter plots to visualize relationships:

```r
# Basic scatter plot
ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point()

# Customized scatter plot
ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point(color = "blue", size = 2, alpha = 0.6) +
  labs(title = "Temperature vs Humidity",
       x = "Temperature (°C)",
       y = "Humidity (%)")

# Color by category
ggplot(sensor_data, aes(x = temperature, y = humidity, color = status)) +
  geom_point() +
  labs(title = "Temperature vs Humidity by Status")
```

### Step 3: Line Plots

Visualize trends over time:

```r
# Basic line plot
ggplot(time_data, aes(x = timestamp, y = temperature)) +
  geom_line()

# Line plot with points
ggplot(time_data, aes(x = timestamp, y = temperature)) +
  geom_line() +
  geom_point()

# Multiple lines
ggplot(time_data, aes(x = timestamp, y = value, color = device_id)) +
  geom_line() +
  labs(title = "Temperature Over Time by Device")
```

### Step 4: Bar Plots

Compare categories:

```r
# Basic bar plot
device_summary <- sensor_data %>%
  group_by(device_id) %>%
  summarize(avg_temp = mean(temperature))

ggplot(device_summary, aes(x = device_id, y = avg_temp)) +
  geom_bar(stat = "identity")

# Horizontal bar plot
ggplot(device_summary, aes(x = device_id, y = avg_temp)) +
  geom_bar(stat = "identity") +
  coord_flip()

# Grouped bar plot
status_summary <- sensor_data %>%
  group_by(device_id, status) %>%
  summarize(count = n())

ggplot(status_summary, aes(x = device_id, y = count, fill = status)) +
  geom_bar(stat = "identity", position = "dodge")
```

### Step 5: Histograms and Density Plots

Explore distributions:

```r
# Histogram
ggplot(sensor_data, aes(x = temperature)) +
  geom_histogram(bins = 30, fill = "steelblue", color = "black") +
  labs(title = "Temperature Distribution",
       x = "Temperature (°C)",
       y = "Frequency")

# Density plot
ggplot(sensor_data, aes(x = temperature)) +
  geom_density(fill = "steelblue", alpha = 0.5) +
  labs(title = "Temperature Density")

# Multiple densities
ggplot(sensor_data, aes(x = temperature, fill = status)) +
  geom_density(alpha = 0.5) +
  labs(title = "Temperature Distribution by Status")
```

### Step 6: Box Plots and Violin Plots

Compare distributions across groups:

```r
# Box plot
ggplot(sensor_data, aes(x = device_id, y = temperature)) +
  geom_boxplot() +
  labs(title = "Temperature by Device",
       x = "Device ID",
       y = "Temperature (°C)")

# Violin plot
ggplot(sensor_data, aes(x = device_id, y = temperature, fill = device_id)) +
  geom_violin() +
  theme(legend.position = "none")
```

### Step 7: Faceting

Create multiple panels:

```r
# Facet by one variable
ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point() +
  facet_wrap(~ device_id)

# Facet by two variables
ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point() +
  facet_grid(status ~ device_id)

# Customize facet labels
ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point() +
  facet_wrap(~ device_id, labeller = labeller(device_id = label_both))
```

### Step 8: Customizing Aesthetics

Control colors, scales, and more:

```r
# Custom colors
ggplot(sensor_data, aes(x = temperature, y = humidity, color = status)) +
  geom_point() +
  scale_color_manual(values = c("online" = "green", "offline" = "red"))

# Custom scales
ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point() +
  scale_x_continuous(limits = c(20, 30), breaks = seq(20, 30, 2)) +
  scale_y_continuous(limits = c(40, 60))

# Color gradients
ggplot(sensor_data, aes(x = temperature, y = humidity, color = pressure)) +
  geom_point() +
  scale_color_gradient(low = "blue", high = "red")
```

### Step 9: Themes and Styling

Make your plots publication-ready:

```r
# Built-in themes
ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point() +
  theme_minimal()

ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point() +
  theme_bw()

ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point() +
  theme_classic()

# Custom theme
ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point() +
  theme(
    plot.title = element_text(size = 16, face = "bold"),
    axis.title = element_text(size = 12),
    axis.text = element_text(size = 10),
    legend.position = "bottom"
  )
```

### Step 10: Combining Multiple Layers

Build complex visualizations:

```r
# Multiple geoms
ggplot(sensor_data, aes(x = timestamp, y = temperature)) +
  geom_line(color = "blue", alpha = 0.5) +
  geom_point(color = "red", size = 1) +
  geom_smooth(method = "loess", se = TRUE) +
  labs(title = "Temperature Over Time with Trend",
       x = "Time",
       y = "Temperature (°C)")

# Annotations
ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point() +
  annotate("text", x = 25, y = 55, label = "Normal Range", color = "blue") +
  geom_hline(yintercept = 50, linetype = "dashed", color = "red") +
  geom_vline(xintercept = 24, linetype = "dashed", color = "red")
```

### Step 11: Saving Plots

Export your visualizations:

```r
# Save as PNG
ggsave("temperature_plot.png", width = 10, height = 6, dpi = 300)

# Save as PDF
ggsave("temperature_plot.pdf", width = 10, height = 6)

# Save with specific plot object
p <- ggplot(sensor_data, aes(x = temperature, y = humidity)) +
  geom_point()
ggsave("plot.png", plot = p, width = 10, height = 6)
```

## Exercises

1. **Basic Visualization:**
   - Create a scatter plot of temperature vs humidity
   - Color points by device status
   - Add appropriate labels and title

2. **Time Series Plot:**
   - Create a line plot showing temperature over time
   - Add a smooth trend line
   - Color by device_id

3. **Comparative Visualization:**
   - Create box plots comparing temperature across devices
   - Use facets to separate by status
   - Apply a clean theme

4. **Publication-Ready Plot:**
   - Create a complex visualization with multiple layers
   - Customize all aesthetics (colors, labels, theme)
   - Save as high-resolution PNG

## Summary

In this workshop, you've learned:
- How to create basic plots (scatter, line, bar)
- Customizing aesthetics and scales
- Using facets for multi-panel plots
- Applying themes for styling
- Combining multiple layers
- Saving plots to files

## Next Steps

- Review the example code in `examples/06-data-visualization.r`
- Experiment with different plot types
- Move on to Workshop 07: Statistical Analysis

## Additional Resources

- ggplot2 documentation: https://ggplot2.tidyverse.org/
- ggplot2 cheatsheet: https://www.rstudio.com/resources/cheatsheets/
- R Graphics Cookbook: https://r-graphics.org/
