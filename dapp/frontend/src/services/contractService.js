import { ethers } from 'ethers';
import {
  NEX_TOKEN_ADDRESS,
  NEX_STAKING_ADDRESS,
  NEX_TOKEN_ABI,
  NEX_STAKING_ABI,
  TOKEN_DECIMALS,
} from '../constants/config.js';

/**
 * Get the ethers BrowserProvider (MetaMask)
 */
export function getProvider() {
  if (!window.ethereum) {
    throw new Error('MetaMask not detected. Please install MetaMask.');
  }
  return new ethers.BrowserProvider(window.ethereum);
}

/**
 * Get a signer from the current provider
 */
export async function getSigner() {
  const provider = getProvider();
  const signer = await provider.getSigner();
  return signer;
}

/**
 * Get NexToken contract instance
 * @param {ethers.Signer|ethers.Provider} signerOrProvider
 */
export function getNexTokenContract(signerOrProvider) {
  return new ethers.Contract(NEX_TOKEN_ADDRESS, NEX_TOKEN_ABI, signerOrProvider);
}

/**
 * Get NexStaking contract instance
 * @param {ethers.Signer|ethers.Provider} signerOrProvider
 */
export function getNexStakingContract(signerOrProvider) {
  return new ethers.Contract(NEX_STAKING_ADDRESS, NEX_STAKING_ABI, signerOrProvider);
}

/**
 * Format a BigInt wei value to a human-readable NEX string
 * @param {bigint|string} amount - Amount in wei
 * @param {number} decimals - Number of decimal places to display
 */
export function formatNEX(amount, decimals = 4) {
  if (!amount && amount !== 0n) return '0';
  try {
    const formatted = ethers.formatUnits(amount.toString(), TOKEN_DECIMALS);
    const num = parseFloat(formatted);
    if (num === 0) return '0';
    if (num < 0.0001) return '<0.0001';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  } catch {
    return '0';
  }
}

/**
 * Parse a human-readable NEX amount to wei BigInt
 * @param {string|number} amount - Human-readable amount
 */
export function parseNEX(amount) {
  try {
    return ethers.parseUnits(amount.toString(), TOKEN_DECIMALS);
  } catch {
    throw new Error(`Invalid amount: ${amount}`);
  }
}

/**
 * Format ETH balance
 * @param {bigint|string} wei
 */
export function formatETH(wei, decimals = 4) {
  if (!wei && wei !== 0n) return '0';
  try {
    const formatted = ethers.formatEther(wei.toString());
    return parseFloat(formatted).toFixed(decimals);
  } catch {
    return '0';
  }
}

/**
 * Get NEX token balance for an address
 * @param {string} address
 */
export async function getTokenBalance(address) {
  try {
    const provider = getProvider();
    const contract = getNexTokenContract(provider);
    const balance = await contract.balanceOf(address);
    return balance;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0n;
  }
}

/**
 * Get full staking info for an address
 * @param {string} address
 */
export async function getStakeInfo(address) {
  try {
    const provider = getProvider();
    const contract = getNexStakingContract(provider);
    const info = await contract.getStakeInfo(address);
    return {
      stakedAmount: info[0],
      pendingRewards: info[1],
      stakeTimestamp: info[2],
      lockEnds: info[3],
      canUnstake: info[4],
    };
  } catch (error) {
    console.error('Error fetching stake info:', error);
    return {
      stakedAmount: 0n,
      pendingRewards: 0n,
      stakeTimestamp: 0n,
      lockEnds: 0n,
      canUnstake: false,
    };
  }
}

/**
 * Get global staking stats (total staked, reward pool)
 */
export async function getGlobalStakingStats() {
  try {
    const provider = getProvider();
    const contract = getNexStakingContract(provider);
    const [totalStaked, rewardPool] = await Promise.all([
      contract.totalStaked(),
      contract.rewardPool(),
    ]);
    return { totalStaked, rewardPool };
  } catch (error) {
    console.error('Error fetching global staking stats:', error);
    return { totalStaked: 0n, rewardPool: 0n };
  }
}

/**
 * Shorten an Ethereum address for display
 * @param {string} address
 */
export function shortenAddress(address, chars = 4) {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Get Etherscan URL for a transaction hash
 * @param {string} hash - Transaction hash
 * @param {number} chainId - Chain ID
 */
export function getExplorerTxUrl(hash, chainId) {
  const explorers = {
    11155111: 'https://sepolia.etherscan.io',
    1: 'https://etherscan.io',
    1337: null,
  };
  const base = explorers[chainId];
  if (!base) return null;
  return `${base}/tx/${hash}`;
}
