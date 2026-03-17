import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Required for Solana web3.js in browser
import { Buffer } from 'buffer';
window.Buffer = Buffer;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
