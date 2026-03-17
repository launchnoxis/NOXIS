import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useSolanaWallet } from '../lib/wallet';
import { buildLaunchTx, submitSignedTx } from '../lib/api';

export default function LaunchTab() {
  const wallet = useSolanaWallet();

  const [form, setForm] = useState({
    name: '', symbol: '', description: '', imageUrl: '',
    twitter: '', telegram: '', website: '',
    devBuySol: 0.5, slippageBps: 500,
  });
  const [launching, setLaunching] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(''); // current step label

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleLaunch() {
    if (!wallet.publicKey) return toast.error('Connect your wallet first');
    if (!form.name || !form.symbol) return toast.error('Name and symbol are required');

    setLaunching(true);
    setResult(null);

    try {
      setStep('Uploading metadata to IPFS...');
      const buildRes = await buildLaunchTx({
        creatorWallet: wallet.publicKey.toBase58(),
        ...form,
        symbol: form.symbol.toUpperCase(),
      });

      // Lightning API handles everything — no wallet signing needed
      setResult({
        signature: buildRes.signature,
        mintAddress: buildRes.mintAddress,
        metadataUri: buildRes.metadataUri,
        pumpFunUrl: buildRes.pumpFunUrl,
        explorerUrl: buildRes.explorerUrl,
      });
      toast.success('Token launched successfully!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLaunching(false);
      setStep('');
    }
  }

  return (
    <div className="tab-content">
      <div className="page-hero">
        <div className="hero-label">Solana · pump.fun</div>
        <h1 className="hero-title">Launch your token.<br/><span className="hero-highlight">In one click.</span></h1>
        <p className="hero-sub">Fill in your token details, connect your wallet, and deploy directly to pump.fun with anti-rug protection built in.</p>
      </div>
      <div className="grid2">
        {/* Left column */}
        <div>
          <div className="card mb">
            <div className="card-title">Token Identity</div>
            <label>Token Name</label>
            <input
              type="text" placeholder="e.g. MoonDoge" value={form.name}
              onChange={(e) => set('name', e.target.value)} maxLength={32}
            />
            <label>Ticker Symbol</label>
            <input
              type="text" placeholder="e.g. MDOGE" value={form.symbol}
              onChange={(e) => set('symbol', e.target.value.toUpperCase())} maxLength={10}
            />
            <label>Description</label>
            <textarea
              placeholder="Tell the community what this coin is about..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)} maxLength={500}
              rows={3}
            />
            <label>Token Image</label>
            <ImageUploader value={form.imageUrl} onChange={(url) => set('imageUrl', url)} />
          </div>

          <div className="card">
            <div className="card-title">Socials</div>
            <label>Twitter / X</label>
            <input type="text" placeholder="https://twitter.com/..." value={form.twitter}
              onChange={(e) => set('twitter', e.target.value)} />
            <label>Telegram</label>
            <input type="text" placeholder="https://t.me/..." value={form.telegram}
              onChange={(e) => set('telegram', e.target.value)} />
            <label>Website</label>
            <input type="text" placeholder="https://..." value={form.website}
              onChange={(e) => set('website', e.target.value)} />
          </div>
        </div>

        {/* Right column */}
        <div>
          <div className="card mb">
            <div className="card-title">Token Preview</div>
            <div className="token-preview">
              <div className="token-img">
                {form.imageUrl
                  ? <img src={form.imageUrl} alt="token" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:10}} />
                  : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.3}}><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                }
              </div>
              <div>
                <div className="token-name">{form.name || 'My Token'}</div>
                <div className="token-sym">${form.symbol || 'TOKEN'}</div>
                <div className="badges-row">
                  <span className="badge badge-green">pump.fun</span>
                  <span className="badge badge-purple">Anti-Rug</span>
                </div>
              </div>
            </div>

            <div className="section-head" style={{ marginTop: '1rem' }}>Launch Settings</div>

            <label>Initial Dev Buy (SOL)</label>
            <div className="range-wrap">
              <input type="range" min="0" max="5" step="0.1" value={form.devBuySol}
                onChange={(e) => set('devBuySol', parseFloat(e.target.value))} />
              <span className="range-val">{form.devBuySol.toFixed(1)} SOL</span>
            </div>

            <label>Slippage Tolerance</label>
            <div className="range-wrap">
              <input type="range" min="100" max="3000" step="100" value={form.slippageBps}
                onChange={(e) => set('slippageBps', parseInt(e.target.value))} />
              <span className="range-val">{(form.slippageBps / 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Wallet status */}
          <div className="card mb">
            <div className="card-title">Wallet</div>
            <WalletStatus wallet={wallet} />
          </div>

          {/* Launch button */}
          <button
            className={`btn btn-primary${launching ? ' loading' : ''}`}
            onClick={handleLaunch}
            disabled={launching || !wallet.publicKey}
          >
            {launching ? (
              <><span className="spinner" /> {step || 'Launching...'}</>
            ) : (
              <><span className="pulse" /> Launch on pump.fun</>
            )}
          </button>

          {/* Result */}
          {result && (
            <div className="launch-result">
              <div className="result-title">🎉 Token Launched!</div>
              <div className="result-row">
                <span className="rl">Mint</span>
                <a href={result.pumpFunUrl} target="_blank" rel="noreferrer" className="rlink">
                  {result.mintAddress.slice(0, 8)}...{result.mintAddress.slice(-8)}
                </a>
              </div>
              <div className="result-row">
                <span className="rl">TX</span>
                <a href={result.explorerUrl} target="_blank" rel="noreferrer" className="rlink">
                  {result.signature.slice(0, 12)}...
                </a>
              </div>
              <div className="result-links">
                <a href={result.pumpFunUrl} target="_blank" rel="noreferrer" className="btn-sm">
                  View on pump.fun →
                </a>
                <a href={result.explorerUrl} target="_blank" rel="noreferrer" className="btn-sm">
                  Solscan →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ImageUploader({ value, onChange }) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const inputRef = React.useRef();

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      onChange(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function handleUrlInput(e) {
    setPreview(e.target.value);
    onChange(e.target.value);
  }

  return (
    <div>
      <div
        className={`img-drop-zone${dragging ? ' dragging' : ''}`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {preview ? (
          <div className="img-preview-wrap">
            <img src={preview} alt="preview" className="img-preview" />
            <span className="img-change">Click to change</span>
          </div>
        ) : (
          <div className="img-placeholder">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Drop image or click to upload</span>
            <span className="img-sub">PNG, JPG, GIF up to 5MB</span>
          </div>
        )}
      </div>
      <input
        type="text"
        placeholder="Or paste image URL..."
        value={typeof value === 'string' && value.startsWith('http') ? value : ''}
        onChange={handleUrlInput}
        style={{ marginTop: 8 }}
      />
    </div>
  );
}

function WalletStatus({ wallet }) {
  if (!wallet.publicKey) {
    return (
      <div className="wallet-box">
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>No wallet connected</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 3 }}>
            Connect Phantom, Solflare, or Backpack
          </div>
        </div>
        <WalletConnectButton />
      </div>
    );
  }

  const addr = wallet.publicKey.toBase58();
  return (
    <div className="wallet-box connected">
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--green)' }}>
          ● Connected
        </div>
        <div className="wallet-addr">
          {addr.slice(0, 6)}...{addr.slice(-6)}
        </div>
      </div>
      <button
        className="btn-sm danger"
        onClick={() => wallet.disconnect()}
      >
        Disconnect
      </button>
    </div>
  );
}

function WalletConnectButton() {
  // Uses the wallet adapter modal
  const { select, wallets } = useSolanaWallet();
  const [open, setOpen] = useState(false);

  const readyWallets = wallets.filter(
    (w) => w.readyState === 'Installed' || w.readyState === 'Loadable'
  );

  if (!open) {
    return (
      <button className="btn-sm" onClick={() => setOpen(true)}>Connect</button>
    );
  }

  return (
    <div className="wallet-list">
      {readyWallets.length === 0 ? (
        <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
          No wallet detected. Install Phantom or Solflare.
        </div>
      ) : (
        readyWallets.map((w) => (
          <button
            key={w.adapter.name}
            className="wallet-option"
            onClick={() => { select(w.adapter.name); setOpen(false); }}
          >
            {w.adapter.name}
          </button>
        ))
      )}
    </div>
  );
}
