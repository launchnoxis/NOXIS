import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSolanaWallet } from '../lib/wallet';
import { startVolumeJob, stopVolumeJob, getVolumeJobStatus } from '../lib/api';

const BACKEND = 'https://noxis-backend-production.up.railway.app';

export default function BoostTab() {
  const wallet = useSolanaWallet();

  const [subWallets, setSubWallets] = useState([]);
  const [volumeSettings, setVolumeSettings] = useState({
    mintAddress: '',
    dailySolTarget: 5,
    frequencyMinutes: 5,
    maxTradeSol: 0.1,
  });
  const [activeJob, setActiveJob] = useState(() => {
    const saved = localStorage.getItem('noxis_boost_job');
    return saved ? JSON.parse(saved) : null;
  });
  const [jobLoading, setJobLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [userWallets, setUserWallets] = useState(['', '', '']);
  const [showKeys, setShowKeys] = useState([false, false, false]);

  const setVol = (k, v) => setVolumeSettings(s => ({ ...s, [k]: v }));

  // Load sub-wallet addresses on mount
  useEffect(() => {
    fetch(`${BACKEND}/api/boost/wallets`)
      .then(r => r.json())
      .then(d => setSubWallets(d.wallets || []))
      .catch(() => {});
  }, []);

  // Poll job status every 5s
  useEffect(() => {
    if (!activeJob?.jobId) return;
    const interval = setInterval(async () => {
      try {
        const status = await getVolumeJobStatus(activeJob.jobId);
        setActiveJob(prev => ({ ...prev, ...status }));
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [activeJob?.jobId]);

  function copyAddress(addr, idx) {
    navigator.clipboard.writeText(addr);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleStartJob() {
    if (!wallet.publicKey) return toast.error('Connect wallet first');
    if (!volumeSettings.mintAddress) return toast.error('Enter a mint address');
    setJobLoading(true);
    try {
      const activeUserWallets = userWallets.filter(k => k.trim().length > 0);
      const res = await startVolumeJob({
        ...volumeSettings,
        ownerWallet: wallet.publicKey.toBase58(),
        userWallets: activeUserWallets,
      });
      setActiveJob(res.job);
      localStorage.setItem('noxis_boost_job', JSON.stringify(res.job));
      toast.success('Volume job started');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setJobLoading(false);
    }
  }

  async function handleStopJob() {
    if (!activeJob?.jobId) return;
    try {
      await stopVolumeJob(activeJob.jobId);
      setActiveJob(s => ({ ...s, status: 'stopped' }));
      localStorage.removeItem('noxis_boost_job');
      toast('Volume job stopped');
    } catch (err) {
      toast.error(err.message);
    }
  }

  const totalSolNeeded = ((24 * 60) / volumeSettings.frequencyMinutes * volumeSettings.maxTradeSol).toFixed(2);

  return (
    <div className="tab-content">
      <div className="page-hero">
        <div className="hero-label">Boost Engine</div>
        <h1 className="hero-title">Keep your coin<br/><span className="hero-highlight">alive.</span></h1>
        <p className="hero-sub">Automated buy/sell cycles to maintain chart activity. Fund the sub-wallets below then start a job.</p>
      </div>

      {/* Step 1 — Import wallets */}
      <div className="card mb">
        <div className="card-title">Step 1 — Import Wallets</div>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4, lineHeight: 1.6 }}>
          Paste the private keys of wallets you want to trade from. Each wallet needs SOL to execute trades. Keys are used in memory only — never stored.
        </p>
        <div style={{
          fontSize: 11, color: 'rgba(245,158,11,0.8)', fontFamily: 'monospace',
          background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
          borderRadius: 8, padding: '8px 12px', marginBottom: 16,
        }}>
          ⚠ Never use your main wallet. Use dedicated trading wallets only.
        </div>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'monospace', marginBottom: 4 }}>
              Wallet {i + 1} {userWallets[i] ? '✓' : '(optional)'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type={showKeys[i] ? 'text' : 'password'}
                placeholder="Base58 private key..."
                value={userWallets[i]}
                onChange={e => {
                  const updated = [...userWallets];
                  updated[i] = e.target.value;
                  setUserWallets(updated);
                }}
                style={{ flex: 1, fontFamily: 'monospace', fontSize: 11 }}
              />
              <button
                onClick={() => {
                  const updated = [...showKeys];
                  updated[i] = !updated[i];
                  setShowKeys(updated);
                }}
                style={{
                  padding: '8px 12px', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                  color: 'var(--muted)', fontSize: 11, cursor: 'pointer',
                }}
              >
                {showKeys[i] ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        ))}
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
          {userWallets.filter(k => k.trim()).length} wallet{userWallets.filter(k => k.trim()).length !== 1 ? 's' : ''} imported
        </div>
      </div>

      {/* Step 2 — Configure & Start */}
      <div className="card mb">
        <div className="card-title">Step 2 — Configure & Start</div>

        <label>Token Mint Address</label>
        <input
          type="text"
          placeholder="Token mint address..."
          value={volumeSettings.mintAddress}
          onChange={e => setVol('mintAddress', e.target.value)}
          style={{ fontFamily: 'monospace', fontSize: 12 }}
        />

        <label>Daily Volume Target (SOL)</label>
        <div className="range-wrap">
          <input type="range" min="1" max="100" step="1" value={volumeSettings.dailySolTarget}
            onChange={e => setVol('dailySolTarget', parseInt(e.target.value))} />
          <span className="range-val">{volumeSettings.dailySolTarget} SOL</span>
        </div>

        <label>Trade Frequency</label>
        <select value={volumeSettings.frequencyMinutes}
          onChange={e => setVol('frequencyMinutes', parseInt(e.target.value))}>
          <option value={10}>Every 10 minutes</option>
          <option value={5}>Every 5 minutes</option>
          <option value={2}>Every 2 minutes</option>
          <option value={1}>Every 1 minute</option>
        </select>

        <label>Max Trade Size (SOL)</label>
        <div className="range-wrap">
          <input type="range" min="0.01" max="1" step="0.01" value={volumeSettings.maxTradeSol}
            onChange={e => setVol('maxTradeSol', parseFloat(e.target.value))} />
          <span className="range-val">{volumeSettings.maxTradeSol.toFixed(2)} SOL</span>
        </div>

        <div style={{
          fontSize: 12, color: 'var(--muted)', marginBottom: 14,
          background: 'rgba(255,255,255,0.02)', borderRadius: 8,
          padding: '8px 12px', fontFamily: 'monospace',
        }}>
          Estimated daily usage: ~{totalSolNeeded} SOL across all wallets
        </div>

        {activeJob ? (
          <div>
            <div className="job-status-bar">
              <div className="job-stat">
                <span className="js-label">Status</span>
                <span className={`badge ${activeJob.status === 'active' ? 'badge-green' : 'badge-amber'}`}>
                  {activeJob.status}
                </span>
              </div>
              <div className="job-stat">
                <span className="js-label">Trades</span>
                <span className="js-val">{activeJob.tradesExecuted}</span>
              </div>
              <div className="job-stat">
                <span className="js-label">Volume</span>
                <span className="js-val">{activeJob.totalVolumeSol?.toFixed(3)} SOL</span>
              </div>
              <div className="job-stat">
                <span className="js-label">Errors</span>
                <span className="js-val" style={{ color: activeJob.errors > 0 ? 'var(--danger)' : 'inherit' }}>
                  {activeJob.errors}
                </span>
              </div>
            </div>

            {/* Trade history */}
            {activeJob.history?.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent Trades</div>
                {activeJob.history.slice(-5).reverse().map((h, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 10, alignItems: 'center',
                    fontSize: 11, fontFamily: 'monospace', color: 'var(--muted)',
                    padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <span style={{ color: h.action === 'buy' ? 'var(--green)' : 'var(--danger)', width: 30 }}>
                      {h.action?.toUpperCase() || 'ERR'}
                    </span>
                    <span>{h.amountSol ? `${h.amountSol} SOL` : '—'}</span>
                    <span style={{ flex: 1 }}>{h.wallet || ''}</span>
                    <span style={{ color: h.status === 'success' ? 'var(--green)' : 'var(--danger)' }}>
                      {h.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              {(activeJob.status === 'active' || activeJob.status === 'running') && (
                <button className="btn btn-outline" onClick={handleStopJob}>
                  Stop Job
                </button>
              )}
              <button className="btn btn-outline" style={{ opacity: 0.5 }} onClick={() => {
                localStorage.removeItem('noxis_boost_job');
                setActiveJob(null);
              }}>
                Clear
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleStartJob}
            disabled={jobLoading || !wallet.publicKey}
          >
            {jobLoading ? 'Starting...' : '▶ Start Volume Engine'}
          </button>
        )}

        {!wallet.publicKey && (
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, textAlign: 'center' }}>
            Connect wallet to start
          </div>
        )}
      </div>
    </div>
  );
}
