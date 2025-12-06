# Chapter 4: Linear Regression for Sensor Value Prediction

## Overview

This chapter introduces linear regression using scikit-learn to predict sensor values from other sensor readings and time. Linear regression is a fundamental machine learning algorithm that models the relationship between input features and a continuous target variable. We'll use it to predict temperature based on other sensor measurements.

## Learning Objectives

By the end of this chapter, you will:
- Understand linear regression and its assumptions
- Use scikit-learn's LinearRegression for prediction
- Split data into training and test sets
- Evaluate regression models using MSE, RMSE, MAE, and R²
- Interpret model coefficients
- Visualize predictions and residuals

## Linear Regression Fundamentals

### What is Linear Regression?

Linear regression models the relationship between input features (X) and a target variable (y) using a linear equation:

```
y = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ + ε
```

Where:
- **β₀**: Intercept (bias term)
- **β₁...βₙ**: Coefficients (weights) for each feature
- **ε**: Error term

### Assumptions

1. **Linearity**: Relationship between X and y is linear
2. **Independence**: Observations are independent
3. **Homoscedasticity**: Constant variance of errors
4. **Normality**: Errors are normally distributed

### When to Use

- Target variable is continuous
- Linear relationship exists
- Good baseline model
- Interpretable results needed

## Code Implementation

The `chapter04.py` file demonstrates:

### 1. Data Preparation

```python
# Features: time, vibration, pressure, current
X = df[["time", "vibration", "pressure", "current"]].values
# Target: temperature
y = df["temperature"].values

# Normalize features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
```

### 2. Train-Test Split

```python
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42
)
```

**Why Split?**
- **Training Set**: Used to learn model parameters
- **Test Set**: Used to evaluate generalization performance
- **80/20 Split**: Common practice (can vary)

### 3. Model Training

```python
model = LinearRegression()
model.fit(X_train, y_train)
```

### 4. Making Predictions

```python
y_pred = model.predict(X_test)
```

## Evaluation Metrics

### Mean Squared Error (MSE)
```python
mse = mean_squared_error(y_test, y_pred)
```
- Average of squared differences
- Penalizes large errors more
- Units: squared units of target

### Root Mean Squared Error (RMSE)
```python
rmse = np.sqrt(mse)
```
- Square root of MSE
- Same units as target variable
- More interpretable than MSE

### Mean Absolute Error (MAE)
```python
mae = mean_absolute_error(y_test, y_pred)
```
- Average of absolute differences
- Less sensitive to outliers
- Same units as target

### R² Score (Coefficient of Determination)
```python
r2 = r2_score(y_test, y_pred)
```
- Proportion of variance explained
- Range: -∞ to 1 (1 = perfect, 0 = baseline)
- Higher is better

## Model Interpretation

### Coefficients

```python
for name, coef in zip(feature_names, model.coef_):
    print(f"{name}: {coef:.4f}")
```

**Interpretation**:
- Positive coefficient: Feature increases target
- Negative coefficient: Feature decreases target
- Magnitude: Strength of relationship

### Intercept

```python
print(f"Intercept: {model.intercept_:.4f}")
```

- Value when all features are zero
- After normalization, represents baseline

## Visualization

### 1. Actual vs Predicted

Shows how well predictions match actual values:
- Points on diagonal line = perfect predictions
- Scatter indicates prediction quality

### 2. Residuals Plot

Shows prediction errors:
- Random scatter = good model
- Patterns = model issues (non-linearity, heteroscedasticity)

### 3. Prediction on New Data

Demonstrates model generalization to unseen data

## Key Concepts

### Feature Scaling

**Why Normalize?**
- Features on different scales
- Prevents one feature from dominating
- Improves numerical stability

**Methods Used**:
- StandardScaler: Mean=0, Std=1
- Applied to features, not target

### Overfitting vs Underfitting

- **Overfitting**: Model memorizes training data (high train accuracy, low test accuracy)
- **Underfitting**: Model too simple (low train and test accuracy)
- **Good Fit**: Similar train and test performance

## Best Practices

1. **Always Split Data**: Never evaluate on training data
2. **Normalize Features**: Especially important for distance-based algorithms
3. **Check Assumptions**: Verify linearity, independence, etc.
4. **Interpret Results**: Understand what coefficients mean
5. **Visualize**: Plots reveal issues numbers don't

## Limitations

- Assumes linear relationships
- Sensitive to outliers
- Cannot capture non-linear patterns
- May miss complex interactions

## Applications

Linear regression is useful for:
- **Sensor Value Prediction**: Predict one sensor from others
- **Trend Analysis**: Understand relationships
- **Baseline Models**: Compare against more complex models
- **Feature Importance**: Identify important sensors

## Next Steps

In the next chapter, we'll move from regression (continuous values) to classification (discrete categories) using logistic regression to detect abnormal sensor behavior.

