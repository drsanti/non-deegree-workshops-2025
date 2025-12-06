# Chapter 5: Logistic Regression for Binary Classification

## Overview

This chapter introduces logistic regression for binary classification tasks. Unlike linear regression which predicts continuous values, logistic regression predicts probabilities of class membership. We'll use it to classify sensor readings as "normal" or "abnormal" based on multiple sensor features.

## Learning Objectives

By the end of this chapter, you will:
- Understand the difference between regression and classification
- Learn how logistic regression works
- Use scikit-learn's LogisticRegression for binary classification
- Evaluate classification models using accuracy, confusion matrix, and classification report
- Visualize decision boundaries
- Interpret model probabilities

## Classification vs Regression

### Regression (Previous Chapter)
- **Target**: Continuous values (e.g., temperature in °C)
- **Output**: Real numbers
- **Example**: Predict temperature from other sensors

### Classification (This Chapter)
- **Target**: Discrete categories (e.g., normal/abnormal)
- **Output**: Class labels or probabilities
- **Example**: Classify sensor state as normal or abnormal

## Logistic Regression Fundamentals

### What is Logistic Regression?

Logistic regression models the probability of class membership using the logistic (sigmoid) function:

```
P(y=1) = 1 / (1 + e^(-z))
where z = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ
```

**Key Properties**:
- Output is always between 0 and 1 (probability)
- Uses sigmoid function to map linear combination to probability
- Decision threshold typically at 0.5

### Sigmoid Function

- Input: Any real number
- Output: Value between 0 and 1
- S-shaped curve
- Steep near 0, flat at extremes

## Code Implementation

The `chapter05.py` file demonstrates:

### 1. Generate Classification Data

```python
# Normal operation
normal_vibration = np.random.normal(1.0, 0.1, 500)
normal_temp = np.random.normal(50, 2, 500)

# Abnormal operation (e.g., bearing failure)
abnormal_vibration = np.random.normal(1.6, 0.2, 150)
abnormal_temp = np.random.normal(55, 3, 150)
```

**Key Differences**:
- Abnormal data has higher mean values
- Simulates real fault conditions
- Creates separable classes

### 2. Model Training

```python
clf = LogisticRegression(max_iter=1000)
clf.fit(X_train, y_train)
```

### 3. Predictions

```python
# Class predictions
y_pred = clf.predict(X_test)

# Probability predictions
y_proba = clf.predict_proba(X_test)[:, 1]
```

## Evaluation Metrics

### Accuracy

```python
accuracy = accuracy_score(y_test, y_pred)
```

- Proportion of correct predictions
- Simple but can be misleading with imbalanced classes
- Range: 0 to 1 (higher is better)

### Confusion Matrix

```
                Predicted
              Normal  Abnormal
Actual Normal    TN      FP
       Abnormal  FN      TP
```

**Components**:
- **TP (True Positive)**: Correctly predicted abnormal
- **TN (True Negative)**: Correctly predicted normal
- **FP (False Positive)**: Normal predicted as abnormal (false alarm)
- **FN (False Negative)**: Abnormal predicted as normal (missed fault)

### Classification Report

Provides:
- **Precision**: TP / (TP + FP) - Of predicted abnormal, how many are actually abnormal?
- **Recall**: TP / (TP + FN) - Of actual abnormal, how many were detected?
- **F1-Score**: Harmonic mean of precision and recall
- **Support**: Number of samples in each class

## Decision Boundary

### What is a Decision Boundary?

The line (or surface) that separates classes in feature space.

### Visualization

```python
# Create mesh
xx, yy = np.meshgrid(...)
Z = clf.predict_proba(np.c_[xx.ravel(), yy.ravel()])[:, 1]
Z = Z.reshape(xx.shape)

# Plot contour
plt.contourf(xx, yy, Z, levels=20, alpha=0.6)
```

**Interpretation**:
- Different colors = different probabilities
- Contour line at 0.5 = decision boundary
- Points on one side = one class, other side = other class

## Model Interpretation

### Coefficients

```python
for name, coef in zip(feature_names, clf.coef_[0]):
    print(f"{name}: {coef:.4f}")
```

**Interpretation**:
- Positive coefficient: Feature increases probability of class 1
- Negative coefficient: Feature decreases probability of class 1
- Larger magnitude: Stronger influence

### Intercept

- Baseline log-odds when all features are zero
- After normalization, represents overall class balance

## Probability Interpretation

### Probability Distribution

The code visualizes probability distributions:
- Normal samples: Should have low probabilities (close to 0)
- Abnormal samples: Should have high probabilities (close to 1)
- Overlap indicates classification difficulty

### Decision Threshold

- Default: 0.5
- Can be adjusted based on:
  - Cost of false positives vs false negatives
  - Class imbalance
  - Application requirements

## Key Concepts

### Feature Scaling

**Why Important?**
- Logistic regression uses gradient descent
- Unscaled features can cause slow convergence
- StandardScaler ensures all features contribute equally

### Class Imbalance

**Problem**: One class has many more samples than the other

**Solutions**:
- Use class_weight parameter
- Resample data (oversample minority, undersample majority)
- Use different evaluation metrics (precision, recall, F1)

### Multi-class Extension

- Logistic regression can handle multiple classes
- Uses one-vs-rest or multinomial approach
- We'll see this in later chapters

## Best Practices

1. **Normalize Features**: Always scale before training
2. **Check Class Balance**: Handle imbalanced classes appropriately
3. **Use Appropriate Metrics**: Don't rely only on accuracy
4. **Visualize Decision Boundary**: Understand model behavior
5. **Interpret Probabilities**: Use probabilities, not just predictions

## Limitations

- Assumes linear decision boundary
- May struggle with non-linear relationships
- Sensitive to outliers
- Requires feature scaling

## Applications

Logistic regression is useful for:
- **Fault Detection**: Normal vs abnormal classification
- **Quality Control**: Pass/fail decisions
- **Medical Diagnosis**: Disease/no disease
- **Spam Detection**: Spam/not spam

## Next Steps

In the next chapter, we'll explore decision trees and random forests, which can capture non-linear relationships and handle multiple classes more effectively.

