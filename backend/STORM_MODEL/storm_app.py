# FASTAPI Storm Alert Prediction API

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import joblib

# Load the pre-trained storm alert model
model_data = joblib.load("storm_alert_model.pkl")
model = model_data["model"]
scaler = model_data["scaler"]
label_encoder = model_data["label_encoder"]
feature_columns = model_data["feature_columns"]

# Initialize FastAPI
app = FastAPI(title="Storm Alert Prediction API")

# Enable CORS (optional, for frontend access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace "*" with your frontend URL if needed
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input schema
class StormInput(BaseModel):
    water_level: float
    surge_height: float
    wave_height: float
    wave_period: float
    wave_direction: float
    tidal_level: float
    tidal_range: float
    current_speed: float
    current_direction: float
    wind_speed: float
    wind_direction: float
    wind_gusts: float
    atmospheric_pressure: float
    pressure_trend: float
    air_temperature: float
    sea_surface_temp: float
    flood_depth: float
    inundation_area: float
    drainage_rate: float

# Test endpoint
@app.get("/")
def read_root():
    return {"message": "Storm Alert Prediction API is running. Use POST /predict with input JSON."}

# Prediction endpoint
@app.post("/predict")
def predict(data: StormInput):
    # Convert input to numpy array in the same order as feature_columns
    input_dict = data.dict()
    X = np.array([[input_dict[feat] for feat in feature_columns]])
    
    # Scale input
    X_scaled = scaler.transform(X)
    
    # Make prediction
    pred_class = model.predict(X_scaled)[0]
    pred_proba = model.predict_proba(X_scaled)[0]
    
    # Convert class back to original label
    if hasattr(label_encoder, 'classes_'):
        pred_class_label = label_encoder.inverse_transform([pred_class])[0]
    else:
        pred_class_label = pred_class
    
    # Return prediction and class probabilities
    return {
        "predicted_risk_level": str(pred_class_label),
        "class_probabilities": {label_encoder.classes_[i]: float(prob) for i, prob in enumerate(pred_proba)}
    }
