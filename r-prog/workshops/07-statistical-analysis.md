# Workshop 07: Statistical Analysis

**Duration:** 90-120 minutes  
**Level:** Intermediate

## Introduction

Statistical analysis helps you understand patterns, relationships, and make data-driven decisions. This workshop covers descriptive statistics, hypothesis testing, correlation analysis, and regression - essential tools for analyzing IoT sensor data and making informed conclusions.

## What You'll Learn

- Calculating descriptive statistics
- Performing hypothesis tests (t-tests, chi-square)
- Understanding correlation and covariance
- Linear regression analysis
- ANOVA (Analysis of Variance)
- Interpreting statistical results
- Applying statistics to IoT sensor data

## Prerequisites

Before starting, you should have:
- Completed Workshop 02: Data Structures in R
- Completed Workshop 05: Data Manipulation with dplyr
- Basic understanding of statistics (helpful but not required)

## Step-by-Step Instructions

### Step 1: Descriptive Statistics

Summarize your data:

```r
# Basic statistics
mean(temperature)
median(temperature)
sd(temperature)
var(temperature)
min(temperature)
max(temperature)
quantile(temperature, c(0.25, 0.5, 0.75))

# Summary function
summary(sensor_data)

# Using dplyr
sensor_data %>%
  summarize(
    mean_temp = mean(temperature),
    median_temp = median(temperature),
    sd_temp = sd(temperature),
    min_temp = min(temperature),
    max_temp = max(temperature)
  )
```

### Step 2: Hypothesis Testing - T-Test

Compare means:

```r
# One-sample t-test
t.test(temperature, mu = 25)

# Two-sample t-test
online_temp <- sensor_data$temperature[sensor_data$status == "online"]
offline_temp <- sensor_data$temperature[sensor_data$status == "offline"]
t.test(online_temp, offline_temp)

# Paired t-test
t.test(before, after, paired = TRUE)
```

### Step 3: Correlation Analysis

Measure relationships:

```r
# Pearson correlation
cor(temperature, humidity)
cor(sensor_data$temperature, sensor_data$humidity)

# Correlation matrix
cor(sensor_data[, c("temperature", "humidity", "pressure")])

# Correlation test
cor.test(temperature, humidity)

# Spearman correlation (rank-based)
cor(temperature, humidity, method = "spearman")
```

### Step 4: Linear Regression

Model relationships:

```r
# Simple linear regression
model <- lm(humidity ~ temperature, data = sensor_data)
summary(model)

# Multiple regression
model <- lm(humidity ~ temperature + pressure, data = sensor_data)
summary(model)

# Predictions
predictions <- predict(model, newdata = data.frame(temperature = c(20, 25, 30)))

# Plot regression
plot(temperature, humidity)
abline(model, col = "red")
```

### Step 5: ANOVA

Compare multiple groups:

```r
# One-way ANOVA
anova_result <- aov(temperature ~ device_id, data = sensor_data)
summary(anova_result)

# Post-hoc tests
TukeyHSD(anova_result)

# Two-way ANOVA
anova_result <- aov(temperature ~ device_id + status, data = sensor_data)
summary(anova_result)
```

### Step 6: Chi-Square Test

Test categorical associations:

```r
# Chi-square test of independence
table_data <- table(sensor_data$device_id, sensor_data$status)
chisq.test(table_data)

# Goodness of fit test
observed <- c(20, 30, 25)
expected <- c(25, 25, 25)
chisq.test(observed, p = expected/sum(expected))
```

### Step 7: Non-Parametric Tests

When assumptions aren't met:

```r
# Wilcoxon rank-sum test (Mann-Whitney)
wilcox.test(online_temp, offline_temp)

# Kruskal-Wallis test (non-parametric ANOVA)
kruskal.test(temperature ~ device_id, data = sensor_data)

# Spearman correlation
cor.test(temperature, humidity, method = "spearman")
```

## Exercises

1. **Descriptive Statistics:**
   - Calculate mean, median, SD for temperature by device
   - Create a summary table with all key statistics

2. **Hypothesis Testing:**
   - Test if average temperature differs between online and offline devices
   - Interpret the results

3. **Correlation Analysis:**
   - Calculate correlation between temperature and humidity
   - Create a correlation matrix for all numeric variables

4. **Regression Analysis:**
   - Build a model predicting humidity from temperature
   - Interpret coefficients and R-squared
   - Make predictions for new temperature values

## Summary

In this workshop, you've learned:
- How to calculate descriptive statistics
- Performing hypothesis tests (t-tests, chi-square)
- Understanding correlation and relationships
- Linear regression modeling
- ANOVA for group comparisons
- Interpreting statistical results

## Next Steps

- Review the example code in `examples/07-statistical-analysis.r`
- Practice with your own datasets
- Move on to Workshop 08: Time Series Analysis

## Additional Resources

- R Statistics: https://www.statmethods.net/stats/index.html
- Quick-R Statistics: https://www.statmethods.net/
