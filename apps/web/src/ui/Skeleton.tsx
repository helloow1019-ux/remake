import React from 'react';
import { clsx } from 'clsx';

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={clsx(
        'animate-pulse bg-ink/10 rounded-xl border-2 border-dashed border-ink/20',
        className
      )}
    />
  );
};
