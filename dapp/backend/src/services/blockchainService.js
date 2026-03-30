import { ethers } from 'ethers';

// Minimal ABIs for reading blockchain data
const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function decimals() view returns (uint8)',
];

const STAKING_ABI = [
  'function getStakeInfo(address user) view returns (uint256 stakedAmount, uint256 pendingRewards, uint256 stakeTimestamp, uint256 lockEnds, bool canUnstake)',
  'function getRewards(address user) view returns (uint256)',
  'function totalStaked() view returns (uint256)',
  'function rewardPool() view returns (uint256)',
  'function paused() view returns (bool)',
  'event Staked(address indexed user, uint256 amount, uint256 timestamp)',
  'event Unstaked(address indexed user, uint256 amount, uint256 timestamp)',
  'event RewardsClaimed(address indexed user, uint256 amount, uint256 timestamp)',
];

let provider = null;
let tokenContract = null;
let stakingContract = null;

/**
 * Initialize the ethers provider and contracts
 */
function initProvider() {
  if (provider) return provider;

  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  if (!rpcUrl || rpcUrl.includes('placeholder')) {
    console.warn('Warning: No valid SEPOLIA_RPC_URL configured. Blockchain service will be limited.');
    return null;
  }

  try {
    provider = new ethers.JsonRpcProvider(rpcUrl);

    const tokenAddress = process.env.NEX_TOKEN_ADDRESS;
    const stakingAddress = process.env.NEX_STAKING_ADDRESS;

    if (tokenAddress && tokenAddress !== '0x...') {
      tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    }

    if (stakingAddress && stakingAddress !== '0x...') {
      stakingContract = new ethers.Contract(stakingAddress, STAKING_ABI, provider);
    }

    return provider;
  } catch (err) {
    console.error('Failed to initialize blockchain provider:', err.message);
    return null;
  }
}

/**
 * Get NEX token info for an address
 * @param {string} address - Wallet address
 */
export async function getTokenInfo(address) {
  const p = initProvider();
  if (!p || !tokenContract) {
    return {
      balance: '0',
      balanceFormatted: '0',
      address: process.env.NEX_TOKEN_ADDRESS || null,
      error: 'Blockchain service not configured',
    };
  }

  try {
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }

    const [balance, totalSupply, symbol, decimals] = await Promise.all([
      tokenContract.balanceOf(address),
      tokenContract.totalSupply(),
      tokenContract.symbol(),
      tokenContract.decimals(),
    ]);

    return {
      balance: balance.toString(),
      balanceFormatted: ethers.formatUnits(balance, decimals),
      totalSupply: totalSupply.toString(),
      totalSupplyFormatted: ethers.formatUnits(totalSupply, decimals),
      symbol,
      decimals: Number(decimals),
      address: process.env.NEX_TOKEN_ADDRESS,
    };
  } catch (err) {
    console.error('getTokenInfo error:', err.message);
    throw new Error(`Failed to fetch token info: ${err.message}`);
  }
}

/**
 * Get staking info for an address
 * @param {string} address - Wallet address
 */
export async function getStakingInfo(address) {
  const p = initProvider();
  if (!p || !stakingContract) {
    return {
      stakedAmount: '0',
      pendingRewards: '0',
      stakeTimestamp: 0,
      lockEnds: 0,
      canUnstake: false,
      totalStaked: '0',
      error: 'Blockchain service not configured',
    };
  }

  try {
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }

    const [stakeInfo, totalStaked, rewardPool] = await Promise.all([
      stakingContract.getStakeInfo(address),
      stakingContract.totalStaked(),
      stakingContract.rewardPool(),
    ]);

    return {
      stakedAmount: stakeInfo[0].toString(),
      stakedAmountFormatted: ethers.formatEther(stakeInfo[0]),
      pendingRewards: stakeInfo[1].toString(),
      pendingRewardsFormatted: ethers.formatEther(stakeInfo[1]),
      stakeTimestamp: Number(stakeInfo[2]),
      lockEnds: Number(stakeInfo[3]),
      canUnstake: stakeInfo[4],
      totalStaked: totalStaked.toString(),
      totalStakedFormatted: ethers.formatEther(totalStaked),
      rewardPool: rewardPool.toString(),
      rewardPoolFormatted: ethers.formatEther(rewardPool),
    };
  } catch (err) {
    console.error('getStakingInfo error:', err.message);
    throw new Error(`Failed to fetch staking info: ${err.message}`);
  }
}

/**
 * Get current gas price from the network
 */
export async function getGasPrice() {
  const p = initProvider();
  if (!p) {
    return { error: 'Blockchain service not configured' };
  }

  try {
    const feeData = await p.getFeeData();
    return {
      gasPrice: feeData.gasPrice?.toString() || '0',
      gasPriceGwei: feeData.gasPrice
        ? ethers.formatUnits(feeData.gasPrice, 'gwei')
        : '0',
      maxFeePerGas: feeData.maxFeePerGas?.toString() || null,
      maxFeePerGasGwei: feeData.maxFeePerGas
        ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei')
        : null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString() || null,
      network: 'Sepolia',
    };
  } catch (err) {
    console.error('getGasPrice error:', err.message);
    throw new Error(`Failed to fetch gas price: ${err.message}`);
  }
}

/**
 * Listen to staking events
 * @param {Function} callback - Called with event data
 */
export function listenToStakingEvents(callback) {
  if (!stakingContract) {
    console.warn('Staking contract not initialized, cannot listen to events');
    return () => {};
  }

  const handleStaked = (user, amount, timestamp, event) => {
    callback({
      type: 'Staked',
      user,
      amount: ethers.formatEther(amount),
      timestamp: Number(timestamp),
      txHash: event.transactionHash,
    });
  };

  const handleUnstaked = (user, amount, timestamp, event) => {
    callback({
      type: 'Unstaked',
      user,
      amount: ethers.formatEther(amount),
      timestamp: Number(timestamp),
      txHash: event.transactionHash,
    });
  };

  const handleRewardsClaimed = (user, amount, timestamp, event) => {
    callback({
      type: 'RewardsClaimed',
      user,
      amount: ethers.formatEther(amount),
      timestamp: Number(timestamp),
      txHash: event.transactionHash,
    });
  };

  stakingContract.on('Staked', handleStaked);
  stakingContract.on('Unstaked', handleUnstaked);
  stakingContract.on('RewardsClaimed', handleRewardsClaimed);

  // Return cleanup function
  return () => {
    stakingContract.off('Staked', handleStaked);
    stakingContract.off('Unstaked', handleUnstaked);
    stakingContract.off('RewardsClaimed', handleRewardsClaimed);
  };
}

/**
 * Check blockchain service health
 */
export async function checkHealth() {
  const p = initProvider();
  if (!p) {
    return {
      status: 'degraded',
      message: 'Provider not configured',
      rpcConfigured: false,
    };
  }

  try {
    const blockNumber = await p.getBlockNumber();
    const network = await p.getNetwork();
    return {
      status: 'healthy',
      blockNumber,
      chainId: network.chainId.toString(),
      network: network.name,
      rpcConfigured: true,
      contractsConfigured: !!(tokenContract && stakingContract),
    };
  } catch (err) {
    return {
      status: 'error',
      message: err.message,
      rpcConfigured: true,
    };
  }
}
