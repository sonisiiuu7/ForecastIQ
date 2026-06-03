<p align="center">
  <strong>Built autonomously by <a href="https://heyneo.so/">NEO — Your Autonomous AI Engineering Agent</a></strong>
</p>

---

<div align="center">

# ChronoSight

### AI-Powered Time Series Forecasting

*Predict any time series from plain English — powered by Google TimesFM*

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## What is ChronoSight?

ChronoSight is a full-stack AI forecasting application that lets anyone predict any time series from plain English — no data science knowledge required.

Type something like _"Apple stock closing price"_ or _"Airline passenger demand"_, choose how far ahead to forecast and at what frequency, and within seconds you get a publication-quality interactive chart complete with confidence bands, trend metrics, and source metadata.

Under the hood it runs **Google TimesFM-2.5-200M**, a 200-million-parameter transformer pre-trained by Google Research on a massive corpus of real-world time series. Because the model is **zero-shot**, it never needs fine-tuning — it generalises across domains out of the box, from equities and commodities to atmospheric science and macroeconomics.

ChronoSight is built to be **honest**: it only ever forecasts from real, live data. If no data source matches your query, instead of making something up it tells you exactly what is available and lets you pick with one click.

---

## Features

- **Natural language query routing** — free-text descriptions are automatically mapped to the right data source (stock ticker, crypto pair, index, commodity, FX rate, or economic dataset)
- **Live market data** — up-to-date price history from Yahoo Finance for hundreds of tickers, with frequency-appropriate lookback windows (e.g. 30 years for yearly, 3 months for hourly)
- **Curated economic datasets** — CO₂ levels, international airline passengers, sunspot activity, and US macroeconomic/Real GDP series
- **Zero-shot AI forecasting** — normalised historical context is passed to TimesFM-2.5-200M; mean forecast + 10th/90th percentile confidence bounds are returned and denormalised back to the original scale
- **Interactive visualisation** — composed area chart with gradient fills, a dashed forecast-start reference line, and a rich custom tooltip
- **Metrics panel** — historical mean, forecast mean, trend direction + percentage change, and confidence interval width
- **Graceful no-data errors** — structured error responses with a full list of available datasets shown as clickable suggestion chips
- **Persistent disclaimer** — non-intrusive amber banner reminding users that AI forecasts should not be used for financial decisions

---

## Demo

