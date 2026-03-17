import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { SolanaWalletProvider, useSolanaWallet } from './lib/wallet';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { getWalletBalance } from './lib/api';
import LaunchTab from './components/LaunchTab';
import AntiRugTab from './components/AntiRugTab';
import BoostTab from './components/BoostTab';
import DashboardTab from './components/DashboardTab';
import DocsPage from './components/DocsPage';
import './styles/app.css';

const TABS = [
  { id: 'launch',    label: 'Launch Token' },
  { id: 'antirug',  label: 'Anti-Rug' },
  { id: 'boost',    label: 'Boost Engine' },
  { id: 'dashboard',label: 'Dashboard' },
];

const NLogo = ({ size = 32, light = false }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
    <defs>
      <linearGradient id="ng" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={light ? '#a5b4fc' : '#818cf8'}/>
        <stop offset="100%" stopColor={light ? '#6366f1' : '#4f46e5'}/>
      </linearGradient>
    </defs>
    <path d="M6 34 L6 6 L34 34 L34 6" fill="none" stroke="url(#ng)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="6"  cy="6"  r="3.5" fill="#a5b4fc"/>
    <circle cx="34" cy="6"  r="3.5" fill="#a5b4fc"/>
    <circle cx="6"  cy="34" r="3.5" fill="#6366f1"/>
    <circle cx="34" cy="34" r="3.5" fill="#6366f1"/>
  </svg>
);

function LandingPage({ onLaunch, onDocs }) {
  return (
    <div className="landing">

      {/* Nav */}
      <nav className="land-nav">
        <div className="land-nav-logo">
          <NLogo size={28} light />
          <span className="land-logo-text">Noxis</span>
        </div>
        <div className="land-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <button className="land-nav-docs" onClick={onDocs}>Docs</button>
        </div>
        <button className="btn-launch-app" onClick={onLaunch}>Launch App →</button>
      </nav>

      {/* Hero */}
      <section className="land-hero">
        <div className="land-hero-badge">
          <span className="badge-dot" /> Private Access · Solana
        </div>
        <h1 className="land-hero-title">
          The fastest way to<br/>
          <span className="land-hero-glow">launch on pump.fun.</span>
        </h1>
        <p className="land-hero-sub">
          One-click token deployment with built-in anti-rug protection,<br/>
          dev vesting, LP lock, and a volume engine — all in one place.
        </p>
        <div className="land-hero-btns">
          <button className="btn-primary-land" onClick={onLaunch}>Launch Your Token →</button>
          <button className="btn-ghost-land" onClick={onDocs}>Read Documentation</button>
        </div>

        {/* Stats */}
        <div className="land-stats">
          <div className="land-stat">
            <div className="land-stat-val">1-click</div>
            <div className="land-stat-label">Deployment</div>
          </div>
          <div className="land-stat-div"/>
          <div className="land-stat">
            <div className="land-stat-val">0%</div>
            <div className="land-stat-label">Rug risk with LP lock</div>
          </div>
          <div className="land-stat-div"/>
          <div className="land-stat">
            <div className="land-stat-val">3</div>
            <div className="land-stat-label">Wallets supported</div>
          </div>
          <div className="land-stat-div"/>
          <div className="land-stat">
            <div className="land-stat-val">24/7</div>
            <div className="land-stat-label">Volume engine</div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="land-ticker">
        {['LAUNCH IN SECONDS', 'ANTI-RUG BUILT IN', 'LP LOCK ON LAUNCH', 'DEV VESTING', 'VOLUME ENGINE', 'PUMP.FUN NATIVE', 'PHANTOM · SOLFLARE', 'IPFS METADATA'].map((t, i) => (
          <span key={i}>{t} <span className="tick-dot">·</span> </span>
        ))}
        {['LAUNCH IN SECONDS', 'ANTI-RUG BUILT IN', 'LP LOCK ON LAUNCH', 'DEV VESTING', 'VOLUME ENGINE', 'PUMP.FUN NATIVE', 'PHANTOM · SOLFLARE', 'IPFS METADATA'].map((t, i) => (
          <span key={`b${i}`}>{t} <span className="tick-dot">·</span> </span>
        ))}
      </div>

      {/* Features */}
      <section className="land-features" id="features">
        <div className="land-section-label">What's included</div>
        <h2 className="land-section-title">Everything your token needs<br/><span className="land-white-hl">to survive.</span></h2>

        <div className="feat-grid">
          <div className="feat-card">
            <div className="feat-icon feat-icon-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <h3>One-click launch</h3>
            <p>Fill in details, connect wallet, hit deploy. Your token is live on pump.fun in under 30 seconds.</p>
          </div>
          <div className="feat-card feat-card-highlight">
            <div className="feat-card-glow"/>
            <div className="feat-icon feat-icon-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3>Anti-rug suite</h3>
            <p>LP auto-lock, mint renounce, freeze renounce, max wallet cap, and honeypot protection — all pre-configured.</p>
            <div className="feat-badge">Most important</div>
          </div>
          <div className="feat-card">
            <div className="feat-icon feat-icon-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h3>Dev vesting</h3>
            <p>Auto-vest your allocation over 3–12 months with a cliff period. Buyers can verify on-chain before they buy.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon feat-icon-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            </div>
            <h3>Volume engine</h3>
            <p>Schedule automated buy/sell cycles to keep your chart alive and push to the pump.fun trending page.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon feat-icon-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
            <h3>IPFS metadata</h3>
            <p>Token image and metadata are automatically pinned to IPFS via Pinata — permanent and decentralized.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon feat-icon-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3>Wallet native</h3>
            <p>Connects with Phantom, Solflare, and Coinbase Wallet. The server never touches your private keys.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="land-how" id="how">
        <div className="land-section-label">Simple process</div>
        <h2 className="land-section-title">From idea to live token<br/><span className="land-white-hl">in 3 steps.</span></h2>
        <div className="how-steps">
          <div className="how-step">
            <div className="how-num">01</div>
            <h3>Fill in your token</h3>
            <p>Name, ticker, description, image, and socials. Upload from your desktop or paste a URL.</p>
          </div>
          <div className="how-arrow">→</div>
          <div className="how-step">
            <div className="how-num">02</div>
            <h3>Configure protection</h3>
            <p>Set LP lock duration, dev vesting schedule, and toggle anti-rug features to your preference.</p>
          </div>
          <div className="how-arrow">→</div>
          <div className="how-step">
            <div className="how-num">03</div>
            <h3>Sign and deploy</h3>
            <p>Connect your wallet, approve the transaction, and your token is live on pump.fun instantly.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="land-cta">
        <div className="land-cta-glow"/>
        <NLogo size={48} light />
        <h2>Ready to launch?</h2>
        <p>Join the degens building tokens that actually survive.</p>
        <button className="btn-primary-land" onClick={onLaunch}>Open the App →</button>
      </section>

      {/* Footer */}
      <footer className="land-footer">
        <div className="land-footer-logo">
          <NLogo size={18} />
          <span>Noxis</span>
        </div>
        <span>Built on Solana · pump.fun native</span>
        <span>© 2025 Noxis</span>
      </footer>
    </div>
  );
}

