# pollution_app.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import pickle
from environmental_model import EnvironmentalRiskPredictor

# Load trained model
with open("environmental_risk_model.pkl", "rb") as f:
    model = pickle.load(f)

# FastAPI setup
app = FastAPI(title="Environmental Risk Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input schema
class EnvironmentalInput(BaseModel):
    pH: float
    dissolved_oxygen: float
    biochemical_oxygen_demand: float
    chemical_oxygen_demand: float
    nitrates: float
    phosphates: float
    toxicity_level: str
    turbidity: float
    temperature: float
    salinity: float
    bacterial_count: float
    algal_bloom_risk: float
    coral_bleaching_index: float
    fish_mortality_rate: float
    industrial_waste_indicator: float
    agricultural_runoff_index: float
    domestic_sewage_index: float

# Test endpoint
@app.get("/")
def read_root():
    return {"message": "Environmental Risk Prediction API is running. Use POST /predict with input JSON."}

# Prediction endpoint
@app.post("/predict")
def predict(data: EnvironmentalInput):
    input_df = pd.DataFrame([data.dict()])
    prediction = model.predict(input_df)[0]
    return {"predicted_risk_level": prediction}
