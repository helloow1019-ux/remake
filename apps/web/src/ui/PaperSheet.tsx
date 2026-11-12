import React, { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface PaperSheetProps extends HTMLAttributes<HTMLDivElement> {
  tornBottom?: boolean;
  pinColor?: 'brass' | 'yellow' | 'silver' | 'blue' | string;
}

export const PaperSheet: React.FC<PaperSheetProps> = ({
  tornBottom = false,
  pinColor,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'bg-card text-ink rounded-3xl p-6 border-2 border-ink shadow-[0_6px_0_rgba(27,42,34,0.15)] relative kraft-texture',
        tornBottom && 'torn-edge pb-10',
        className
      )}
      {...props}
    >
      {pinColor && (
        <div
          className={clsx(
            'absolute -top-3 left-8 w-6 h-6 rounded-full border-2 border-ink shadow-sm pointer-events-none z-10 flex items-center justify-center',
            pinColor === 'brass' && 'bg-amber-600',
            pinColor === 'yellow' && 'bg-amber-400',
            pinColor === 'silver' && 'bg-slate-300',
            pinColor === 'blue' && 'bg-sky-500',
            !['brass', 'yellow', 'silver', 'blue'].includes(pinColor) && 'bg-amber-500'
          )}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
        </div>
      )}
      {children}
    </div>
  );
};
