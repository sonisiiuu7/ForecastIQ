# ForecastIQ

### AI-Powered Time Series Forecasting Platform

ForecastIQ is a full-stack forecasting application that leverages Google's TimesFM foundation model to generate forecasts from historical time-series data.

The platform combines a FastAPI backend, a React + TypeScript frontend, and a transformer-based forecasting engine to provide interactive predictions, confidence intervals, and trend analysis across multiple financial and economic datasets.

Users can enter natural-language queries such as:

* Apple stock price
* Bitcoin price
* S&P 500 index
* Airline passenger demand
* Atmospheric CO₂ levels

The system automatically retrieves historical data, generates forecasts using TimesFM, and visualizes results through interactive charts and analytics.

---

## Features

* Natural language forecasting interface
* Google TimesFM-based zero-shot forecasting
* Interactive forecasting charts with confidence intervals
* Historical vs forecast trend comparison
* Live financial market data integration
* Economic and macroeconomic dataset support
* FastAPI REST API backend
* React + TypeScript frontend
* Responsive dashboard design
* Real-time error handling and dataset suggestions

---

## Demo Queries

Try the following examples:

* Apple stock price
* Bitcoin price
* Tesla stock price
* S&P 500
* Airline passenger demand
* CO₂ levels

---

## Architecture

```text
┌─────────────────────────────────────┐
│             Frontend                │
│      React + TypeScript + Vite      │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│            FastAPI Backend          │
│                                     │
│  • Query Processing                 │
│  • Data Retrieval                   │
│  • Forecast Generation              │
│  • Metrics Calculation              │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│       Google TimesFM Model          │
│     Transformer Forecast Engine     │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│      Financial & Economic Data      │
│  Yahoo Finance + Curated Datasets   │
└─────────────────────────────────────┘
```

---

## Tech Stack

| Layer                | Technology              |
| -------------------- | ----------------------- |
| Frontend             | React 19                |
| Language             | TypeScript              |
| Build Tool           | Vite                    |
| Backend              | FastAPI                 |
| API Server           | Uvicorn                 |
| Forecasting Model    | Google TimesFM-2.5-200M |
| Market Data          | yfinance                |
| Data Analysis        | NumPy, Pandas           |
| Statistical Datasets | statsmodels             |
| Visualization        | Recharts                |
| Styling              | Tailwind CSS            |

---

## Project Structure

```text
ForecastIQ/
│
├── backend/
│   ├── main.py
│   ├── data_fetcher.py
│   ├── model_singleton.py
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── components/
    │   └── hooks/
    │
    ├── package.json
    ├── vite.config.ts
    └── index.html
```

---

## Getting Started

### Prerequisites

* Python 3.10+
* Node.js 18+
* 2 GB available storage
* Internet connection for first model download

---

### Clone Repository

```bash
git clone https://github.com/sonisiiuu7/ForecastIQ.git
cd ForecastIQ
```

---

### Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt

copy .env.example .env

python main.py
```

Backend runs on:

```text
http://localhost:8000
```

On first startup, TimesFM model weights will be downloaded and cached locally.

---

### Frontend Setup

Open a second terminal:

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## Supported Data Sources

### Financial Assets

* Apple (AAPL)
* Microsoft (MSFT)
* Tesla (TSLA)
* NVIDIA (NVDA)
* Amazon (AMZN)
* Meta (META)
* Bitcoin (BTC-USD)
* Ethereum (ETH-USD)
* S&P 500
* NASDAQ
* Dow Jones

### Economic Datasets

* Atmospheric CO₂ Levels
* Airline Passenger Demand
* Sunspot Activity
* US Macroeconomic Indicators
* Real GDP Data

---

## API Reference

### POST /api/forecast

Generate forecasts from natural-language queries.

Example request:

```json
{
  "problem_description": "Apple stock price",
  "horizon": 30,
  "frequency": "D",
  "context_length": 365
}
```

Example response:

```json
{
  "historical": {},
  "forecast": {},
  "metadata": {},
  "metrics": {}
}
```

---

### GET /health

Returns application health status.

```json
{
  "status": "healthy",
  "model_loaded": true
}
```

---

## Future Improvements

* Forecast history tracking
* Export forecasts to CSV
* Multi-asset comparison dashboard
* User authentication
* Cloud deployment automation
* Additional forecasting models

---

## Disclaimer

Forecasts generated by ForecastIQ are intended for educational and research purposes only.

The application does not provide financial advice, investment recommendations, or guarantees regarding future performance. Historical trends do not guarantee future outcomes.

---

## License

Licensed under the MIT License.
