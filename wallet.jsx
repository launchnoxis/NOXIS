import React, { createContext, useContext, useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
  useConnection,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

const NETWORK = WalletAdapterNetwork.Mainnet;
const ENDPOINT = 'https://api.mainnet-beta.solana.com';

export function SolanaWalletProvider({ children }) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network: NETWORK }),
      new CoinbaseWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

// ─── Custom hook: wallet + connection + helpers ───────────────────────────────
export function useSolanaWallet() {
  const wallet = useWallet();
  const { connection } = useConnection();

  /**
   * Sign and send a base64-encoded partially-signed transaction.
   * The backend has already partial-signed with the mint keypair.
   * This adds the wallet signature and submits.
   */
  async function signAndSendTransaction(base64Tx, mintKeypairBytes) {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    const { Transaction, Keypair } = await import('@solana/web3.js');

    // Get fresh blockhash FIRST before doing anything
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');

    // Deserialize
    const txBuffer = Buffer.from(base64Tx, 'base64');
    const tx = Transaction.from(txBuffer);

    // Apply fresh blockhash
    tx.recentBlockhash = blockhash;
    tx.feePayer = wallet.publicKey;

    // Clear all existing signatures since we changed the blockhash
    tx.signatures = [];

    // Re-sign with mint keypair
    if (mintKeypairBytes) {
      const mintKp = Keypair.fromSecretKey(Uint8Array.from(mintKeypairBytes));
      tx.partialSign(mintKp);
    }

    // Sign with user wallet
    const signedTx = await wallet.signTransaction(tx);
    const serialized = signedTx.serialize({ requireAllSignatures: false });

    // Send with skipPreflight to bypass simulation
    const signature = await connection.sendRawTransaction(serialized, {
      skipPreflight: true,
      maxRetries: 5,
    });

    // Confirm
    await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');

    return { signature, serialized: Buffer.from(serialized).toString('base64') };
  }

  /**
   * Sign a transaction without sending (for vesting setup etc.)
   */
  async function signTransactionOnly(base64Tx) {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }
    const { Transaction } = await import('@solana/web3.js');
    const txBuffer = Buffer.from(base64Tx, 'base64');
    const tx = Transaction.from(txBuffer);
    const signedTx = await wallet.signTransaction(tx);
    return Buffer.from(signedTx.serialize()).toString('base64');
  }

  return {
    ...wallet,
    connection,
    signAndSendTransaction,
    signTransactionOnly,
  };
}

export { useWallet, useConnection };
