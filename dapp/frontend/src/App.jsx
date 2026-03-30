import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Staking from './pages/Staking.jsx';
import AIChat from './pages/AIChat.jsx';
import { useWallet } from './hooks/useWallet.js';

// Page transition wrapper
function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

// 404 Not Found page
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-black gradient-text mb-6">404</p>
        <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
        <a
          href="/"
          className="px-6 py-3 bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan rounded-xl hover:bg-neon-cyan/20 transition-all"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  // Initialize wallet state on app load (auto-reconnect)
  useWallet();

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Background effects */}
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-30 z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-neon-cyan/3 to-transparent pointer-events-none z-0" />

      {/* Navigation */}
      <Navbar />
      <Sidebar />

      {/* Main Content */}
      <main className="relative pt-16 z-10">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <Home />
                </PageTransition>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              }
            />
            <Route
              path="/staking"
              element={
                <PageTransition>
                  <Staking />
                </PageTransition>
              }
            />
            <Route
              path="/ai-chat"
              element={
                <PageTransition>
                  <AIChat />
                </PageTransition>
              }
            />
            <Route
              path="*"
              element={
                <PageTransition>
                  <NotFound />
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}
