"""
Data fetcher for ChronoSight backend.
Routes natural language queries to real data sources only:
- Financial tickers via yfinance
- Economic indicators via statsmodels
No synthetic data — if data isn't available, returns helpful suggestions.
"""
import yfinance as yf
import pandas as pd
from statsmodels.datasets import get_rdataset
import logging
from typing import Optional, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Curated list of topics with real data available, shown to users on failed queries
AVAILABLE_TOPICS = [
    {"label": "Apple stock (AAPL)",        "query": "Apple stock price"},
    {"label": "Microsoft (MSFT)",          "query": "Microsoft stock price"},
    {"label": "NVIDIA (NVDA)",             "query": "NVIDIA stock price"},
    {"label": "Tesla (TSLA)",              "query": "Tesla stock price"},
    {"label": "Amazon (AMZN)",             "query": "Amazon stock price"},
    {"label": "Google (GOOGL)",            "query": "Google stock price"},
    {"label": "Meta (META)",               "query": "Meta stock price"},
    {"label": "S&P 500 index",             "query": "S&P 500"},
    {"label": "NASDAQ index",              "query": "NASDAQ"},
    {"label": "Bitcoin (BTC)",             "query": "Bitcoin price"},
    {"label": "Ethereum (ETH)",            "query": "Ethereum price"},
    {"label": "Gold futures",              "query": "Gold futures price"},
    {"label": "Crude oil (WTI)",           "query": "Oil prices"},
    {"label": "EUR/USD exchange rate",     "query": "EURUSD"},
    {"label": "Airline passengers",        "query": "Airline passenger demand"},
    {"label": "Atmospheric CO₂",           "query": "CO2 levels"},
    {"label": "Sunspot activity",          "query": "Sunspot activity"},
    {"label": "US macroeconomic data",     "query": "Macroeconomic indicators"},
]


class DataNotAvailableError(Exception):
    """Raised when no real data can be found for the query."""
    def __init__(self, message: str, suggestions: list = None):
        super().__init__(message)
        self.suggestions = suggestions or AVAILABLE_TOPICS


