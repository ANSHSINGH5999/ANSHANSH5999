import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, LogOut, ChevronDown, AlertTriangle, Wallet, Check } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet.js';
import useStore from '../../store/useStore.js';
import { SUPPORTED_CHAINS } from '../../constants/config.js';
import GlowBadge from '../ui/GlowBadge.jsx';
import toast from 'react-hot-toast';

function MetaMaskIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32.9582 1L19.8241 10.7183L22.2919 4.99099L32.9582 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.04834 1L15.0707 10.8094L12.7143 4.99099L2.04834 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M28.2086 23.5334L24.7366 28.8808L32.0562 30.8492L34.1166 23.6484L28.2086 23.5334Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M0.896484 23.6484L2.94373 30.8492L10.2533 28.8808L6.79104 23.5334L0.896484 23.6484Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.84437 15.0459L7.81104 18.0777L15.0406 18.3975L14.8086 10.6133L9.84437 15.0459Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M25.1619 15.0459L20.1264 10.5234L20.0156 18.3975L27.2351 18.0777L25.1619 15.0459Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.2534 28.8808L14.6152 26.7975L10.8624 23.6984L10.2534 28.8808Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20.3909 26.7975L24.7428 28.8808L24.1437 23.6984L20.3909 26.7975Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function ConnectWallet() {
  const { account, chainId, balance, isConnecting, connectWallet, disconnectWallet, switchNetwork, isCorrectNetwork } = useWallet();
  const { nexBalance } = useStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyAddress = async () => {
    if (!account) return;
    await navigator.clipboard.writeText(account);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : '';

  const networkName = SUPPORTED_CHAINS[chainId] || (chainId ? `Chain ${chainId}` : null);

  if (!account) {
    return (
      <motion.button
        onClick={connectWallet}
        disabled={isConnecting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="
          relative flex items-center gap-2 px-4 py-2.5 rounded-xl
          bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10
          border border-neon-cyan/30 hover:border-neon-cyan/60
          text-neon-cyan font-medium text-sm
          hover:shadow-neon-cyan transition-all duration-200
          disabled:opacity-60 disabled:cursor-not-allowed
          overflow-hidden group
        "
      >
        <span className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        {isConnecting ? (
          <>
            <div className="w-4 h-4 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <MetaMaskIcon />
            <span>Connect Wallet</span>
          </>
        )}
      </motion.button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Connected Button */}
      <motion.button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        whileHover={{ scale: 1.01 }}
        className="
          flex items-center gap-2 px-3 py-2 rounded-xl
          bg-dark-card border transition-all duration-200
          cursor-pointer group
          border-dark-border hover:border-neon-cyan/30
        "
      >
        {/* Network Badge */}
        {!isCorrectNetwork ? (
          <GlowBadge color="yellow" size="xs">
            <AlertTriangle className="w-3 h-3" />
            Wrong Network
          </GlowBadge>
        ) : (
          <GlowBadge color="green" size="xs">
            {networkName}
          </GlowBadge>
        )}

        {/* Balance */}
        <span className="text-gray-300 text-sm font-mono hidden sm:block">
          {parseFloat(balance).toFixed(3)} ETH
        </span>

        {/* Address */}
        <div className="flex items-center gap-1.5 bg-dark-hover px-2.5 py-1 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span className="text-white text-sm font-mono">{shortAddress}</span>
        </div>

        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="
              absolute right-0 top-full mt-2 w-64
              bg-dark-card border border-dark-border rounded-2xl
              shadow-[0_20px_60px_rgba(0,0,0,0.5)]
              overflow-hidden z-50
            "
          >
            {/* Header */}
            <div className="p-4 border-b border-dark-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Connected Wallet</p>
                  <p className="text-gray-400 text-xs">{networkName || 'Unknown Network'}</p>
                </div>
              </div>

              {/* Full Address */}
              <div className="bg-dark-hover rounded-xl p-2.5 flex items-center justify-between">
                <p className="text-gray-300 text-xs font-mono truncate mr-2">
                  {account}
                </p>
                <button
                  onClick={copyAddress}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-neon-cyan transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-neon-green" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Balances */}
            <div className="p-4 border-b border-dark-border space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">ETH Balance</span>
                <span className="text-white font-mono text-sm">{parseFloat(balance).toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">NEX Balance</span>
                <span className="text-neon-cyan font-mono text-sm">{nexBalance} NEX</span>
              </div>
            </div>

            {/* Wrong Network Warning */}
            {!isCorrectNetwork && (
              <div className="p-3 border-b border-yellow-500/20 bg-yellow-500/5">
                <p className="text-yellow-400 text-xs mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Wrong Network
                </p>
                <button
                  onClick={() => { switchNetwork(11155111); setIsDropdownOpen(false); }}
                  className="w-full text-xs px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition-colors"
                >
                  Switch to Sepolia
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={() => { disconnectWallet(); setIsDropdownOpen(false); }}
                className="
                  w-full flex items-center gap-2 px-3 py-2.5 rounded-xl
                  text-red-400 hover:bg-red-500/10 transition-colors text-sm
                "
              >
                <LogOut className="w-4 h-4" />
                Disconnect Wallet
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
