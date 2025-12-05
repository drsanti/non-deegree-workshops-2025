# R ggplot2 Tutorial Series for IoT Sensor Data Visualization

## Introduction

Welcome to this comprehensive 10-chapter R ggplot2 tutorial series designed specifically for IoT sensor data visualization and analysis. This hands-on curriculum takes you from basic plotting fundamentals to advanced dashboard creation, with a focus on real-world IoT applications including equipment monitoring, predictive maintenance, and building automation systems.

### What You'll Learn

- **Master ggplot2**: From basic syntax to advanced multi-panel dashboards
- **IoT Data Visualization**: Realistic sensor scenarios with temperature, humidity, vibration, and environmental monitoring
- **Time Series Analysis**: Temporal patterns, trends, and seasonal decomposition
- **Frequency Domain Analysis**: FFT, power spectral density, and spectrograms for equipment health monitoring
- **Predictive Maintenance**: Vibration analysis, bearing fault detection, and health scoring
- **Professional Dashboards**: Multi-plot layouts combining time and frequency domain visualizations

### Tutorial Structure

Each chapter includes:
- **6 Progressive Examples**: Starting from minimal viable plots to polished visualizations
- **Realistic IoT Datasets**: Generated sensor data with authentic patterns, noise, and anomalies
- **Comprehensive Documentation**: Markdown files (`docs/`) explaining concepts and techniques
- **Executable R Code**: Complete scripts (`codes/`) ready to run and modify
- **Practical Applications**: Real-world scenarios from smart buildings, industrial monitoring, and equipment diagnostics

### Who This Tutorial Is For

- **IoT Engineers** visualizing sensor data from deployed systems
- **Data Scientists** working with time series and equipment monitoring
- **R Users** wanting to master ggplot2 with practical examples
- **Researchers** creating publication-quality visualizations
- **Facility Managers** building monitoring dashboards

---

## Preparation

### System Requirements

