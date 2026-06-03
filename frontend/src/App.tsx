import { useState } from 'react';
import { useForecast } from './hooks/useForecast';
import { ProblemInput } from './components/ProblemInput';
import { ForecastChart } from './components/ForecastChart';
import { MetricsPanel } from './components/MetricsPanel';
import { Clock, Zap, Target, Layers, AlertCircle, Database } from 'lucide-react';

function App() {
  const { data, loading, error, fetchForecast } = useForecast();
  const [suggestedQuery, setSuggestedQuery] = useState<string | undefined>(undefined);

  return (
    <div style={{ minHeight: '100vh', background: '#06060f', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Ambient blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-8%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-8%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(6,6,15,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
              <Clock size={16} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, background: 'linear-gradient(90deg, #a5b4fc, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ChronoSight
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#34d399' }}>TimesFM-2.5-200M active</span>
          </div>
        </div>
      </header>

      {/* Persistent disclaimer banner */}
      <div style={{ background: 'rgba(234,179,8,0.07)', borderBottom: '1px solid rgba(234,179,8,0.18)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '9px 28px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={13} color="#ca8a04" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#854d0e' }}>
            Forecasts are AI-generated from live market and economic data. Results may be inaccurate — do not use for financial decisions.
          </span>
        </div>
      </div>

      {/* Page content */}
      <main style={{ position: 'relative', zIndex: 1, maxWidth: 880, margin: '0 auto', padding: '0 28px 80px' }}>

        {/* Hero — only when no results */}
        {!data && (
          <div style={{ textAlign: 'center', paddingTop: 72, paddingBottom: 56 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: 28 }}>
              <Zap size={13} color="#a5b4fc" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#a5b4fc' }}>Google TimesFM · Zero-shot AI Forecasting</span>
            </div>

            <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, margin: '0 0 20px', background: 'linear-gradient(135deg, #f1f5f9 0%, #a5b4fc 55%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Predict Any<br />Time Series
            </h1>

            <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.8, maxWidth: 440, margin: '0 auto 36px' }}>
              Generate accurate AI-powered forecasts for stocks, sales, energy demand, and more — in under a second.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
              {[
                { icon: Zap, text: '200M Parameters' },
                { icon: Target, text: 'Sub-second inference' },
                { icon: Layers, text: 'Zero-shot forecasting' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, color: '#64748b' }}>
                  <Icon size={14} color="#6366f1" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results label */}
        {data && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 36, paddingBottom: 20 }}>
            <div style={{ width: 3, height: 22, borderRadius: 2, background: 'linear-gradient(180deg, #6366f1, #8b5cf6)' }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0' }}>Forecast Results</span>
          </div>
        )}

        {/* Results */}
        {data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
            <ForecastChart historical={data.historical} forecast={data.forecast} />
            <MetricsPanel historical={data.historical} forecast={data.forecast} metadata={data.metadata} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: 20, borderRadius: 16, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: error.suggestions?.length ? 16 : 0 }}>
              <AlertCircle size={18} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#f87171', margin: '0 0 4px' }}>No data available</p>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>{error.message}</p>
              </div>
            </div>
            {error.suggestions && error.suggestions.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(239,68,68,0.15)', paddingTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Database size={13} color="#64748b" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Available datasets</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {error.suggestions.map((s) => (
                    <button
                      key={s.query}
                      type="button"
                      onClick={() => setSuggestedQuery(s.query)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        height: 34, padding: '0 14px',
                        background: 'rgba(99,102,241,0.09)',
                        border: '1px solid rgba(99,102,241,0.22)',
                        borderRadius: 8,
                        color: '#a5b4fc', fontSize: 12, fontWeight: 500,
                        cursor: 'pointer', whiteSpace: 'nowrap',
                        transition: 'background 0.15s, border-color 0.15s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.17)';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.4)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.09)';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.22)';
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <ProblemInput onSubmit={fetchForecast} loading={loading} hasResults={!!data} initialQuery={suggestedQuery} />

        {/* Tag cloud — empty state only */}
        {!data && !loading && !error && (
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <p style={{ fontSize: 12, color: '#1e3a5f', marginBottom: 14 }}>Popular use cases</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
              {['AAPL Stock', 'Retail Sales', 'Energy Demand', 'CO₂ Levels', 'Crypto Prices', 'Web Traffic'].map(tag => (
                <span key={tag} style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', fontSize: 12, color: '#334155' }}>{tag}</span>
              ))}
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 12, color: '#1e293b', marginTop: 60 }}>
          Built with Google TimesFM · FastAPI · React · Recharts
        </p>
      </main>
    </div>
  );
}

export default App;
