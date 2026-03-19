import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSolanaWallet } from '../lib/wallet';
import { startVolumeJob, stopVolumeJob, getVolumeJobStatus, buildBoostBuy } from '../lib/api';

export default function BoostTab() {
  const wallet = useSolanaWallet();

  const [volumeSettings, setVolumeSettings] = useState({
    mintAddress: '',
    dailySolTarget: 20,
    frequencyMinutes: 2,
    maxTradeSol: 0.3,
  });
  const [activeJob, setActiveJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [singleBuy, setSingleBuy] = useState({ mintAddress: '', solAmount: 0.1 });
  const [buyLoading, setBuyLoading] = useState(false);

  const setVol = (k, v) => setVolumeSettings(s => ({ ...s, [k]: v }));

  useEffect(() => {
    if (!activeJob?.jobId) return;
    const interval = setInterval(async () => {
      try {
        const status = await getVolumeJobStatus(activeJob.jobId);
        setActiveJob(status);
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [activeJob?.jobId]);

  async function handleStartJob() {
    if (!wallet.publicKey) return toast.error('Connect wallet first');
    if (!volumeSettings.mintAddress) return toast.error('Enter a mint address');
    setJobLoading(true);
    try {
      const res = await startVolumeJob({
        ...volumeSettings,
        ownerWallet: wallet.publicKey.toBase58(),
      });
      setActiveJob(res.job);
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
      toast('Volume job stopped');
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleManualBuy() {
    if (!wallet.publicKey) return toast.error('Connect wallet first');
    if (!singleBuy.mintAddress) return toast.error('Enter a mint address');
    setBuyLoading(true);
    try {
      const res = await buildBoostBuy({
        buyerWallet: wallet.publicKey.toBase58(),
        mintAddress: singleBuy.mintAddress,
        solAmount: singleBuy.solAmount,
      });
      const { signature } = await wallet.signAndSendTransaction(res.transaction);
      toast.success(`Buy sent: ${signature.slice(0, 12)}...`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBuyLoading(false);
    }
  }

  return (
    <div className="tab-content">
      <div className="page-hero">
        <div className="hero-label">Boost Engine</div>
        <h1 className="hero-title">Keep your coin<br/><span className="hero-highlight">alive.</span></h1>
        <p className="hero-sub">Schedule automated volume cycles or execute manual buys to maintain chart activity.</p>
      </div>

      {/* Volume Engine */}
      <div className="card mb">
        <div className="card-title">Volume Engine</div>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
          Schedules recurring buy/sell cycles on your token. Requires funded sub-wallets configured on the backend to execute real transactions.
        </p>

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
          <input type="range" min="1" max="200" step="1" value={volumeSettings.dailySolTarget}
            onChange={e => setVol('dailySolTarget', parseInt(e.target.value))} />
          <span className="range-val">{volumeSettings.dailySolTarget} SOL</span>
        </div>

        <label>Trade Frequency</label>
        <select value={volumeSettings.frequencyMinutes}
          onChange={e => setVol('frequencyMinutes', parseInt(e.target.value))}>
          <option value={5}>Every 5 minutes</option>
          <option value={2}>Every 2 minutes</option>
          <option value={1}>Every 1 minute</option>
        </select>

        <label>Max Trade Size (SOL)</label>
        <div className="range-wrap">
          <input type="range" min="0.01" max="2" step="0.01" value={volumeSettings.maxTradeSol}
            onChange={e => setVol('maxTradeSol', parseFloat(e.target.value))} />
          <span className="range-val">{volumeSettings.maxTradeSol.toFixed(2)} SOL</span>
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
                <span className="js-label">Cycles</span>
                <span className="js-val">{activeJob.tradesExecuted}</span>
              </div>
              <div className="job-stat">
                <span className="js-label">Volume</span>
                <span className="js-val">{activeJob.totalVolumeSol?.toFixed(2)} SOL</span>
              </div>
              <div className="job-stat">
                <span className="js-label">Errors</span>
                <span className="js-val" style={{ color: activeJob.errors > 0 ? 'var(--danger)' : 'inherit' }}>
                  {activeJob.errors}
                </span>
              </div>
            </div>
            {activeJob.status === 'active' && (
              <button className="btn btn-outline" style={{ marginTop: 10 }} onClick={handleStopJob}>
                Stop Volume Job
              </button>
            )}
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
            Connect wallet to start volume engine
          </div>
        )}
      </div>

      {/* Manual Buy */}
      <div className="card">
        <div className="card-title">Manual Buy</div>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
          Execute a single buy transaction directly from your connected wallet on any pump.fun token.
        </p>
        <div className="grid2" style={{ gap: '0.75rem' }}>
          <div>
            <label>Mint Address</label>
            <input
              type="text"
              placeholder="Token mint..."
              value={singleBuy.mintAddress}
              onChange={e => setSingleBuy(s => ({ ...s, mintAddress: e.target.value }))}
              style={{ fontFamily: 'monospace', fontSize: 12 }}
            />
          </div>
          <div>
            <label>Amount (SOL)</label>
            <input
              type="number"
              step="0.01"
              min="0.001"
              value={singleBuy.solAmount}
              onChange={e => setSingleBuy(s => ({ ...s, solAmount: parseFloat(e.target.value) }))}
            />
          </div>
        </div>
        <button
          className="btn btn-outline"
          style={{ marginTop: 12 }}
          onClick={handleManualBuy}
          disabled={buyLoading || !wallet.publicKey}
        >
          {buyLoading ? 'Sending...' : 'Execute Buy →'}
        </button>
        {!wallet.publicKey && (
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, textAlign: 'center' }}>
            Connect wallet to execute buy
          </div>
        )}
      </div>
    </div>
  );
}
