import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_recall_fscore_support
import matplotlib
matplotlib.use('Agg')  # Use non-GUI backend to avoid Tkinter errors
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import warnings

warnings.filterwarnings('ignore')

class StormAlertPredictor:
    def __init__(self, random_state=42):
        self.random_state = random_state
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.feature_columns = [
            'water_level', 'surge_height', 'wave_height', 'wave_period', 
            'wave_direction', 'tidal_level', 'tidal_range', 'current_speed',
            'current_direction', 'wind_speed', 'wind_direction', 'wind_gusts',
            'atmospheric_pressure', 'pressure_trend', 'air_temperature', 
            'sea_surface_temp', 'flood_depth', 'inundation_area', 'drainage_rate'
        ]
    
    def load_data(self, file_path=None, data=None):
        try:
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
        except Exception as e:
            raise RuntimeError(f"Error loading data: {e}")
    
    def explore_data(self):
        print("\n=== DATA EXPLORATION ===")
        print(f"Dataset Info:")
        print(f"Shape: {self.data.shape}")
        print(f"Missing values:\n{self.data.isnull().sum()}")
        
        if 'risk_level' in self.data.columns:
            print(f"\nTarget variable distribution:")
            print(self.data['risk_level'].value_counts().sort_index())
            
            plt.figure(figsize=(12, 5))
            
            plt.subplot(1, 2, 1)
            self.data['risk_level'].value_counts().sort_index().plot(kind='bar')
            plt.title('Risk Level Distribution')
            plt.xlabel('Risk Level')
            plt.ylabel('Count')
            
            plt.subplot(1, 2, 2)
            numeric_cols = self.data.select_dtypes(include=[np.number]).columns
            sns.heatmap(self.data[numeric_cols].corr(), cmap='coolwarm', center=0, annot=False)
            plt.title('Feature Correlation Matrix')
            
            plt.tight_layout()
            plt.show()
            plt.close('all')  # Close plots to avoid Tkinter warnings
    
    def preprocess_data(self, data=None):
        if data is None:
            data = self.data
        
        available_features = [col for col in self.feature_columns if col in data.columns]
        missing_features = list(set(self.feature_columns) - set(available_features))
        if missing_features:
            print(f"Warning: Missing features {missing_features}. Using available features.")
        self.feature_columns = available_features
        
        X = data[self.feature_columns].copy()
        X = X.fillna(X.median())
        
        if 'risk_level' in data.columns:
            y = data['risk_level'].copy()
            if y.dtype == 'object':
                y = self.label_encoder.fit_transform(y)
        else:
            raise ValueError("Target column 'risk_level' not found in data")
        
        print(f"Features shape: {X.shape}, Target shape: {y.shape}")
        print(f"Target classes: {np.unique(y)}")
        return X, y
    
    def train_model(self, X, y, tune_hyperparameters=False):
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=self.random_state, stratify=y
        )
        
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        if tune_hyperparameters:
            param_grid = {
                'n_estimators': [100, 200, 300],
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
    
    def evaluate_model(self):
        y_train_pred = self.model.predict(self.X_train)
        y_test_pred = self.model.predict(self.X_test)
        
        train_accuracy = accuracy_score(self.y_train, y_train_pred)
        test_accuracy = accuracy_score(self.y_test, y_test_pred)
        cv_scores = cross_val_score(self.model, self.X_train, self.y_train, cv=5, scoring='accuracy')
        precision, recall, f1, _ = precision_recall_fscore_support(self.y_test, y_test_pred, average='weighted')
        
        metrics = {
            'train_accuracy': train_accuracy,
            'test_accuracy': test_accuracy,
            'cv_accuracy_mean': cv_scores.mean(),
            'cv_accuracy_std': cv_scores.std(),
            'precision': precision,
            'recall': recall,
            'f1_score': f1
        }
        return metrics, y_test_pred
    
    def get_feature_importance(self):
        if self.model is None:
            raise ValueError("Model must be trained first")
        importance_df = pd.DataFrame({
            'feature': self.feature_columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        return importance_df
    
    def plot_results(self, y_test_pred):
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        
        importance_df = self.get_feature_importance()
        axes[0, 0].barh(importance_df['feature'][:10], importance_df['importance'][:10])
        axes[0, 0].set_title('Top 10 Feature Importances')
        axes[0, 0].set_xlabel('Importance')
        
        cm = confusion_matrix(self.y_test, y_test_pred)
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=axes[0, 1])
        axes[0, 1].set_title('Confusion Matrix')
        axes[0, 1].set_xlabel('Predicted')
        axes[0, 1].set_ylabel('Actual')
        
        unique_classes = np.unique(np.concatenate([self.y_test, y_test_pred]))
        axes[1, 0].hist([self.y_test, y_test_pred], bins=len(unique_classes),
                        label=['Actual', 'Predicted'], alpha=0.7)
        axes[1, 0].set_title('Actual vs Predicted Distribution')
        axes[1, 0].set_xlabel('Risk Level')
        axes[1, 0].set_ylabel('Count')
        axes[1, 0].legend()
        
        cv_scores = cross_val_score(self.model, self.X_train, self.y_train, cv=5, scoring='accuracy')
        axes[1, 1].bar(range(1, 6), cv_scores)
        axes[1, 1].axhline(y=cv_scores.mean(), color='red', linestyle='--', label=f'Mean: {cv_scores.mean():.3f}')
        axes[1, 1].set_title('Cross-Validation Scores')
        axes[1, 1].set_xlabel('Fold')
        axes[1, 1].set_ylabel('Accuracy')
        axes[1, 1].legend()
        
        plt.tight_layout()
        plt.show()
        plt.close('all')  # Close plots to avoid Tkinter warnings
    
    def predict_storm_risk(self, new_data):
        if self.model is None:
            raise ValueError("Model must be trained first")
        
        available_features = [col for col in self.feature_columns if col in new_data.columns]
        if not available_features:
            raise ValueError("No matching features found in new data")
        
        X_new = new_data[available_features].copy().fillna(new_data[available_features].median())
        X_new_scaled = self.scaler.transform(X_new)
        predictions = self.model.predict(X_new_scaled)
        probabilities = self.model.predict_proba(X_new_scaled)
        
        if hasattr(self.label_encoder, 'classes_'):
            predictions = self.label_encoder.inverse_transform(predictions)
        return predictions, probabilities
    
    def save_model(self, filename='storm_alert_model.pkl'):
        if self.model is None:
            raise ValueError("Model must be trained first")
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'label_encoder': self.label_encoder,
            'feature_columns': self.feature_columns
        }, filename)
        print(f"Model saved to {filename}")
    
    def load_model(self, filename='storm_alert_model.pkl'):
        try:
            model_data = joblib.load(filename)
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.label_encoder = model_data['label_encoder']
            self.feature_columns = model_data['feature_columns']
            print(f"Model loaded from {filename}")
        except Exception as e:
            raise RuntimeError(f"Error loading model: {e}")
    
    def print_model_summary(self):
        if self.model is None:
            raise ValueError("Model must be trained first")
        metrics, y_test_pred = self.evaluate_model()
        print("\n" + "="*50)
        print("STORM ALERT MODEL SUMMARY")
        print("="*50)
        print(f"\nModel Type: Random Forest Classifier")
        print(f"Number of features: {len(self.feature_columns)}")
        print(f"Number of trees: {self.model.n_estimators}")
        print(f"\nDataset Information:")
        print(f"Training samples: {len(self.X_train)}")
        print(f"Test samples: {len(self.X_test)}")
        print(f"Number of classes: {len(np.unique(self.y_train))}")
        print(f"\nModel Performance Metrics:")
        for key, val in metrics.items():
            print(f"{key.replace('_', ' ').title()}: {val:.4f}")
        print(f"\nClassification Report:")
        print(classification_report(self.y_test, y_test_pred))
        print(f"\nTop 10 Most Important Features:")
        importance_df = self.get_feature_importance()
        for idx, row in importance_df.head(10).iterrows():
            print(f"{row['feature']}: {row['importance']:.4f}")

def main():
    predictor = StormAlertPredictor(random_state=42)
    try:
        data = predictor.load_data('storm_data.csv')
        predictor.explore_data()
        X, y = predictor.preprocess_data()
        predictor.train_model(X, y, tune_hyperparameters=False)
        predictor.print_model_summary()
        y_test_pred = predictor.evaluate_model()[1]
        predictor.plot_results(y_test_pred)
        predictor.save_model('storm_alert_model.pkl')
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
