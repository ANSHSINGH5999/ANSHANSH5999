import React from 'react';

const colorMap = {
  green: {
    bg: 'bg-neon-green/10',
    border: 'border-neon-green/30',
    text: 'text-neon-green',
    dot: 'bg-neon-green',
    shadow: 'shadow-[0_0_8px_rgba(0,255,136,0.3)]',
  },
  cyan: {
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/30',
    text: 'text-neon-cyan',
    dot: 'bg-neon-cyan',
    shadow: 'shadow-[0_0_8px_rgba(0,212,255,0.3)]',
  },
  purple: {
    bg: 'bg-neon-purple/10',
    border: 'border-neon-purple/30',
    text: 'text-neon-purple',
    dot: 'bg-neon-purple',
    shadow: 'shadow-[0_0_8px_rgba(139,92,246,0.3)]',
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    dot: 'bg-yellow-400',
    shadow: 'shadow-[0_0_8px_rgba(234,179,8,0.3)]',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    dot: 'bg-red-400',
    shadow: 'shadow-[0_0_8px_rgba(239,68,68,0.3)]',
  },
  gray: {
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
    dot: 'bg-gray-400',
    shadow: '',
  },
};

function GlowBadge({
  children,
  color = 'cyan',
  pulse = true,
  size = 'sm',
  showDot = true,
  className = '',
}) {
  const colors = colorMap[color] || colorMap.cyan;
  const sizeClasses = size === 'xs' ? 'text-xs px-2 py-0.5' : 'text-xs px-3 py-1';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-medium
        ${colors.bg} ${colors.border} ${colors.text} ${colors.shadow}
        ${sizeClasses}
        ${className}
      `}
    >
      {showDot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colors.dot}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${colors.dot}`} />
        </span>
      )}
      {children}
    </span>
  );
}

export default GlowBadge;
