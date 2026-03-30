import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ArrowUpRight, ArrowDownLeft, Gift, History } from 'lucide-react';
import useStore from '../../store/useStore.js';
import GlowBadge from '../ui/GlowBadge.jsx';
import { getExplorerTxUrl } from '../../services/contractService.js';

const txTypeConfig = {
  'Stake': { icon: ArrowUpRight, color: 'cyan', label: 'Stake' },
  'Unstake': { icon: ArrowDownLeft, color: 'purple', label: 'Unstake' },
  'Claim Rewards': { icon: Gift, color: 'green', label: 'Rewards' },
};

const statusConfig = {
  'Confirmed': { color: 'green', label: 'Confirmed' },
  'Pending': { color: 'yellow', label: 'Pending' },
  'Failed': { color: 'red', label: 'Failed' },
};

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TransactionHistory() {
  const { txHistory, chainId } = useStore();

  return (
    <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-neon-cyan" />
          <h3 className="text-white font-semibold">Transaction History</h3>
        </div>
        {txHistory.length > 0 && (
          <span className="text-xs text-gray-500">{txHistory.length} transaction{txHistory.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Empty State */}
      {txHistory.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-dark-hover border border-dark-border flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-400 font-medium">No transactions yet</p>
          <p className="text-gray-600 text-sm mt-1">Your transaction history will appear here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-6 py-3">Type</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-6 py-3">Amount</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-6 py-3">Time</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-6 py-3">Hash</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {txHistory.map((tx, index) => {
                  const typeConfig = txTypeConfig[tx.type] || { icon: ArrowUpRight, color: 'cyan' };
                  const TxIcon = typeConfig.icon;
                  const status = statusConfig[tx.status] || statusConfig.Pending;
                  const explorerUrl = getExplorerTxUrl(tx.hash, tx.chainId || chainId);
                  const shortHash = tx.hash ? `${tx.hash.slice(0, 6)}...${tx.hash.slice(-4)}` : 'N/A';

                  return (
                    <motion.tr
                      key={tx.hash || index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-dark-border/50 hover:bg-dark-hover/50 transition-colors"
                    >
                      {/* Type */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-neon-${typeConfig.color}/10`}>
                            <TxIcon className={`w-4 h-4 text-neon-${typeConfig.color}`} />
                          </div>
                          <span className="text-white text-sm font-medium">{tx.type}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <span className="text-white font-mono text-sm">{tx.amount}</span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <GlowBadge color={status.color} size="xs">
                          {status.label}
                        </GlowBadge>
                      </td>

                      {/* Time */}
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm">{formatTime(tx.timestamp)}</span>
                      </td>

                      {/* Hash */}
                      <td className="px-6 py-4">
                        {explorerUrl ? (
                          <a
                            href={explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-neon-cyan/70 hover:text-neon-cyan text-sm font-mono transition-colors group"
                          >
                            {shortHash}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ) : (
                          <span className="text-gray-500 text-sm font-mono">{shortHash}</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
