import React from 'react';
import { motion } from 'framer-motion';

const borderColors = {
  cyan: 'border-neon-cyan/20 hover:border-neon-cyan/40',
  purple: 'border-neon-purple/20 hover:border-neon-purple/40',
  green: 'border-neon-green/20 hover:border-neon-green/40',
  default: 'border-dark-border hover:border-white/10',
};

const glowColors = {
  cyan: 'hover:shadow-neon-cyan',
  purple: 'hover:shadow-neon-purple',
  green: 'hover:shadow-neon-green',
  default: '',
};

function Card({
  children,
  title,
  subtitle,
  neonColor = 'default',
  glow = false,
  className = '',
  animate = true,
  headerAction,
  padding = true,
  ...props
}) {
  const Component = animate ? motion.div : 'div';
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <Component
      className={`
        bg-dark-card rounded-2xl border
        transition-all duration-300
        ${borderColors[neonColor] || borderColors.default}
        ${glow ? glowColors[neonColor] || '' : ''}
        ${className}
      `}
      {...motionProps}
      {...props}
    >
      {(title || headerAction) && (
        <div className={`flex items-center justify-between ${padding ? 'px-6 pt-6 pb-0' : 'px-0 pt-0'}`}>
          <div>
            {title && (
              <h3 className="text-white font-semibold text-lg">{title}</h3>
            )}
            {subtitle && (
              <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={padding ? (title || headerAction ? 'p-6' : 'p-6') : ''}>
        {children}
      </div>
    </Component>
  );
}

export default Card;
