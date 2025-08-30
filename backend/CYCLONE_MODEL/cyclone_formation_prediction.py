import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import warnings
warnings.filterwarnings('ignore')

class CycloneFormationPredictor:
    def __init__(self, random_state=42):
        self.random_state = random_state
        self.model = None
        self.scaler = StandardScaler()
        self.feature_columns = [
            'central_pressure', 'wind_speed', 'wind_shear', 'sea_surface_temp',
            'cloud_top_temp', 'vorticity', 'convective_activity', 'humidity', 'precipitation'
        ]

    def load_data(self, file_path):
        try:
            data = pd.read_csv(file_path)
            print(f"Data loaded from {file_path}")
            return data
        except Exception as e:
            raise RuntimeError(f"Error loading data: {e}")

    def preprocess_data(self, data):
        X = data[self.feature_columns].copy()
        y = data['cyclone_formation_probability'].copy()
        X = X.fillna(X.mean())
        return X, y

    def train_model(self, X, y):
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=self.random_state, stratify=pd.cut(y, bins=5)
        )
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=self.random_state,
            n_jobs=-1
        )
        self.model.fit(X_train, y_train)
        self.X_train, self.X_test = X_train, X_test
        self.y_train, self.y_test = y_train, y_test
        print("Model training completed!")

    def evaluate_model(self):
        y_train_pred = self.model.predict(self.X_train)
        y_test_pred = self.model.predict(self.X_test)
        metrics = {
            'train_mse': mean_squared_error(self.y_train, y_train_pred),
            'test_mse': mean_squared_error(self.y_test, y_test_pred),
            'train_mae': mean_absolute_error(self.y_train, y_train_pred),
            'test_mae': mean_absolute_error(self.y_test, y_test_pred),
            'train_r2': r2_score(self.y_train, y_train_pred),
            'test_r2': r2_score(self.y_test, y_test_pred),
            'cv_r2_mean': cross_val_score(self.model, self.X_train, self.y_train, cv=5, scoring='r2').mean()
        }
        return metrics

    def get_feature_importance(self):
        importance_df = pd.DataFrame({
            'feature': self.feature_columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        return importance_df

    def save_model(self, filename='cyclone_formation_model.pkl'):
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'feature_columns': self.feature_columns
        }, filename)
        print(f"Model saved to {filename}")

    def print_model_summary(self):
        metrics = self.evaluate_model()
        print("\nModel Performance:")
        for key, val in metrics.items():
            print(f"{key}: {val:.4f}")
        print("\nTop Feature Importances:")
        print(self.get_feature_importance().head())

def main():
    predictor = CycloneFormationPredictor(random_state=42)
    data = predictor.load_data('cyclone_data.csv')
    X, y = predictor.preprocess_data(data)
    predictor.train_model(X, y)
    predictor.print_model_summary()
    predictor.save_model('cyclone_formation_model.pkl')

if __name__ == "__main__":
    main()
