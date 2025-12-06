# Chapter 6: Decision Trees and Random Forest for Multi-feature Classification

## Overview

This chapter introduces decision trees and random forest algorithms for multi-feature classification. Unlike logistic regression which creates linear decision boundaries, decision trees can capture non-linear relationships and complex interactions between features. Random forest combines multiple decision trees for improved accuracy and robustness.

## Learning Objectives

By the end of this chapter, you will:
- Understand how decision trees work
- Learn the random forest ensemble method
- Compare decision tree vs random forest performance
- Interpret feature importance
- Visualize confusion matrices for multi-class problems
- Understand when to use tree-based methods

## Decision Trees

### What is a Decision Tree?

A decision tree is a flowchart-like structure where:
- **Internal nodes**: Test a feature
- **Branches**: Outcome of the test
- **Leaf nodes**: Class label or prediction

### How It Works

1. Start at root node
2. Test a feature (e.g., "Is vibration > 1.5?")
3. Follow branch based on answer
4. Repeat until reaching a leaf
5. Predict class at leaf

### Key Concepts

**Splitting Criteria**:
- **Gini Impurity**: Measures class mixing
- **Entropy**: Measures information content
- **Information Gain**: Reduction in entropy after split

**Stopping Criteria**:
- Maximum depth
- Minimum samples per leaf
- Minimum samples to split

### Advantages

- Easy to interpret and visualize
- Handles non-linear relationships
- No feature scaling required
- Handles mixed data types
- Feature importance available

### Disadvantages

- Prone to overfitting
- Sensitive to small data changes
- Can create biased trees
- May not generalize well

## Random Forest

### What is Random Forest?

An ensemble method that combines multiple decision trees:
1. Train many trees on different data subsets
2. Each tree votes on the prediction
3. Final prediction = majority vote (classification) or average (regression)

### Key Features

**Bootstrap Aggregating (Bagging)**:
- Each tree trained on random sample (with replacement)
- Different samples for each tree

**Feature Randomness**:
- Each split considers random subset of features
- Reduces correlation between trees

### Advantages

- More accurate than single decision tree
- Less prone to overfitting
- Handles missing values well
- Provides feature importance
- Works well with default parameters

### Disadvantages

- Less interpretable than single tree
- Can be slow with many trees
- Requires more memory
- May overfit with noisy data

## Code Implementation

The `chapter06.py` file demonstrates:

### 1. Multi-class Data Generation

```python
# Normal operation
normal = np.random.rand(200, 4) * 10

# Different fault types with distinct patterns
fault1 = normal.copy()
fault1[:, 0] += 3  # High vibration
```

**Key Design**:
- Four classes: Normal, Fault Type 1, 2, 3
- Each fault has distinct feature patterns
- Realistic industrial scenarios

### 2. Decision Tree Training

```python
dt = DecisionTreeClassifier(max_depth=5, random_state=42)
dt.fit(X_train, y_train)
```

**Parameters**:
- `max_depth`: Limits tree depth to prevent overfitting
- `random_state`: Ensures reproducibility

### 3. Random Forest Training

```python
rf = RandomForestClassifier(
    n_estimators=100,  # Number of trees
    max_depth=5,
    random_state=42
)
rf.fit(X_train, y_train)
```

**Parameters**:
- `n_estimators`: Number of trees (more = better but slower)
- `max_depth`: Limits depth of each tree

## Feature Importance

### What is Feature Importance?

Measures how much each feature contributes to predictions.

### Calculation

- Decision Tree: Based on how much each feature reduces impurity
- Random Forest: Average importance across all trees

### Interpretation

```python
importances = rf.feature_importances_
plt.barh(feature_names, importances)
```

**Higher importance** = Feature is more useful for classification

**Applications**:
- Feature selection
- Understanding model behavior
- Domain knowledge validation

## Evaluation

### Accuracy Comparison

The code compares:
- Decision Tree accuracy
- Random Forest accuracy
- Typically, Random Forest performs better

### Confusion Matrix

Shows classification performance for each class:
- Diagonal: Correct predictions
- Off-diagonal: Misclassifications
- Helps identify which classes are confused

### Classification Report

Provides per-class metrics:
- Precision, Recall, F1-score
- Support (number of samples)
- Macro and weighted averages

## Visualization

### Feature Importance Plot

- Horizontal bar chart
- Shows relative importance of each feature
- Helps understand what the model uses

### Confusion Matrix Heatmap

- Color-coded matrix
- Darker colors = more samples
- Easy to spot misclassifications

## Key Concepts

### Overfitting Prevention

**Decision Tree**:
- Limit max_depth
- Set minimum samples per leaf
- Use pruning

**Random Forest**:
- Naturally reduces overfitting
- Can use deeper trees
- More trees = better generalization (up to a point)

### Hyperparameters

**Decision Tree**:
- `max_depth`: Maximum tree depth
- `min_samples_split`: Minimum samples to split
- `min_samples_leaf`: Minimum samples in leaf

**Random Forest**:
- `n_estimators`: Number of trees
- `max_features`: Features considered per split
- `max_depth`: Maximum tree depth

## Best Practices

1. **Start with Random Forest**: Usually better than single tree
2. **Tune Hyperparameters**: Use cross-validation
3. **Check Feature Importance**: Validate with domain knowledge
4. **Visualize Trees**: Understand model decisions (for single tree)
5. **Handle Imbalanced Classes**: Use class_weight parameter

## When to Use

### Decision Trees
- Need interpretability
- Small datasets
- Quick baseline model
- Feature importance needed

### Random Forest
- Better accuracy needed
- Large datasets
- Complex relationships
- Production systems

## Limitations

- May not capture linear relationships well
- Can be memory intensive
- Less interpretable than linear models
- May require tuning

## Applications

Tree-based methods are useful for:
- **Multi-class Fault Detection**: Different fault types
- **Feature Selection**: Identify important sensors
- **Non-linear Classification**: Complex decision boundaries
- **Interpretable Models**: Understand model decisions

## Next Steps

In the next chapter, we'll explore unsupervised learning with K-means clustering and supervised learning with SVM for anomaly detection.

