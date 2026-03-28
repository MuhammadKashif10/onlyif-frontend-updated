'use client';

import React from 'react';
import Badge from './Badge';

type PropertyStatus = 'pending' | 'private' | 'public' | 'sold' | 'withdrawn';

interface StatusBadgeProps {
  status: PropertyStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTooltip?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
  showTooltip = true,
}) => {
  const getStatusConfig = (status: PropertyStatus) => {
    const configs = {
      pending: {
        variant: 'warning' as const,
        label: 'Pending Review',
        tooltip: 'Property is awaiting media uploads or admin approval',
      },
      private: {
        variant: 'info' as const,
        label: 'Private',
        tooltip: 'Property is visible only to users who have unlocked it',
      },
      public: {
        variant: 'success' as const,
        label: 'Public',
        tooltip: 'Property is visible in search results',
      },
      sold: {
        variant: 'default' as const,
        label: 'Sold',
        tooltip: 'Property has been sold',
      },
      withdrawn: {
        variant: 'error' as const,
        label: 'Withdrawn',
        tooltip: 'Property has been withdrawn from the market',
      },
    };
    return configs[status] || configs.pending;
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant={config.variant}
      size={size}
      className={className}
      tooltip={showTooltip ? config.tooltip : undefined}
    >
      {config.label}
    </Badge>
  );
};

export default StatusBadge;