import React from 'react';
import { clsx } from 'clsx';

export interface TicketStatProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  className?: string;
}

export const TicketStat: React.FC<TicketStatProps> = ({
  label,
  value,
  unit,
  icon,
  highlight = false,
  className,
}) => {
  return (
    <div
      className={clsx(
        'relative flex flex-col items-center justify-center p-2.5 rounded-xl border-2 border-ink text-center select-none',
        highlight ? 'bg-marigold text-ink shadow-[2px_2px_0_#1B2A22]' : 'bg-card text-ink shadow-[2px_2px_0_rgba(27,42,34,0.12)]',
        className
      )}
    >
      <div className="flex items-center gap-1 text-[11px] font-display font-medium text-ink/75 uppercase tracking-wide">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-base font-display font-black text-ink mt-0.5 flex items-baseline gap-0.5">
        <span>{value}</span>
        {unit && <span className="text-[11px] font-bold text-ink/70">{unit}</span>}
      </div>
    </div>
  );
};
