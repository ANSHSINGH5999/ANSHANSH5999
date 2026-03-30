import { Router } from 'express';
import { getTokenInfo, getStakingInfo, getGasPrice, checkHealth } from '../services/blockchainService.js';
import { ethers } from 'ethers';

const router = Router();

/**
 * GET /api/blockchain/info/:address
 * Get combined token + staking info for a wallet address
 */
router.get('/info/:address', async (req, res) => {
  const { address } = req.params;

  // Validate Ethereum address
  if (!ethers.isAddress(address)) {
    return res.status(400).json({
      error: 'Invalid Ethereum address',
      code: 'INVALID_ADDRESS',
    });
  }

  try {
    const [tokenInfo, stakingInfo] = await Promise.allSettled([
      getTokenInfo(address),
      getStakingInfo(address),
    ]);

    res.json({
      success: true,
      address,
      token: tokenInfo.status === 'fulfilled'
        ? tokenInfo.value
        : { error: tokenInfo.reason?.message || 'Failed to fetch token info' },
      staking: stakingInfo.status === 'fulfilled'
        ? stakingInfo.value
        : { error: stakingInfo.reason?.message || 'Failed to fetch staking info' },
    });
  } catch (err) {
    console.error('Blockchain info error:', err);
    res.status(500).json({
      error: 'Failed to fetch blockchain data',
      code: 'BLOCKCHAIN_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

/**
 * GET /api/blockchain/gas
 * Get current gas price data
 */
router.get('/gas', async (req, res) => {
  try {
    const gasData = await getGasPrice();
    res.json({
      success: true,
      ...gasData,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Gas price error:', err);
    res.status(500).json({
      error: 'Failed to fetch gas price',
      code: 'GAS_PRICE_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

/**
 * GET /api/blockchain/health
 * Blockchain service health check
 */
router.get('/health', async (req, res) => {
  try {
    const health = await checkHealth();
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 206 : 503;
    res.status(statusCode).json({
      success: health.status === 'healthy',
      ...health,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      status: 'error',
      error: err.message,
    });
  }
});

export default router;
