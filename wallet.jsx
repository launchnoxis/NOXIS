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

    const { VersionedTransaction, Keypair } = await import('@solana/web3.js');

    // PumpPortal returns a VersionedTransaction
    const txBuffer = Buffer.from(base64Tx, 'base64');
    const tx = VersionedTransaction.deserialize(txBuffer);

    // Sign with mint keypair first
    if (mintKeypairBytes) {
      const mintKp = Keypair.fromSecretKey(Uint8Array.from(mintKeypairBytes));
      tx.sign([mintKp]);
    }

    // Sign with user wallet
    const signedTx = await wallet.signTransaction(tx);

    // Send skipPreflight — let Solana validate on-chain directly
    const signature = await connection.sendRawTransaction(signedTx.serialize(), {
      skipPreflight: true,
      maxRetries: 5,
    });

    // Confirm
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');

    return { signature };
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
