import React from 'react';
import clsx from 'clsx';

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: 'sm' | 'md';
}

const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  size = 'sm',
}) => {
  const isSmall = size === 'sm';

  return (
    <div
      className={clsx(
        'flex items-center gap-0 rounded-xl overflow-hidden border border-primary/30 bg-surface-light',
        isSmall ? 'h-8' : 'h-10'
      )}
    >
      <button
        onClick={onDecrement}
        className={clsx(
          'flex items-center justify-center text-primary hover:bg-primary/20 transition-colors font-bold',
          isSmall ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-lg'
        )}
      >
        −
      </button>
      <span
        className={clsx(
          'flex items-center justify-center font-semibold text-text-primary bg-surface',
          isSmall ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base'
        )}
      >
        {quantity}
      </span>
      <button
        onClick={onIncrement}
        className={clsx(
          'flex items-center justify-center text-primary hover:bg-primary/20 transition-colors font-bold',
          isSmall ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-lg'
        )}
      >
        +
      </button>
    </div>
  );
};

export default QuantityStepper;