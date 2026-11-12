import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

export interface ChipProps {
  label: string;
  selected?: boolean;
  active?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  active,
  onClick,
  icon,
  className,
}) => {
  const isSelected = active !== undefined ? active : selected;
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-bold transition-all cursor-pointer select-none active:scale-95',
        isSelected
          ? 'bg-leaf text-white border-2 border-ink shadow-[2px_2px_0_#1B2A22]'
          : 'bg-card text-ink border-2 border-ink/40 hover:border-ink shadow-[1px_1px_0_rgba(27,42,34,0.1)]',
        className
      )}
    >
      {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : icon}
      <span>{label}</span>
    </button>
  );
};
