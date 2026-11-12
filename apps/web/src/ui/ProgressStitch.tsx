import React from 'react';
import { clsx } from 'clsx';

export interface ProgressStitchProps {
  current: number;
  total: number;
  className?: string;
}

export const ProgressStitch: React.FC<ProgressStitchProps> = ({ current, total, className }) => {
  const percentage = Math.round((Math.max(1, current) / Math.max(1, total)) * 100);

  return (
    <div className={clsx('w-full flex flex-col gap-1.5', className)}>
      <div className="flex justify-between items-center text-xs font-display font-bold text-ink">
        <span>Step {current} of {total}</span>
        <span>{percentage}% Completed</span>
      </div>
      <div className="w-full h-3.5 bg-card rounded-full border-2 border-ink p-0.5 overflow-hidden">
        <div
          className="h-full bg-leaf rounded-full transition-all duration-300 border-r-2 border-ink"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