function AppInner() {
  const [view, setView] = useState('landing');
  const [activeTab, setActiveTab] = useState('launch');
  const wallet = useSolanaWallet();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (!wallet.publicKey) { setBalance(null); return; }
    getWalletBalance(wallet.publicKey.toBase58())
      .then(r => setBalance(r.sol))
      .catch(() => {});
  }, [wallet.publicKey]);

  if (view === 'docs') {
    return <DocsPage onBack={() => setView('landing')} />;
  }

  if (view === 'landing') {
    return <LandingPage onLaunch={() => setView('app')} onDocs={() => setView('docs')} />;
  }

  return (
    <div className="app-shell">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#161b27', color: '#f0f4ff', border: '1px solid rgba(99,102,241,0.25)', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' },
          success: { iconTheme: { primary: '#10b981', secondary: '#161b27' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#161b27' } },
        }}
      />

      <header className="app-header">
        <div className="header-left">
          <button className="logo" onClick={() => setView('landing')} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:10,padding:0}}>
            <NLogo size={28} />
            <span className="logo-text">Noxis</span>
          </button>
          <div className="tagline">Solana Token Launcher · Anti-Rug Suite · Private Access</div>
        </div>
        <div className="header-right">
          {wallet.publicKey && balance !== null && (
            <div className="sol-badge">
              <span className="sol-dot" />
              {balance.toFixed(3)} SOL
            </div>
          )}
          <WalletMultiButton />
        </div>
      </header>

      <nav className="tab-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span className="tab-dot"></span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activeTab === 'launch'    && <LaunchTab />}
        {activeTab === 'antirug'   && <AntiRugTab />}
        {activeTab === 'boost'     && <BoostTab />}
        {activeTab === 'dashboard' && <DashboardTab />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <SolanaWalletProvider>
      <AppInner />
    </SolanaWalletProvider>
  );
}
