# R Programming Workshops

A comprehensive series of 10 progressive workshops covering R programming from fundamentals to advanced topics, with a focus on IoT sensor data analysis.

## Table of Contents

- [R Programming Workshops](#r-programming-workshops)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Workshop Structure](#workshop-structure)
    - [Core Progressive Workshops (1-6)](#core-progressive-workshops-1-6)
    - [Advanced Standalone Workshops (7-10)](#advanced-standalone-workshops-7-10)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Workshop Format](#workshop-format)
  - [Example Usage](#example-usage)
  - [File Structure](#file-structure)
  - [Learning Path](#learning-path)
    - [Beginner Path](#beginner-path)
    - [Intermediate Path](#intermediate-path)
    - [Advanced Path](#advanced-path)
  - [Key Topics Covered](#key-topics-covered)
  - [Dependencies](#dependencies)
    - [Required Packages](#required-packages)
    - [Optional Packages](#optional-packages)
  - [Contributing](#contributing)
  - [License](#license)
  - [Additional Resources](#additional-resources)
  - [Contact](#contact)

## Overview

This repository contains 10 hands-on workshops designed to teach R programming through practical examples. Each workshop includes:

- **Detailed markdown guide** (`workshops/0X-workshop-name.md`) - Step-by-step instructions with explanations
- **Example R script** (`examples/0X-workshop-name.r`) - Executable code demonstrating concepts
- **Exercises** - Practice problems to reinforce learning

## Workshop Structure

### Core Progressive Workshops (1-6)

These workshops build sequentially and should be completed in order:

1. **[R Programming Fundamentals](workshops/01-r-fundamentals.md)** (45-60 min)
   - Variables and data types
   - Basic operations and arithmetic
   - Program flow (conditionals, loops)
   - Functions basics
   - Working with vectors

2. **[Data Structures in R](workshops/02-data-structures.md)** (60-75 min)
   - Vectors, lists, matrices, arrays
   - Data frames (creation, indexing, subsetting)
   - Working with factors
   - Advanced indexing techniques

3. **[Data Generation and Simulation](workshops/03-data-generation.md)** (60-75 min)
   - Generating synthetic IoT sensor data
   - Random number generation
   - Time series data creation
   - Simulating device readings

4. **[Data Import and Export](workshops/04-data-import-export.md)** (60-75 min)
   - Reading and writing CSV files
   - Import/export Excel files (readxl, writexl)
   - Working with JSON data
   - Handling different file formats

5. **[Data Manipulation with dplyr](workshops/05-data-manipulation.md)** (75-90 min)
   - Filter, select, mutate, arrange
   - Group by and summarize
   - Joining datasets
   - Using the pipe operator `%>%`

6. **[Data Visualization with ggplot2](workshops/06-data-visualization.md)** (90-120 min)
   - Basic plots (scatter, line, bar)
   - Customizing aesthetics
   - Faceting for multi-panel plots
   - Themes and styling
   - Creating publication-ready visualizations

### Advanced Standalone Workshops (7-10)

These workshops can be completed in any order after finishing workshops 1-6:

7. **[Statistical Analysis](workshops/07-statistical-analysis.md)** (90-120 min)
   - Descriptive statistics
   - Hypothesis testing (t-tests, chi-square)
   - Correlation and regression
   - ANOVA
   - Working with IoT sensor data statistically

8. **[Time Series Analysis](workshops/08-time-series.md)** (90-120 min)
   - Working with dates and times (lubridate)
   - Time series objects
   - Trend analysis
   - Seasonal decomposition
   - Basic forecasting techniques

9. **[Data Cleaning and Preprocessing](workshops/09-data-cleaning.md)** (90-120 min)
   - Handling missing values
   - Outlier detection and treatment
   - Data transformation
   - Normalization and standardization
   - Building cleaning pipelines

10. **[Advanced Topics and Best Practices](workshops/10-advanced-topics.md)** (90-120 min)
    - Creating custom functions
    - Working with packages
    - Error handling
    - Code organization and documentation
    - Performance optimization

## Getting Started

### Prerequisites

- **R** installed (R 4.0 or higher recommended)
- **RStudio** or any R-compatible IDE
- Basic understanding of programming concepts (helpful but not required)

### Installation

1. **Clone or download this repository:**
   ```bash
   git clone <repository-url>
   cd r-prog
   ```

2. **Install required R packages (optional):**
   
   All example scripts automatically install required packages if they're not already installed. However, you can also install them manually:
   
   ```r
   # Core packages
   install.packages(c("dplyr", "ggplot2", "readxl", "writexl", 
                     "jsonlite", "readr", "lubridate", "zoo"))
   
   # Optional packages for advanced workshops
   install.packages(c("tidyr", "forecast", "xts", "outliers"))
   ```

3. **Start with Workshop 01:**
   - Open `workshops/01-r-fundamentals.md` for the guide
   - Open `examples/01-r-fundamentals.r` for the example code
   - Follow along and complete the exercises

## Workshop Format

Each workshop follows this structure:

1. **Introduction** - What you'll learn
2. **Prerequisites** - Required knowledge
3. **Step-by-Step Instructions** - Detailed explanations with code examples
4. **Exercises** - Practice problems
5. **Summary** - Key takeaways
6. **Next Steps** - What to do next
7. **Additional Resources** - Further reading

## Example Usage

```r
# Load required libraries
library(dplyr)
library(ggplot2)

# Read example data
data <- read.csv("data/sensor_data.csv")

# Process data
processed <- data %>%
  filter(status == "online") %>%
  group_by(device_id) %>%
  summarize(avg_temp = mean(temperature))

# Visualize
ggplot(processed, aes(x = device_id, y = avg_temp)) +
  geom_bar(stat = "identity") +
  labs(title = "Average Temperature by Device",
       x = "Device ID",
       y = "Average Temperature (°C)")
```

## File Structure

```
r-prog/
├── README.md                    # This file
├── workshops/                   # Workshop guides (markdown)
│   ├── 01-r-fundamentals.md
│   ├── 02-data-structures.md
│   ├── 03-data-generation.md
│   ├── 04-data-import-export.md
│   ├── 05-data-manipulation.md
│   ├── 06-data-visualization.md
│   ├── 07-statistical-analysis.md
│   ├── 08-time-series.md
│   ├── 09-data-cleaning.md
│   └── 10-advanced-topics.md
└── examples/                    # Example R scripts
    ├── 01-r-fundamentals.r
    ├── 02-data-structures.r
    ├── 03-data-generation.r
    ├── 04-data-import-export.r
    ├── 05-data-manipulation.r
    ├── 06-data-visualization.r
    ├── 07-statistical-analysis.r
    ├── 08-time-series.r
    ├── 09-data-cleaning.r
    └── 10-advanced-topics.r
```

## Learning Path

### Beginner Path
Complete workshops 1-4 in order to gain fundamental R programming skills.

### Intermediate Path
Complete workshops 1-6 to become proficient in data manipulation and visualization.

### Advanced Path
Complete all 10 workshops to master R programming for data analysis.

## Key Topics Covered

- **Programming Fundamentals**: Variables, data types, control flow, functions
- **Data Structures**: Vectors, lists, matrices, data frames, factors
- **Data Generation**: Creating synthetic datasets, random number generation
- **Data I/O**: CSV, Excel, JSON file handling
- **Data Manipulation**: Filtering, selecting, transforming, summarizing
- **Visualization**: Creating publication-quality plots with ggplot2
- **Statistics**: Descriptive stats, hypothesis testing, regression
- **Time Series**: Date/time handling, trend analysis, forecasting
- **Data Cleaning**: Missing values, outliers, transformations
- **Best Practices**: Functions, error handling, optimization

## Dependencies

### Required Packages
- **Base R** - Core R functionality
- **dplyr** - Data manipulation
- **ggplot2** - Data visualization
- **readxl, writexl** - Excel file handling
- **jsonlite** - JSON data handling
- **readr** - Fast CSV reading
- **lubridate** - Date/time manipulation
- **zoo** - Time series objects

### Optional Packages
- **tidyr** - Data tidying
- **forecast** - Time series forecasting
- **xts** - Extended time series
- **outliers** - Outlier detection
- **VIM** - Missing value visualization

## Contributing

This is an educational resource. Feel free to:
- Report issues or suggest improvements
- Add additional examples or exercises
- Improve documentation

## License

This educational material is provided for learning purposes.

## Additional Resources

- [R Project](https://www.r-project.org/) - Official R website
- [RStudio](https://www.rstudio.com/) - Popular R IDE
- [Tidyverse](https://www.tidyverse.org/) - Collection of R packages
- [R-bloggers](https://www.r-bloggers.com/) - R programming blog aggregator
- [Stack Overflow - R](https://stackoverflow.com/questions/tagged/r) - Q&A forum

## Contact

For questions or feedback about these workshops, please refer to the repository issues.

---

**Happy Learning!** Start with Workshop 01 and work through each workshop at your own pace. Practice the exercises and experiment with the code examples to reinforce your understanding.
