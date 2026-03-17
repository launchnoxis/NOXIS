import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSolanaWallet } from '../lib/wallet';
import { startVolumeJob, stopVolumeJob, getVolumeJobStatus, listVolumeJobs, buildBoostBuy } from '../lib/api';

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
  const [holderSettings, setHolderSettings] = useState({ enabled: false, targetHolders: 500 });
  const [commentSettings, setCommentSettings] = useState({ enabled: false, postsPerHour: 4, style: 'Organic Retail' });
  const [trendingSettings, setTrendingSettings] = useState({ enabled: false, targetSlot: 'Top 25' });
  const [singleBuy, setSingleBuy] = useState({ mintAddress: '', solAmount: 0.1 });

  const setVol = (k, v) => setVolumeSettings(s => ({ ...s, [k]: v }));

  // Poll job status every 5s if active
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
    }
  }

  return (
    <div className="tab-content">

      {/* Volume Engine */}
      <div className="card mb">
        <div className="card-title">Volume Engine</div>
        <label>Token Mint Address</label>
        <input type="text" placeholder="Token mint address..." value={volumeSettings.mintAddress}
          onChange={e => setVol('mintAddress', e.target.value)} />

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
                <span className="js-label">Trades</span>
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
          <button className="btn btn-primary" onClick={handleStartJob} disabled={jobLoading}>
            {jobLoading ? 'Starting...' : '▶ Start Volume Engine'}
          </button>
        )}
      </div>

      <div className="grid2 mb">
        {/* Holder Growth */}
        <div className="card">
          <div className="card-title">Holder Growth</div>
          <div className="toggle-row">
            <div>
              <div className="toggle-label">Auto Distribute</div>
              <div className="toggle-desc">Spread tokens to grow holder count</div>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={holderSettings.enabled}
                onChange={() => setHolderSettings(s => ({ ...s, enabled: !s.enabled }))} />
              <span className="slider" />
            </label>
          </div>
          {holderSettings.enabled && (
            <>
              <label>Target Holders</label>
              <input type="number" value={holderSettings.targetHolders} min={10}
                onChange={e => setHolderSettings(s => ({ ...s, targetHolders: parseInt(e.target.value) }))} />
              <div className="alert alert-warn" style={{ marginTop: 10 }}>
                Requires funded sub-wallets configured on backend.
              </div>
            </>
          )}
        </div>

        {/* Comment Seeding */}
        <div className="card">
          <div className="card-title">Comment Seeding</div>
          <div className="toggle-row">
            <div>
              <div className="toggle-label">Auto Hype Comments</div>
              <div className="toggle-desc">Post bullish comments on pump.fun page</div>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={commentSettings.enabled}
                onChange={() => setCommentSettings(s => ({ ...s, enabled: !s.enabled }))} />
              <span className="slider" />
            </label>
          </div>
          {commentSettings.enabled && (
            <>
              <label>Comment Style</label>
              <select value={commentSettings.style}
                onChange={e => setCommentSettings(s => ({ ...s, style: e.target.value }))}>
                <option>Organic Retail</option>
                <option>Degen Culture</option>
                <option>Professional</option>
              </select>
              <label>Posts per Hour</label>
              <input type="number" value={commentSettings.postsPerHour} min={1} max={20}
                onChange={e => setCommentSettings(s => ({ ...s, postsPerHour: parseInt(e.target.value) }))} />
            </>
          )}
        </div>
      </div>

      {/* Trending Booster */}
      <div className="card mb">
        <div className="card-title">Trending Booster</div>
        <div className="toggle-row">
          <div>
            <div className="toggle-label">Trending Page Push</div>
            <div className="toggle-desc">Coordinate buys to reach pump.fun trending at a target time</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={trendingSettings.enabled}
              onChange={() => setTrendingSettings(s => ({ ...s, enabled: !s.enabled }))} />
            <span className="slider" />
          </label>
        </div>
        {trendingSettings.enabled && (
          <div className="grid2" style={{ marginTop: 10, gap: '0.75rem' }}>
            <div>
              <label>Target Slot</label>
              <select value={trendingSettings.targetSlot}
                onChange={e => setTrendingSettings(s => ({ ...s, targetSlot: e.target.value }))}>
                <option>Top 10</option>
                <option>Top 25</option>
                <option>Top 50</option>
              </select>
            </div>
            <div>
              <label>Push Window</label>
              <select>
                <option>2 hours post-launch</option>
                <option>6 hours post-launch</option>
                <option>Custom time</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Manual single buy */}
      <div className="card">
        <div className="card-title">Manual Buy</div>
        <div className="grid2" style={{ gap: '0.75rem' }}>
          <div>
            <label>Mint Address</label>
            <input type="text" placeholder="Token mint..." value={singleBuy.mintAddress}
              onChange={e => setSingleBuy(s => ({ ...s, mintAddress: e.target.value }))} />
          </div>
          <div>
            <label>Amount (SOL)</label>
            <input type="number" step="0.01" min="0.001" value={singleBuy.solAmount}
              onChange={e => setSingleBuy(s => ({ ...s, solAmount: parseFloat(e.target.value) }))} />
          </div>
        </div>
        <button className="btn btn-outline" style={{ marginTop: 10 }} onClick={handleManualBuy}>
          Execute Buy →
        </button>
      </div>
    </div>
  );
}
