# FASTAPI Cyclone Prediction API

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import joblib

# Load the pre-trained model
model_data = joblib.load("cyclone_formation_model.pkl")
model = model_data["model"]

# Initialize FastAPI
app = FastAPI(title="Cyclone Prediction API")

# Enable CORS (optional, for frontend access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace "*" with your frontend URL if needed
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input schema
class CycloneInput(BaseModel):
    central_pressure: float
    wind_speed: float
    wind_shear: float
    sea_surface_temp: float
    cloud_top_temp: float
    vorticity: float
    convective_activity: float
    humidity: float
    precipitation: float

# Test endpoint
@app.get("/")
def read_root():
    return {"message": "Cyclone Prediction API is running. Use POST /predict with input JSON."}

# Prediction endpoint
@app.post("/predict")
def predict(data: CycloneInput):
    # Convert input to numpy array
    X = np.array([[value for value in data.dict().values()]])
    # Make prediction
    prediction = model.predict(X)[0]
    return {"cyclone_formation_probability": round(float(prediction), 4)}
