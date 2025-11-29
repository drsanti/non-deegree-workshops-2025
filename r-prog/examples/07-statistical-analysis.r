# Workshop 07: Statistical Analysis
# This script demonstrates statistical analysis techniques

# Install and load required libraries
# Install packages if not already installed
if (!require(dplyr, quietly = TRUE)) {
  cat("Installing dplyr package...\n")
  install.packages("dplyr")
}

# Load libraries (dplyr is optional for some examples)
if (require(dplyr, quietly = TRUE)) {
  library(dplyr)
}

# ============================================================================
# Setup: Create Sample Data
# ============================================================================

cat("=== Creating Sample Data ===\n")

set.seed(123)
sensor_data <- data.frame(
  device_id = rep(paste0("IoT-", sprintf("%03d", 1:5)), each = 20),
  temperature = round(rnorm(100, mean = 25, sd = 2), 2),
  humidity = round(runif(100, 40, 60), 1),
  pressure = round(rnorm(100, mean = 1013, sd = 5), 1),
  status = sample(c("online", "offline"), 100, replace = TRUE, prob = c(0.8, 0.2))
)

# Add some correlation between temperature and humidity
sensor_data$humidity <- 50 - 0.5 * (sensor_data$temperature - 25) + rnorm(100, 0, 3)
sensor_data$humidity <- pmax(40, pmin(60, sensor_data$humidity))

cat("Sample data created:", nrow(sensor_data), "rows\n")

# ============================================================================
# 1. Descriptive Statistics
# ============================================================================

cat("\n=== Descriptive Statistics ===\n")

# Basic statistics
cat("Temperature Statistics:\n")
cat("Mean:", mean(sensor_data$temperature), "\n")
cat("Median:", median(sensor_data$temperature), "\n")
cat("SD:", sd(sensor_data$temperature), "\n")
cat("Variance:", var(sensor_data$temperature), "\n")
cat("Min:", min(sensor_data$temperature), "\n")
cat("Max:", max(sensor_data$temperature), "\n")
cat("Range:", range(sensor_data$temperature), "\n")
cat("Quantiles:\n")
print(quantile(sensor_data$temperature, c(0.25, 0.5, 0.75)))

# Summary function
cat("\nSummary of sensor_data:\n")
print(summary(sensor_data))

# Using dplyr for grouped statistics
if (require(dplyr, quietly = TRUE)) {
  library(dplyr)
  
  device_stats <- sensor_data %>%
    group_by(device_id) %>%
    summarize(
      count = n(),
      mean_temp = mean(temperature),
      median_temp = median(temperature),
      sd_temp = sd(temperature),
      min_temp = min(temperature),
      max_temp = max(temperature),
      .groups = "drop"
    )
  
  cat("\nStatistics by Device:\n")
  print(device_stats)
}

# ============================================================================
# 2. Hypothesis Testing - T-Test
# ============================================================================

cat("\n=== Hypothesis Testing ===\n")

# One-sample t-test
cat("One-sample t-test (testing if mean = 25):\n")
t_test1 <- t.test(sensor_data$temperature, mu = 25)
print(t_test1)
cat("P-value:", t_test1$p.value, "\n")
if (t_test1$p.value < 0.05) {
  cat("Reject null hypothesis: mean is significantly different from 25\n")
} else {
  cat("Fail to reject null hypothesis: mean is not significantly different from 25\n")
}

# Two-sample t-test
online_temp <- sensor_data$temperature[sensor_data$status == "online"]
offline_temp <- sensor_data$temperature[sensor_data$status == "offline"]

cat("\nTwo-sample t-test (online vs offline):\n")
cat("Online mean:", mean(online_temp), "\n")
cat("Offline mean:", mean(offline_temp), "\n")

t_test2 <- t.test(online_temp, offline_temp)
print(t_test2)
cat("P-value:", t_test2$p.value, "\n")

# ============================================================================
# 3. Correlation Analysis
# ============================================================================

cat("\n=== Correlation Analysis ===\n")

# Pearson correlation
correlation <- cor(sensor_data$temperature, sensor_data$humidity)
cat("Pearson correlation (temperature vs humidity):", round(correlation, 3), "\n")

# Correlation test
cor_test <- cor.test(sensor_data$temperature, sensor_data$humidity)
cat("\nCorrelation test:\n")
print(cor_test)
cat("P-value:", cor_test$p.value, "\n")

# Correlation matrix
cat("\nCorrelation Matrix:\n")
cor_matrix <- cor(sensor_data[, c("temperature", "humidity", "pressure")])
print(round(cor_matrix, 3))

# Spearman correlation (rank-based)
spearman_cor <- cor(sensor_data$temperature, sensor_data$humidity, method = "spearman")
cat("\nSpearman correlation:", round(spearman_cor, 3), "\n")

# ============================================================================
# 4. Linear Regression
# ============================================================================

cat("\n=== Linear Regression ===\n")

# Simple linear regression
model1 <- lm(humidity ~ temperature, data = sensor_data)
cat("Simple Linear Regression (humidity ~ temperature):\n")
print(summary(model1))

cat("\nCoefficients:\n")
print(coef(model1))
cat("\nR-squared:", summary(model1)$r.squared, "\n")
cat("Adjusted R-squared:", summary(model1)$adj.r.squared, "\n")

# Multiple regression
model2 <- lm(humidity ~ temperature + pressure, data = sensor_data)
cat("\nMultiple Regression (humidity ~ temperature + pressure):\n")
print(summary(model2))

# Predictions
new_temps <- data.frame(temperature = c(20, 25, 30))
predictions <- predict(model1, newdata = new_temps)
cat("\nPredictions for temperatures 20, 25, 30:\n")
print(predictions)

