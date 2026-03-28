'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { validatePassword, validatePasswordConfirmation, getPasswordStrengthColor, getPasswordStrengthBgColor } from '../../utils/passwordValidation';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  showStrengthMeter?: boolean;
  confirmPassword?: string;
  isConfirmField?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  error,
  required = false,
  disabled = false,
  className = '',
  id,
  name,
  showStrengthMeter = false,
  confirmPassword,
  isConfirmField = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Validate password or confirmation
  const validation = isConfirmField && confirmPassword
    ? validatePasswordConfirmation(value, confirmPassword)
    : validatePassword(value);

  const hasError = error || (value && !validation.isValid);
  
  // Fix: Handle different validation result types
  const getErrorMessage = () => {
    if (error) return error;
    if (value && !validation.isValid) {
      // For password confirmation, use 'error' property
      if (isConfirmField && 'error' in validation) {
        return validation.error || '';
      }
      // For regular password validation, use 'errors' array
      if ('errors' in validation && validation.errors.length > 0) {
        return validation.errors[0];
      }
    }
    return '';
  };
  
  const errorMessage = getErrorMessage();

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={id || name} 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          id={id || name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
            ${hasError 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
        />
        
        <button
          type="button"
          onClick={togglePasswordVisibility}
          disabled={disabled}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none disabled:cursor-not-allowed"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" color="#47C96F" strokeWidth={2} size={24} />
          ) : (
            <Eye className="h-5 w-5" color="#47C96F" strokeWidth={2} size={24} />
          )}
        </button>
      </div>

      {/* Password Strength Meter */}
      {showStrengthMeter && !isConfirmField && value && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Password Strength</span>
            <span className={`text-xs font-medium ${getPasswordStrengthColor(validation.strength)}`}>
              {validation.strength.charAt(0).toUpperCase() + validation.strength.slice(1)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthBgColor(validation.strength)}`}
              style={{ width: `${(validation.score / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {hasError && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}

      {/* Password Requirements (only for main password field) */}
      {showStrengthMeter && !isConfirmField && value && validation.errors.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-600 mb-1">Password must contain:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            {validation.errors.map((errorMsg, index) => (
              <li key={index} className="flex items-center">
                <span className="text-red-500 mr-1">•</span>
                {errorMsg}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordField;