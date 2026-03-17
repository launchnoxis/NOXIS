import React, { useState } from 'react';

const SECTIONS = [
  { id: 'readme',    label: 'Read Me' },
  { id: 'how',       label: 'How It Works' },
  { id: 'launch',    label: 'Launching a Token' },
  { id: 'antirug',   label: 'Anti-Rug Suite' },
  { id: 'vesting',   label: 'Dev Vesting' },
  { id: 'boost',     label: 'Volume Engine' },
  { id: 'wallets',   label: 'Wallets & Security' },
  { id: 'faq',       label: 'FAQ' },
];

const CONTENT = {
  readme: {
    title: 'Noxis',
    subtitle: 'Solana token launcher with anti-rug infrastructure',
    body: [
      { type: 'h2', text: 'What is Noxis?' },
      { type: 'p', text: 'Noxis is an advanced token launcher for pump.fun. It gives creators everything they need to deploy a token safely — LP locking, dev vesting, mint authority renounce, and a volume engine — all in one interface.' },
      { type: 'p', text: 'The server never holds your private keys. Transactions are built unsigned and returned to your wallet for signing. Your keys stay yours.' },
      { type: 'h2', text: 'Why it matters' },
      { type: 'p', text: "Most tokens die because the creator extracts value and leaves. Noxis doesn't change human nature — but it gives buyers verifiable proof that the creator has locked their tokens and LP before launch." },
      { type: 'p', text: 'No new tax on traders. No manual intervention. Just a safer launch with protection built in from block one.' },
      { type: 'h2', text: 'Links' },
      { type: 'links', items: ['pump.fun', 'Solana', 'Phantom Wallet', 'Solflare'] },
    ],
  },
  how: {
    title: 'How It Works',
    subtitle: 'From wallet connect to live token in 3 steps',
    body: [
      { type: 'h2', text: 'Step 1 — Fill in your token' },
      { type: 'p', text: 'Enter your token name, ticker symbol, description, and upload an image. You can drag and drop from your desktop or paste a URL. Your image gets pinned to IPFS via Pinata for permanent, decentralized storage.' },
      { type: 'h2', text: 'Step 2 — Configure protection' },
      { type: 'p', text: 'In the Anti-Rug tab, set your LP lock duration (30 days to permanent burn), configure dev vesting with a cliff period, and toggle protections like mint renounce, freeze renounce, and max wallet cap.' },
      { type: 'h2', text: 'Step 3 — Sign and deploy' },
      { type: 'p', text: 'Connect your wallet (Phantom, Solflare, or Coinbase). Click "Launch on pump.fun". The backend builds a Solana transaction, partially signs it with the ephemeral mint keypair, and returns it to your wallet for final signing. You approve — your token goes live.' },
      { type: 'callout', text: 'Noxis never stores or transmits your private keys. All signing happens in your browser wallet.' },
    ],
  },
  launch: {
    title: 'Launching a Token',
    subtitle: 'Full guide to the Launch Token tab',
    body: [
      { type: 'h2', text: 'Token Identity' },
      { type: 'p', text: 'Name: Up to 32 characters. This is what shows on pump.fun and in wallets.' },
      { type: 'p', text: 'Symbol: Up to 10 characters, uppercase. This is your ticker (e.g. DOGE, PEPE).' },
      { type: 'p', text: 'Description: Up to 500 characters. Shown on the pump.fun token page.' },
      { type: 'h2', text: 'Token Image' },
      { type: 'p', text: 'Upload from your desktop (PNG, JPG, GIF up to 5MB) or paste a URL. The image is automatically uploaded to IPFS and embedded in your token metadata.' },
      { type: 'h2', text: 'Launch Settings' },
      { type: 'p', text: 'Initial Dev Buy: How much SOL to spend buying your own token at launch. This sets an initial price and shows buyers there is skin in the game. Range: 0–5 SOL.' },
      { type: 'p', text: 'Slippage Tolerance: Maximum price movement accepted during the buy transaction. Default 5% is suitable for most launches.' },
      { type: 'h2', text: 'Socials' },
      { type: 'p', text: 'Twitter, Telegram, and website links are embedded in the token metadata and shown on pump.fun.' },
    ],
  },
  antirug: {
    title: 'Anti-Rug Suite',
    subtitle: 'Verifiable protections for your token',
    body: [
      { type: 'h2', text: 'LP Lock' },
      { type: 'p', text: 'Automatically locks liquidity at launch. Options range from 30 days to permanent burn. Buyers can verify the lock on-chain before purchasing.' },
      { type: 'h2', text: 'Mint Authority Renounce' },
      { type: 'p', text: 'Permanently removes the ability to mint new tokens. Once renounced, the supply is fixed forever. This is encoded directly into the launch transaction.' },
      { type: 'h2', text: 'Freeze Authority Renounce' },
      { type: 'p', text: 'Removes the ability to freeze any token holder\'s wallet. Without this, a malicious creator could freeze wallets and prevent selling.' },
      { type: 'h2', text: 'Max Wallet Cap' },
      { type: 'p', text: 'Limits each wallet to a maximum of 2% of the total supply. Prevents whales from accumulating and dumping.' },
      { type: 'h2', text: 'Honeypot Protection' },
      { type: 'p', text: 'Verifies that the sell function is always enabled before launch. Prevents tokens where buyers can buy but never sell.' },
      { type: 'callout', text: 'A higher Security Score means more protections are active. Buyers can see this score on your token page.' },
    ],
  },
  vesting: {
    title: 'Dev Vesting',
    subtitle: 'Lock your allocation to build trust',
    body: [
      { type: 'h2', text: 'What is vesting?' },
      { type: 'p', text: 'Vesting locks your developer allocation and releases it gradually over time. This prevents the classic move of dumping all dev tokens on buyers immediately after launch.' },
      { type: 'h2', text: 'Configuration' },
      { type: 'p', text: 'Dev Allocation: Percentage of total supply reserved for the dev wallet. Recommended: under 5%.' },
      { type: 'p', text: 'Cliff Period: How long before ANY tokens are released. Common choices: 30 or 60 days.' },
      { type: 'p', text: 'Vesting Duration: Total time over which tokens are released linearly. Common: 6–12 months.' },
      { type: 'h2', text: 'Schedule Preview' },
      { type: 'p', text: 'The Anti-Rug tab shows a full month-by-month vesting table so you can show buyers exactly when and how much you\'ll receive.' },
    ],
  },
  boost: {
    title: 'Volume Engine',
    subtitle: 'Keep your token alive after launch',
    body: [
      { type: 'h2', text: 'Volume Bot' },
      { type: 'p', text: 'Schedules automated buy/sell cycles at configurable intervals. This creates organic-looking chart activity and keeps your token appearing in pump.fun active feeds.' },
      { type: 'h2', text: 'Configuration' },
      { type: 'p', text: 'Daily SOL Target: Total volume to generate per day across all trades.' },
      { type: 'p', text: 'Trade Frequency: How often to execute a trade. Every 1–5 minutes.' },
      { type: 'p', text: 'Max Trade Size: Cap per individual trade in SOL.' },
      { type: 'h2', text: 'Trending Booster' },
      { type: 'p', text: 'Coordinates buys to push your token into the pump.fun trending page at a target time window after launch (e.g. 2 hours post-launch when initial hype is strongest).' },
      { type: 'callout', text: 'Volume bots require funded sub-wallets configured on your backend server. See the README for setup instructions.' },
    ],
  },
  wallets: {
    title: 'Wallets & Security',
    subtitle: 'How Noxis handles your keys',
    body: [
      { type: 'h2', text: 'Supported wallets' },
      { type: 'p', text: 'Phantom, Solflare, and Coinbase Wallet are supported. Install the browser extension for your preferred wallet before connecting.' },
      { type: 'h2', text: 'Key security' },
      { type: 'p', text: 'Noxis follows a server-side unsigned transaction model. The backend builds the transaction and returns it as base64. Your wallet signs it locally in your browser. Your private key never leaves your device.' },
      { type: 'h2', text: 'Mint keypair' },
      { type: 'p', text: 'Each token launch generates a fresh random mint keypair server-side. The keypair bytes are returned to the frontend for co-signing and are never stored.' },
      { type: 'callout', text: 'Never share your seed phrase or private key with anyone — including Noxis support. We will never ask for it.' },
    ],
  },
  faq: {
    title: 'FAQ',
    subtitle: 'Frequently asked questions',
    body: [
      { type: 'h2', text: 'Does Noxis work on mainnet?' },
      { type: 'p', text: 'Yes. Set SOLANA_NETWORK=mainnet-beta in your backend .env file. Always test thoroughly on devnet first.' },
      { type: 'h2', text: 'What does it cost to launch?' },
      { type: 'p', text: 'You pay Solana network fees (~0.01–0.05 SOL) plus your optional dev buy amount. Noxis itself charges no platform fee.' },
      { type: 'h2', text: 'Can I use any wallet?' },
      { type: 'p', text: 'Phantom, Solflare, and Coinbase Wallet are supported. Backpack support is coming.' },
      { type: 'h2', text: 'Is the anti-rug protection mandatory?' },
      { type: 'p', text: 'No, all protections are optional toggles. But we strongly recommend enabling at minimum mint renounce and LP lock for any public launch.' },
      { type: 'h2', text: 'Where is my token metadata stored?' },
      { type: 'p', text: 'On IPFS via Pinata. It\'s permanent, decentralized, and censorship-resistant. You\'ll need a free Pinata API key in your backend config.' },
      { type: 'h2', text: 'What is the volume engine?' },
      { type: 'p', text: 'A scheduled bot that generates buy/sell activity on your token to keep the chart moving and maintain visibility on pump.fun.' },
    ],
  },
};

