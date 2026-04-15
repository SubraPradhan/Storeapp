import React, { useRef, useEffect, useCallback } from 'react';
import clsx from 'clsx';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  useEffect(() => {
    // Auto-focus first empty input
    const firstEmpty = digits.findIndex((d) => d === '');
    if (firstEmpty >= 0 && inputRefs.current[firstEmpty]) {
      inputRefs.current[firstEmpty]?.focus();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const focusInput = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(index, length - 1));
      inputRefs.current[clampedIndex]?.focus();
    },
    [length]
  );

  const handleChange = (index: number, char: string) => {
    if (disabled) return;

    // Handle paste
    if (char.length > 1) {
      const pastedDigits = char.replace(/\D/g, '').slice(0, length);
      onChange(pastedDigits);
      focusInput(pastedDigits.length - 1);
      return;
    }

    if (!/^\d?$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    const newValue = newDigits.join('').replace(/\s/g, '');
    onChange(newValue);

    if (char && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join('').trim());
        focusInput(index - 1);
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join('').trim());
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focusInput(index + 1);
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => {
            e.preventDefault();
            handleChange(index, e.clipboardData.getData('text'));
          }}
          className={clsx(
            'w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-surface-light',
            'outline-none transition-all duration-200',
            'focus:border-primary focus:ring-2 focus:ring-primary/30',
            digit
              ? 'border-primary text-primary'
              : 'border-glass-border text-text-primary',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
      ))}
    </div>
  );
};

export default OtpInput;