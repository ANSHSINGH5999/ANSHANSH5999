import { useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import useStore from '../store/useStore.js';
import { formatETH, getTokenBalance, formatNEX, getStakeInfo } from '../services/contractService.js';
import { SUPPORTED_CHAINS } from '../constants/config.js';

const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex

export function useWallet() {
  const {
    account,
    chainId,
    balance,
    isConnecting,
    walletError,
    setAccount,
    setChainId,
    setBalance,
    setIsConnecting,
    setWalletError,
    setNexBalance,
    setStakeInfo,
    reset,
  } = useStore();

  /**
   * Load additional contract data after wallet connection
   */
  const loadContractData = useCallback(async (address) => {
    try {
      const [tokenBalance, stakeInfo] = await Promise.allSettled([
        getTokenBalance(address),
        getStakeInfo(address),
      ]);

      if (tokenBalance.status === 'fulfilled') {
        setNexBalance(formatNEX(tokenBalance.value));
      }

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
    } catch (err) {
      console.warn('Could not load contract data:', err.message);
    }
  }, [setNexBalance, setStakeInfo]);

  /**
   * Connect MetaMask wallet
   */
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not detected. Please install MetaMask extension.');
      setWalletError('MetaMask not found');
      return;
    }

    setIsConnecting(true);
    setWalletError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Request account access
      const accounts = await provider.send('eth_requestAccounts', []);
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      const address = accounts[0];
      const network = await provider.getNetwork();
      const chainIdNum = Number(network.chainId);
      const balanceWei = await provider.getBalance(address);

      setAccount(address);
      setChainId(chainIdNum);
      setBalance(formatETH(balanceWei));

      // Load contract data
      await loadContractData(address);

      const networkName = SUPPORTED_CHAINS[chainIdNum] || `Chain ${chainIdNum}`;
      toast.success(`Connected to ${networkName}`, {
        icon: '🔗',
      });

      if (!SUPPORTED_CHAINS[chainIdNum]) {
        toast('Wrong network. Please switch to Sepolia or Localhost.', {
          icon: '⚠️',
          style: { border: '1px solid rgba(255, 165, 0, 0.3)' },
        });
      }
    } catch (err) {
      const message = err.code === 4001
        ? 'Connection rejected by user.'
        : err.message || 'Failed to connect wallet.';
      setWalletError(message);
      toast.error(message);
    } finally {
      setIsConnecting(false);
    }
  }, [setIsConnecting, setWalletError, setAccount, setChainId, setBalance, loadContractData]);

  /**
   * Disconnect wallet (clears state)
   */
  const disconnectWallet = useCallback(() => {
    reset();
    toast('Wallet disconnected', { icon: '👋' });
  }, [reset]);

  /**
   * Switch or add Sepolia network
   */
  const switchNetwork = useCallback(async (targetChainId = 11155111) => {
    if (!window.ethereum) {
      toast.error('MetaMask not detected');
      return;
    }

    const chainHex = `0x${targetChainId.toString(16)}`;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainHex }],
      });
      toast.success(`Switched to ${SUPPORTED_CHAINS[targetChainId] || 'network'}`);
    } catch (switchError) {
      // Chain not added to MetaMask yet
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Ethereum Sepolia',
                nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: [
                  import.meta.env.VITE_SEPOLIA_RPC_URL ||
                  'https://rpc.sepolia.org',
                ],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
          toast.success('Sepolia network added to MetaMask');
        } catch (addError) {
          toast.error('Failed to add network: ' + addError.message);
        }
      } else {
        toast.error('Failed to switch network: ' + switchError.message);
      }
    }
  }, []);

  /**
   * Refresh ETH and NEX balances
   */
  const refreshBalances = useCallback(async () => {
    if (!account) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balanceWei = await provider.getBalance(account);
      setBalance(formatETH(balanceWei));
      await loadContractData(account);
    } catch (err) {
      console.warn('Failed to refresh balances:', err.message);
    }
  }, [account, setBalance, loadContractData]);

  /**
   * Listen for MetaMask account/chain changes
   */
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        reset();
        toast('Wallet disconnected', { icon: '👋' });
      } else if (accounts[0] !== account) {
        const newAddress = accounts[0];
        setAccount(newAddress);

        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const balanceWei = await provider.getBalance(newAddress);
          setBalance(formatETH(balanceWei));
          await loadContractData(newAddress);
        } catch (err) {
          console.warn('Error handling account change:', err);
        }

        toast(`Account changed to ${newAddress.slice(0, 6)}...${newAddress.slice(-4)}`, {
          icon: '🔄',
        });
      }
    };

    const handleChainChanged = (chainIdHex) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);
      const networkName = SUPPORTED_CHAINS[newChainId] || `Chain ${newChainId}`;
      toast(`Switched to ${networkName}`, { icon: '🔗' });

      if (!SUPPORTED_CHAINS[newChainId]) {
        toast('Unsupported network. Please switch to Sepolia.', {
          icon: '⚠️',
          style: { border: '1px solid rgba(255, 165, 0, 0.3)' },
        });
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [account, setAccount, setChainId, setBalance, reset, loadContractData]);

  /**
   * Auto-reconnect if previously connected
   */
  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return;
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0 && !account) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();
          const balanceWei = await provider.getBalance(accounts[0]);

          setAccount(accounts[0]);
          setChainId(Number(network.chainId));
          setBalance(formatETH(balanceWei));
          await loadContractData(accounts[0]);
        }
      } catch (err) {
        console.warn('Auto-reconnect failed:', err.message);
      }
    };
    checkConnection();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    account,
    chainId,
    balance,
    isConnecting,
    walletError,
    isConnected: !!account,
    isCorrectNetwork: SUPPORTED_CHAINS[chainId] !== undefined,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshBalances,
  };
}
