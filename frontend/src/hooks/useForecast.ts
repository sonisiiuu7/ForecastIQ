import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface ForecastRequest {
  problem_description: string;
  horizon: number;
  frequency: string;
  context_length: number;
}

export interface ForecastResponse {
  historical: { timestamps: string[]; values: number[] };
  forecast: { timestamps: string[]; mean: number[]; lower: number[]; upper: number[] };
  metadata: { source: string; identifier: string; horizon: number; frequency: string };
  metrics: Record<string, number | string>;
}

export interface Suggestion {
  label: string;
  query: string;
}

export interface ForecastError {
  message: string;
  suggestions?: Suggestion[];
}

interface UseForecastReturn {
  data: ForecastResponse | null;
  loading: boolean;
  error: ForecastError | null;
  fetchForecast: (request: ForecastRequest) => Promise<void>;
}

export const useForecast = (): UseForecastReturn => {
  const [data, setData]       = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<ForecastError | null>(null);

  const fetchForecast = useCallback(async (request: ForecastRequest) => {
    setLoading(true);
    setError(null);

    const toastId = toast.loading('Fetching data and generating forecast…', {
      description: `Processing: ${request.problem_description}`,
    });

    const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
    try {
      const response = await fetch(`${apiBase}/api/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // detail may be a string (500) or a structured object (422)
        if (typeof errorData.detail === 'object' && errorData.detail !== null) {
          throw { message: errorData.detail.message, suggestions: errorData.detail.suggestions };
        }
        throw { message: errorData.detail || 'Failed to fetch forecast' };
      }

      const result: ForecastResponse = await response.json();
      setData(result);
      toast.success('Forecast generated!', {
        id: toastId,
        description: `${result.metadata.horizon} ${result.metadata.frequency} steps · source: ${result.metadata.source}`,
      });
    } catch (err: any) {
      const forecastError: ForecastError = {
        message: err.message ?? 'An unknown error occurred',
        suggestions: err.suggestions,
      };
      setError(forecastError);
      toast.error('Could not generate forecast', {
        id: toastId,
        description: forecastError.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchForecast };
};
