import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useSolanaWallet } from '../lib/wallet';
import { previewVesting } from '../lib/api';

const BACKEND = 'https://noxis-backend-production.up.railway.app';

export default function AntiRugTab() {
  const wallet = useSolanaWallet();

  const [vestingSettings, setVestingSettings] = useState({
    mintAddress: '',
    devAlloc: 5,
    cliffDays: 30,
    vestingMonths: 6,
  });
  const [vestingPreview, setVestingPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submittingVest, setSubmittingVest] = useState(false);

  const set = (k, v) => setVestingSettings(s => ({ ...s, [k]: v }));

  async function loadVestingPreview() {
    setLoadingPreview(true);
    try {
      const res = await previewVesting({
        totalTokens: 1_000_000_000 * (vestingSettings.devAlloc / 100),
        cliffDays: vestingSettings.cliffDays,
        vestingMonths: vestingSettings.vestingMonths,
      });
      setVestingPreview(res);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleSetupVesting() {
    if (!wallet.publicKey) return toast.error('Connect your wallet first');
    if (!vestingSettings.mintAddress.trim()) return toast.error('Enter the token mint address');
    setSubmittingVest(true);
    try {
      const res = await fetch(`${BACKEND}/api/vesting/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderWallet:    wallet.publicKey.toBase58(),
          recipientWallet: wallet.publicKey.toBase58(),
          mintAddress:     vestingSettings.mintAddress.trim(),
          totalTokens:     1_000_000_000 * (vestingSettings.devAlloc / 100),
          cliffSeconds:    vestingSettings.cliffDays * 86400,
          vestingSeconds:  vestingSettings.vestingMonths * 30 * 86400,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to build vesting transaction');

      const { Transaction } = await import('@solana/web3.js');
      const txBytes = Buffer.from(data.transaction, 'base64');
      const tx = Transaction.from(txBytes);
      const signed = await wallet.signTransaction(tx);
      const rawTx = signed.serialize();

      const submitRes = await fetch(`${BACKEND}/api/vesting/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction: Buffer.from(rawTx).toString('base64') }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData.error || 'Failed to submit');

      toast.success('Vesting schedule created on-chain!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingVest(false);
    }
  }

  return (
    <div className="tab-content">
      <div className="page-hero">
        <div className="hero-label">Anti-Rug Suite</div>
        <h1 className="hero-title">Real protection.<br/><span className="hero-highlight">On-chain.</span></h1>
        <p className="hero-sub">Every Noxis token launches with mint and freeze authority renounced automatically. Set up dev token vesting to prove long-term commitment.</p>
      </div>

      {/* Automatic protections */}
      <div className="card mb">
        <div className="card-title">Automatic Protections</div>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
          Applied automatically on every pump.fun launch. No action needed — fully verifiable on-chain.
        </p>
        <div className="grid2">
          <AutoBadge
            title="Mint Authority Renounced"
            desc="No new tokens can ever be minted. Supply is permanently fixed at launch."
            accuracy="100% verifiable on-chain"
          />
          <AutoBadge
            title="Freeze Authority Renounced"
            desc="No wallet can ever be frozen. Holders always retain the ability to sell."
            accuracy="100% verifiable on-chain"
          />
        </div>
      </div>

      {/* LP Lock */}
      <div className="card mb">
        <div className="card-title">LP Lock</div>
        <div style={{
          display: 'flex', gap: 12, alignItems: 'flex-start',
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 10, padding: '14px 16px',
        }}>
          <span style={{ fontSize: 20 }}>⏳</span>
          <div>
            <div style={{ fontWeight: 600, color: '#f59e0b', fontSize: 14, marginBottom: 6 }}>
              Available after graduation to Pump.fun Swap
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
              pump.fun tokens run on a bonding curve — there is no LP pool to lock until the token graduates (~85 SOL raised) and moves to Pump.fun Swap. Once graduated, LP tokens can be locked via Streamflow or burned permanently. A one-click lock button will appear here once graduation is detected.
            </div>
          </div>
        </div>
      </div>

      {/* Dev Vesting */}
      <div className="card mb">
        <div className="card-title">Dev Token Vesting</div>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
          Lock your dev tokens into a vesting schedule via Streamflow. Tokens release linearly over time — proves you are not going to dump.
        </p>

        <label>Token Mint Address</label>
        <input
          type="text"
          placeholder="Paste your token mint address after launch..."
          value={vestingSettings.mintAddress}
          onChange={e => set('mintAddress', e.target.value)}
          style={{ fontFamily: 'monospace', fontSize: 12 }}
        />

        <label style={{ marginTop: 14 }}>Dev Allocation to Vest (%)</label>
        <div className="range-wrap">
          <input type="range" min={1} max={20} step={1}
            value={vestingSettings.devAlloc}
            onChange={e => set('devAlloc', parseInt(e.target.value))} />
          <span className="range-val">{vestingSettings.devAlloc}%</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
          = {(1_000_000_000 * vestingSettings.devAlloc / 100).toLocaleString()} tokens
        </div>

        <label style={{ marginTop: 14 }}>Cliff Period</label>
        <select value={vestingSettings.cliffDays}
          onChange={e => set('cliffDays', parseInt(e.target.value))}>
          <option value={0}>No Cliff</option>
          <option value={30}>30 Days</option>
          <option value={60}>60 Days</option>
          <option value={90}>90 Days</option>
        </select>

        <label style={{ marginTop: 14 }}>Vesting Duration</label>
        <select value={vestingSettings.vestingMonths}
          onChange={e => set('vestingMonths', parseInt(e.target.value))}>
          <option value={3}>3 Months</option>
          <option value={6}>6 Months</option>
          <option value={12}>12 Months</option>
        </select>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn btn-outline" style={{ flex: 1 }}
            onClick={loadVestingPreview} disabled={loadingPreview}>
            {loadingPreview ? 'Loading...' : 'Preview Schedule'}
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }}
            onClick={handleSetupVesting}
            disabled={submittingVest || !wallet.publicKey || !vestingSettings.mintAddress.trim()}>
            {submittingVest ? 'Creating...' : 'Create Vesting →'}
          </button>
        </div>

        {!wallet.publicKey && (
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, textAlign: 'center' }}>
            Connect wallet to create vesting schedule
          </div>
        )}
      </div>

      {/* Vesting preview */}
      {vestingPreview && (
        <div className="card">
          <div className="card-title">Vesting Schedule Preview</div>
          <div className="between muted-sm mb-sm">
            <span>Cliff: {vestingPreview.cliffDate}</span>
            <span>End: {vestingPreview.endDate}</span>
            <span>{vestingPreview.periodsTotal} releases</span>
          </div>
          <div className="vesting-table">
            <div className="vt-header">
              <span>Period</span>
              <span>Release Date</span>
              <span>Tokens</span>
              <span>% Vested</span>
            </div>
            {vestingPreview.schedule.map(r => (
              <div className="vt-row" key={r.period}>
                <span>{r.period}</span>
                <span>{r.date}</span>
                <span>{r.tokens.toLocaleString()}</span>
                <span style={{ color: 'var(--green)' }}>{r.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AutoBadge({ title, desc, accuracy }) {
  return (
    <div style={{
      background: 'rgba(34,197,94,0.05)',
      border: '1px solid rgba(34,197,94,0.15)',
      borderRadius: 12, padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{
          background: 'rgba(34,197,94,0.15)', color: '#22c55e',
          borderRadius: 6, padding: '2px 8px',
          fontSize: 11, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.08em',
        }}>✓ AUTO</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{title}</span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 8 }}>{desc}</p>
      <span style={{ fontSize: 11, color: 'rgba(34,197,94,0.6)', fontFamily: 'monospace' }}>{accuracy}</span>
    </div>
  );
}
