import React from 'react';
import clsx from 'clsx';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hover = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        hover ? 'glass-hover' : 'glass',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassCard;