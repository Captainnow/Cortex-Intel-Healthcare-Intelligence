"""
AHIP v2 - AI Healthcare Intelligence Platform
100% FREE - No paid APIs, no subscriptions
"""
from fastapi import FastAPI, HTTPException, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sqlite3
import pandas as pd
import json
from datetime import datetime
import joblib
import numpy as np
import os

# Load .env file manually
if os.path.exists("backend/.env"):
    with open("backend/.env") as f:
        for line in f:
            if "=" in line and not line.strip().startswith("#"):
                key, val = line.strip().split("=", 1)
                os.environ[key.strip()] = val.strip()

# Load ML models at startup
ml_models = {}
encoders = {}

def load_models():
    global ml_models, encoders
    try:
        # Resolve path relative to project root
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        ml_models['heart'] = joblib.load(os.path.join(base_dir, "ml", "models", "heart_disease_model.pkl"))
        ml_models['diabetes'] = joblib.load(os.path.join(base_dir, "ml", "models", "diabetes_model.pkl"))
        ml_models['stroke'] = joblib.load(os.path.join(base_dir, "ml", "models", "stroke_model.pkl"))
        ml_models['ckd'] = joblib.load(os.path.join(base_dir, "ml", "models", "ckd_model.pkl"))
        encoders = joblib.load(os.path.join(base_dir, "ml", "models", "encoders.pkl"))
        print("ML models loaded successfully.")
    except Exception as e:
        print(f"Warning: Could not load ML models: {e}")

import threading
try:
    from services.realtime_connector import RealTimeConnector
    from services.ai_agent import HealthcareAIAgent
except ModuleNotFoundError:
    from backend.services.realtime_connector import RealTimeConnector
    from backend.services.ai_agent import HealthcareAIAgent

ai_agent = HealthcareAIAgent("ahip_warehouse.db")

