import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Calendar, BarChart3, TrendingUp, DollarSign, Package, Zap, ArrowRight } from 'lucide-react';

interface ProblemInputProps {
  onSubmit: (data: { problem_description: string; horizon: number; frequency: string; context_length: number }) => void;
  loading: boolean;
  hasResults?: boolean;
  initialQuery?: string;
}

const FREQ = [
  { value: 'D', short: 'Day',  label: 'Daily' },
  { value: 'W', short: 'Wk',   label: 'Weekly' },
  { value: 'M', short: 'Mo',   label: 'Monthly' },
  { value: 'Q', short: 'Qtr',  label: 'Quarterly' },
  { value: 'Y', short: 'Yr',   label: 'Yearly' },
];

const EXAMPLES = [
  { text: 'Apple stock price (AAPL)', icon: DollarSign },
  { text: 'Monthly e-commerce sales', icon: TrendingUp },
  { text: 'Airline passenger demand', icon: Package },
  { text: 'Bitcoin price forecast',   icon: Zap },
];

const label = (text: string) => (
  <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
    {text}
  </span>
);

export const ProblemInput: React.FC<ProblemInputProps> = ({ onSubmit, loading, hasResults, initialQuery }) => {
  const [description, setDescription] = useState('');
  const [horizon,     setHorizon]     = useState(30);
  const [frequency,   setFrequency]   = useState('D');
  const [context,     setContext]      = useState(365);
  const [focused,     setFocused]      = useState(false);

  useEffect(() => {
    if (initialQuery) setDescription(initialQuery);
  }, [initialQuery]);

  const canSubmit = !loading && description.trim().length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) onSubmit({ problem_description: description, horizon, frequency, context_length: context });
  };

  const selectedFreqLabel = FREQ.find(f => f.value === frequency)?.label ?? '';

  /* ---- shared input style ---- */
  const numInput: React.CSSProperties = {
    width: '100%',
    padding: '14px 12px',
    fontSize: 26,
    fontWeight: 800,
    textAlign: 'center',
    color: '#f1f5f9',
    background: 'rgba(0,0,0,0.35)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  };

  return (
    <form onSubmit={submit}>
      <div style={{ background: '#0d0d1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 36 }}>

        {/* ── Description ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0' }}>
              {hasResults ? 'Generate another forecast' : 'What would you like to forecast?'}
            </span>
            {description.length > 0 && (
              <span style={{ fontSize: 11, color: '#334155' }}>{description.length} chars</span>
            )}
          </div>

          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="e.g. 'Apple stock closing price', 'monthly retail sales in the US', 'daily electricity consumption'..."
            rows={3}
            required
            style={{
              width: '100%',
              padding: '16px',
              fontSize: 14,
              lineHeight: 1.65,
              color: '#f1f5f9',
              background: 'rgba(0,0,0,0.4)',
              border: focused ? '1px solid rgba(99,102,241,0.55)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
              caretColor: '#818cf8',
              boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
          />
        </div>

        {/* ── Example chips ── */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 12, color: '#475569', margin: '0 0 10px' }}>Try an example:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EXAMPLES.map(({ text, icon: Icon }) => (
              <button
                key={text}
                type="button"
                onClick={() => setDescription(text)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  height: 36, padding: '0 14px',
                  background: 'rgba(99,102,241,0.09)',
                  border: '1px solid rgba(99,102,241,0.22)',
                  borderRadius: 8,
                  color: '#a5b4fc', fontSize: 13, fontWeight: 500,
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
                <Icon size={13} />
                {text}
              </button>
            ))}
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 0 28px' }} />

        {/* ── Config row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 24, marginBottom: 28 }}>

          {/* Horizon */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Clock size={13} color="#6366f1" />
              {label('Horizon')}
            </div>
            <input
              type="number"
              value={horizon}
              onChange={e => setHorizon(Math.max(1, parseInt(e.target.value) || 1))}
              min={1} max={365}
              style={numInput}
            />
            <p style={{ textAlign: 'center', fontSize: 12, color: '#334155', margin: '8px 0 0' }}>steps ahead</p>
          </div>

          {/* Frequency */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Calendar size={13} color="#6366f1" />
              {label('Frequency')}
            </div>
            <div style={{
              display: 'flex', gap: 4, padding: 4,
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
            }}>
              {FREQ.map(({ value, short, label: lbl }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFrequency(value)}
                  title={lbl}
                  style={{
                    flex: 1, padding: '12px 4px',
                    borderRadius: 8, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                    ...(frequency === value
                      ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', boxShadow: '0 2px 12px rgba(99,102,241,0.45)' }
                      : { background: 'transparent', color: '#475569' }),
                  }}
                >
                  {short}
                </button>
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#334155', margin: '8px 0 0' }}>{selectedFreqLabel}</p>
          </div>

          {/* Context */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <BarChart3 size={13} color="#6366f1" />
              {label('Context')}
            </div>
            <input
              type="number"
              value={context}
              onChange={e => setContext(Math.max(30, parseInt(e.target.value) || 30))}
              min={30} max={2000}
              style={numInput}
            />
            <p style={{ textAlign: 'center', fontSize: 12, color: '#334155', margin: '8px 0 0' }}>historical points</p>
          </div>
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            width: '100%', height: 54,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            fontSize: 15, fontWeight: 700,
            border: 'none', borderRadius: 14,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: 'opacity 0.15s, box-shadow 0.15s',
            ...(canSubmit
              ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', boxShadow: '0 4px 24px rgba(99,102,241,0.38)' }
              : { background: 'rgba(99,102,241,0.12)', color: 'rgba(165,180,252,0.4)' }),
          }}
          onMouseEnter={e => { if (canSubmit) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 32px rgba(99,102,241,0.55)'; }}
          onMouseLeave={e => { if (canSubmit) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(99,102,241,0.38)'; }}
        >
          {loading ? (
            <>
              <span className="animate-spin" style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', display: 'inline-block' }} />
              Generating forecast…
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate Forecast
              <ArrowRight size={16} style={{ opacity: 0.65 }} />
            </>
          )}
        </button>

      </div>
    </form>
  );
};
