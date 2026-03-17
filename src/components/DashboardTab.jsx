import React, { useState, useEffect } from 'react';
import { useSolanaWallet } from '../lib/wallet';
import { getWalletBalance, getWalletTokens, getTokenInfo, listVolumeJobs } from '../lib/api';

export default function DashboardTab() {
  const wallet = useSolanaWallet();
  const [balance, setBalance] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [network, setNetwork] = useState('devnet');
  const [loading, setLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);

  useEffect(() => {
    if (!wallet.publicKey) { setBalance(null); setTokens([]); return; }
    loadWalletData();
    loadJobs();
  }, [wallet.publicKey]);

  async function loadWalletData() {
    setLoading(true);
    const addr = wallet.publicKey.toBase58();
    try {
      const [balRes, tokRes] = await Promise.all([
        getWalletBalance(addr),
        getWalletTokens(addr),
      ]);
      setBalance(balRes.sol);
      setNetwork(balRes.network);
      setTokens(tokRes.tokens || []);
    } catch {}
    setLoading(false);
  }

  async function loadJobs() {
    try {
      const res = await listVolumeJobs(wallet.publicKey?.toBase58());
      setJobs(res.jobs || []);
    } catch {}
  }

  async function loadTokenInfo(mint) {
    setSelectedToken(mint);
    setTokenInfo(null);
    try {
      const info = await getTokenInfo(mint);
      setTokenInfo(info);
    } catch {}
  }

  const totalVol = jobs.reduce((s, j) => s + (j.totalVolumeSol || 0), 0);
  const activeJobs = jobs.filter(j => j.status === 'active').length;

  return (
    <div className="tab-content">
      {/* Stats row */}
      <div className="grid3 mb">
        <div className="stat-card">
          <div className="stat-value stat-green">
            {balance !== null ? balance.toFixed(4) : '—'}
          </div>
          <div className="stat-label">SOL Balance</div>
        </div>
        <div className="stat-card">
          <div className="stat-value stat-amber">{tokens.length}</div>
          <div className="stat-label">Token Holdings</div>
        </div>
        <div className="stat-card">
          <div className="stat-value stat-purple">{activeJobs}</div>
          <div className="stat-label">Active Jobs</div>
        </div>
      </div>

      {/* Wallet not connected */}
      {!wallet.publicKey && (
        <div className="card empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-title">Connect your wallet</div>
          <div className="empty-desc">Connect a Solana wallet to see your portfolio and live analytics</div>
        </div>
      )}

      {wallet.publicKey && (
        <>
          {/* Network badge */}
          <div className="network-bar mb">
            <span className={`badge ${network === 'mainnet-beta' ? 'badge-green' : 'badge-amber'}`}>
              {network === 'mainnet-beta' ? '● Mainnet' : '● Devnet'}
            </span>
            <span className="wallet-addr-sm">
              {wallet.publicKey.toBase58().slice(0, 8)}...{wallet.publicKey.toBase58().slice(-8)}
            </span>
            <button className="btn-sm" onClick={loadWalletData} disabled={loading}>
              {loading ? 'Refreshing...' : '↻ Refresh'}
            </button>
          </div>

          {/* Token holdings */}
          <div className="card mb">
            <div className="card-title">Token Holdings</div>
            {tokens.length === 0 ? (
              <div className="empty-desc" style={{ padding: '1rem 0', textAlign: 'center' }}>
                No token holdings found
              </div>
            ) : (
              <div className="token-list">
                {tokens.map(t => (
                  <div
                    key={t.ata}
                    className={`token-row ${selectedToken === t.mint ? 'selected' : ''}`}
                    onClick={() => loadTokenInfo(t.mint)}
                  >
                    <div className="tr-mint">{t.mint.slice(0, 8)}...{t.mint.slice(-6)}</div>
                    <div className="tr-amount">{t.amount?.toLocaleString()}</div>
                    <div className="tr-arrow">→</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Token detail card */}
          {selectedToken && (
            <div className="card mb">
              <div className="card-title">Token Details</div>
              {!tokenInfo ? (
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Loading token info...</div>
              ) : (
                <div>
                  <div className="token-preview" style={{ marginBottom: '1rem' }}>
                    <div className="token-img">
                      {tokenInfo.image_uri
                        ? <img src={tokenInfo.image_uri} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }} />
                        : '🪙'}
                    </div>
                    <div>
                      <div className="token-name">{tokenInfo.name || 'Unknown'}</div>
                      <div className="token-sym">${tokenInfo.symbol}</div>
                      <div className="badges-row">
                        <span className="badge badge-purple">MC: ${((tokenInfo.usd_market_cap || 0) / 1000).toFixed(1)}K</span>
                      </div>
                    </div>
                  </div>
                  <div className="info-grid">
                    <InfoRow label="Price (SOL)" value={(tokenInfo.sol_price || 0).toFixed(9)} />
                    <InfoRow label="Market Cap" value={`$${((tokenInfo.usd_market_cap || 0)).toLocaleString()}`} />
                    <InfoRow label="Bonding Curve" value={`${((tokenInfo.bonding_curve_progress || 0) * 100).toFixed(1)}%`} />
                    <InfoRow label="Reply Count" value={tokenInfo.reply_count || 0} />
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <a
                      href={`https://pump.fun/${selectedToken}`}
                      target="_blank" rel="noreferrer"
                      className="btn-sm"
                    >
                      View on pump.fun →
                    </a>
                    <a
                      href={`https://solscan.io/token/${selectedToken}`}
                      target="_blank" rel="noreferrer"
                      className="btn-sm"
                    >
                      Solscan →
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active boost jobs */}
          {jobs.length > 0 && (
            <div className="card">
              <div className="card-title">Boost Jobs</div>
              {jobs.map(job => (
                <div key={job.jobId} className="job-row">
                  <div className="job-row-left">
                    <span className={`badge ${job.status === 'active' ? 'badge-green' : 'badge-amber'}`}>
                      {job.status}
                    </span>
                    <span className="job-mint">{job.mintAddress?.slice(0, 10)}...</span>
                  </div>
                  <div className="job-row-right">
                    <span className="muted-sm">{job.tradesExecuted} trades</span>
                    <span className="muted-sm">{job.totalVolumeSol?.toFixed(2)} SOL vol</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="ir-label">{label}</span>
      <span className="ir-val">{value}</span>
    </div>
  );
}
