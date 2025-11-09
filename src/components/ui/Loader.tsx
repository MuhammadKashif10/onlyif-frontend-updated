'use client';
import { LoaderCircle } from 'lucide-react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  color?: 'blue' | 'white' | 'gray';
  className?: string;
}

export default function Loader({
  size = 'md',
  variant = 'spinner',
  color = 'blue',
  className = ''
}: LoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorValue = color === 'white' ? '#ffffff' : color === 'gray' ? '#6b7280' : '#47C96F';

  const renderSpinner = () => (
    <LoaderCircle
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      color={colorValue}
      strokeWidth={2}
      size={24}
      aria-label="Loading"
    />
  );

  const renderDots = () => (
    <div className={`flex space-x-1 ${className}`}>
      <div className={`${sizeClasses.sm} rounded-full animate-bounce`} style={{ backgroundColor: colorValue, animationDelay: '0ms' }}></div>
      <div className={`${sizeClasses.sm} rounded-full animate-bounce`} style={{ backgroundColor: colorValue, animationDelay: '150ms' }}></div>
      <div className={`${sizeClasses.sm} rounded-full animate-bounce`} style={{ backgroundColor: colorValue, animationDelay: '300ms' }}></div>
    </div>
  );

  const renderPulse = () => (
    <div className={`${sizeClasses[size]} rounded-full animate-pulse ${className}`} style={{ backgroundColor: colorValue }}></div>
  );

  switch (variant) {
    case 'dots':
      return renderDots();
    case 'pulse':
      return renderPulse();
    case 'spinner':
    default:
      return renderSpinner();
  }
}
