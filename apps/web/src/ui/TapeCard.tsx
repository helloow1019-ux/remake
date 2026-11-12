import React, { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface TapeCardProps extends HTMLAttributes<HTMLDivElement> {
  tape?: boolean;
  stitched?: boolean;
  tapePosition?: 'top-left' | 'top-right' | string;
  tapeColor?: 'yellow' | 'washi' | string;
}

export const TapeCard: React.FC<TapeCardProps> = ({
  tape = true,
  stitched = false,
  tapePosition = 'top-left',
  tapeColor = 'yellow',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'relative bg-card text-ink rounded-2xl border-2 border-ink shadow-[0_4px_0_rgba(27,42,34,0.15)] transition-all',
        tape && 'tape-corner',
        stitched && 'border-dashed border-sky',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
