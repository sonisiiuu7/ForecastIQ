"""
FastAPI backend for ChronoSight time series forecasting tool.
"""
import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import logging
from datetime import datetime, timedelta
import pandas as pd

from model_singleton import timesfm_singleton
from data_fetcher import data_fetcher, DataNotAvailableError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ChronoSight API", version="1.0.0")

# CORS origins — comma-separated list in CORS_ORIGINS env var, defaults to localhost dev server
_cors_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ForecastRequest(BaseModel):
    problem_description: str
    horizon: int
    frequency: str = "D"
    context_length: Optional[int] = 512


class ForecastResponse(BaseModel):
    historical: dict
    forecast: dict
    metadata: dict
    metrics: dict


@app.get("/")
async def root():
    return {"message": "ChronoSight API is running", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "model_loaded": timesfm_singleton._model is not None}


@app.post("/api/forecast", response_model=ForecastResponse)
async def create_forecast(request: ForecastRequest):
    """
    Generate a time series forecast based on natural language problem description.
    
    - **problem_description**: Natural language description (e.g., "Apple stock price", "monthly sales")
    - **horizon**: Number of future steps to forecast
    - **frequency**: Data frequency ('D', 'W', 'M', 'Q', 'Y')
    - **context_length**: Number of historical data points to use
    """
    try:
        logger.info(f"Received forecast request: {request.problem_description}")
        
        # Fetch historical data
        df = data_fetcher.fetch_data(
            query=request.problem_description,
            frequency=request.frequency,
            context_length=request.context_length
        )
        
        # Prepare data for model
        historical_values = df['value'].tolist()
        historical_timestamps = df.index.strftime('%Y-%m-%d').tolist()
        
        # Generate forecast
        forecast_result = timesfm_singleton.forecast(
            past_values=historical_values,
            horizon=request.horizon,
            frequency=request.frequency
        )
        
        # Generate forecast timestamps
        last_date = df.index[-1]
        freq_map = {
            'D': 'D', 'daily': 'D',
            'W': 'W', 'weekly': 'W',
            'M': 'M', 'monthly': 'M',
            'Q': 'Q', 'quarterly': 'Q',
            'Y': 'Y', 'yearly': 'Y', 'annual': 'Y',
            'H': 'H', 'hourly': 'H',
        }
        freq_code = freq_map.get(request.frequency.lower(), 'D')
        
        forecast_dates = pd.date_range(
            start=last_date + pd.Timedelta(days=1),
            periods=request.horizon,
            freq=freq_code
        )
        forecast_timestamps = forecast_dates.strftime('%Y-%m-%d').tolist()
        
        # Calculate metrics
        historical_mean = sum(historical_values) / len(historical_values)
        forecast_mean_val = sum(forecast_result['mean']) / len(forecast_result['mean'])
        
        metrics = {
            "historical_mean": round(historical_mean, 2),
            "forecast_mean": round(forecast_mean_val, 2),
            "trend_direction": "up" if forecast_mean_val > historical_mean else "down",
            "trend_percent": round(((forecast_mean_val - historical_mean) / historical_mean) * 100, 2) if historical_mean != 0 else 0,
            "confidence_width": round(
                sum(u - l for u, l in zip(forecast_result['upper'], forecast_result['lower'])) / len(forecast_result['mean']), 2
            )
        }
        
        # Build response with restructured format
        historical_data = {
            "timestamps": historical_timestamps,
            "values": historical_values
        }
        
        forecast_data = {
            "timestamps": forecast_timestamps,
            "mean": forecast_result['mean'],
            "lower": forecast_result['lower'],
            "upper": forecast_result['upper']
        }
        
        metadata = {
            "source": data_fetcher._last_source or "synthetic",
            "identifier": data_fetcher._last_identifier or request.problem_description,
            "horizon": request.horizon,
            "frequency": request.frequency
        }
        
        return ForecastResponse(
            historical=historical_data,
            forecast=forecast_data,
            metadata=metadata,
            metrics=metrics
        )
        
    except DataNotAvailableError as e:
        raise HTTPException(status_code=422, detail={
            "message": str(e),
            "suggestions": e.suggestions,
        })
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating forecast: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    # Pre-load model on startup
    logger.info("Pre-loading TimesFM model...")
    timesfm_singleton.load_model()
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host=host, port=port)
