import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { SolanaWalletProvider, useSolanaWallet } from './lib/wallet';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { getWalletBalance } from './lib/api';
import LaunchTab from './components/LaunchTab';
import AntiRugTab from './components/AntiRugTab';
import BoostTab from './components/BoostTab';
import DashboardTab from './components/DashboardTab';
import './styles/app.css';

const TABS = [
  { id: 'launch',    label: 'Launch Token' },
  { id: 'antirug',  label: 'Anti-Rug' },
  { id: 'boost',    label: 'Boost Engine' },
  { id: 'dashboard',label: 'Dashboard' },
];

function AppInner() {
  const [activeTab, setActiveTab] = useState('launch');
  const wallet = useSolanaWallet();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (!wallet.publicKey) { setBalance(null); return; }
    getWalletBalance(wallet.publicKey.toBase58())
      .then(r => setBalance(r.sol))
      .catch(() => {});
  }, [wallet.publicKey]);

  return (
    <div className="app-shell">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a1a24', color: '#f1f0ff', border: '1px solid rgba(120,80,255,0.25)', fontFamily: "'DM Mono', monospace", fontSize: '0.85rem' },
          success: { iconTheme: { primary: '#10b981', secondary: '#1a1a24' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1a1a24' } },
        }}
      />

      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">NOX<span>IS</span></div>
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

      {/* Tabs */}
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

      {/* Content */}
      <main className="app-main">
        {activeTab === 'launch' && <LaunchTab />}
        {activeTab === 'antirug' && <AntiRugTab />}
        {activeTab === 'boost' && <BoostTab />}
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
