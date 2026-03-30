import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Coins, Clock, RefreshCw } from 'lucide-react';
import useStore from '../../store/useStore.js';
import { useStaking } from '../../hooks/useStaking.js';
import { STAKING_APY, LOCK_PERIOD_DAYS } from '../../constants/config.js';

// Circular progress component
function CircularProgress({ percentage, size = 80, strokeWidth = 6, color = '#00d4ff' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1, ease: 'easeOut' }}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  );
}

function StatItem({ label, value, unit, icon: Icon, color = 'cyan', subtext }) {
  const textColors = {
    cyan: 'text-neon-cyan',
    green: 'text-neon-green',
    purple: 'text-neon-purple',
    white: 'text-white',
  };

  return (
    <div className="flex items-start justify-between p-4 bg-dark-hover rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl bg-neon-${color}/10 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 text-neon-${color}`} />
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-0.5">{label}</p>
          {subtext && <p className="text-gray-600 text-xs">{subtext}</p>}
        </div>
      </div>
      <div className="text-right">
        <span className={`font-bold font-mono ${textColors[color] || textColors.cyan}`}>{value}</span>
        {unit && <span className="text-gray-500 text-xs ml-1">{unit}</span>}
      </div>
    </div>
  );
}

export default function StakingStats() {
  const {
    account,
    stakedAmount,
    pendingRewards,
    totalStaked,
    rewardPool,
    lockEnds,
    canUnstake,
    stakeTimestamp,
  } = useStore();
  const { refreshStakeInfo, isRefreshing } = useStaking();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!account) return;
    refreshStakeInfo();
    const interval = setInterval(refreshStakeInfo, 30000);
    return () => clearInterval(interval);
  }, [account]); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate lock period progress
  const getLockProgress = () => {
    if (!stakeTimestamp || stakeTimestamp === 0) return 0;
    const now = Math.floor(Date.now() / 1000);
    const lockDuration = LOCK_PERIOD_DAYS * 24 * 60 * 60;
    const elapsed = now - stakeTimestamp;
    return Math.min(100, Math.max(0, (elapsed / lockDuration) * 100));
  };

  const lockProgress = getLockProgress();

  // Calculate time until unlock
  const getTimeUntilUnlock = () => {
    if (!lockEnds || canUnstake) return null;
    const now = Math.floor(Date.now() / 1000);
    const remaining = lockEnds - now;
    if (remaining <= 0) return 'Ready';
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
  };

  const timeUntilUnlock = getTimeUntilUnlock();

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-dark-card rounded-2xl border border-dark-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Staking Overview</h3>
          <button
            onClick={refreshStakeInfo}
            disabled={isRefreshing}
            className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-neon-cyan transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-3">
          <StatItem
            label="Total Platform Staked"
            value={totalStaked || '0'}
            unit="NEX"
            icon={Users}
            color="cyan"
          />
          <StatItem
            label="Reward Pool"
            value={rewardPool || '0'}
            unit="NEX"
            icon={Coins}
            color="purple"
          />
          <StatItem
            label="Annual Percentage Yield"
            value={`${STAKING_APY}%`}
            icon={TrendingUp}
            color="green"
            subtext="Fixed APY"
          />
        </div>
      </div>

      {/* User Stats Card */}
      {account && (
        <div className="bg-dark-card rounded-2xl border border-dark-border p-5">
          <h3 className="text-white font-semibold mb-4">Your Position</h3>

          <div className="space-y-3">
            <StatItem
              label="Your Staked Amount"
              value={stakedAmount || '0'}
              unit="NEX"
              icon={Coins}
              color="cyan"
            />
            <StatItem
              label="Pending Rewards"
              value={pendingRewards || '0'}
              unit="NEX"
              icon={TrendingUp}
              color="green"
              subtext="Auto-updated every 30s"
            />
          </div>

          {/* Lock Period Progress */}
          {stakeTimestamp > 0 && (
            <div className="mt-5 pt-4 border-t border-dark-border">
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <CircularProgress
                    percentage={lockProgress}
                    color={canUnstake ? '#00ff88' : '#00d4ff'}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xs font-bold ${canUnstake ? 'text-neon-green' : 'text-neon-cyan'}`}>
                      {Math.round(lockProgress)}%
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium mb-1">Lock Period Progress</p>
                  <p className="text-gray-400 text-xs">
                    {canUnstake
                      ? 'Lock period complete — you can unstake now'
                      : timeUntilUnlock
                        ? `${timeUntilUnlock} until unlock`
                        : `${LOCK_PERIOD_DAYS}-day lock period`
                    }
                  </p>
                  <div className="mt-2 h-1.5 bg-dark-hover rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${lockProgress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        canUnstake
                          ? 'bg-gradient-to-r from-neon-green to-neon-cyan'
                          : 'bg-gradient-to-r from-neon-cyan to-neon-purple'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* APY Calculator */}
      <div className="bg-dark-card rounded-2xl border border-neon-purple/20 p-5">
        <h3 className="text-white font-semibold mb-3">APY Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Annual Rate</span>
            <span className="text-neon-green font-medium">{STAKING_APY}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Monthly Rate</span>
            <span className="text-white font-mono">{(STAKING_APY / 12).toFixed(2)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Daily Rate</span>
            <span className="text-white font-mono">{(STAKING_APY / 365).toFixed(4)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Lock Period</span>
            <span className="text-white">{LOCK_PERIOD_DAYS} days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