def sync_db_in_background():
    try:
        # DB path is relative to where we run uvicorn (root directory)
        connector = RealTimeConnector("ahip_warehouse.db")
        connector.update_database()
    except Exception as e:
        print(f"Background database sync failed: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_models()
    # Trigger background sync of live data
    threading.Thread(target=sync_db_in_background, daemon=True).start()
    yield

app = FastAPI(
    title="Cortex Intel - Healthcare Intelligence Platform",
    description="100% FREE - Real-time healthcare analytics using openFDA, WHO, World Bank, and open-source AI",
    version="2.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    conn = sqlite3.connect("ahip_warehouse.db")
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/")
async def root():
    return {
        "platform": "Cortex Intel - Healthcare Intelligence Platform",
        "version": "2.1.0",
        "cost": "100% FREE",
        "status": "operational",
        "data_sources": {
            "fda": "openFDA API (free, no key)",
            "who": "WHO GHO API (free, no key)",
            "patient": "UCI ML Repository + Kaggle (free)"
        },
        "ai_providers": {
            "llm": "Groq API Free Tier / Ollama Local / HuggingFace Free",
            "ml": "scikit-learn (open source)"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# === FDA DEVICE RECALLS ===
@app.get("/api/devices/recalls")
async def get_recalls(
    recall_class: str = Query(None),
    status: str = Query(None),
    limit: int = Query(100, le=1000)
):
    conn = get_db()
    query = "SELECT * FROM fact_device_recalls WHERE 1=1"
    params = []
    if recall_class:
        query += " AND recall_class = ?"
        params.append(recall_class)
    if status:
        query += " AND status = ?"
        params.append(status)
    query += f" LIMIT {limit}"

    df = pd.read_sql(query, conn, params=params)
    conn.close()
    return {"recalls": df.to_dict('records'), "count": len(df)}

@app.get("/api/devices/summary")
async def get_device_summary():
    conn = get_db()
    df = pd.read_sql("""
        SELECT 
            product_type,
            COUNT(*) as total_recalls,
            recall_class,
            COUNT(DISTINCT firm_name) as manufacturers_affected
        FROM fact_device_recalls
        GROUP BY product_type, recall_class
        ORDER BY total_recalls DESC
    """, conn)
    conn.close()
    return {"summary": df.to_dict('records')}

# === HEALTH INDICATORS (WHO + World Bank) ===
@app.get("/api/health/indicators")
async def get_health_indicators(
    country: str = Query(None),
    indicator: str = Query(None)
):
    conn = get_db()
    query = "SELECT * FROM fact_health_indicators WHERE 1=1"
    params = []
    if country:
        query += " AND country = ?"
        params.append(country)
    if indicator:
        query += " AND indicator_code = ?"
        params.append(indicator)

    df = pd.read_sql(query, conn, params=params)
    conn.close()
    return {"indicators": df.to_dict('records'), "count": len(df)}

@app.get("/api/health/countries")
async def get_country_comparison():
    conn = get_db()
    df = pd.read_sql("""
        SELECT country, indicator_name, AVG(CAST(value as REAL)) as avg_value
        FROM fact_health_indicators
        WHERE value IS NOT NULL
        GROUP BY country, indicator_name
        ORDER BY country
    """, conn)
    conn.close()
    return {"countries": df.to_dict('records')}

# === PATIENT RISK PREDICTION ===
@app.get("/api/patients/risk")
async def get_patient_risk(disease_type: str = Query(..., enum=["heart_disease", "diabetes", "stroke", "ckd"])):
    conn = get_db()
    df = pd.read_sql("""
        SELECT * FROM fact_patient_risk 
        WHERE disease_type = ?
        ORDER BY outcome DESC
        LIMIT 100
    """, conn, params=[disease_type])
    conn.close()
    return {"patients": df.to_dict('records'), "count": len(df)}

@app.post("/api/patients/predict")
async def predict_patient_risk(disease_type: str, features: dict):
    """Predict patient risk using ML models"""
    if disease_type not in ml_models:
        raise HTTPException(status_code=400, detail="Model not available")

    model = ml_models[disease_type]

    # Extract features based on disease type
    if disease_type == 'heart':
        X = [[features.get('age', 50), features.get('sex', 1), features.get('cp', 1),
              features.get('trestbps', 130), features.get('chol', 200), features.get('fbs', 0),
              features.get('restecg', 0), features.get('thalach', 150), features.get('exang', 0),
              features.get('oldpeak', 1.0), features.get('slope', 1), features.get('ca', 0), features.get('thal', 3)]]
    elif disease_type == 'diabetes':
        X = [[features.get('pregnancies', 0), features.get('glucose', 100), features.get('blood_pressure', 70),
              features.get('skin_thickness', 20), features.get('insulin', 80), features.get('bmi', 25),
              features.get('diabetes_pedigree', 0.5), features.get('age', 30)]]
    else:
        X = [[0, 50, 0, 0, 0, 0, 0, 100, 25, 0]]

    prediction = model.predict(X)[0]
    probability = model.predict_proba(X)[0]

    risk_level = "High" if probability[1] > 0.7 else "Medium" if probability[1] > 0.4 else "Low"

    return {
        "disease_type": disease_type,
        "prediction": int(prediction),
        "risk_probability": round(float(probability[1]), 3),
        "risk_level": risk_level,
        "confidence": round(float(max(probability)), 3),
        "model": "RandomForest (scikit-learn, open source)"
    }

# === AI ASSISTANT (FREE) ===
@app.post("/api/ai/ask")
async def ai_ask(
    question: str,
    api_key: str = Query(None),
    x_api_key: str = Header(None),
    provider: str = Query("gemini")
):
    """AI-powered natural language analytics (using dynamic database agent RAG)"""
    key = api_key or x_api_key
    try:
        result = ai_agent.run_query(question, api_key=key, provider=provider)
        return {
            "question": question,
            "insight": result.get("insight"),
            "data": result.get("data", []),
            "sql_query": result.get("sql_query")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ai/providers")
async def get_ai_providers():
    return {
        "providers": [
            {"name": "Groq API", "tier": "FREE", "cost": "$0.00", "url": "https://console.groq.com/", "limits": "20 req/min, 1M tokens/day"},
            {"name": "Ollama (Local)", "tier": "FREE", "cost": "$0.00", "url": "https://ollama.com/", "limits": "Unlimited (local)"},
            {"name": "HuggingFace", "tier": "FREE", "cost": "$0.00", "url": "https://huggingface.co/", "limits": "30K chars/month"}
        ],
        "recommendation": "Start with Groq API (free, no credit card). For privacy, use Ollama (runs offline)."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
