import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Zap } from 'lucide-react';
import ConnectWallet from '../wallet/ConnectWallet.jsx';
import useStore from '../../store/useStore.js';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/staking', label: 'Staking' },
  { path: '/ai-chat', label: 'AI Chat' },
];

function NexDefiLogo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <div className="relative">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 flex items-center justify-center group-hover:shadow-neon-cyan transition-all duration-300">
          <Zap className="w-5 h-5 text-neon-cyan" />
        </div>
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-neon-green border border-dark-bg animate-pulse" />
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold gradient-text leading-none">NexDeFi</span>
        <span className="text-[10px] text-gray-500 leading-none tracking-widest uppercase">Protocol</span>
      </div>
    </Link>
  );
}

export default function Navbar() {
  const location = useLocation();
  const { isSidebarOpen, toggleSidebar } = useStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <NexDefiLogo />

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neon-cyan"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <ConnectWallet />

          {/* Mobile Hamburger */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-xl bg-dark-card border border-dark-border text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