# Confidence intervals
conf_int <- predict(model1, newdata = new_temps, interval = "confidence")
cat("\nConfidence intervals:\n")
print(conf_int)

# ============================================================================
# 5. ANOVA
# ============================================================================

cat("\n=== ANOVA ===\n")

# One-way ANOVA
anova_result <- aov(temperature ~ device_id, data = sensor_data)
cat("One-way ANOVA (temperature ~ device_id):\n")
print(summary(anova_result))

# Extract p-value
p_value <- summary(anova_result)[[1]][["Pr(>F)"]][1]
cat("P-value:", p_value, "\n")
if (p_value < 0.05) {
  cat("Significant difference between devices\n")
} else {
  cat("No significant difference between devices\n")
}

# Post-hoc tests (Tukey HSD)
if (p_value < 0.05) {
  cat("\nPost-hoc test (Tukey HSD):\n")
  tukey_result <- TukeyHSD(anova_result)
  print(tukey_result)
}

# Two-way ANOVA
anova_result2 <- aov(temperature ~ device_id + status, data = sensor_data)
cat("\nTwo-way ANOVA (temperature ~ device_id + status):\n")
print(summary(anova_result2))

# ============================================================================
# 6. Chi-Square Test
# ============================================================================

cat("\n=== Chi-Square Test ===\n")

# Create contingency table
table_data <- table(sensor_data$device_id, sensor_data$status)
cat("Contingency Table:\n")
print(table_data)

# Chi-square test of independence
chisq_result <- chisq.test(table_data)
cat("\nChi-square test:\n")
print(chisq_result)
cat("P-value:", chisq_result$p.value, "\n")

# Goodness of fit test
observed <- c(20, 30, 25, 15, 10)
expected <- rep(20, 5)
chisq_gof <- chisq.test(observed, p = expected/sum(expected))
cat("\nGoodness of fit test:\n")
print(chisq_gof)

# ============================================================================
# 7. Non-Parametric Tests
# ============================================================================

cat("\n=== Non-Parametric Tests ===\n")

# Wilcoxon rank-sum test (Mann-Whitney)
wilcox_result <- wilcox.test(online_temp, offline_temp)
cat("Wilcoxon rank-sum test:\n")
print(wilcox_result)
cat("P-value:", wilcox_result$p.value, "\n")

# Kruskal-Wallis test (non-parametric ANOVA)
kruskal_result <- kruskal.test(temperature ~ device_id, data = sensor_data)
cat("\nKruskal-Wallis test:\n")
print(kruskal_result)
cat("P-value:", kruskal_result$p.value, "\n")

# Spearman correlation test
spearman_test <- cor.test(sensor_data$temperature, sensor_data$humidity, 
                          method = "spearman")
cat("\nSpearman correlation test:\n")
print(spearman_test)

# ============================================================================
# Exercise Solutions
# ============================================================================

cat("\n=== Exercise 1: Descriptive Statistics ===\n")
if (require(dplyr, quietly = TRUE)) {
  exercise1 <- sensor_data %>%
    group_by(device_id) %>%
    summarize(
      count = n(),
      mean_temp = mean(temperature),
      median_temp = median(temperature),
      sd_temp = sd(temperature),
      min_temp = min(temperature),
      max_temp = max(temperature),
      q25 = quantile(temperature, 0.25),
      q75 = quantile(temperature, 0.75),
      .groups = "drop"
    )
  cat("Summary statistics by device:\n")
  print(exercise1)
}

cat("\n=== Exercise 2: Hypothesis Testing ===\n")
t_test_ex <- t.test(online_temp, offline_temp)
cat("Testing if average temperature differs between online and offline devices:\n")
cat("Online mean:", mean(online_temp), "\n")
cat("Offline mean:", mean(offline_temp), "\n")
cat("P-value:", t_test_ex$p.value, "\n")
if (t_test_ex$p.value < 0.05) {
  cat("Conclusion: Significant difference exists\n")
} else {
  cat("Conclusion: No significant difference\n")
}

cat("\n=== Exercise 3: Correlation Analysis ===\n")
cor_matrix_ex <- cor(sensor_data[, c("temperature", "humidity", "pressure")])
cat("Correlation matrix:\n")
print(round(cor_matrix_ex, 3))

cor_test_ex <- cor.test(sensor_data$temperature, sensor_data$humidity)
cat("\nTemperature-Humidity correlation:\n")
cat("Correlation:", round(cor_test_ex$estimate, 3), "\n")
cat("P-value:", cor_test_ex$p.value, "\n")

cat("\n=== Exercise 4: Regression Analysis ===\n")
model_ex <- lm(humidity ~ temperature, data = sensor_data)
cat("Regression model summary:\n")
print(summary(model_ex))

cat("\nInterpretation:\n")
cat("Intercept:", round(coef(model_ex)[1], 2), "\n")
cat("Slope (temperature coefficient):", round(coef(model_ex)[2], 2), "\n")
cat("R-squared:", round(summary(model_ex)$r.squared, 3), "\n")
cat("This means", round(summary(model_ex)$r.squared * 100, 1), 
    "% of variance in humidity is explained by temperature\n")

# Predictions
new_data <- data.frame(temperature = c(20, 25, 30))
predictions_ex <- predict(model_ex, newdata = new_data)
cat("\nPredictions for temperatures 20, 25, 30:\n")
print(round(predictions_ex, 2))

cat("\n=== Summary ===\n")
cat("Statistical analysis completed successfully!\n")
cat("Key techniques demonstrated:\n")
cat("- Descriptive statistics\n")
cat("- Hypothesis testing (t-tests)\n")
cat("- Correlation analysis\n")
cat("- Linear regression\n")
cat("- ANOVA\n")
cat("- Non-parametric tests\n")
