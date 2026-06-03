import React from 'react';
import {
  ComposedChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

interface ForecastChartProps {
  historical: { timestamps: string[]; values: number[] };
  forecast:   { timestamps: string[]; mean: number[]; lower: number[]; upper: number[] };
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length || !label) return null;

  const fmtDate = (ts: string) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const fmtNum  = (v: number) => v == null ? '—' : v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const META: Record<string, { name: string; color: string }> = {
    historical: { name: 'Historical', color: '#94a3b8' },
    forecast:   { name: 'Forecast',   color: '#818cf8' },
    upper:      { name: 'Upper',      color: '#6366f1' },
  };

  const items = payload.filter((p: any) => p.value != null && p.dataKey !== 'lower');

  return (
    <div style={{ background: '#0c0c1e', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 14, padding: '14px 18px', minWidth: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(99,102,241,0.1)' }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: '0 0 12px', paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {fmtDate(label)}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((entry: any, i: number) => {
          const meta = META[entry.dataKey];
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta?.color ?? '#818cf8', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#64748b' }}>{meta?.name ?? entry.dataKey}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', fontFamily: "'JetBrains Mono','Fira Code',monospace" }}>{fmtNum(entry.value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ForecastChart: React.FC<ForecastChartProps> = ({ historical, forecast }) => {
  const chartData = [
    ...historical.timestamps.map((ts, i) => ({
      timestamp: ts,
      historical: historical.values[i],
      forecast: null as number | null,
      lower: null as number | null,
      upper: null as number | null,
    })),
    ...forecast.timestamps.map((ts, i) => ({
      timestamp: ts,
      historical: null as number | null,
      forecast: forecast.mean[i],
      lower: forecast.lower[i],
      upper: forecast.upper[i],
    })),
  ];

  const fmtDate = (ts: string) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const fmtVal  = (v: number) => v == null ? '' : Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(1);

  const forecastStart = forecast.timestamps[0];
  const forecastEnd   = forecast.timestamps[forecast.timestamps.length - 1];

  const Legend = ({ color, label, type }: { color: string; label: string; type: 'line' | 'band' }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {type === 'line'
        ? <div style={{ width: 24, height: 2, background: color, borderRadius: 1 }} />
        : <div style={{ width: 24, height: 10, background: color, borderRadius: 3 }} />
      }
      <span style={{ fontSize: 12, color: '#64748b' }}>{label}</span>
    </div>
  );

  return (
    <div style={{ background: '#0d0d1f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '28px 28px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Forecast Visualization</h3>
          <p style={{ margin: '5px 0 0', fontSize: 12, color: '#475569' }}>
            {historical.timestamps.length} historical · {forecast.timestamps.length} forecasted points
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Legend color="#64748b" label="Historical" type="line" />
          <Legend color="#818cf8" label="Forecast" type="line" />
          <Legend color="rgba(99,102,241,0.25)" label="Confidence" type="band" />
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 380 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="histFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#64748b" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#64748b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="confFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />

            <XAxis
              dataKey="timestamp"
              tickFormatter={fmtDate}
              tick={{ fontSize: 11, fill: '#334155' }}
              axisLine={false} tickLine={false} minTickGap={50}
            />
            <YAxis
              tickFormatter={fmtVal}
              tick={{ fontSize: 11, fill: '#334155' }}
              axisLine={false} tickLine={false} width={56}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.2)', strokeWidth: 1 }} />

            <ReferenceLine
              x={forecastStart}
              stroke="rgba(99,102,241,0.35)"
              strokeDasharray="5 4"
              label={{ value: 'Forecast Start', position: 'insideTopRight', fill: '#6366f1', fontSize: 11, fontWeight: 600 }}
            />

            {/* Confidence band */}
            <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confFill)" name="upper" connectNulls={false} />
            <Area type="monotone" dataKey="lower" stroke="none" fill="#0d0d1f" fillOpacity={1} name="lower" connectNulls={false} />

            {/* Historical with gradient fill */}
            <Area
              type="monotone" dataKey="historical"
              stroke="#64748b" strokeWidth={2}
              fill="url(#histFill)" dot={false}
              name="historical" connectNulls={false}
            />

            {/* Forecast line */}
            <Area
              type="monotone" dataKey="forecast"
              stroke="#818cf8" strokeWidth={2.5}
              fill="none"
              dot={{ r: 3.5, fill: '#818cf8', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#a78bfa', strokeWidth: 2.5, stroke: '#0d0d1f' }}
              name="forecast" connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
