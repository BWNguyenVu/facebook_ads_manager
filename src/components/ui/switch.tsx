'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  size = 'default',
  className
}: SwitchProps) {
  const sizeClasses = {
    sm: 'h-4 w-8',
    default: 'h-5 w-9',
    lg: 'h-6 w-11'
  };

  const thumbSizeClasses = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  const translateClasses = {
    sm: checked ? 'translate-x-4' : 'translate-x-0.5',
    default: checked ? 'translate-x-4' : 'translate-x-0.5',
    lg: checked ? 'translate-x-5' : 'translate-x-0.5'
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        sizeClasses[size],
        checked ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 hover:bg-gray-400',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out',
          thumbSizeClasses[size],
          translateClasses[size]
        )}
      />
    </button>
  );
}
