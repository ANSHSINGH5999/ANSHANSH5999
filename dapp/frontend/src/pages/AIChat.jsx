import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Info, Wallet, Layers, TrendingUp, ExternalLink } from 'lucide-react';
import AIAssistant from '../components/ai/AIAssistant.jsx';
import useStore from '../store/useStore.js';
import GlowBadge from '../components/ui/GlowBadge.jsx';

function ContextPanel() {
  const { account, nexBalance, stakedAmount, pendingRewards, chainId } = useStore();

  const networkName = {
    11155111: 'Sepolia',
    1337: 'Localhost',
  }[chainId] || 'Unknown';

  return (
    <div className="space-y-4">
      {/* AI Info */}
      <div className="bg-dark-card rounded-2xl border border-dark-border p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 flex items-center justify-center">
            <Brain className="w-5 h-5 text-neon-cyan" />
          </div>
          <div>
            <h3 className="text-white font-semibold">NexAI</h3>
            <GlowBadge color="green" size="xs">GPT-4o-mini</GlowBadge>
          </div>
        </div>

        <p className="text-gray-400 text-sm leading-relaxed">
          NexAI is your intelligent DeFi assistant. It has access to your wallet context and can provide personalized insights about:
        </p>

        <ul className="mt-3 space-y-1.5">
          {[
            'Staking strategies & optimization',
            'DeFi risk management',
            'Portfolio analysis',
            'Blockchain transactions',
            'NEX token economics',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-1 h-1 rounded-full bg-neon-cyan flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Wallet Context */}
      {account ? (
        <div className="bg-dark-card rounded-2xl border border-dark-border p-5">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-neon-cyan" />
            AI Context
          </h4>
          <p className="text-gray-500 text-xs mb-3">
            NexAI has access to this data to provide personalized advice:
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                <Wallet className="w-3.5 h-3.5" />
                Wallet
              </span>
              <span className="text-white text-xs font-mono">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                <Layers className="w-3.5 h-3.5" />
                Staked
              </span>
              <span className="text-neon-cyan text-xs font-mono">{stakedAmount || '0'} NEX</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                <TrendingUp className="w-3.5 h-3.5" />
                Rewards
              </span>
              <span className="text-neon-green text-xs font-mono">{pendingRewards || '0'} NEX</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">Network</span>
              <GlowBadge color="cyan" size="xs" showDot={false}>{networkName}</GlowBadge>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-dark-card rounded-2xl border border-dark-border p-5">
          <div className="text-center py-2">
            <Wallet className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm font-medium">Wallet not connected</p>
            <p className="text-gray-600 text-xs mt-1">Connect your wallet for personalized AI insights</p>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4">
        <p className="text-yellow-400 text-xs font-medium mb-1">⚠️ Disclaimer</p>
        <p className="text-gray-500 text-xs leading-relaxed">
          NexAI provides educational information only. This is not financial advice. Always do your own research before making investment decisions.
        </p>
      </div>
    </div>
  );
}

export default function AIChat() {
  const { account, nexBalance, stakedAmount, pendingRewards } = useStore();

  const contextData = {
    nexBalance: nexBalance || '0',
    stakedAmount: stakedAmount || '0',
    pendingRewards: pendingRewards || '0',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 h-[calc(100vh-4rem)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-white mb-1">
          AI <span className="gradient-text">DeFi Assistant</span>
        </h1>
        <p className="text-gray-400 text-sm">
          Ask NexAI anything about DeFi, staking, and your portfolio
        </p>
      </motion.div>

      {/* Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100%-5rem)]">
        {/* Chat Panel - 3 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 h-full min-h-[500px] max-h-[700px]"
        >
          <AIAssistant contextData={contextData} />
        </motion.div>

        {/* Context Sidebar - 1 col */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 overflow-y-auto"
        >
          <ContextPanel />
        </motion.div>
      </div>
    </div>
  );
}
