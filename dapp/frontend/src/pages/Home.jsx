import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Brain, BarChart3, Shield, ArrowRight, ChevronRight, Star } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import { STAKING_APY } from '../constants/config.js';

const features = [
  {
    icon: Zap,
    title: 'High-Yield Staking',
    description: 'Stake your NEX tokens and earn 12% APY with automatic reward compounding every second.',
    color: 'cyan',
    delay: 0,
  },
  {
    icon: Brain,
    title: 'AI DeFi Assistant',
    description: 'Get intelligent insights powered by GPT-4o-mini. Ask anything about DeFi strategies and portfolio management.',
    color: 'purple',
    delay: 0.1,
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Monitor your portfolio, track staking rewards, and view live blockchain data all in one place.',
    color: 'green',
    delay: 0.2,
  },
  {
    icon: Shield,
    title: 'Audited Contracts',
    description: 'Smart contracts built with OpenZeppelin standards. ReentrancyGuard, Pausable, and full test coverage.',
    color: 'purple',
    delay: 0.3,
  },
];

const stats = [
  { label: 'Staking APY', value: `${STAKING_APY}%`, subtext: 'Fixed annual yield' },
  { label: 'Lock Period', value: '7 Days', subtext: 'Then freely unstake' },
  { label: 'Min Stake', value: '100 NEX', subtext: 'Low entry barrier' },
  { label: 'Network', value: 'Sepolia', subtext: 'Ethereum testnet' },
];

// Particle background
function ParticleBackground() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 12,
    size: Math.random() > 0.7 ? 3 : 2,
    opacity: 0.1 + Math.random() * 0.3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-neon-cyan"
          style={{
            left: `${p.x}%`,
            bottom: '-10px',
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -window.innerHeight - 20],
            x: [0, (Math.random() - 0.5) * 100],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen">
      {/* Grid background */}
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-40" />

      {/* Gradient orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 right-1/4 w-80 h-80 bg-neon-purple/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        <ParticleBackground />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-neon-cyan/5 border border-neon-cyan/20 rounded-full px-4 py-1.5 text-neon-cyan text-sm mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
          Live on Ethereum Sepolia Testnet
          <ChevronRight className="w-3.5 h-3.5" />
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-none tracking-tight"
        >
          <span className="text-white">Next-Gen</span>
          <br />
          <span className="gradient-text">DeFi on Ethereum</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Stake NEX tokens, earn{' '}
          <span className="text-neon-green font-semibold">{STAKING_APY}% APY</span>, and get
          AI-powered insights from your intelligent DeFi assistant — all in one platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            variant="solid"
            size="xl"
            onClick={() => navigate('/dashboard')}
            className="group"
          >
            Launch App
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="ghost"
            size="xl"
            onClick={() => navigate('/staking')}
          >
            Start Staking →
          </Button>
        </motion.div>

        {/* Floating stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="glass-card-cyan p-4 text-center"
            >
              <p className="text-neon-cyan text-2xl font-bold font-mono">{stat.value}</p>
              <p className="text-white text-sm font-medium mt-1">{stat.label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{stat.subtext}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything you need for{' '}
            <span className="gradient-text">DeFi success</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            NexDeFi combines cutting-edge blockchain technology with AI to give you an edge in DeFi.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: feature.delay }}
                viewport={{ once: true }}
                className={`
                  p-6 rounded-2xl border bg-dark-card
                  border-neon-${feature.color}/15 hover:border-neon-${feature.color}/30
                  transition-all duration-300 group
                  hover:shadow-[0_0_30px_rgba(0,212,255,0.05)]
                `}
              >
                <div className={`w-12 h-12 rounded-2xl bg-neon-${feature.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 text-neon-${feature.color}`} />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl p-10 text-center bg-gradient-to-br from-neon-cyan/10 via-dark-card to-neon-purple/10 border border-neon-cyan/20"
        >
          <div className="absolute inset-0 grid-bg-dense opacity-20" />
          <div className="relative">
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to start earning?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
              Connect your MetaMask wallet and start staking NEX tokens to earn{' '}
              <span className="text-neon-green font-bold">{STAKING_APY}% APY</span> today.
            </p>
            <Button
              variant="solid"
              size="xl"
              onClick={() => navigate('/staking')}
              className="mx-auto"
            >
              Start Staking Now
              <Zap className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