export default function DocsPage({ onBack }) {
  const [active, setActive] = useState('readme');
  const section = CONTENT[active];

  return (
    <div className="docs-shell">

      {/* Sidebar */}
      <aside className="docs-sidebar">
        <div className="docs-sidebar-logo">
          <svg width="20" height="20" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="dg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a5b4fc"/>
                <stop offset="100%" stopColor="#6366f1"/>
              </linearGradient>
            </defs>
            <path d="M6 34 L6 6 L34 34 L34 6" fill="none" stroke="url(#dg)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="6"  cy="6"  r="3" fill="#a5b4fc"/>
            <circle cx="34" cy="6"  r="3" fill="#a5b4fc"/>
            <circle cx="6"  cy="34" r="3" fill="#6366f1"/>
            <circle cx="34" cy="34" r="3" fill="#6366f1"/>
          </svg>
          <span className="docs-sidebar-title">Noxis Docs</span>
        </div>

        <nav className="docs-nav">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`docs-nav-item ${active === s.id ? 'active' : ''}`}
              onClick={() => setActive(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="docs-sidebar-footer">
          <button className="docs-back-btn" onClick={onBack}>← Back to Noxis</button>
          <div className="docs-powered">Powered by Noxis</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="docs-main">

        {/* Hero banner */}
        <div className="docs-hero">
          <h1 className="docs-hero-title">{section.title}</h1>
          <p className="docs-hero-sub">{section.subtitle}</p>
        </div>

        <div className="docs-content">
          {section.body.map((block, i) => {
            if (block.type === 'h2') return (
              <h2 key={i} className="docs-h2">{block.text}</h2>
            );
            if (block.type === 'p') return (
              <p key={i} className="docs-p">{block.text}</p>
            );
            if (block.type === 'callout') return (
              <div key={i} className="docs-callout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {block.text}
              </div>
            );
            if (block.type === 'links') return (
              <div key={i} className="docs-links">
                {block.items.map((l, j) => (
                  <span key={j} className="docs-link-chip">{l}</span>
                ))}
              </div>
            );
            return null;
          })}
        </div>

        {/* Pagination */}
        <div className="docs-pagination">
          {SECTIONS.findIndex(s => s.id === active) > 0 && (
            <button
              className="docs-page-btn"
              onClick={() => setActive(SECTIONS[SECTIONS.findIndex(s => s.id === active) - 1].id)}
            >
              ← {SECTIONS[SECTIONS.findIndex(s => s.id === active) - 1].label}
            </button>
          )}
          {SECTIONS.findIndex(s => s.id === active) < SECTIONS.length - 1 && (
            <button
              className="docs-page-btn docs-page-btn-next"
              onClick={() => setActive(SECTIONS[SECTIONS.findIndex(s => s.id === active) + 1].id)}
            >
              {SECTIONS[SECTIONS.findIndex(s => s.id === active) + 1].label} →
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
