'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CampaignStatusBadgeProps {
  currentStatus: 'ACTIVE' | 'PAUSED' | string;
}

export function CampaignStatusBadge({
  currentStatus
}: CampaignStatusBadgeProps) {
  const getStatusInfo = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return {
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-300',
          text: 'Active'
        };
      case 'PAUSED':
        return {
          variant: 'secondary' as const,
          className: 'bg-orange-100 text-orange-800 border-orange-300',
          text: 'Paused'
        };
      case 'ARCHIVED':
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-300',
          text: 'Archived'
        };
      case 'DELETED':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-300',
          text: 'Deleted'
        };
      default:
        return {
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-300',
          text: status || 'Unknown'
        };
    }
  };

  const statusInfo = getStatusInfo(currentStatus);

  return (
    <Badge
      variant={statusInfo.variant}
      className={statusInfo.className}
    >
      {statusInfo.text}
    </Badge>
  );
}
