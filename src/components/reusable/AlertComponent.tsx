import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'warning' | 'success';
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const getAlertStyles = (variant: string) => {
  switch (variant) {
    case 'destructive':
      return 'border-red-200 bg-red-50 text-red-800';
    case 'warning':
      return 'border-yellow-200 bg-yellow-50 text-yellow-800';
    case 'success':
      return 'border-green-200 bg-green-50 text-green-800';
    default:
      return 'border-blue-200 bg-blue-50 text-blue-800';
  }
};

export const Alert: React.FC<AlertProps> = ({ children, className = '', variant = 'default' }) => {
  const alertStyles = getAlertStyles(variant);
  
  return (
    <div className={`border rounded-lg p-4 ${alertStyles} ${className}`}>
      {children}
    </div>
  );
};

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ children, className = '' }) => {
  return (
    <div className={`text-sm ${className}`}>
      {children}
    </div>
  );
};