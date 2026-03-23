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
// Use your Helius RPC for better reliability
const ENDPOINT = 'https://mainnet.helius-rpc.com/?api-key=df6e4ab9-4411-414a-93e7-1ef173635b18';

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
// Custom hook: wallet + connection + helpers

export function useSolanaWallet() {
  const wallet = useWallet();
  const { connection } = useConnection();

  /**
   * Sign and send a base64-encoded partially-signed VersionedTransaction.
   * The backend has already partial-signed with the mint keypair.
   * This adds the user wallet signature and submits to Solana.
   */
  async function signAndSendTransaction(base64Tx) {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    const { VersionedTransaction } = await import('@solana/web3.js');

    // Deserialize the partially-signed VersionedTransaction from backend
    const txBuffer = Uint8Array.from(atob(base64Tx), c => c.charCodeAt(0));
    const tx = VersionedTransaction.deserialize(txBuffer);

    // Sign with user wallet (Phantom adds its signature without clobbering mint sig)
    const signedTx = await wallet.signTransaction(tx);

    // Send to Solana
    const signature = await connection.sendRawTransaction(signedTx.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
      maxRetries: 3,
    });

    // Confirm
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    if (confirmation.value.err) {
      throw new Error('Transaction failed: ' + JSON.stringify(confirmation.value.err));
    }

    return { signature };
  }

  /**
   * Sign a legacy transaction without sending (for vesting setup etc.)
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
