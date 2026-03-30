import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // ============ Wallet State ============
      account: null,
      chainId: null,
      balance: '0',
      isConnecting: false,
      walletError: null,

      // ============ Contract State ============
      nexBalance: '0',
      stakedAmount: '0',
      pendingRewards: '0',
      stakeTimestamp: 0,
      lockEnds: 0,
      canUnstake: false,
      totalStaked: '0',
      rewardPool: '0',

      // ============ UI State ============
      isSidebarOpen: false,
      activeTab: 'dashboard',

      // ============ Transaction State ============
      pendingTx: null,
      txHistory: [],

      // ============ Wallet Actions ============
      setAccount: (account) => set({ account }),
      setChainId: (chainId) => set({ chainId }),
      setBalance: (balance) => set({ balance }),
      setIsConnecting: (isConnecting) => set({ isConnecting }),
      setWalletError: (walletError) => set({ walletError }),

      // ============ Contract Actions ============
      setNexBalance: (nexBalance) => set({ nexBalance }),
      setStakedAmount: (stakedAmount) => set({ stakedAmount }),
      setPendingRewards: (pendingRewards) => set({ pendingRewards }),
      setStakeTimestamp: (stakeTimestamp) => set({ stakeTimestamp }),
      setLockEnds: (lockEnds) => set({ lockEnds }),
      setCanUnstake: (canUnstake) => set({ canUnstake }),
      setTotalStaked: (totalStaked) => set({ totalStaked }),
      setRewardPool: (rewardPool) => set({ rewardPool }),

      setStakeInfo: ({ stakedAmount, pendingRewards, stakeTimestamp, lockEnds, canUnstake }) =>
        set({ stakedAmount, pendingRewards, stakeTimestamp, lockEnds, canUnstake }),

      // ============ UI Actions ============
      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setActiveTab: (activeTab) => set({ activeTab }),

      // ============ Transaction Actions ============
      setPendingTx: (pendingTx) => set({ pendingTx }),
      addTxHistory: (tx) =>
        set((state) => ({
          txHistory: [tx, ...state.txHistory].slice(0, 50), // Keep last 50
        })),
      updateTxStatus: (hash, status) =>
        set((state) => ({
          txHistory: state.txHistory.map((tx) =>
            tx.hash === hash ? { ...tx, status } : tx
          ),
        })),
      clearPendingTx: () => set({ pendingTx: null }),

      // ============ Reset ============
      reset: () =>
        set({
          account: null,
          chainId: null,
          balance: '0',
          isConnecting: false,
          walletError: null,
          nexBalance: '0',
          stakedAmount: '0',
          pendingRewards: '0',
          stakeTimestamp: 0,
          lockEnds: 0,
          canUnstake: false,
          totalStaked: '0',
          rewardPool: '0',
          pendingTx: null,
        }),
    }),
    {
      name: 'nexdefi-store',
      partialize: (state) => ({
        // Only persist tx history and UI preferences
        txHistory: state.txHistory,
        activeTab: state.activeTab,
      }),
    }
  )
);

export default useStore;
