import React from 'react';
import clsx from 'clsx';
import type { TrackingStep } from '@/types';
import useLangStore from '@/store/langStore';

interface StatusTimelineProps {
  steps: TrackingStep[];
}

const statusIcons: Record<string, string> = {
  pending: '📝',
  verified: '✅',
  accepted: '👍',
  paid: '💳',
  shipped: '🚚',
  delivered: '📦',
  cancelled: '❌',
};

const StatusTimeline: React.FC<StatusTimelineProps> = ({ steps }) => {
  const { t } = useLangStore();

 const getStatusLabel = (status: string): string => {
  const map: Record<string, Parameters<typeof t>[0]> = {
    pending: 'statusPending',
    verified: 'statusVerified',
    accepted: 'statusAccepted',
    paid: 'statusPaid',
    shipped: 'statusShipped',
    delivered: 'statusDelivered',
    cancelled: 'statusCancelled',
  };
  const key = map[status];
  return key ? t(key) : status;
};

  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <div key={step.status} className="flex gap-4">
            {/* Timeline column */}
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-500',
                  step.completed
                    ? 'bg-success/20 border-success'
                    : step.active
                    ? 'bg-primary/20 border-primary animate-pulse-slow'
                    : 'bg-surface-light border-glass-border'
                )}
              >
                {statusIcons[step.status] || '⏳'}
              </div>
              {!isLast && (
                <div
                  className={clsx(
                    'w-0.5 h-10 transition-all duration-500',
                    step.completed ? 'bg-success' : 'bg-surface-lighter'
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className="pb-6 pt-1.5 flex-1">
              <p
                className={clsx(
                  'font-semibold text-sm',
                  step.completed
                    ? 'text-success'
                    : step.active
                    ? 'text-primary'
                    : 'text-text-muted'
                )}
              >
                {getStatusLabel(step.status)}
              </p>
              {step.timestamp && (
                <p className="text-xs text-text-muted mt-0.5">
                  {new Date(step.timestamp).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;