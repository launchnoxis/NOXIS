// NoxisLoader.jsx — Uses the real Noxis logo
// Usage: <NoxisLoader visible={isLoading} message="Deploying token..." />

import { useEffect, useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400&display=swap');

  .nx-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #0b0d1a;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
  }

  .nx-overlay.visible {
    opacity: 1;
    pointer-events: all;
  }

  .nx-overlay::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 50% at 50% 40%, rgba(99,102,241,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .nx-brand {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 48px;
    animation: fadeUp 0.4s ease both;
  }

  .nx-logo-wrap {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
  }

  .nx-wordmark {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: 24px;
    color: #ffffff;
    letter-spacing: -0.01em;
  }

  .nx-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 32px 44px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 22px;
    min-width: 300px;
    animation: fadeUp 0.4s 0.1s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .nx-spinner {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 2px solid rgba(99,102,241,0.2);
    border-top-color: #6366f1;
    animation: spin 0.85s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .nx-msg {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 500;
    font-size: 15px;
    color: rgba(255,255,255,0.85);
    letter-spacing: -0.01em;
    text-align: center;
  }

  .nx-bar-track {
    width: 100%;
    height: 3px;
    background: rgba(99,102,241,0.15);
    border-radius: 99px;
    overflow: hidden;
  }

  .nx-bar-fill {
    height: 100%;
    background: #6366f1;
    border-radius: 99px;
    animation: sweep 1.6s ease-in-out infinite;
  }

  @keyframes sweep {
    0%   { width: 0%;   margin-left: 0%; }
    50%  { width: 55%;  margin-left: 22%; }
    100% { width: 0%;   margin-left: 100%; }
  }

  .nx-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(255,255,255,0.28);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-top: -6px;
  }
`;

const MESSAGES = [
  "Connecting to Solana...",
  "Uploading metadata...",
  "Preparing transaction...",
  "Confirming on-chain...",
  "Almost done...",
];

export default function NoxisLoader({ visible = false, message = null }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!visible) { setMsgIndex(0); return; }
    const interval = setInterval(() => {
      setMsgIndex(i => (i + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <>
      <style>{styles}</style>
      <div className={`nx-overlay${visible ? " visible" : ""}`}>

        <div className="nx-brand">
          <div className="nx-logo-wrap">
            <svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="ng" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#a5b4fc"/>
                  <stop offset="100%" stopColor="#6366f1"/>
                </linearGradient>
              </defs>
              <path d="M8 36 L8 8 L36 36 L36 8" fill="none" stroke="url(#ng)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="8" cy="8" r="3" fill="#a5b4fc"/>
              <circle cx="36" cy="8" r="3" fill="#a5b4fc"/>
              <circle cx="8" cy="36" r="3" fill="#6366f1"/>
              <circle cx="36" cy="36" r="3" fill="#6366f1"/>
            </svg>
          </div>
          <span className="nx-wordmark">Noxis</span>
        </div>

        <div className="nx-card">
          <div className="nx-spinner" />
          <div className="nx-msg">{message || MESSAGES[msgIndex]}</div>
          <div className="nx-bar-track">
            <div className="nx-bar-fill" />
          </div>
          <div className="nx-sub">Powered by Solana</div>
        </div>

      </div>
    </>
  );
}


// ─── USAGE ──────────────────────────────────────────────────────────────────
//
// import { useState } from 'react';
// import NoxisLoader from './NoxisLoader';
//
// const handleDeploy = async () => {
//   setLoading(true);
//   try {
//     await deployToken(tokenData);
//   } finally {
//     setLoading(false);
//   }
// };
//
// return (
//   <>
//     <NoxisLoader visible={loading} message="Deploying token..." />
//     <button onClick={handleDeploy}>Deploy</button>
//   </>
// );
//
// ─── 2s MINIMUM (prevents flash on fast connections) ────────────────────────
//
// const withMinLoader = (fn) => async () => {
//   setLoading(true);
//   const [result] = await Promise.all([fn(), new Promise(r => setTimeout(r, 2000))]);
//   setLoading(false);
//   return result;
// };
// ────────────────────────────────────────────────────────────────────────────
