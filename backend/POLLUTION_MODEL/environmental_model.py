# environmental_model.py

import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, LabelEncoder
import warnings
warnings.filterwarnings('ignore')

class EnvironmentalRiskPredictor:
    """
    Unsupervised Learning Model for Environmental Risk Assessment
    Uses K-Means clustering to predict categorical risk levels
    """

    def __init__(self, n_clusters=4, random_state=42):
        self.n_clusters = n_clusters
        self.random_state = random_state
        self.scaler = StandardScaler()
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=random_state, n_init=10)
        self.label_encoder = LabelEncoder()
        self.cluster_risk_mapping = None
        self.feature_names = None
        self.is_trained = False

    def fit(self, X, toxicity_level_col='toxicity_level'):
        numeric_cols = X.select_dtypes(include=np.number).columns.tolist()
        if toxicity_level_col in X.columns:
            numeric_cols.append(toxicity_level_col)
        X_processed = X[numeric_cols].copy()

        if toxicity_level_col in X_processed.columns:
            X_processed[f'{toxicity_level_col}_encoded'] = self.label_encoder.fit_transform(X_processed[toxicity_level_col])
            X_processed = X_processed.drop(toxicity_level_col, axis=1)

        self.feature_names = list(X_processed.columns)
        X_scaled = self.scaler.fit_transform(X_processed)
        cluster_labels = self.kmeans.fit_predict(X_scaled)
        self._calculate_risk_mapping(X_processed, cluster_labels)
        self.is_trained = True
        return self

    def _calculate_risk_mapping(self, X, cluster_labels):
        cluster_centers = self.scaler.inverse_transform(self.kmeans.cluster_centers_)
        risk_indicators = {
            'chemical_oxygen_demand': 0.25,
            'bacterial_count': 0.20,
            'fish_mortality_rate': 0.15,
            'coral_bleaching_index': 0.15,
            'industrial_waste_indicator': 0.15,
            'domestic_sewage_index': 0.10
        }
        risk_scores = []
        for cluster_id in range(self.n_clusters):
            score = 0
            for i, feature in enumerate(self.feature_names):
                if feature in risk_indicators:
                    if feature == 'chemical_oxygen_demand':
                        norm_value = min(cluster_centers[cluster_id, i] / 100, 1.0)
                    elif feature == 'bacterial_count':
                        norm_value = min(cluster_centers[cluster_id, i] / 30000, 1.0)
                    else:
                        norm_value = cluster_centers[cluster_id, i]
                    score += norm_value * risk_indicators[feature]
            risk_scores.append(score)

        sorted_clusters = sorted(range(self.n_clusters), key=lambda x: risk_scores[x])
        risk_levels = ['Low', 'Medium', 'High', 'Very High']
        self.cluster_risk_mapping = {cluster_id: risk_levels[i] if i < len(risk_levels) else 'Critical'
                                     for i, cluster_id in enumerate(sorted_clusters)}

    def predict(self, X):
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")

        X_processed = pd.DataFrame(0, index=range(len(X)), columns=self.feature_names)
        for col in X.columns:
            if col in X_processed.columns:
                X_processed[col] = X[col]

        if 'toxicity_level' in X_processed.columns:
            X_processed['toxicity_level_encoded'] = self.label_encoder.transform(X_processed['toxicity_level'])
            X_processed = X_processed.drop('toxicity_level', axis=1)

        X_scaled = self.scaler.transform(X_processed)
        cluster_predictions = self.kmeans.predict(X_scaled)
        return [self.cluster_risk_mapping[cluster] for cluster in cluster_predictions]