- **R**: Version 4.0 or higher ([Download R](https://cran.r-project.org/))
- **RStudio** (recommended): Latest version ([Download RStudio](https://posit.co/download/rstudio-desktop/))
- **Operating System**: Windows, macOS, or Linux

### Package Installation

You have two installation options depending on your needs:

#### Option 1: Minimal Installation
Install only the packages you need for specific chapters:

```r
# Core visualization (required for all chapters)
install.packages("ggplot2")

# Data manipulation (required for chapters 4-10)
install.packages("dplyr")
install.packages("tidyr")

# Advanced layouts (required for chapter 10)
install.packages("patchwork")
install.packages("cowplot")

# Color palettes (optional, recommended for chapters 7+)
install.packages("viridis")
install.packages("RColorBrewer")
```

#### Option 2: Tidyverse Installation (Recommended)
Install the tidyverse meta-package which includes ggplot2, dplyr, tidyr, and more:

```r
# Tidyverse meta-package (includes ggplot2, dplyr, tidyr, and more)
install.packages("tidyverse")

# Advanced layouts (required for chapter 10)
install.packages("patchwork")
install.packages("cowplot")

# Color palettes (optional, recommended for chapters 7+)
install.packages("viridis")
install.packages("RColorBrewer")
```

### Getting Started

1. **Clone or download** this repository to your local machine
2. **Install required packages** using one of the options above
3. **Navigate** to the `codes/` directory
4. **Open** any chapter R script (e.g., `chapter01.R`) in RStudio
5. **Run** the script line-by-line or all at once
6. **Review** the corresponding documentation in `docs/` (e.g., `chapter01.md`)

### File Organization

```
R-ggplot2/
├── README.md              # This file - start here!
├── layout.md              # Detailed curriculum structure
├── docs/                  # Chapter documentation (Markdown)
│   ├── chapter01.md       # Introduction to IoT Sensor Visualization
│   ├── chapter02.md       # Multi-Sensor Data Visualization
│   ├── chapter03.md       # Sensor Calibration & Distribution Analysis
│   ├── chapter04.md       # Scatter Plots & Correlation Analysis
│   ├── chapter05.md       # Faceting & Sensor Arrays
│   ├── chapter06.md       # Bar Charts & Categorical Data
│   ├── chapter07.md       # Heatmaps & Correlation Matrices
│   ├── chapter08.md       # Box/Violin Plots & Comparisons
│   ├── chapter09.md       # Time Series Decomposition & FFT
│   └── chapter10.md       # Advanced Dashboards & Layouts
└── codes/                 # Executable R scripts
    ├── chapter01.R
    ├── chapter02.R
    ├── chapter03.R
    ├── chapter04.R
    ├── chapter05.R
    ├── chapter06.R
    ├── chapter07.R
    ├── chapter08.R
    ├── chapter09.R
    └── chapter10.R
```

---

## Table of Contents

### Part 1: Foundation (Chapters 1-3)
**Single and Multi-Sensor Time Series**

Core IoT visualization skills: time series, multi-sensor comparison, and distribution analysis for sensor calibration.

#### [Chapter 1: Introduction to IoT Sensor Data Visualization](docs/chapter01.md)
**Focus**: Single temperature sensor monitoring in warehouse/industrial facility

**What You'll Learn**:
- Understand the basic ggplot2 syntax and the grammar of graphics
- Create line plots for IoT sensor time series data
- Visualize environmental sensor readings (temperature) over time
- Master basic aesthetics including color, size, and linetype
- Customize plot labels, titles, and themes for sensor dashboards
- Add reference lines for sensor thresholds and safety limits

**Dataset**: Temperature sensor data from TEMP_WAREHOUSE_001
- 720 readings (30 days × 24 hours)
- Realistic daily HVAC cycles, weekend effects, measurement noise, drift
- Operating range: 15-25°C typical warehouse environment

**Key ggplot2 Features**: `ggplot()`, `aes()`, `geom_line()`, `labs()`, `theme_minimal()`, `theme()`, `geom_hline()`, `annotate()`

---

#### [Chapter 2: Multi-Sensor IoT Data Visualization](docs/chapter02.md)
**Focus**: Smart building environmental monitoring with 3 temperature sensors across zones

**What You'll Learn**:
- Visualize multiple sensor streams simultaneously on one plot
- Use aesthetic mappings (color, linetype, shape) to distinguish data sources
- Customize legends for clear sensor identification
- Combine geom layers (points + lines) for sparse or irregular sensor data
- Highlight specific time periods (working hours, maintenance windows, events)
- Handle sensor metadata and naming conventions common in IoT systems
- Preview faceting techniques for multi-sensor comparisons

**Dataset**: Multi-sensor data from smart office building
- 3 sensors: Server Room (TEMP_SRV_001), Open Office (TEMP_OFF_002), Warehouse (TEMP_WH_003)
- 168 hours (7 days) per sensor, 504 total readings
- Realistic patterns: tight server room control, office business hours effect, warehouse variability

**Key ggplot2 Features**: `aes(color = sensor_id)`, `scale_color_manual()`, `scale_linetype_manual()`, `theme(legend.position)`, `geom_point() + geom_line()`, `geom_rect()`, `facet_wrap()` preview

---

#### [Chapter 3: Sensor Calibration and Distribution Analysis](docs/chapter03.md)
**Focus**: Sensor commissioning, quality control, and calibration verification

**What You'll Learn**:
- Visualize sensor calibration against reference standards using scatter plots
- Analyze sensor measurement distributions with histograms and density plots
- Compare distributions across multiple sensors to identify calibration issues
- Detect outliers and assess sensor quality using boxplots
- Calculate and interpret calibration metrics (bias, RMSE, correlation)
- Create comprehensive calibration dashboards for sensor quality control

**Datasets**: 
- **Calibration**: New sensor vs. certified reference (21 points, 20-30°C)
- **Distribution**: Three-sensor quality assessment (200 readings per sensor)

**Key ggplot2 Features**: `geom_point()`, `geom_smooth(method = "lm")`, `geom_abline()`, `geom_histogram()`, `geom_density()`, `geom_vline()`, `geom_boxplot()`, `annotate()`, transparency (`alpha`)

---

### Part 2: Multi-Variable Analysis (Chapters 4-5)
**Correlation Analysis and Array Visualization**

Techniques for visualizing large sensor arrays with faceting and correlation analysis between sensor types.

#### [Chapter 4: Scatter Plots and Sensor Correlation Analysis](docs/chapter04.md)
**Focus**: Multi-variable sensor analysis - understanding relationships in smart building systems

**What You'll Learn**:
- Create scatter plots for multi-variable IoT sensor data
- Visualize relationships between different sensor types (temperature vs. humidity)
- Add trend lines and correlation analysis
- Identify sensor dependencies and system interactions
- Use scatter plots for sensor redundancy validation
- Analyze HVAC performance with multi-sensor correlations

**Dataset**: Correlated environmental sensors in smart building
- Temperature, humidity, and CO2 sensors (3 variables)
- 500 hourly readings from synchronized sensor array
- Realistic correlations: temp-humidity (negative), CO2-occupancy (positive)
- HVAC system response patterns

**Key ggplot2 Features**: `geom_point()`, `geom_smooth()` with correlation trends, `se` parameter, `stat_ellipse()`, `facet_grid()`, `geom_text()`, `scale_color_gradient()`, `coord_fixed()`

---

#### [Chapter 5: Faceting and Small Multiples for Sensor Arrays](docs/chapter05.md)
**Focus**: Large-scale sensor deployment - visualizing 6-12 sensors across multiple locations/zones

**What You'll Learn**:
- Create small multiples for comparing many sensors simultaneously
- Use facet_wrap() and facet_grid() for sensor array visualization
- Compare sensor performance across different conditions/zones
- Create panel layouts for comprehensive monitoring dashboards
- Customize facet labels with sensor metadata
- Share or free scales based on sensor characteristics

**Dataset**: Building-wide sensor array deployment
- 8 temperature sensors across 2 floors × 4 zones
- 7 days of continuous monitoring (168 hours per sensor)
- Different zone types: offices, server rooms, labs, common areas
- Day/night and weekday/weekend patterns

**Key ggplot2 Features**: `facet_wrap(~ sensor_id)`, `facet_grid(floor ~ zone)`, `scales = "free_y"` vs. `"fixed"`, `labeller`, `strip.text`, `facet_wrap(ncol = ...)`, combining facets with color aesthetics

---

### Part 3: Categorical Data and Networks (Chapters 6-7)
**Bar Charts and Heatmaps**

Bar charts for sensor states/metrics and heatmaps for correlation matrices in sensor networks.

#### [Chapter 6: Bar Charts and Categorical Sensor Data](docs/chapter06.md)
**Focus**: Sensor fleet management - status monitoring, performance metrics, and operational analytics

**What You'll Learn**:
- Visualize categorical sensor data and states (ON/OFF, Normal/Warning/Critical)
- Create bar charts for sensor status counts and summaries
- Compare sensor performance metrics across devices
- Visualize alert frequencies and downtime statistics
- Use grouped and stacked bars for multi-category comparisons
- Create horizontal bars for sensor rankings and comparisons

**Dataset**: Sensor fleet operational data
- 20 sensors across facility with operational states
- Alert history: Normal, Warning, Critical states over 30 days
- Uptime/downtime statistics per sensor
- Data quality metrics: missing readings, out-of-range percentages

**Key ggplot2 Features**: `geom_bar()`, `geom_col()`, `stat = "identity"` vs. `"count"`, `position = "dodge"/"stack"/"fill"`, `coord_flip()`, `reorder()`, `geom_text()`, `scale_fill_manual()` with traffic light colors

---

#### [Chapter 7: Heatmaps and Correlation Matrices for Sensor Networks](docs/chapter07.md)
**Focus**: Sensor network analysis - understanding dependencies and redundancy in large sensor arrays

**What You'll Learn**:
- Create heatmaps for sensor correlation matrices
- Visualize sensor-to-sensor relationships across large arrays
- Use color gradients for correlation strength
- Create time-based heatmaps (sensor readings over time)
- Identify sensor clusters and redundancy patterns
- Visualize missing data and data quality patterns

**Dataset**: Large sensor network correlation data
- 15 sensors (temperature, humidity, pressure, CO2) across building
- Correlation matrix (15 × 15) showing sensor relationships
- 30 days × 24 hours time-sensor heatmap (720 × 15 matrix)
- Data quality heatmap showing missing/invalid readings

**Key ggplot2 Features**: `geom_tile()`, `geom_raster()`, `scale_fill_gradient2()`, `scale_fill_viridis_c()`, `coord_fixed()`, `geom_text()` overlays, hierarchical clustering with `reorder()`, `facet_grid()`

---

### Part 4: Statistical Analysis (Chapters 8-9)
**Distributions and Time Series Patterns**

Box/violin plots for sensor quality comparison and time series decomposition for periodic patterns.

#### [Chapter 8: Box Plots and Violin Plots for Sensor Comparisons](docs/chapter08.md)
**Focus**: Sensor quality control and comparative performance analysis

**What You'll Learn**:
- Create box plots to compare sensor distributions and ranges
- Use violin plots to visualize sensor measurement density
- Combine multiple geoms (box + violin + points) for comprehensive views
- Add statistical annotations (mean, median, outliers)
- Compare sensor performance across time periods or conditions
- Identify sensors requiring maintenance or recalibration

**Dataset**: Multi-sensor comparative performance data
- 12 sensors monitored over different time periods
- Grouped by: sensor type, location zone, manufacturer, age
- 3 conditions: normal operation, high load, maintenance mode
- 7,200+ total readings with varying baseline temperatures

**Key ggplot2 Features**: `geom_boxplot()`, `geom_violin()`, `geom_jitter()`, combining geoms, `stat_summary()`, `position_dodge()`, `notch = TRUE`, `outlier.colour`, violin `width` and `scale` parameters

---

#### [Chapter 9: Time Series Decomposition and Frequency Analysis](docs/chapter09.md)
**Focus**: Understanding periodic patterns in building automation, equipment vibration monitoring, and predictive maintenance

**What You'll Learn**:
- Decompose IoT sensor time series into trend, seasonal, and residual components
- Visualize daily, weekly, and seasonal patterns in sensor data
- Apply FFT (Fast Fourier Transform) for frequency domain analysis
- Create power spectral density plots to identify dominant periodicities
- Generate spectrograms showing time-frequency relationships
- Detect equipment health issues through frequency analysis
- Identify periodic maintenance schedules and HVAC cycles
- Detect anomalies by analyzing residuals and frequency shifts

**Datasets**: 
- **Temperature/HVAC**: 1 year hourly (8,760 readings) with 24h, 7d, seasonal cycles
- **Vibration sensors**: High-frequency (1000 Hz) for 10 seconds capturing motor/bearing frequencies
- Healthy baseline vs. degrading bearing signatures

**Key ggplot2 + Base R Features**: `facet_grid()` for decomposition panels, `geom_line()`, cycle plots with `facet_wrap()`, `scale_x_datetime()`, `geom_smooth()`, `stats::fft()`, `stats::spectrum()`, `geom_tile()` for spectrograms, `scale_x_log10()`, `geom_ribbon()`

---

### Part 5: Integration (Chapter 10)
**Professional Dashboards**

Combining multiple visualization types into comprehensive IoT monitoring dashboards.

#### [Chapter 10: Advanced Dashboard Layouts and Integrated Monitoring Systems](docs/chapter10.md)
**Focus**: Creating professional sensor monitoring dashboards, equipment health monitoring, and automated predictive maintenance reports

**What You'll Learn**:
- Combine multiple plot types into comprehensive IoT dashboards
- Use patchwork and cowplot packages for complex multi-plot layouts
- Integrate time-domain and frequency-domain visualizations
- Create equipment health monitoring dashboards with FFT analysis
- Apply consistent theming across multiple plots
- Build predictive maintenance dashboards combining trends, spectra, and alerts
- Design publication-quality multi-panel figures
- Export high-resolution dashboard layouts for reports

**Dataset**: Comprehensive multi-domain monitoring system data
- Real-time sensor status, historical trends, vibration monitoring
- Frequency analysis: FFT spectra, power spectral density, spectrograms
- Distribution comparisons, correlation matrices, alert histories
- Performance KPIs: uptime, data quality, prediction accuracy

**Key Packages & Features**: `patchwork` (`+`, `/`, `|`, `plot_layout()`, `plot_annotation()`), `cowplot::plot_grid()`, `theme_set()`, `ggsave()` high DPI, `inset_element()`, custom themes, combining time-domain and frequency-domain visualizations

---

## Progressive Learning Path

### Beginner Track (Chapters 1-3)
Start here if you're new to ggplot2 or data visualization:
- **Chapter 1**: Master basic line plots and time series
- **Chapter 2**: Learn to visualize multiple sensors
- **Chapter 3**: Understand distributions and calibration

**Time estimate**: 6-8 hours

### Intermediate Track (Chapters 4-7)
Build on fundamentals with multi-variable analysis:
- **Chapter 4**: Correlation and scatter plots
- **Chapter 5**: Faceting for large sensor arrays
- **Chapter 6**: Categorical data with bar charts
- **Chapter 7**: Heatmaps and correlation matrices

**Time estimate**: 8-10 hours

### Advanced Track (Chapters 8-10)
Master advanced techniques and professional dashboards:
- **Chapter 8**: Statistical comparisons with box/violin plots
- **Chapter 9**: Time series decomposition and FFT analysis
- **Chapter 10**: Integrated dashboards and layouts

**Time estimate**: 10-12 hours

### Total Course Duration
**24-30 hours** for complete mastery with practice exercises

---

## Key Features of This Tutorial

### 🎯 Realistic IoT Scenarios
Every example uses authentic sensor data patterns:
- Daily HVAC cycles and occupancy effects
- Sensor drift, noise, and calibration issues
- Equipment vibration signatures and bearing faults
- Seasonal trends and holiday effects
- Multi-zone building automation systems

### 📊 Progressive Complexity
Each chapter builds systematically:
1. **Example 1**: Minimal viable plot (MVP)
2. **Example 2**: Add labels and basic styling
3. **Example 3**: Introduce 2-3 aesthetic parameters
4. **Example 4**: Add statistical layers or transformations
5. **Example 5+**: Combine multiple advanced features for polished plots

### 🔬 Advanced Techniques
Later chapters cover sophisticated methods:
- **FFT Analysis**: Identify periodic patterns and equipment faults
- **Power Spectral Density**: Compare healthy vs. degrading systems
- **Spectrograms**: Visualize time-frequency evolution
- **Multi-Panel Dashboards**: Combine 6-8 plots in professional layouts
- **Predictive Maintenance**: Health scoring and maintenance recommendations

### 💼 Production-Ready Code
All scripts are designed for real-world use:
- Complete, executable R code (no pseudocode)
- Proper error handling and data validation
- High-resolution export for reports (`ggsave()` with 300-600 DPI)
- Consistent styling and theming
- Commented and well-documented

---

## Additional Resources

### ggplot2 Documentation
- [Official ggplot2 Reference](https://ggplot2.tidyverse.org/)
- [R Graphics Cookbook](https://r-graphics.org/)
- [Data Visualization with ggplot2 Cheat Sheet](https://rstudio.github.io/cheatsheets/data-visualization.pdf)

### Time Series & Signal Processing
- [Forecasting: Principles and Practice](https://otexts.com/fpp3/)
- R `stats` package documentation for `fft()` and `spectrum()`

### Dashboard Design
- [patchwork Documentation](https://patchwork.data-imaginist.com/)
- [cowplot Introduction](https://wilkelab.org/cowplot/articles/introduction.html)

---

## Contributing & Feedback

This tutorial is designed to be a comprehensive learning resource. If you find issues, have suggestions, or want to contribute additional examples:

- **Issues**: Found a bug or unclear explanation? Open an issue
- **Examples**: Have a great IoT visualization example? Submit a pull request
- **Questions**: Stuck on a concept? Check documentation or ask for help

---

## License & Usage

This tutorial is created for educational purposes. Feel free to:
- Use the code in your IoT projects
- Adapt examples for your specific sensors
- Share with colleagues and students
- Modify and extend for your applications

---

## Quick Start Example

Want to dive in immediately? Try this:

```r
# Install required packages
install.packages(c("ggplot2", "dplyr"))

# Load libraries
library(ggplot2)

# Generate simple sensor data
sensor_data <- data.frame(
  timestamp = seq(Sys.time() - 24*3600, Sys.time(), by = "hour"),
  temperature = 25 + 3*sin(2*pi*(0:24)/24) + rnorm(25, 0, 0.5)
)

# Create your first sensor plot
ggplot(sensor_data, aes(x = timestamp, y = temperature)) +
  geom_line(color = "#3498db", size = 1) +
  geom_hline(yintercept = 25, linetype = "dashed", color = "red") +
  labs(
    title = "Temperature Sensor: 24-Hour Monitoring",
    subtitle = "TEMP_001 - Warehouse Zone A",
    x = "Time",
    y = "Temperature (°C)"
  ) +
  theme_minimal()
```

**Congratulations!** 🎉 You've created your first IoT sensor visualization. Now proceed to [Chapter 1](docs/chapter01.md) for a comprehensive deep dive.

---

**Ready to master ggplot2 for IoT data visualization? Start with [Chapter 1](docs/chapter01.md)!**
