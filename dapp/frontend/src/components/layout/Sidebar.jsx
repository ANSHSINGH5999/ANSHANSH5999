import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, LayoutDashboard, Layers, Bot, X, Wallet, ChevronRight, Zap } from 'lucide-react';
import useStore from '../../store/useStore.js';
import GlowBadge from '../ui/GlowBadge.jsx';

const navLinks = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/staking', label: 'Staking', icon: Layers, badge: '12% APY' },
  { path: '/ai-chat', label: 'AI Chat', icon: Bot, badge: 'New' },
];

export default function Sidebar() {
  const location = useLocation();
  const { isSidebarOpen, setSidebarOpen, account, balance, nexBalance, chainId } = useStore();

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="
              fixed top-0 right-0 bottom-0 z-50
              w-72 bg-dark-card border-l border-dark-border
              flex flex-col md:hidden
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-neon-cyan" />
                </div>
                <span className="font-bold gradient-text">NexDeFi</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                      ${isActive
                        ? 'bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan'
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-neon-cyan' : 'group-hover:text-neon-cyan/70'}`} />
                    <span className="font-medium flex-1">{link.label}</span>
                    {link.badge && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-neon-cyan/20 text-neon-cyan'
                          : 'bg-white/10 text-gray-400'
                      }`}>
                        {link.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-4 h-4 text-neon-cyan" />}
                  </Link>
                );
              })}
            </nav>

            {/* Wallet Info at Bottom */}
            <div className="px-3 pb-6 pt-3 border-t border-dark-border">
              {account ? (
                <div className="p-4 rounded-xl bg-dark-hover border border-dark-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{shortAddress}</p>
                      <GlowBadge color="green" size="xs" showDot>
                        Connected
                      </GlowBadge>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">ETH</span>
                      <span className="text-white font-mono">{parseFloat(balance || 0).toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">NEX</span>
                      <span className="text-neon-cyan font-mono">{nexBalance || '0'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-dark-hover border border-dark-border text-center">
                  <Wallet className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No wallet connected</p>
                  <p className="text-gray-600 text-xs mt-1">Use the Connect button in the navbar</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
