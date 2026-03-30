import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

// Generate fake sparkline data
function generateSparklineData(baseValue, points = 10) {
  const data = [];
  let current = baseValue;
  for (let i = 0; i < points; i++) {
    current = current * (0.95 + Math.random() * 0.1);
    data.push({ value: Math.max(0, current) });
  }
  return data;
}

// Animated number hook
function useAnimatedNumber(target, duration = 1000) {
  const [current, setCurrent] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const targetNum = parseFloat(target) || 0;
    if (isNaN(targetNum)) return;

    const startValue = current;
    startRef.current = null;

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCurrent(startValue + (targetNum - startValue) * easedProgress);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps

  return current;
}

const colorSchemes = {
  cyan: {
    gradient: 'from-neon-cyan/10 to-transparent',
    border: 'border-neon-cyan/20 hover:border-neon-cyan/40',
    icon: 'bg-neon-cyan/10 text-neon-cyan',
    chart: '#00d4ff',
    text: 'text-neon-cyan',
  },
  purple: {
    gradient: 'from-neon-purple/10 to-transparent',
    border: 'border-neon-purple/20 hover:border-neon-purple/40',
    icon: 'bg-neon-purple/10 text-neon-purple',
    chart: '#8b5cf6',
    text: 'text-neon-purple',
  },
  green: {
    gradient: 'from-neon-green/10 to-transparent',
    border: 'border-neon-green/20 hover:border-neon-green/40',
    icon: 'bg-neon-green/10 text-neon-green',
    chart: '#00ff88',
    text: 'text-neon-green',
  },
  orange: {
    gradient: 'from-orange-500/10 to-transparent',
    border: 'border-orange-500/20 hover:border-orange-500/40',
    icon: 'bg-orange-500/10 text-orange-400',
    chart: '#f97316',
    text: 'text-orange-400',
  },
};

export default function BalanceCard({
  label,
  value,
  unit = '',
  change,
  icon: Icon,
  color = 'cyan',
  loading = false,
  index = 0,
}) {
  const scheme = colorSchemes[color] || colorSchemes.cyan;
  const numValue = parseFloat(value) || 0;
  const animatedValue = useAnimatedNumber(numValue);
  const sparklineData = React.useMemo(() => generateSparklineData(numValue || 100), [label]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeNum = parseFloat(change);
  const isPositive = changeNum > 0;
  const isNeutral = !change || changeNum === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`
        relative bg-dark-card rounded-2xl border p-5
        transition-all duration-300 overflow-hidden
        ${scheme.border}
        hover:shadow-lg cursor-default
      `}
    >
      {/* Background gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-radial ${scheme.gradient} rounded-full blur-2xl pointer-events-none`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-3 relative">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${scheme.icon}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</p>
          </div>
        </div>

        {/* Change indicator */}
        {!isNeutral && (
          <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-neon-green' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{isPositive ? '+' : ''}{changeNum.toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-3 relative">
        {loading ? (
          <div className="h-8 w-32 bg-white/5 rounded-lg animate-pulse" />
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${scheme.text}`}>
              {animatedValue < 1 && animatedValue > 0
                ? animatedValue.toFixed(4)
                : animatedValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </span>
            {unit && <span className="text-gray-500 text-sm">{unit}</span>}
          </div>
        )}
      </div>

      {/* Sparkline */}
      <div className="h-12 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData}>
            <defs>
              <linearGradient id={`gradient-${color}-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={scheme.chart} stopOpacity={0.3} />
                <stop offset="95%" stopColor={scheme.chart} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={scheme.chart}
              strokeWidth={1.5}
              fill={`url(#gradient-${color}-${index})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