> Start the backend and frontend (see [Getting Started](#getting-started)), then open `http://localhost:5173`.

**Example queries to try:**
- `Apple stock price` → live AAPL daily close from Yahoo Finance
- `Bitcoin price` → live BTC-USD daily close
- `Airline passenger demand` → classic Box-Jenkins AirPassengers dataset
- `CO2 levels` → Mauna Loa atmospheric CO₂ monthly readings
- `S&P 500` → ^GSPC index daily close

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  React + TypeScript + Vite  (:5173)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ ProblemInput │  │ForecastChart │  │  MetricsPanel    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│           │               ▲                  ▲              │
│           │ POST /api/forecast               │              │
└───────────┼───────────────┼──────────────────┼─────────────┘
            │               │                  │
┌───────────▼───────────────┴──────────────────┴─────────────┐
│                   FastAPI Backend  (:8000)                   │
│  ┌─────────────────┐     ┌──────────────────────────────┐   │
│  │  data_fetcher   │     │      model_singleton         │   │
│  │                 │     │                              │   │
│  │  ┌───────────┐  │     │  TimesFM-2.5-200M            │   │
│  │  │ yfinance  │  │     │  (HuggingFace transformers)  │   │
│  │  └───────────┘  │     │                              │   │
│  │  ┌───────────┐  │     │  • Normalise input           │   │
│  │  │statsmodels│  │     │  • Pad to 32-multiple        │   │
│  │  └───────────┘  │     │  • Run inference             │   │
│  └─────────────────┘     │  • Return mean + quantiles   │   │
│                           └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| AI Model | Google TimesFM-2.5-200M | Zero-shot time series forecasting |
| Backend framework | FastAPI + Uvicorn | REST API, request validation, async serving |
| Market data | yfinance | Live OHLC data for stocks, crypto, FX, commodities |
| Economic data | statsmodels | Curated R datasets (CO₂, AirPassengers, sunspots, GDP) |
| Frontend framework | React 19 + TypeScript | Component-based UI with full type safety |
| Build tool | Vite 7 | HMR dev server + optimised production builds |
| Charts | Recharts | Composable SVG charts with custom tooltips |
| Styling | Tailwind CSS v4 + inline styles | Dark theme, responsive layout |
| Notifications | Sonner | Toast notifications for loading/success/error states |
| Icons | Lucide React | Consistent icon set |

---

## Project Structure

```
tsPredictor/
│
├── backend/                        # Python / FastAPI
│   ├── main.py                     # App entrypoint, /api/forecast route
│   ├── data_fetcher.py             # NLP query → data source routing
│   ├── model_singleton.py          # TimesFM singleton, normalisation, inference
│   ├── requirements.txt            # Python dependencies
│   └── .env.example                # Environment variable template
│
└── frontend/                       # React / TypeScript / Vite
    ├── src/
    │   ├── App.tsx                  # Root layout, hero, error handling
    │   ├── components/
    │   │   ├── ForecastChart.tsx    # Recharts area chart + tooltip
    │   │   ├── MetricsPanel.tsx     # KPI cards + source info
    │   │   └── ProblemInput.tsx     # Query form (description, horizon, frequency)
    │   └── hooks/
    │       └── useForecast.ts       # API call, loading/error state, toast triggers
    ├── vite.config.ts               # Dev proxy → backend :8000
    └── package.json
```

---

## Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Python | 3.10 or newer |
| Node.js | 18 or newer |
| Disk space | ~2 GB for model weights (downloaded once, cached automatically) |
| RAM | 4 GB minimum recommended (8 GB+ for smooth inference) |

---

### 1. Clone the repository

```bash
git clone https://github.com/dakshjain-1616/AI-Powered-Time-Series-Forecasting
cd chronosight
```

---

### 2. Backend setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# (Optional) configure environment
cp .env.example .env              # edit HOST, PORT, HF_HOME as needed

# Start the API server
python main.py
```

The server starts at `http://localhost:8000`. On **first launch**, the TimesFM model weights (~800 MB) are downloaded from HuggingFace Hub and cached in `~/.cache/huggingface/`. Every subsequent start is instant.

> **GPU support:** The model automatically uses CUDA if a compatible GPU is detected. Set `FORCE_CPU=true` in `.env` to override.

---

### 3. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The app is available at `http://localhost:5173`. Vite proxies all `/api/*` requests to the backend at `:8000` — no manual CORS setup needed.

---

### 4. Production build

```bash
cd frontend
npm run build         # outputs to frontend/dist/
```

Serve the `dist/` folder with any static host (Nginx, Vercel, Netlify, Cloudflare Pages, etc.) and configure your reverse proxy to forward `/api/*` to the FastAPI server.

---

## Available Data Sources

ChronoSight never generates synthetic data. Every forecast is grounded in real historical data from one of the sources below.

### Financial data — via yfinance

| Category | Examples |
|---|---|
| US large-cap stocks | AAPL, MSFT, GOOGL, AMZN, TSLA, META, NVDA, NFLX, AMD, INTC |
| Market indices | S&P 500 (^GSPC), NASDAQ (^IXIC), Dow Jones (^DJI) |
| Cryptocurrency | Bitcoin (BTC-USD), Ethereum (ETH-USD) |
| Commodities | Gold futures (GC=F), Crude oil WTI (CL=F) |
| FX pairs | EUR/USD, GBP/USD |
| Other equities | Shopify, Uber, Airbnb, Palantir, Berkshire Hathaway, JPMorgan, Visa, Mastercard |

Lookback period is automatically set per frequency:

| Frequency | Lookback |
|---|---|
| Daily | 2 years |
| Weekly | 5 years |
| Monthly | 15 years |
| Quarterly | 20 years |
| Yearly | 30 years |

### Economic datasets — via statsmodels

| Dataset | Description | Period | Frequency |
|---|---|---|---|
| `co2` | Mauna Loa atmospheric CO₂ concentration | 1959–present | Monthly |
| `AirPassengers` | International airline passengers (Box & Jenkins) | 1949–1960 | Monthly |
| `sunspot.month` | Monthly sunspot numbers | 1749–present | Monthly |
| `macrodata` | US macroeconomic indicators incl. Real GDP | 1959–present | Quarterly |

---

## API Reference

### `POST /api/forecast`

Generate a forecast from a natural language description.

**Request body:**

```json
{
  "problem_description": "Apple stock price",
  "horizon": 30,
  "frequency": "D",
  "context_length": 365
}
```

| Field | Type | Description |
|---|---|---|
| `problem_description` | `string` | Plain English description of what to forecast |
| `horizon` | `integer` | Number of future steps to predict |
| `frequency` | `string` | `D` daily · `W` weekly · `M` monthly · `Q` quarterly · `Y` yearly |
| `context_length` | `integer` | Max historical points to pass as context (default 512) |

**Success response `200`:**

```json
{
  "historical": {
    "timestamps": ["2023-01-03", "2023-01-04", "..."],
    "values":     [125.07, 126.36, "..."]
  },
  "forecast": {
    "timestamps": ["2025-01-02", "2025-01-03", "..."],
    "mean":       [195.4, 196.1, "..."],
    "lower":      [188.2, 189.0, "..."],
    "upper":      [202.6, 203.2, "..."]
  },
  "metadata": {
    "source":     "financial",
    "identifier": "AAPL",
    "horizon":    30,
    "frequency":  "D"
  },
  "metrics": {
    "historical_mean":  182.50,
    "forecast_mean":    196.80,
    "trend_direction":  "up",
    "trend_percent":    7.84,
    "confidence_width": 14.20
  }
}
```

**Error response `422` — no data available:**

```json
{
  "detail": {
    "message": "No real data source found for \"weekly weather\". Try one of the suggestions below.",
    "suggestions": [
      { "label": "Apple stock (AAPL)", "query": "Apple stock price" },
      { "label": "Bitcoin (BTC)",      "query": "Bitcoin price" }
    ]
  }
}
```

---

### `GET /health`

```json
{ "status": "healthy", "model_loaded": true }
```

---

## Important Disclaimer

> Forecasts produced by ChronoSight are generated by an AI model and are provided for **informational and educational purposes only**. They are not financial advice. Past data does not guarantee future results. Do not make investment, trading, or financial decisions based on these outputs.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  <strong>This project was built autonomously by <a href="https://heyneo.so/">NEO — Your Autonomous AI Engineering Agent</a></strong>
</p>
