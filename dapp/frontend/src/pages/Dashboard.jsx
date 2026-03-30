import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Coins, Layers, TrendingUp, ArrowUpRight, ArrowDownLeft, Gift, RefreshCw } from 'lucide-react';
import BalanceCard from '../components/dashboard/BalanceCard.jsx';
import TransactionHistory from '../components/dashboard/TransactionHistory.jsx';
import Button from '../components/ui/Button.jsx';
import { useWallet } from '../hooks/useWallet.js';
import { useStaking } from '../hooks/useStaking.js';
import useStore from '../store/useStore.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const { account, connectWallet, isConnecting } = useWallet();
  const { refreshStakeInfo, isRefreshing } = useStaking();
  const { balance, nexBalance, stakedAmount, pendingRewards } = useStore();

  useEffect(() => {
    if (account) {
      refreshStakeInfo();
    }
  }, [account]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!account) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[60vh] text-center"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 border border-neon-cyan/20 flex items-center justify-center mb-6">
            <Wallet className="w-12 h-12 text-neon-cyan" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Connect Your Wallet</h2>
          <p className="text-gray-400 text-lg max-w-md mb-8">
            Connect your MetaMask wallet to view your dashboard, balances, and transaction history.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={connectWallet}
            loading={isConnecting}
            icon={Wallet}
          >
            Connect MetaMask
          </Button>
        </motion.div>
      </div>
    );
  }

  const balanceCards = [
    {
      label: 'ETH Balance',
      value: balance || '0',
      unit: 'ETH',
      icon: Wallet,
      color: 'cyan',
    },
    {
      label: 'NEX Balance',
      value: nexBalance || '0',
      unit: 'NEX',
      icon: Coins,
      color: 'purple',
    },
    {
      label: 'Staked NEX',
      value: stakedAmount || '0',
      unit: 'NEX',
      icon: Layers,
      color: 'green',
    },
    {
      label: 'Pending Rewards',
      value: pendingRewards || '0',
      unit: 'NEX',
      icon: TrendingUp,
      color: 'orange',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white mb-1"
          >
            Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-sm font-mono"
          >
            {account.slice(0, 8)}...{account.slice(-6)}
          </motion.p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshStakeInfo}
          loading={isRefreshing}
          icon={RefreshCw}
        >
          Refresh
        </Button>
      </div>

      {/* Balance Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {balanceCards.map((card, i) => (
          <BalanceCard
            key={card.label}
            {...card}
            index={i}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-dark-card rounded-2xl border border-dark-border p-6"
      >
        <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/staking')}
            icon={ArrowUpRight}
          >
            Stake NEX
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/staking')}
            icon={ArrowDownLeft}
          >
            Unstake
          </Button>
          <Button
            variant="success"
            size="md"
            onClick={() => navigate('/staking')}
            icon={Gift}
          >
            Claim Rewards
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate('/ai-chat')}
          >
            Ask NexAI →
          </Button>
        </div>
      </motion.div>

      {/* Portfolio Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Staking Summary */}
        <div className="lg:col-span-2 bg-dark-card rounded-2xl border border-dark-border p-6">
          <h2 className="text-white font-semibold mb-4">Staking Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-dark-border">
              <span className="text-gray-400">Staking APY</span>
              <span className="text-neon-green font-bold text-lg">12%</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-dark-border">
              <span className="text-gray-400">Your Staked Amount</span>
              <span className="text-neon-cyan font-mono">{stakedAmount || '0'} NEX</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-dark-border">
              <span className="text-gray-400">Claimable Rewards</span>
              <span className="text-neon-green font-mono">{pendingRewards || '0'} NEX</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-400">Lock Period</span>
              <span className="text-white">7 days</span>
            </div>
          </div>
        </div>

        {/* AI Assistant Quick */}
        <div className="bg-gradient-to-br from-neon-purple/10 to-neon-cyan/5 rounded-2xl border border-neon-purple/20 p-6 flex flex-col">
          <div className="w-12 h-12 rounded-2xl bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center mb-4">
            <span className="text-2xl">🤖</span>
          </div>
          <h3 className="text-white font-semibold mb-2">NexAI Assistant</h3>
          <p className="text-gray-400 text-sm leading-relaxed flex-1">
            Get personalized DeFi insights, staking tips, and portfolio recommendations from your AI assistant.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => navigate('/ai-chat')}
          >
            Chat with NexAI →
          </Button>
        </div>
      </motion.div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <TransactionHistory />
      </motion.div>
    </div>
  );
}
