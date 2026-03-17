import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useSolanaWallet } from '../lib/wallet';
import { previewVesting, buildVestingTx } from '../lib/api';

export default function AntiRugTab() {
  const wallet = useSolanaWallet();

  const [settings, setSettings] = useState({
    lpLock: true, lpLockDuration: '6mo',
    vestingEnabled: true, devAlloc: 5, cliffDays: 30, vestingMonths: 6,
    maxWalletCap: true, honeypotProtection: true,
    mintRenounce: true, freezeRenounce: true,
    blacklistProtection: true, antiSnipeTax: false,
  });
  const [vestingPreview, setVestingPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const toggle = (k) => setSettings((s) => ({ ...s, [k]: !s[k] }));
  const set = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  const securityScore = [
    settings.lpLock, settings.vestingEnabled,
    settings.maxWalletCap, settings.mintRenounce,
    settings.freezeRenounce, settings.honeypotProtection,
    settings.blacklistProtection,
  ].filter(Boolean).length;

  const scoreColor = securityScore >= 6 ? 'var(--green)' : securityScore >= 4 ? 'var(--accent3)' : 'var(--danger)';

  async function loadVestingPreview() {
    setLoadingPreview(true);
    try {
      const res = await previewVesting({
        totalTokens: 1_000_000_000 * (settings.devAlloc / 100),
        cliffDays: settings.cliffDays,
        vestingMonths: settings.vestingMonths,
      });
      setVestingPreview(res);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingPreview(false);
    }
  }

  return (
    <div className="tab-content">
      <div className="page-hero">
        <div className="hero-label">Protection Layer</div>
        <h1 className="hero-title">Your token,<br/><span className="hero-highlight">Rug-proof.</span></h1>
        <p className="hero-sub">Lock liquidity, vest dev tokens, and renounce mint authority — all configured before launch so buyers can verify everything on-chain.</p>
      </div>
      <div className="grid2 mb">
        {/* LP Lock */}
        <div className="card">
          <div className="card-title">Liquidity Lock</div>
          <ToggleRow
            label="Auto-Lock LP on Launch"
            desc="Lock liquidity immediately — prevents rug pulls"
            checked={settings.lpLock}
            onChange={() => toggle('lpLock')}
          />
          {settings.lpLock && (
            <>
              <label>Lock Duration</label>
              <select value={settings.lpLockDuration} onChange={(e) => set('lpLockDuration', e.target.value)}>
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
                <option value="6mo">6 Months</option>
                <option value="1yr">1 Year</option>
                <option value="burn">Permanent (Burn)</option>
              </select>
              <div className="progress-bar" style={{ marginTop: 12 }}>
                <div className="progress-fill green" style={{ width: '75%' }} />
              </div>
              <div className="between muted-sm">
                <span>75% LP locked</span>
                <span className="badge badge-green">Safe</span>
              </div>
            </>
          )}
        </div>

        {/* Dev Vesting */}
        <div className="card">
          <div className="card-title">Dev Wallet Vesting</div>
          <ToggleRow
            label="Team Token Vesting"
            desc="Auto-vest dev tokens — prevents early dumps"
            checked={settings.vestingEnabled}
            onChange={() => toggle('vestingEnabled')}
          />
          {settings.vestingEnabled && (
            <>
              <label>Dev Allocation (%)</label>
              <div className="range-wrap">
                <input type="range" min={0} max={20} step={1} value={settings.devAlloc}
                  onChange={(e) => set('devAlloc', parseInt(e.target.value))} />
                <span className="range-val">{settings.devAlloc}%</span>
              </div>
              <label>Cliff Period</label>
              <select value={settings.cliffDays} onChange={(e) => set('cliffDays', parseInt(e.target.value))}>
                <option value={0}>No Cliff</option>
                <option value={30}>30 Days</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days</option>
              </select>
              <label>Vesting Duration</label>
              <select value={settings.vestingMonths} onChange={(e) => set('vestingMonths', parseInt(e.target.value))}>
                <option value={3}>3 Months</option>
                <option value={6}>6 Months</option>
                <option value={12}>12 Months</option>
              </select>
              <button
                className="btn btn-outline"
                style={{ marginTop: 12, padding: '8px 0' }}
                onClick={loadVestingPreview}
                disabled={loadingPreview}
              >
                {loadingPreview ? 'Loading...' : 'Preview Schedule →'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Vesting preview table */}
      {vestingPreview && (
        <div className="card mb">
          <div className="card-title">Vesting Schedule Preview</div>
          <div className="between muted-sm mb-sm">
            <span>Cliff: {vestingPreview.cliffDate}</span>
            <span>End: {vestingPreview.endDate}</span>
            <span>{vestingPreview.periodsTotal} total releases</span>
          </div>
          <div className="vesting-table">
            <div className="vt-header">
              <span>Period</span><span>Release Date</span><span>Tokens</span><span>% Vested</span>
            </div>
            {vestingPreview.schedule.map((r) => (
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

      {/* Toggles */}
      <div className="card mb">
        <div className="card-title">Anti-Rug Toggles</div>
        {[
          { key: 'maxWalletCap', label: 'Max Wallet Cap (2%)', desc: 'Limit each wallet to 2% of supply — prevents whale dominance' },
          { key: 'honeypotProtection', label: 'Honeypot Protection', desc: 'Verify sell function is always enabled before launch' },
          { key: 'mintRenounce', label: 'Renounce Mint Authority', desc: 'Permanently prevent minting new tokens' },
          { key: 'freezeRenounce', label: 'Renounce Freeze Authority', desc: 'Ensure no wallet can ever be frozen' },
          { key: 'blacklistProtection', label: 'Blacklist Known Bots', desc: 'Block known sniper/MEV wallets at launch' },
          { key: 'antiSnipeTax', label: 'Anti-Snipe Tax (First 5 Blocks)', desc: '50% sell tax in first 5 blocks to deter launch snipers' },
        ].map(({ key, label, desc }) => (
          <ToggleRow key={key} label={label} desc={desc}
            checked={settings[key]} onChange={() => toggle(key)} />
        ))}
      </div>

      {/* Score */}
      <div className="card">
        <div className="card-title">Security Score</div>
        <div className="grid3">
          <div className="stat-card">
            <div className="stat-value" style={{ color: scoreColor }}>
              {Math.round((securityScore / 7) * 100)}
            </div>
            <div className="stat-label">Safety Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-value stat-amber">{settings.devAlloc}%</div>
            <div className="stat-label">Dev Allocation</div>
          </div>
          <div className="stat-card">
            <div className="stat-value stat-purple">{settings.lpLockDuration}</div>
            <div className="stat-label">LP Lock</div>
          </div>
        </div>
        {securityScore >= 6 && (
          <div className="alert alert-success" style={{ marginTop: '1rem' }}>
            All critical protections active. Safe to launch.
          </div>
        )}
        {securityScore < 4 && (
          <div className="alert alert-warn" style={{ marginTop: '1rem' }}>
            Low security score. Enable more protections before launching.
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="toggle-row">
      <div>
        <div className="toggle-label">{label}</div>
        {desc && <div className="toggle-desc">{desc}</div>}
      </div>
      <label className="toggle">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="slider" />
      </label>
    </div>
  );
}
