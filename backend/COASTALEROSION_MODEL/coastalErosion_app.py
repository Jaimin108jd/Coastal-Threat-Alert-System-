# FASTAPI Coastal Erosion Prediction API

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np
import pandas as pd
import joblib

# Load the pre-trained model
model_data = joblib.load("coastal_erosion_model.pkl")
model = model_data["model"]
scaler = model_data["scaler"]
label_encoder = model_data["label_encoder"]
feature_columns = model_data["feature_columns"]
final_features = model_data.get("final_features", feature_columns)

# Initialize FastAPI
app = FastAPI(title="Coastal Erosion Prediction API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input schema
class CoastalErosionInput(BaseModel):
    shoreline_position: float
    beach_width: float
    beach_volume: float
    dune_height: float
    dune_width: float
    cliff_retreat_rate: float
    wave_height: float
    wave_period: float
    wave_energy: float
    tidal_range: float
    storm_surge_frequency: float
    wind_speed: float
    wind_direction: float
    sea_level_rise: float
    relative_sea_level_change: float

# For batch predictions
class CoastalErosionBatchInput(BaseModel):
    records: List[CoastalErosionInput]

@app.get("/")
def read_root():
    return {"message": "Coastal Erosion Prediction API is running. Use POST /predict or /predict_batch."}

@app.post("/predict")
def predict(data: CoastalErosionInput):
    return _predict_single(data)

@app.post("/predict_batch")
def predict_batch(data: CoastalErosionBatchInput):
    results = []
    for record in data.records:
        result = _predict_single(record)
        results.append(result)
    return {"predictions": results}

# Internal function to handle single prediction
def _predict_single(data: CoastalErosionInput):
    input_dict = data.dict()
    df_input = pd.DataFrame([input_dict])

    # Feature engineering
    if 'wave_height' in df_input.columns and 'wave_period' in df_input.columns:
        df_input['wave_steepness'] = df_input['wave_height'] / (df_input['wave_period'] + 1e-6)
    if 'beach_width' in df_input.columns and 'beach_volume' in df_input.columns:
        df_input['beach_stability_ratio'] = df_input['beach_volume'] / (df_input['beach_width'] + 1e-6)

    # Ensure all final features exist in input
    missing_features = [f for f in final_features if f not in df_input.columns]
    for f in missing_features:
        df_input[f] = 0.0  # Fill missing engineered features with 0

    X = df_input[final_features].values
    X_scaled = scaler.transform(X)

    prediction = model.predict(X_scaled)
    if hasattr(label_encoder, 'classes_'):
        prediction = label_encoder.inverse_transform(prediction)

    return {"risk_assessment_prediction": prediction[0]}
