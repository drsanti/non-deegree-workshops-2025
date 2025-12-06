# ==============================================================================
# Chapter 7: K-means Clustering and SVM for Anomaly Detection
# Python Code for all examples
# ==============================================================================

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from sklearn.preprocessing import StandardScaler
import os

# Set seed for reproducibility
np.random.seed(42)

# Create output directory if it doesn't exist
os.makedirs("output", exist_ok=True)

# ==============================================================================
# GENERATE DATA WITH ANOMALIES
# ==============================================================================

# Normal operation data
normal_data = np.random.normal(0, 1, (800, 2))

# Anomaly data (different distribution)
anomaly_data = np.random.normal(5, 0.5, (50, 2))

# Combine data
X = np.vstack([normal_data, anomaly_data])

# For supervised learning (SVM), we have labels
y = np.array([0]*800 + [1]*50)  # 0=normal, 1=anomaly

print(f"Normal samples: {800}")
print(f"Anomaly samples: {50}")
print(f"Total samples: {len(y)}")

# ==============================================================================
# K-MEANS CLUSTERING (UNSUPERVISED)
# ==============================================================================

print("\n" + "="*60)
print("K-means Clustering (Unsupervised)")
print("="*60)

# Normalize data
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# K-means with 2 clusters
kmeans = KMeans(n_clusters=2, random_state=42, n_init=10)
clusters = kmeans.fit_predict(X_scaled)

# Count samples in each cluster
cluster_0_count = np.sum(clusters == 0)
cluster_1_count = np.sum(clusters == 1)

print(f"\nCluster 0: {cluster_0_count} samples")
print(f"Cluster 1: {cluster_1_count} samples")
print(f"Cluster centers:\n{kmeans.cluster_centers_}")

# Evaluate clustering (compare with true labels)
# Note: Clusters may not match labels 0/1, so we need to map them
from scipy.stats import mode
labels = np.zeros_like(clusters)
for i in range(2):
    mask = (clusters == i)
    labels[mask] = mode(y[mask])[0]

kmeans_acc = accuracy_score(y, labels)
print(f"\nClustering accuracy (mapped to labels): {kmeans_acc:.4f}")

# ==============================================================================
# VISUALIZE K-MEANS CLUSTERING
# ==============================================================================

plt.figure(figsize=(10, 8))
plt.scatter(X_scaled[clusters==0, 0], X_scaled[clusters==0, 1], 
           label="Cluster 0", alpha=0.6, s=30, edgecolors='black', linewidths=0.5)
plt.scatter(X_scaled[clusters==1, 0], X_scaled[clusters==1, 1], 
           label="Cluster 1", alpha=0.6, s=30, edgecolors='black', linewidths=0.5)
plt.scatter(kmeans.cluster_centers_[:, 0], kmeans.cluster_centers_[:, 1], 
           marker='x', s=200, c='red', linewidths=3, label="Centroids")
plt.xlabel("Feature 1 (normalized)")
plt.ylabel("Feature 2 (normalized)")
plt.title("K-means Clustering (2 clusters)")
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("output/chapter07-kmeans.png", dpi=150, bbox_inches='tight')
plt.show()

# ==============================================================================
# SVM FOR ANOMALY DETECTION (SUPERVISED)
# ==============================================================================

print("\n" + "="*60)
print("SVM for Anomaly Detection (Supervised)")
print("="*60)

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)

# Train SVM with RBF kernel
svm = SVC(kernel='rbf', probability=True, random_state=42)
svm.fit(X_train, y_train)

# Predictions
svm_train_pred = svm.predict(X_train)
svm_test_pred = svm.predict(X_test)
svm_test_proba = svm.predict_proba(X_test)[:, 1]

# Evaluate
svm_train_acc = accuracy_score(y_train, svm_train_pred)
svm_test_acc = accuracy_score(y_test, svm_test_pred)

print(f"\nTraining Accuracy: {svm_train_acc:.4f}")
print(f"Test Accuracy: {svm_test_acc:.4f}")

# Classification report
print("\n" + "="*60)
print("SVM Classification Report")
print("="*60)
print(classification_report(y_test, svm_test_pred, 
                            target_names=['Normal', 'Anomaly']))

# ==============================================================================
# VISUALIZE SVM DECISION BOUNDARY
# ==============================================================================

# Create mesh for decision boundary
xx, yy = np.meshgrid(
    np.linspace(X_scaled[:, 0].min()-1, X_scaled[:, 0].max()+1, 100),
    np.linspace(X_scaled[:, 1].min()-1, X_scaled[:, 1].max()+1, 100)
)
Z = svm.predict_proba(np.c_[xx.ravel(), yy.ravel()])[:, 1]
Z = Z.reshape(xx.shape)

plt.figure(figsize=(10, 8))
contour = plt.contourf(xx, yy, Z, levels=20, alpha=0.6, cmap='RdYlBu')
plt.colorbar(contour, label='Probability of Anomaly')
plt.contour(xx, yy, Z, levels=[0.5], colors='black', linewidths=2, linestyles='--')

# Scatter plot
plt.scatter(X_scaled[y==0, 0], X_scaled[y==0, 1], 
           label="Normal", alpha=0.6, s=30, edgecolors='black', linewidths=0.5)
plt.scatter(X_scaled[y==1, 0], X_scaled[y==1, 1], 
           label="Anomaly", alpha=0.6, s=30, edgecolors='black', linewidths=0.5)

# Support vectors
plt.scatter(svm.support_vectors_[:, 0], svm.support_vectors_[:, 1], 
           s=100, facecolors='none', edgecolors='yellow', linewidths=2, 
           label='Support Vectors')

plt.xlabel("Feature 1 (normalized)")
plt.ylabel("Feature 2 (normalized)")
plt.title("SVM Anomaly Detection Decision Boundary")
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("output/chapter07-svm.png", dpi=150, bbox_inches='tight')
plt.show()

# ==============================================================================
# COMPARISON: K-MEANS VS SVM
# ==============================================================================

print("\n" + "="*60)
print("Comparison: K-means vs SVM")
print("="*60)
print(f"\n{'Method':<15} {'Type':<15} {'Accuracy':<15}")
print("-" * 45)
print(f"{'K-means':<15} {'Unsupervised':<15} {kmeans_acc:<15.4f}")
print(f"{'SVM':<15} {'Supervised':<15} {svm_test_acc:<15.4f}")

# Confusion matrices
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# K-means (mapped to labels)
cm_kmeans = confusion_matrix(y, labels)
import seaborn as sns
sns.heatmap(cm_kmeans, annot=True, fmt='d', cmap='Blues', ax=axes[0],
            xticklabels=['Normal', 'Anomaly'], yticklabels=['Normal', 'Anomaly'])
axes[0].set_ylabel('Actual')
axes[0].set_xlabel('Predicted')
axes[0].set_title('K-means Clustering (Mapped)')

# SVM
cm_svm = confusion_matrix(y_test, svm_test_pred)
sns.heatmap(cm_svm, annot=True, fmt='d', cmap='Greens', ax=axes[1],
            xticklabels=['Normal', 'Anomaly'], yticklabels=['Normal', 'Anomaly'])
axes[1].set_ylabel('Actual')
axes[1].set_xlabel('Predicted')
axes[1].set_title('SVM Classification')

plt.tight_layout()
plt.savefig("output/chapter07-comparison.png", dpi=150, bbox_inches='tight')
plt.show()

