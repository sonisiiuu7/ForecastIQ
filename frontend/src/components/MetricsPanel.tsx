import React from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3, Database, Clock, Target, Zap } from 'lucide-react';

interface MetricsPanelProps {
  historical: { timestamps: string[]; values: number[] };
  forecast:   { timestamps: string[]; mean: number[]; lower: number[]; upper: number[] };
  metadata:   { source: string; identifier: string; horizon: number; frequency: string };
  loading?:   boolean;
}

const fmt = (n: number) => {
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return n.toFixed(2);
};

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ historical, forecast, metadata, loading = false }) => {
  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ height: 110, background: '#0d0d1f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16 }} />
        ))}
      </div>
    );
  }

  const hVals   = historical.values;
  const fMean   = forecast.mean;
  const histAvg = hVals.reduce((a, b) => a + b, 0) / hVals.length;
  const fcastAvg = fMean.reduce((a, b) => a + b, 0) / fMean.length;
  const lastHist  = hVals[hVals.length - 1];
  const firstFcast = fMean[0];
  const pct = ((firstFcast - lastHist) / lastHist) * 100;
  const ciPct = (forecast.upper.map((u, i) => u - forecast.lower[i]).reduce((a, b) => a + b, 0) / fMean.length / fcastAvg) * 100;
  const up = pct >= 0;

  const cards = [
    { label: 'Historical Avg', value: fmt(histAvg), sub: 'mean value', icon: Activity, dot: '#60a5fa', ibg: 'rgba(59,130,246,0.1)', ib: 'rgba(59,130,246,0.2)' },
    { label: 'Forecast Avg',   value: fmt(fcastAvg), sub: 'predicted mean', icon: TrendingUp, dot: '#34d399', ibg: 'rgba(16,185,129,0.1)', ib: 'rgba(16,185,129,0.2)' },
    { label: 'Expected Change', value: `${up ? '+' : ''}${pct.toFixed(2)}%`, sub: 'vs. last value', icon: up ? TrendingUp : TrendingDown, dot: up ? '#34d399' : '#fb7185', ibg: up ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', ib: up ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)', vc: up ? '#34d399' : '#fb7185' },
    { label: 'Confidence Range', value: `±${ciPct.toFixed(1)}%`, sub: 'avg interval', icon: BarChart3, dot: '#a78bfa', ibg: 'rgba(139,92,246,0.1)', ib: 'rgba(139,92,246,0.2)' },
  ] as const;

  const freqLabel: Record<string, string> = { D: 'Daily', W: 'Weekly', M: 'Monthly', Q: 'Quarterly', Y: 'Yearly', H: 'Hourly' };
  const srcLabel:  Record<string, string> = { financial: 'Yahoo Finance', economic: 'Statsmodels', synthetic: 'Synthetic Data' };

  const card: React.CSSProperties = { background: '#0d0d1f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* 4 metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {cards.map((c) => (
          <div key={c.label} style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: c.ibg, border: `1px solid ${c.ib}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <c.icon size={16} color={c.dot} />
              </div>
              <span style={{ fontSize: 12, color: '#64748b', lineHeight: 1.3 }}>{c.label}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: (c as any).vc ?? '#f1f5f9', fontFamily: "'JetBrains Mono','Fira Code',monospace", lineHeight: 1 }}>
              {c.value}
            </div>
            <div style={{ fontSize: 11, color: '#334155', marginTop: 6 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Info panel */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Database size={14} color="#6366f1" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data Source</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 20 }}>
          {[
            { icon: Database, label: 'Source',     value: srcLabel[metadata.source] ?? metadata.source },
            { icon: Zap,      label: 'Identifier', value: metadata.identifier },
            { icon: Clock,    label: 'Frequency',  value: freqLabel[metadata.frequency] ?? metadata.frequency },
            { icon: Target,   label: 'Horizon',    value: `${metadata.horizon} steps` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
                <Icon size={12} color="#475569" />
                <span style={{ fontSize: 11, color: '#475569' }}>{label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 16 }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { label: 'Last Historical', value: fmt(lastHist) },
            { label: 'First Forecast',  value: fmt(firstFcast) },
            { label: 'Total Points',    value: `${hVals.length} + ${fMean.length}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10 }}>
              <span style={{ fontSize: 12, color: '#475569' }}>{label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', fontFamily: "'JetBrains Mono','Fira Code',monospace" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
