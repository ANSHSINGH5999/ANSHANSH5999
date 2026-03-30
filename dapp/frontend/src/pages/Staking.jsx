import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Lock, Coins, ChevronRight, Info } from 'lucide-react';
import StakingPanel from '../components/staking/StakingPanel.jsx';
import StakingStats from '../components/staking/StakingStats.jsx';
import { STAKING_APY, MIN_STAKE, LOCK_PERIOD_DAYS } from '../constants/config.js';

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Get NEX Tokens',
    desc: 'Obtain NEX tokens from the faucet or token contract. You need at least 100 NEX to start staking.',
    icon: Coins,
  },
  {
    step: '02',
    title: 'Approve & Stake',
    desc: 'Approve the staking contract to use your NEX, then stake your desired amount. Minimum is 100 NEX.',
    icon: TrendingUp,
  },
  {
    step: '03',
    title: 'Wait 7 Days',
    desc: 'Your tokens are locked for 7 days. Rewards accrue every second at 12% APY during this time.',
    icon: Lock,
  },
  {
    step: '04',
    title: 'Claim or Unstake',
    desc: 'Claim rewards anytime without unstaking, or unstake after the lock period to get everything back.',
    icon: ChevronRight,
  },
];

// Simple APY calculator
function ApyCalculator() {
  const [amount, setAmount] = React.useState('1000');

  const calculate = (stakeAmt) => {
    const num = parseFloat(stakeAmt) || 0;
    return {
      daily: ((num * STAKING_APY / 100) / 365).toFixed(4),
      weekly: ((num * STAKING_APY / 100) / 52).toFixed(4),
      monthly: ((num * STAKING_APY / 100) / 12).toFixed(4),
      yearly: (num * STAKING_APY / 100).toFixed(4),
    };
  };

  const rewards = calculate(amount);

  return (
    <div className="bg-dark-card rounded-2xl border border-dark-border p-6">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <span className="text-neon-cyan">📊</span>
        APY Calculator
      </h3>
      <div className="mb-4">
        <label className="text-gray-400 text-sm mb-2 block">Stake Amount (NEX)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="
            w-full bg-dark-hover border border-dark-border rounded-xl
            px-4 py-3 text-white font-mono
            focus:outline-none focus:border-neon-cyan/50
            placeholder-gray-600 transition-all
          "
          placeholder="Enter amount..."
        />
      </div>
      <div className="space-y-2">
        {[
          { period: 'Daily', value: rewards.daily },
          { period: 'Weekly', value: rewards.weekly },
          { period: 'Monthly', value: rewards.monthly },
          { period: 'Yearly', value: rewards.yearly },
        ].map(({ period, value }) => (
          <div key={period} className="flex justify-between items-center py-2 border-b border-dark-border/50 last:border-0">
            <span className="text-gray-400 text-sm">{period} Rewards</span>
            <span className="text-neon-green font-mono font-medium">+{value} NEX</span>
          </div>
        ))}
      </div>
      <p className="text-gray-600 text-xs mt-3 flex items-center gap-1">
        <Info className="w-3.5 h-3.5" />
        Based on {STAKING_APY}% APY. Actual rewards may vary.
      </p>
    </div>
  );
}

export default function Staking() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          NEX Token <span className="gradient-text">Staking</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Stake your NEX tokens and earn{' '}
          <span className="text-neon-green font-bold">{STAKING_APY}% APY</span> with a{' '}
          <span className="text-neon-cyan">{LOCK_PERIOD_DAYS}-day</span> lock period.
        </p>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Staking Panel - 3 cols */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          <StakingPanel />
        </motion.div>

        {/* Stats - 2 cols */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <StakingStats />
        </motion.div>
      </div>

      {/* APY Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <ApyCalculator />

        {/* Key Stats */}
        <div className="bg-dark-card rounded-2xl border border-neon-cyan/20 p-6">
          <h3 className="text-white font-semibold mb-4">Staking Parameters</h3>
          <div className="space-y-3">
            {[
              { label: 'Annual Percentage Yield', value: `${STAKING_APY}%`, color: 'text-neon-green' },
              { label: 'Minimum Stake', value: `${MIN_STAKE} NEX`, color: 'text-neon-cyan' },
              { label: 'Lock Period', value: `${LOCK_PERIOD_DAYS} days`, color: 'text-neon-cyan' },
              { label: 'Reward Calculation', value: 'Per second', color: 'text-gray-300' },
              { label: 'Reward Token', value: 'NEX', color: 'text-gray-300' },
              { label: 'Early Unstake', value: 'Not allowed', color: 'text-red-400' },
              { label: 'Claim Anytime', value: 'Yes', color: 'text-neon-green' },
              { label: 'Smart Contract', value: 'Audited', color: 'text-neon-green' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-dark-border/50 last:border-0">
                <span className="text-gray-400 text-sm">{label}</span>
                <span className={`text-sm font-medium ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* How it Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">How Staking Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-dark-card rounded-2xl border border-dark-border p-5 relative"
              >
                <span className="absolute top-4 right-4 text-gray-700 font-bold text-2xl font-mono">
                  {step.step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-neon-cyan" />
                </div>
                <h4 className="text-white font-semibold mb-2">{step.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
