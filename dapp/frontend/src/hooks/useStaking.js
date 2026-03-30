import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import useStore from '../store/useStore.js';
import {
  getProvider,
  getSigner,
  getNexTokenContract,
  getNexStakingContract,
  formatNEX,
  parseNEX,
  getStakeInfo,
  getGlobalStakingStats,
  getTokenBalance,
  getExplorerTxUrl,
} from '../services/contractService.js';
import { NEX_STAKING_ADDRESS, MIN_STAKE, LOCK_PERIOD_DAYS } from '../constants/config.js';

export function useStaking() {
  const {
    account,
    chainId,
    setNexBalance,
    setStakedAmount,
    setPendingRewards,
    setStakeInfo,
    setTotalStaked,
    setRewardPool,
    addTxHistory,
    setPendingTx,
    clearPendingTx,
  } = useStore();

  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Refresh all staking and token data
   */
  const refreshStakeInfo = useCallback(async () => {
    if (!account) return;
    setIsRefreshing(true);
    try {
      const [stakeInfo, tokenBalance, globalStats] = await Promise.allSettled([
        getStakeInfo(account),
        getTokenBalance(account),
        getGlobalStakingStats(),
      ]);

      if (stakeInfo.status === 'fulfilled') {
        const info = stakeInfo.value;
        setStakeInfo({
          stakedAmount: formatNEX(info.stakedAmount),
          pendingRewards: formatNEX(info.pendingRewards),
          stakeTimestamp: Number(info.stakeTimestamp),
          lockEnds: Number(info.lockEnds),
          canUnstake: info.canUnstake,
        });
      }

      if (tokenBalance.status === 'fulfilled') {
        setNexBalance(formatNEX(tokenBalance.value));
      }

      if (globalStats.status === 'fulfilled') {
        setTotalStaked(formatNEX(globalStats.value.totalStaked));
        setRewardPool(formatNEX(globalStats.value.rewardPool));
      }
    } catch (err) {
      console.error('Error refreshing stake info:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [account, setStakeInfo, setNexBalance, setTotalStaked, setRewardPool]);

  /**
   * Stake NEX tokens
   * @param {string} amount - Human-readable amount to stake
   */
  const stakeTokens = useCallback(async (amount) => {
    if (!account) {
      toast.error('Please connect your wallet first.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    if (numAmount < MIN_STAKE) {
      toast.error(`Minimum stake is ${MIN_STAKE} NEX.`);
      return;
    }

    setIsStaking(true);
    const stakeToastId = toast.loading('Preparing stake transaction...');

    try {
      const signer = await getSigner();
      const tokenContract = getNexTokenContract(signer);
      const stakingContract = getNexStakingContract(signer);
      const amountWei = parseNEX(amount);

      // Check balance
      const balance = await tokenContract.balanceOf(account);
      if (balance < amountWei) {
        throw new Error(`Insufficient NEX balance. You have ${formatNEX(balance)} NEX.`);
      }

      // Check allowance
      const allowance = await tokenContract.allowance(account, NEX_STAKING_ADDRESS);

      if (allowance < amountWei) {
        toast.loading('Approving NEX tokens...', { id: stakeToastId });
        const approveTx = await tokenContract.approve(NEX_STAKING_ADDRESS, amountWei);
        setPendingTx(approveTx.hash);
        await approveTx.wait();
        clearPendingTx();
        toast.loading('Approval confirmed. Staking...', { id: stakeToastId });
      }

      // Stake
      const stakeTx = await stakingContract.stake(amountWei);
      setPendingTx(stakeTx.hash);
      toast.loading('Staking tokens... Please wait for confirmation.', { id: stakeToastId });

      const receipt = await stakeTx.wait();
      clearPendingTx();

      // Record in history
      addTxHistory({
        hash: stakeTx.hash,
        type: 'Stake',
        amount: `${amount} NEX`,
        status: 'Confirmed',
        timestamp: Date.now(),
        chainId,
      });

      toast.success(`Successfully staked ${amount} NEX!`, { id: stakeToastId });
      await refreshStakeInfo();
    } catch (err) {
      clearPendingTx();
      const message = err.reason || err.message || 'Staking failed';
      toast.error(message.length > 100 ? 'Staking failed. Check console for details.' : message, {
        id: stakeToastId,
      });
      console.error('Stake error:', err);
    } finally {
      setIsStaking(false);
    }
  }, [account, chainId, addTxHistory, setPendingTx, clearPendingTx, refreshStakeInfo]);

  /**
   * Unstake all NEX tokens
   */
  const unstakeTokens = useCallback(async () => {
    if (!account) {
      toast.error('Please connect your wallet first.');
      return;
    }

    setIsUnstaking(true);
    const unstakeToastId = toast.loading('Preparing unstake transaction...');

    try {
      const signer = await getSigner();
      const stakingContract = getNexStakingContract(signer);

      // Verify lock period
      const info = await getStakeInfo(account);
      if (info.stakedAmount === 0n) {
        throw new Error('No active stake found.');
      }
      if (!info.canUnstake) {
        const lockEndsDate = new Date(Number(info.lockEnds) * 1000);
        throw new Error(
          `Lock period not over. You can unstake after ${lockEndsDate.toLocaleDateString()}.`
        );
      }

      const unstakeTx = await stakingContract.unstake();
      setPendingTx(unstakeTx.hash);
      toast.loading('Unstaking... Please wait for confirmation.', { id: unstakeToastId });

      await unstakeTx.wait();
      clearPendingTx();

      addTxHistory({
        hash: unstakeTx.hash,
        type: 'Unstake',
        amount: `${formatNEX(info.stakedAmount)} NEX`,
        status: 'Confirmed',
        timestamp: Date.now(),
        chainId,
      });

      toast.success('Successfully unstaked tokens!', { id: unstakeToastId });
      await refreshStakeInfo();
    } catch (err) {
      clearPendingTx();
      const message = err.reason || err.message || 'Unstaking failed';
      toast.error(message.length > 100 ? 'Unstaking failed. Check console.' : message, {
        id: unstakeToastId,
      });
      console.error('Unstake error:', err);
    } finally {
      setIsUnstaking(false);
    }
  }, [account, chainId, addTxHistory, setPendingTx, clearPendingTx, refreshStakeInfo]);

  /**
   * Claim pending rewards
   */
  const claimRewards = useCallback(async () => {
    if (!account) {
      toast.error('Please connect your wallet first.');
      return;
    }

    setIsClaiming(true);
    const claimToastId = toast.loading('Preparing claim transaction...');

    try {
      const signer = await getSigner();
      const stakingContract = getNexStakingContract(signer);

      // Check rewards
      const provider = getProvider();
      const readContract = getNexStakingContract(provider);
      const rewards = await readContract.getRewards(account);

      if (rewards === 0n) {
        throw new Error('No rewards to claim yet.');
      }

      const claimTx = await stakingContract.claimRewards();
      setPendingTx(claimTx.hash);
      toast.loading('Claiming rewards... Please wait.', { id: claimToastId });

      await claimTx.wait();
      clearPendingTx();

      addTxHistory({
        hash: claimTx.hash,
        type: 'Claim Rewards',
        amount: `${formatNEX(rewards)} NEX`,
        status: 'Confirmed',
        timestamp: Date.now(),
        chainId,
      });

      toast.success(`Claimed ${formatNEX(rewards)} NEX rewards!`, { id: claimToastId });
      await refreshStakeInfo();
    } catch (err) {
      clearPendingTx();
      const message = err.reason || err.message || 'Claim failed';
      toast.error(message.length > 100 ? 'Claim failed. Check console.' : message, {
        id: claimToastId,
      });
      console.error('Claim error:', err);
    } finally {
      setIsClaiming(false);
    }
  }, [account, chainId, addTxHistory, setPendingTx, clearPendingTx, refreshStakeInfo]);

  return {
    // Actions
    stakeTokens,
    unstakeTokens,
    claimRewards,
    refreshStakeInfo,

    // Loading states
    isStaking,
    isUnstaking,
    isClaiming,
    isRefreshing,
  };
}
