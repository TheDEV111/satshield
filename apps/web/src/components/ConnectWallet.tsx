"use client";
import { useState } from 'react';
import { Wallet } from 'lucide-react';

export function ConnectWallet() {
  const [address, setAddress] = useState<string | null>(null);

  const connect = () => {
    // Mock connection
    setAddress("ST_MOCK_WALLET_ADDRESS");
  };

  return (
    <button 
      onClick={connect}
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors"
    >
      <Wallet size={18} />
      {address ? address.slice(0, 8) + '...' : 'Connect Wallet'}
    </button>
  );
}
