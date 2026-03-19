import React, { useState, useEffect } from 'react';
import { useSolanaWallet } from '../lib/wallet';
import { getWalletBalance, getWalletTokens, listVolumeJobs } from '../lib/api';

const DEXSCREENER = 'https://api.dexscreener.com/latest/dex/tokens';

export default function DashboardTab() {
  const wallet = useSolanaWallet();
  const [balance, setBalance] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [network, setNetwork] = useState('mainnet-beta');
  const [loading, setLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(false);

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
    setTokenLoading(true);
    try {
      // Use DexScreener — doesn't get blocked on Railway
      const res = await fetch(`${DEXSCREENER}/${mint}`);
      const data = await res.json();
      const pair = data.pairs?.[0];
      if (pair) {
        setTokenInfo({
          name:         pair.baseToken?.name || 'Unknown',
          symbol:       pair.baseToken?.symbol || '?',
          image:        pair.info?.imageUrl || null,
          priceUsd:     parseFloat(pair.priceUsd || 0),
          marketCap:    pair.marketCap || 0,
          volume24h:    pair.volume?.h24 || 0,
          liquidity:    pair.liquidity?.usd || 0,
          priceChange:  pair.priceChange?.h24 || 0,
          dexId:        pair.dexId,
          pumpUrl:      `https://pump.fun/${mint}`,
          solscanUrl:   `https://solscan.io/token/${mint}`,
        });
      } else {
        setTokenInfo(null);
      }
    } catch {
      setTokenInfo(null);
    }
    setTokenLoading(false);
  }

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
          <div className="stat-label">Active Boost Jobs</div>
        </div>
      </div>

      {!wallet.publicKey && (
        <div className="card empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-title">Connect your wallet</div>
          <div className="empty-desc">Connect a Solana wallet to see your portfolio and token analytics</div>
        </div>
      )}

      {wallet.publicKey && (
        <>
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
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="tr-mint">{t.mint.slice(0, 8)}...{t.mint.slice(-6)}</div>
                    <div className="tr-amount">{t.amount?.toLocaleString()}</div>
                    <div className="tr-arrow">→</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Token detail */}
          {selectedToken && (
            <div className="card mb">
              <div className="card-title">Token Details</div>
              {tokenLoading ? (
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>Loading...</div>
              ) : !tokenInfo ? (
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>
                  No market data found. Token may still be on bonding curve with low activity.
                </div>
              ) : (
                <>
                  <div className="token-preview" style={{ marginBottom: '1rem' }}>
                    <div className="token-img">
                      {tokenInfo.image
                        ? <img src={tokenInfo.image} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }} />
                        : '🪙'}
                    </div>
                    <div>
                      <div className="token-name">{tokenInfo.name}</div>
                      <div className="token-sym">${tokenInfo.symbol}</div>
                      <div className="badges-row">
                        <span className={`badge ${tokenInfo.dexId === 'raydium' ? 'badge-green' : 'badge-purple'}`}>
                          {tokenInfo.dexId === 'raydium' ? 'Graduated' : 'pump.fun'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="info-grid">
                    <InfoRow label="Price" value={`$${tokenInfo.priceUsd.toFixed(8)}`} />
                    <InfoRow label="Market Cap" value={`$${(tokenInfo.marketCap / 1000).toFixed(1)}K`} />
                    <InfoRow label="24h Volume" value={`$${(tokenInfo.volume24h / 1000).toFixed(1)}K`} />
                    <InfoRow label="Liquidity" value={`$${(tokenInfo.liquidity / 1000).toFixed(1)}K`} />
                    <InfoRow
                      label="24h Change"
                      value={`${tokenInfo.priceChange >= 0 ? '+' : ''}${tokenInfo.priceChange.toFixed(2)}%`}
                      color={tokenInfo.priceChange >= 0 ? 'var(--green)' : 'var(--danger)'}
                    />
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <a href={tokenInfo.pumpUrl} target="_blank" rel="noreferrer" className="btn-sm">
                      pump.fun →
                    </a>
                    <a href={tokenInfo.solscanUrl} target="_blank" rel="noreferrer" className="btn-sm">
                      Solscan →
                    </a>
                  </div>
                </>
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
                    <span className="muted-sm">{job.tradesExecuted} cycles</span>
                    <span className="muted-sm">{job.totalVolumeSol?.toFixed(2)} SOL</span>
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

function InfoRow({ label, value, color }) {
  return (
    <div className="info-row">
      <span className="ir-label">{label}</span>
      <span className="ir-val" style={color ? { color } : {}}>{value}</span>
    </div>
  );
}
