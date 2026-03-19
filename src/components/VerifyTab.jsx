import React, { useState } from 'react';

const BACKEND = 'https://noxis-backend-production.up.railway.app';

const CONFIDENCE_COLORS = {
  high:   { color: '#22c55e', label: '100% accurate' },
  medium: { color: '#f59e0b', label: '~80% accurate' },
  low:    { color: '#6b7280', label: '~65% accurate' },
};

function CheckRow({ label, result, confidence, note, noxisVerified }) {
  const conf = CONFIDENCE_COLORS[confidence] || CONFIDENCE_COLORS.low;

  let statusColor, statusText, icon;
  if (result === true) {
    statusColor = '#22c55e'; statusText = 'PASS'; icon = '✓';
  } else if (result === false) {
    statusColor = '#ef4444'; statusText = 'FAIL'; icon = '✗';
  } else {
    statusColor = '#6b7280'; statusText = 'UNKNOWN'; icon = '?';
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 12,
      padding: '16px 20px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontFamily: 'monospace', fontSize: 11, fontWeight: 600,
            color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>{label}</span>
          {noxisVerified && (
            <span style={{
              background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 20, padding: '1px 8px', fontSize: 10, color: '#818cf8',
              fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.08em',
            }}>NOXIS VERIFIED</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, color: conf.color, fontFamily: 'monospace' }}>{conf.label}</span>
          <span style={{
            background: `${statusColor}18`, border: `1px solid ${statusColor}40`,
            color: statusColor, borderRadius: 6, padding: '3px 10px',
            fontSize: 11, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.08em',
          }}>{icon} {statusText}</span>
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{note}</div>
    </div>
  );
}

export default function VerifyTab() {
  const [mint, setMint] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleVerify(e) {
    e.preventDefault();
    if (!mint.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch(`${BACKEND}/api/verify/${mint.trim()}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Verification failed'); return; }
      setResult(data);
    } catch {
      setError('Could not reach verification server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontFamily: 'monospace', fontSize: 11, color: 'rgba(99,102,241,0.7)',
          letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12,
        }}>Token Verification</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#f0f4ff', marginBottom: 8, letterSpacing: '-0.02em' }}>
          Verify Any Token
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
          Paste a token mint address to check its on-chain protections. Tokens launched via Noxis show verified feature details.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleVerify} style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <input
          value={mint}
          onChange={e => setMint(e.target.value)}
          placeholder="Token mint address..."
          style={{
            flex: 1, padding: '13px 16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, color: '#f0f4ff',
            fontFamily: 'monospace', fontSize: 13,
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={loading || !mint.trim()}
          style={{
            padding: '13px 24px',
            background: loading ? 'rgba(99,102,241,0.4)' : '#6366f1',
            border: 'none', borderRadius: 10,
            color: '#fff', fontWeight: 600, fontSize: 13,
            cursor: loading ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap', transition: 'all 0.2s',
          }}
        >
          {loading ? 'Verifying...' : 'Verify →'}
        </button>
      </form>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10, padding: '12px 16px', color: '#ef4444',
          fontSize: 13, fontFamily: 'monospace', marginBottom: 20,
        }}>{error}</div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Noxis badge */}
          {result.isNoxisLaunch ? (
            <div style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 14, padding: '18px 22px',
              display: 'flex', alignItems: 'center', gap: 16,
              marginBottom: 4,
            }}>
              <div style={{
                width: 42, height: 42,
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>🔒</div>
              <div>
                <div style={{ fontWeight: 700, color: '#f0f4ff', fontSize: 16, marginBottom: 3 }}>
                  ✓ Launched with Noxis
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                  {result.noxisRecord?.name} · {result.noxisRecord?.symbol} · {new Date(result.noxisRecord?.launchedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
              marginBottom: 4,
            }}>
              <span style={{ fontSize: 18 }}>🔍</span>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                Not in Noxis database — showing on-chain verification only
              </div>
            </div>
          )}

          {/* Checks */}
          <CheckRow
            label={result.checks.mintRenounced.label}
            result={result.checks.mintRenounced.result}
            confidence={result.checks.mintRenounced.confidence}
            note={result.checks.mintRenounced.note}
          />
          <CheckRow
            label={result.checks.freezeRenounced.label}
            result={result.checks.freezeRenounced.result}
            confidence={result.checks.freezeRenounced.confidence}
            note={result.checks.freezeRenounced.note}
          />
          <CheckRow
            label={result.checks.lpLocked.label}
            result={result.checks.lpLocked.result}
            confidence={result.checks.lpLocked.confidence}
            note={result.checks.lpLocked.note}
            noxisVerified={result.checks.lpLocked.noxisVerified}
          />
          <CheckRow
            label={result.checks.devVesting.label}
            result={result.checks.devVesting.result}
            confidence={result.checks.devVesting.confidence}
            note={result.checks.devVesting.note}
            noxisVerified={result.checks.devVesting.noxisVerified}
          />

          {/* Accuracy disclaimer */}
          <div style={{
            marginTop: 8, padding: '12px 16px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 10, fontSize: 12,
            color: 'rgba(255,255,255,0.25)', lineHeight: 1.6,
            fontFamily: 'monospace',
          }}>
            Mint & Freeze Authority: 100% accurate · LP Lock: ~80% accurate · Dev Vesting: ~65% accurate<br/>
            Accuracy improves for tokens launched through Noxis (verified from our database).
          </div>
        </div>
      )}
    </div>
  );
}
