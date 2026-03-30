import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Gift, Info, Lock, Unlock } from 'lucide-react';
import { useStaking } from '../../hooks/useStaking.js';
import useStore from '../../store/useStore.js';
import Button from '../ui/Button.jsx';
import { STAKING_APY, MIN_STAKE, LOCK_PERIOD_DAYS } from '../../constants/config.js';
import { parseNEX } from '../../services/contractService.js';

function LockCountdown({ lockEnds, canUnstake }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!lockEnds || canUnstake) {
      setTimeLeft('');
      return;
    }

    const update = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = lockEnds - now;

      if (remaining <= 0) {
        setTimeLeft('Unlocked');
        return;
      }

      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const secs = remaining % 60;

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${secs}s`);
      } else {
        setTimeLeft(`${minutes}m ${secs}s`);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lockEnds, canUnstake]);

  if (canUnstake) {
    return (
      <div className="flex items-center gap-2 text-neon-green text-sm">
        <Unlock className="w-4 h-4" />
        <span>Tokens unlocked — ready to unstake</span>
      </div>
    );
  }

  if (!lockEnds || lockEnds === 0) return null;

  return (
    <div className="flex items-center gap-2 text-yellow-400 text-sm">
      <Lock className="w-4 h-4" />
      <span>Locked for: <span className="font-mono font-medium">{timeLeft}</span></span>
    </div>
  );
}

export default function StakingPanel() {
  const [stakeAmount, setStakeAmount] = useState('');
  const [activeAction, setActiveAction] = useState('stake');
  const { account, nexBalance, stakedAmount, pendingRewards, lockEnds, canUnstake } = useStore();
  const { stakeTokens, unstakeTokens, claimRewards, isStaking, isUnstaking, isClaiming } = useStaking();

  const handleMaxClick = () => {
    const max = parseFloat(nexBalance) || 0;
    setStakeAmount(max.toString());
  };

  const handleStake = async () => {
    await stakeTokens(stakeAmount);
    setStakeAmount('');
  };

  const estimatedReward = () => {
    const amount = parseFloat(stakeAmount) || 0;
    const dailyRate = (STAKING_APY / 100) / 365;
    return (amount * dailyRate * LOCK_PERIOD_DAYS).toFixed(4);
  };

  const isInputValid = stakeAmount && parseFloat(stakeAmount) >= MIN_STAKE;

  return (
    <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-dark-border">
        <h2 className="text-white font-bold text-xl mb-1">NEX Staking</h2>
        <p className="text-gray-400 text-sm">Stake NEX tokens to earn {STAKING_APY}% APY rewards</p>
      </div>

      {/* Action Tabs */}
      <div className="flex border-b border-dark-border">
        {[
          { key: 'stake', label: 'Stake', icon: ArrowUpRight },
          { key: 'unstake', label: 'Unstake', icon: ArrowDownLeft },
          { key: 'claim', label: 'Claim', icon: Gift },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveAction(key)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all
              ${activeAction === key
                ? 'text-neon-cyan bg-neon-cyan/5 border-b-2 border-neon-cyan'
                : 'text-gray-400 hover:text-white border-b-2 border-transparent hover:bg-white/3'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-5">
        {/* Stake Action */}
        {activeAction === 'stake' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Balance Info */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Available Balance</span>
              <button
                onClick={handleMaxClick}
                className="text-neon-cyan hover:text-white transition-colors font-mono"
              >
                {nexBalance || '0'} NEX
              </button>
            </div>

            {/* Amount Input */}
            <div className="relative">
              <input
                type="number"
                placeholder={`Min ${MIN_STAKE} NEX`}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="
                  w-full bg-dark-hover border border-dark-border rounded-xl
                  px-4 py-3.5 pr-20 text-white text-lg font-mono
                  focus:outline-none focus:border-neon-cyan/50 focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)]
                  placeholder-gray-600 transition-all
                "
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  onClick={handleMaxClick}
                  className="text-xs text-neon-cyan bg-neon-cyan/10 px-2 py-1 rounded-lg hover:bg-neon-cyan/20 transition-colors font-medium"
                >
                  MAX
                </button>
                <span className="text-gray-500 text-sm">NEX</span>
              </div>
            </div>

            {/* Stake Info */}
            {stakeAmount && parseFloat(stakeAmount) > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-dark-hover rounded-xl p-4 space-y-2.5"
              >
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Lock Period
                  </span>
                  <span className="text-white">{LOCK_PERIOD_DAYS} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">APY</span>
                  <span className="text-neon-green font-medium">{STAKING_APY}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Est. Rewards (7d)</span>
                  <span className="text-neon-cyan font-mono">~{estimatedReward()} NEX</span>
                </div>
                <div className="border-t border-dark-border/50 pt-2 flex justify-between text-sm">
                  <span className="text-gray-400">You will stake</span>
                  <span className="text-white font-mono font-medium">{parseFloat(stakeAmount).toLocaleString()} NEX</span>
                </div>
              </motion.div>
            )}

            {/* Validation message */}
            {stakeAmount && parseFloat(stakeAmount) < MIN_STAKE && parseFloat(stakeAmount) > 0 && (
              <p className="text-red-400 text-sm flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                Minimum stake is {MIN_STAKE} NEX
              </p>
            )}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleStake}
              loading={isStaking}
              disabled={!account || !isInputValid || isStaking}
              icon={ArrowUpRight}
            >
              {!account ? 'Connect Wallet to Stake' : isStaking ? 'Staking...' : `Stake ${stakeAmount || ''} NEX`}
            </Button>
          </motion.div>
        )}

        {/* Unstake Action */}
        {activeAction === 'unstake' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Staked Amount */}
            <div className="bg-dark-hover rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Currently Staked</span>
                <span className="text-neon-cyan font-mono font-bold text-lg">{stakedAmount || '0'} NEX</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Pending Rewards</span>
                <span className="text-neon-green font-mono">{pendingRewards || '0'} NEX</span>
              </div>
            </div>

            {/* Lock Status */}
            <LockCountdown lockEnds={lockEnds} canUnstake={canUnstake} />

            {!canUnstake && stakedAmount && parseFloat(stakedAmount) > 0 && (
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-yellow-400 text-sm">
                  Your tokens are locked for the {LOCK_PERIOD_DAYS}-day staking period.
                  Unstaking before this period ends is not allowed.
                </p>
              </div>
            )}

            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={unstakeTokens}
              loading={isUnstaking}
              disabled={!account || !canUnstake || isUnstaking || !stakedAmount || parseFloat(stakedAmount) === 0}
              icon={ArrowDownLeft}
            >
              {!account
                ? 'Connect Wallet'
                : !stakedAmount || parseFloat(stakedAmount) === 0
                  ? 'No Active Stake'
                  : !canUnstake
                    ? 'Locked'
                    : isUnstaking
                      ? 'Unstaking...'
                      : `Unstake ${stakedAmount} NEX`
              }
            </Button>

            <p className="text-gray-500 text-xs text-center">
              Unstaking will also automatically claim your pending rewards.
            </p>
          </motion.div>
        )}

        {/* Claim Action */}
        {activeAction === 'claim' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Rewards Info */}
            <div className="bg-gradient-to-br from-neon-green/5 to-transparent border border-neon-green/20 rounded-xl p-5 text-center">
              <p className="text-gray-400 text-sm mb-2">Claimable Rewards</p>
              <p className="text-4xl font-bold font-mono text-neon-green">{pendingRewards || '0'}</p>
              <p className="text-gray-500 text-sm mt-1">NEX</p>
            </div>

            <div className="bg-dark-hover rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Current APY</span>
                <span className="text-neon-green font-medium">{STAKING_APY}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Staked Amount</span>
                <span className="text-white font-mono">{stakedAmount || '0'} NEX</span>
              </div>
            </div>

            <Button
              variant="success"
              size="lg"
              fullWidth
              onClick={claimRewards}
              loading={isClaiming}
              disabled={
                !account ||
                isClaiming ||
                !pendingRewards ||
                parseFloat(pendingRewards) === 0 ||
                !stakedAmount ||
                parseFloat(stakedAmount) === 0
              }
              icon={Gift}
            >
              {!account
                ? 'Connect Wallet'
                : !stakedAmount || parseFloat(stakedAmount) === 0
                  ? 'No Active Stake'
                  : !pendingRewards || parseFloat(pendingRewards) === 0
                    ? 'No Rewards Yet'
                    : isClaiming
                      ? 'Claiming...'
                      : `Claim ${pendingRewards} NEX`
              }
            </Button>

            <p className="text-gray-500 text-xs text-center">
              Claiming rewards does not affect your staked position.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
