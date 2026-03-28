'use client';

import React from 'react';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  enabled,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-7',
    md: 'h-5 w-9',
    lg: 'h-6 w-11',
  };

  const thumbSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const translateClasses = {
    sm: enabled ? 'translate-x-3' : 'translate-x-0',
    md: enabled ? 'translate-x-4' : 'translate-x-0',
    lg: enabled ? 'translate-x-5' : 'translate-x-0',
  };

  return (
    <div className={`flex items-center ${className}`}>
      {label && (
        <div className="mr-3">
          <label className="text-sm font-medium text-gray-900">{label}</label>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      )}
      <button
        type="button"
        className={`
          ${sizeClasses[size]}
          relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${enabled ? 'bg-blue-600' : 'bg-gray-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        role="switch"
        aria-checked={enabled}
        aria-label={label || 'Toggle'}
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
      >
        <span
          aria-hidden="true"
          className={`
            ${thumbSizeClasses[size]}
            ${translateClasses[size]}
            pointer-events-none inline-block rounded-full bg-white shadow transform ring-0
            transition duration-200 ease-in-out
          `}
        />
      </button>
    </div>
  );
};

export default Toggle;