class DataFetcher:

    FINANCIAL_KEYWORDS = {
        'apple': 'AAPL', 'microsoft': 'MSFT', 'google': 'GOOGL', 'alphabet': 'GOOGL',
        'amazon': 'AMZN', 'tesla': 'TSLA', 'meta': 'META', 'facebook': 'META',
        'netflix': 'NFLX', 'nvidia': 'NVDA', 'amd': 'AMD', 'intel': 'INTC',
        'sp500': '^GSPC', 's&p': '^GSPC', 'nasdaq': '^IXIC', 'dow': '^DJI',
        'bitcoin': 'BTC-USD', 'ethereum': 'ETH-USD', 'gold': 'GC=F', 'oil': 'CL=F',
        'crude': 'CL=F', 'eurusd': 'EURUSD=X', 'gbpusd': 'GBPUSD=X',
        'shopify': 'SHOP', 'uber': 'UBER', 'airbnb': 'ABNB', 'palantir': 'PLTR',
        'berkshire': 'BRK-B', 'jpmorgan': 'JPM', 'visa': 'V', 'mastercard': 'MA',
    }

    ECONOMIC_KEYWORDS = {
        'co2': 'co2',
        'airline': 'AirPassengers', 'passenger': 'AirPassengers', 'airpassenger': 'AirPassengers',
        'sunspot': 'sunspots',
        'macroeconomic': 'macrodata', 'macro': 'macrodata',
    }

    NOT_TICKERS = {
        'THE', 'AND', 'FOR', 'WITH', 'FROM', 'INTO', 'OVER', 'AFTER', 'ABOUT',
        'STOCK', 'PRICE', 'DATA', 'SALES', 'DAILY', 'TREND', 'RATE', 'YEAR',
        'MONTH', 'WEEK', 'TIME', 'HIGH', 'CLOSE', 'OPEN', 'TRADE', 'MARKET',
        'VALUE', 'INDEX', 'LEVEL', 'FLOW', 'REAL', 'NEXT', 'LAST', 'SOME',
        'PREDICT', 'FORECAST', 'DEMAND', 'SUPPLY', 'COST', 'LOSS', 'GAIN',
        'SHOW', 'GET', 'GIVE', 'MAKE', 'TAKE', 'FIND', 'LOOK', 'HELP', 'WANT',
        'USING', 'BASED', 'GIVEN', 'TOTAL', 'MEAN', 'WHAT', 'WHEN', 'WHERE',
        'MONTHLY', 'WEEKLY', 'YEARLY', 'QUARTERLY', 'HOURLY', 'FUTURE', 'PAST',
        'SALES', 'REVENUE', 'TRAFFIC', 'USERS', 'ORDERS', 'PRODUCTION',
    }

    FREQ_PERIOD = {
        'D': '2y', 'B': '2y', 'H': '3mo',
        'W': '5y', 'M': '15y', 'Q': '20y', 'Y': '30y',
    }

    FREQ_ALIASES = {
        'D': 'D', 'B': 'B', 'W': 'W', 'M': 'ME', 'Q': 'QE', 'Y': 'YE', 'H': 'h',
    }

    MIN_POINTS = 32

    def __init__(self):
        self._last_source = None
        self._last_identifier = None

    def parse_query(self, query: str) -> Tuple[str, Optional[str]]:
        query_lower = query.lower()

        # 1. Known financial names
        for keyword, ticker in self.FINANCIAL_KEYWORDS.items():
            if keyword in query_lower:
                self._last_source = 'financial'
                self._last_identifier = ticker
                return ('financial', ticker)

        # 2. Economic datasets
        for keyword, dataset in self.ECONOMIC_KEYWORDS.items():
            if keyword in query_lower:
                self._last_source = 'economic'
                self._last_identifier = dataset
                return ('economic', dataset)

        # 3. Short uppercase word that looks like a stock ticker
        for word in query.split():
            clean = ''.join(c for c in word if c.isalpha()).upper()
            if 1 <= len(clean) <= 5 and clean not in self.NOT_TICKERS and clean == word.upper():
                self._last_source = 'financial'
                self._last_identifier = clean
                return ('financial', clean)

        # 4. Nothing matched — no real data available
        return ('unknown', None)

    def fetch_financial_data(self, ticker: str, frequency: str = 'D') -> pd.DataFrame:
        period = self.FREQ_PERIOD.get(frequency.upper(), '2y')
        logger.info(f"Fetching financial data: {ticker} ({period})")
        stock = yf.Ticker(ticker)
        df = stock.history(period=period)
        if df.empty:
            raise DataNotAvailableError(
                f"No market data found for '{ticker}'. It may be delisted or the symbol is incorrect."
            )
        df = df[['Close']].copy()
        df.columns = ['value']
        df.index = pd.to_datetime(df.index).tz_convert(None)
        return df

    def fetch_economic_data(self, dataset_name: str) -> pd.DataFrame:
        logger.info(f"Fetching economic dataset: {dataset_name}")
        try:
            if dataset_name == 'co2':
                data = get_rdataset('co2', 'datasets')
                df = data.data.copy()
                df.index = pd.date_range(start='1959-01-01', periods=len(df), freq='ME')
                df = df[['value']] if 'value' in df.columns else df.iloc[:, :1].rename(columns={df.columns[0]: 'value'})
            elif dataset_name == 'AirPassengers':
                data = get_rdataset('AirPassengers', 'datasets')
                df = data.data.copy()
                df.index = pd.date_range(start='1949-01-01', periods=len(df), freq='ME')
                df.columns = ['value']
            elif dataset_name == 'sunspots':
                data = get_rdataset('sunspot.month', 'datasets')
                df = data.data.copy()
                df.index = pd.date_range(start='1749-01-01', periods=len(df), freq='ME')
                df = df.iloc[:, :1].rename(columns={df.columns[0]: 'value'})
            elif dataset_name == 'macrodata':
                data = get_rdataset('macrodata', 'datasets')
                df = data.data.copy()
                df.index = pd.date_range(start='1959-01-01', periods=len(df), freq='QE')
                df = df[['realgdp']].rename(columns={'realgdp': 'value'})
            else:
                raise DataNotAvailableError(f"Unknown economic dataset: {dataset_name}")
        except DataNotAvailableError:
            raise
        except Exception as e:
            raise DataNotAvailableError(
                f"Could not load economic dataset '{dataset_name}': {e}"
            )
        return df

    def fetch_data(self, query: str, frequency: str = 'D',
                   context_length: Optional[int] = None) -> pd.DataFrame:
        source_type, identifier = self.parse_query(query)

        if source_type == 'unknown':
            raise DataNotAvailableError(
                f"No real data source found for \"{query}\". "
                "We only forecast from live market data and curated economic datasets. "
                "Try one of the suggestions below."
            )

        if source_type == 'financial':
            try:
                df = self.fetch_financial_data(identifier, frequency=frequency)
            except DataNotAvailableError:
                raise
            except Exception as e:
                raise DataNotAvailableError(
                    f"Could not fetch market data for '{identifier}': {e}"
                )
        else:  # economic
            df = self.fetch_economic_data(identifier)

        freq_code = self.FREQ_ALIASES.get(frequency.upper(), 'D')
        try:
            df = df.resample(freq_code).mean().dropna()
        except Exception:
            pass

        if len(df) < self.MIN_POINTS:
            raise DataNotAvailableError(
                f"Only {len(df)} data points available for this query at {frequency} frequency — "
                f"not enough for a reliable forecast (need {self.MIN_POINTS}). "
                "Try a finer frequency (e.g. Daily or Weekly) or a different topic."
            )

        if context_length and len(df) > context_length:
            df = df.tail(context_length)

        logger.info(f"Fetched {len(df)} real data points from {source_type} ({identifier})")
        return df


data_fetcher = DataFetcher()
