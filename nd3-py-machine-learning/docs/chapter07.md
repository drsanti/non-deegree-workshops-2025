# Chapter 7: K-means Clustering and SVM for Anomaly Detection

## Overview

This chapter introduces two powerful approaches for anomaly detection: K-means clustering (unsupervised) and Support Vector Machines (SVM, supervised). We'll compare unsupervised vs supervised approaches and learn when to use each method for detecting abnormal sensor behavior.

## Learning Objectives

By the end of this chapter, you will:
- Understand unsupervised vs supervised learning
- Learn how K-means clustering works
- Use SVM for classification-based anomaly detection
- Compare unsupervised and supervised approaches
- Visualize clusters and decision boundaries
- Choose the right method for your problem

## Unsupervised vs Supervised Learning

### Unsupervised Learning (K-means)

**Characteristics**:
- No labels required
- Finds patterns in data
- Discovers hidden structure

**Use Cases**:
- No labeled data available
- Exploring data structure
- Finding unknown patterns
- Anomaly detection

### Supervised Learning (SVM)

**Characteristics**:
- Requires labeled data
- Learns from examples
- Predicts known classes

**Use Cases**:
- Labeled data available
- Known anomaly types
- Classification tasks
- Better accuracy possible

## K-means Clustering

### What is K-means?

An unsupervised algorithm that partitions data into K clusters:
1. Initialize K cluster centers randomly
2. Assign each point to nearest center
3. Update centers to mean of assigned points
4. Repeat until convergence

### Algorithm Steps

1. **Initialization**: Choose K cluster centers randomly
2. **Assignment**: Assign each point to nearest center
3. **Update**: Move centers to mean of assigned points
4. **Repeat**: Steps 2-3 until centers don't change

### Key Parameters

- **K (n_clusters)**: Number of clusters
- **Initialization**: How to start (random, k-means++)
- **Max iterations**: Maximum iterations
- **Tolerance**: Convergence threshold

### Advantages

- Simple and fast
- Works well with spherical clusters
- No labels needed
- Easy to implement

### Disadvantages

- Need to specify K
- Assumes spherical clusters
- Sensitive to initialization
- May not work with non-spherical clusters

## Code Implementation

The `chapter07.py` file demonstrates:

### 1. Generate Anomaly Data

```python
# Normal operation
normal_data = np.random.normal(0, 1, (800, 2))

# Anomaly data (different distribution)
anomaly_data = np.random.normal(5, 0.5, (50, 2))
```

**Key Design**:
- Normal: Centered at origin
- Anomaly: Shifted distribution
- Simulates real anomaly patterns

### 2. K-means Clustering

```python
kmeans = KMeans(n_clusters=2, random_state=42)
clusters = kmeans.fit_predict(X_scaled)
```

**Process**:
- Finds 2 clusters automatically
- No labels used
- Discovers normal vs anomaly groups

### 3. Cluster Evaluation

```python
# Map clusters to labels for evaluation
labels = np.zeros_like(clusters)
for i in range(2):
    mask = (clusters == i)
    labels[mask] = mode(y[mask])[0]
```

**Note**: Clusters may not match original labels, so we map them for comparison.

## Support Vector Machine (SVM)

### What is SVM?

A supervised learning algorithm that finds the optimal boundary (hyperplane) to separate classes:
- Maximizes margin between classes
- Uses support vectors (critical points)
- Can handle non-linear boundaries with kernels

### Key Concepts

**Hyperplane**: Decision boundary that separates classes

**Margin**: Distance between hyperplane and nearest points

**Support Vectors**: Points closest to hyperplane

**Kernels**: Transform data to higher dimensions for non-linear separation

### Kernel Types

- **Linear**: For linearly separable data
- **RBF (Radial Basis Function)**: For non-linear boundaries
- **Polynomial**: For polynomial relationships

### Advantages

- Effective in high dimensions
- Memory efficient (uses support vectors only)
- Versatile (different kernels)
- Good generalization

### Disadvantages

- Slow on large datasets
- Sensitive to feature scaling
- Doesn't provide probabilities directly
- Black box model

## Code Implementation

### 1. SVM Training

```python
svm = SVC(kernel='rbf', probability=True, random_state=42)
svm.fit(X_train, y_train)
```

**Parameters**:
- `kernel='rbf'`: Non-linear kernel
- `probability=True`: Enable probability estimates

### 2. Predictions

```python
svm_pred = svm.predict(X_test)
svm_proba = svm.predict_proba(X_test)[:, 1]
```

## Comparison: K-means vs SVM

### Accuracy

- **K-means**: Lower (unsupervised, no labels)
- **SVM**: Higher (supervised, uses labels)

### Data Requirements

- **K-means**: No labels needed
- **SVM**: Requires labeled data

### Use Cases

**K-means**:
- Exploring unknown data
- No labeled anomalies
- Quick anomaly detection

**SVM**:
- Known anomaly types
- Labeled data available
- Better accuracy needed

## Visualization

### K-means Clustering

- Scatter plot with cluster colors
- Cluster centers marked
- Shows discovered groups

### SVM Decision Boundary

- Probability contour plot
- Decision boundary line
- Support vectors highlighted
- Clear separation visualization

### Confusion Matrices

- Side-by-side comparison
- Shows classification performance
- Identifies misclassifications

## Key Concepts

### Feature Scaling

**Critical for SVM**:
- SVM uses distance calculations
- Unscaled features cause issues
- Always normalize before SVM

**Less critical for K-means**:
- Also uses distances
- Scaling still recommended

### Choosing K for K-means

**Methods**:
- Elbow method (plot within-cluster sum of squares)
- Domain knowledge
- Try different K values
- In our case: K=2 (normal vs anomaly)

### SVM Hyperparameters

- **C**: Regularization parameter (larger = less regularization)
- **gamma**: Kernel coefficient (RBF kernel)
- **kernel**: Type of kernel function

## Best Practices

### K-means
1. **Normalize Data**: Scale features
2. **Choose K Carefully**: Use elbow method or domain knowledge
3. **Multiple Runs**: Try different initializations
4. **Validate Clusters**: Check if clusters make sense

### SVM
1. **Always Scale**: Critical for performance
2. **Tune Hyperparameters**: C and gamma
3. **Choose Right Kernel**: Linear vs RBF
4. **Handle Imbalance**: Use class_weight

## When to Use

### K-means Clustering
- No labeled data
- Exploring data structure
- Quick anomaly detection
- Unknown number of anomaly types

### SVM
- Labeled data available
- Known anomaly types
- Need high accuracy
- Non-linear boundaries needed

## Limitations

### K-means
- Assumes spherical clusters
- Need to specify K
- May not find all anomalies
- Sensitive to outliers

### SVM
- Slow on large datasets
- Requires labeled data
- Sensitive to hyperparameters
- Less interpretable

## Applications

### K-means
- **Unsupervised Anomaly Detection**: Find unknown patterns
- **Data Exploration**: Understand data structure
- **Clustering**: Group similar samples

### SVM
- **Supervised Anomaly Detection**: Classify known anomalies
- **Fault Classification**: Multiple fault types
- **High Accuracy Needs**: Production systems

## Next Steps

In the next chapter, we'll move to deep learning with TensorFlow, starting with neural networks for binary fault classification.

