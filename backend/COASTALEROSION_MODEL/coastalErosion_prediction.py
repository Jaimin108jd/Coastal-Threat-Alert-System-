import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import warnings
warnings.filterwarnings('ignore')


class CoastalErosionPredictor:
    def __init__(self, random_state=42):
        self.random_state = random_state
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        # Removed 'location' and 'expected_risk' from features
        self.feature_columns = [
            "shoreline_position","beach_width","beach_volume","dune_height",
            "dune_width","cliff_retreat_rate","wave_height","wave_period",
            "wave_energy","tidal_range","storm_surge_frequency","wind_speed",
            "wind_direction","sea_level_rise","relative_sea_level_change"
        ]
        self.final_features = None
        self.X_train = self.X_test = self.y_train = self.y_test = None

    # -------------------- Load Data --------------------
    def load_data(self, file_path=None, data=None):
        if data is not None:
            self.data = data
            print("Data loaded from provided dataset")
        elif file_path:
            self.data = pd.read_csv(file_path)
            print(f"Data loaded from {file_path}")
        else:
            raise ValueError("Either file_path or data must be provided")
        print(f"Dataset shape: {self.data.shape}")
        print(f"Columns: {list(self.data.columns)}")
        return self.data

    # -------------------- Explore Data --------------------
    def explore_data(self):
        print("\n=== DATA EXPLORATION ===")
        print(f"Missing values:\n{self.data.isnull().sum()}")
        if 'risk_assessment' in self.data.columns:
            print("\nTarget distribution:")
            print(self.data['risk_assessment'].value_counts().sort_index())
            plt.figure(figsize=(12,5))
            plt.subplot(1,2,1)
            self.data['risk_assessment'].value_counts().sort_index().plot(kind='bar')
            plt.title('Risk Assessment Distribution')
            plt.xlabel('Risk Level')
            plt.ylabel('Count')

            plt.subplot(1,2,2)
            numeric_cols = self.data.select_dtypes(include=[np.number]).columns
            sns.heatmap(self.data[numeric_cols].corr(), cmap='coolwarm', center=0, annot=False)
            plt.title('Feature Correlation')
            plt.tight_layout()
            plt.show()
            plt.close('all')

    # -------------------- Feature Engineering --------------------
    def feature_engineering(self, X):
        X_engineered = X.copy()
        if 'wave_height' in X.columns and 'wave_period' in X.columns:
            X_engineered['wave_steepness'] = X['wave_height'] / (X['wave_period'] + 1e-6)
        if 'beach_width' in X.columns and 'beach_volume' in X.columns:
            X_engineered['beach_stability_ratio'] = X['beach_volume'] / (X['beach_width'] + 1e-6)
        self.final_features = list(X_engineered.columns)
        return X_engineered

    # -------------------- Preprocess Data --------------------
    def preprocess_data(self, data=None):
        if data is None:
            data = self.data
        available_features = [col for col in self.feature_columns if col in data.columns]
        self.feature_columns = available_features
        X = data[available_features].copy().fillna(data[available_features].median())
        if 'risk_assessment' in data.columns:
            y = data['risk_assessment'].copy()
            if y.dtype == 'object':
                y = self.label_encoder.fit_transform(y)
        else:
            raise ValueError("Target column 'risk_assessment' not found")
        print(f"Features shape: {X.shape}, Target shape: {y.shape}")
        return self.feature_engineering(X), y

    # -------------------- Train Model --------------------
    def train_model(self, X, y, tune_hyperparameters=False):
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=self.random_state, stratify=y
        )
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        if tune_hyperparameters:
            param_grid = {
                'n_estimators': [100, 200],
                'max_depth': [10, 15, 20, None],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4]
            }
            rf = RandomForestClassifier(random_state=self.random_state, n_jobs=-1)
            grid_search = GridSearchCV(rf, param_grid, cv=5, scoring='accuracy', n_jobs=-1, verbose=1)
            grid_search.fit(X_train_scaled, y_train)
            self.model = grid_search.best_estimator_
            print(f"Best parameters: {grid_search.best_params_}")
        else:
            self.model = RandomForestClassifier(
                n_estimators=200,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=self.random_state,
                n_jobs=-1,
                class_weight='balanced'
            )
            self.model.fit(X_train_scaled, y_train)

        self.X_train, self.X_test = X_train_scaled, X_test_scaled
        self.y_train, self.y_test = y_train, y_test
        print("Model training completed!")
        return self.model

    # -------------------- Evaluate Model --------------------
    def evaluate_model(self):
        y_train_pred = self.model.predict(self.X_train)
        y_test_pred = self.model.predict(self.X_test)
        train_acc = accuracy_score(self.y_train, y_train_pred)
        test_acc = accuracy_score(self.y_test, y_test_pred)
        cv_scores = cross_val_score(self.model, self.X_train, self.y_train, cv=5, scoring='accuracy')
        precision, recall, f1, _ = precision_recall_fscore_support(self.y_test, y_test_pred, average='weighted')
        metrics = {
            'train_accuracy': train_acc,
            'test_accuracy': test_acc,
            'cv_accuracy_mean': cv_scores.mean(),
            'cv_accuracy_std': cv_scores.std(),
            'precision': precision,
            'recall': recall,
            'f1_score': f1
        }
        return metrics, y_test_pred

    # -------------------- Feature Importance --------------------
    def get_feature_importance(self):
        if self.model is None:
            raise ValueError("Model must be trained first")
        features = self.final_features if self.final_features is not None else self.feature_columns
        importances = self.model.feature_importances_
        min_length = min(len(features), len(importances))
        importance_df = pd.DataFrame({
            'feature': features[:min_length],
            'importance': importances[:min_length]
        }).sort_values('importance', ascending=False)
        return importance_df

    # -------------------- Predict --------------------
    def predict_risk(self, new_data):
        if isinstance(new_data, dict):
            new_data = pd.DataFrame([new_data])
        X_new = self.feature_engineering(new_data[self.feature_columns])
        X_scaled = self.scaler.transform(X_new)
        preds = self.model.predict(X_scaled)
        if hasattr(self.label_encoder, 'classes_'):
            preds = self.label_encoder.inverse_transform(preds)
        return preds

    # -------------------- Save/Load Model --------------------
    def save_model(self, filename='coastal_erosion_model.pkl'):
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'label_encoder': self.label_encoder,
            'feature_columns': self.feature_columns,
            'final_features': self.final_features
        }, filename)
        print(f"Model saved to {filename}")

    def load_model(self, filename='coastal_erosion_model.pkl'):
        data = joblib.load(filename)
        self.model = data['model']
        self.scaler = data['scaler']
        self.label_encoder = data['label_encoder']
        self.feature_columns = data['feature_columns']
        self.final_features = data.get('final_features', self.feature_columns)
        print(f"Model loaded from {filename}")

    # -------------------- Print Summary --------------------
    def print_summary(self):
        metrics, y_test_pred = self.evaluate_model()
        print("\n" + "="*50)
        print("COASTAL EROSION MODEL SUMMARY")
        print("="*50)
        print(f"Number of features: {len(self.feature_columns)}")
        print(f"Number of trees: {self.model.n_estimators}")
        print(f"Training samples: {len(self.X_train)}, Test samples: {len(self.X_test)}")
        print(f"Target classes: {np.unique(self.y_train)}")
        print("\nPerformance Metrics:")
        for k,v in metrics.items():
            print(f"{k.replace('_',' ').title()}: {v:.4f}")
        print("\nClassification Report:")
        print(classification_report(self.y_test, y_test_pred))
        print("\nTop 10 Feature Importances:")
        importance_df = self.get_feature_importance()
        for idx, row in importance_df.head(10).iterrows():
            print(f"{row['feature']}: {row['importance']:.4f}")


def main():
    predictor = CoastalErosionPredictor(random_state=42)
    try:
        predictor.load_data('coastalErosion_data.csv')
        predictor.explore_data()
        X, y = predictor.preprocess_data()
        predictor.train_model(X, y, tune_hyperparameters=False)
        predictor.print_summary()
        predictor.save_model('coastal_erosion_model.pkl')
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()
