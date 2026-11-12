import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

export interface StickerProps {
  slug: string;
  name: string;
  count?: number;
  selected?: boolean;
  onClick?: () => void;
  icon?: string;
  className?: string;
}

// Visual color tint mapping per waste type
const WASTE_COLORS: Record<string, { bg: string; border: string }> = {
  'plastic-bottle': { bg: 'bg-[#D2EBF7]', border: 'border-[#4F9BC9]' },
  'bottle-cap': { bg: 'bg-[#FCE3AA]', border: 'border-[#F4B63F]' },
  'food-scraps': { bg: 'bg-[#D6EFD8]', border: 'border-[#2E7D4F]' },
  'old-cloth': { bg: 'bg-[#EBD5F5]', border: 'border-[#9C6ADE]' },
  'cardboard': { bg: 'bg-[#ECD9BA]', border: 'border-[#B8874E]' },
  'glass-jar': { bg: 'bg-[#D8F3E5]', border: 'border-[#3FA872]' },
  'tin-can': { bg: 'bg-[#E3E8EC]', border: 'border-[#7E93A3]' },
  'paper-newspaper': { bg: 'bg-[#F4F1EA]', border: 'border-[#8F8D88]' },
  'plastic-bag': { bg: 'bg-[#FFE6D6]', border: 'border-[#F07A48]' },
  'tetra-pack': { bg: 'bg-[#FFF0BA]', border: 'border-[#E0B228]' },
  'other': { bg: 'bg-[#EBEBEB]', border: 'border-[#A3A3A3]' },
};

export const Sticker: React.FC<StickerProps> = ({
  slug,
  name,
  count,
  selected = false,
  onClick,
  className,
}) => {
  const colors = WASTE_COLORS[slug] || { bg: 'bg-card', border: 'border-ink/20' };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.04, rotate: selected ? 0 : 1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={clsx(
        'relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 cursor-pointer select-none text-center',
        'border-3 shadow-sticker',
        selected
          ? 'ring-4 ring-marigold border-ink bg-card shadow-[0_6px_0_#1B2A22]'
          : `${colors.bg} ${colors.border} hover:border-ink`,
        className
      )}
    >
      {/* Selected Tick Stamp */}
      {selected && (
        <span className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-leaf text-white border-2 border-ink flex items-center justify-center shadow-sm z-20">
          <Check className="w-4 h-4 stroke-[3]" />
        </span>
      )}

      {/* Waste Thumbnail Photo */}
      <div className="w-14 h-14 mb-1.5 flex items-center justify-center overflow-hidden rounded-xl border border-ink/20 shadow-sm bg-white/40">
        <img
          src={`/seed/waste-${slug}.jpg`}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.endsWith('.svg')) {
              target.src = `/seed/waste-${slug}.svg`;
            } else {
              target.style.display = 'none';
            }
          }}
        />
      </div>

      {/* Label */}
      <span className="text-xs font-display font-bold text-ink leading-tight line-clamp-2 px-1">
        {name}
      </span>

      {/* Idea count pill */}
      {typeof count === 'number' && (
        <span className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-ink/10 text-ink/80">
          {count} ideas
        </span>
      )}
    </motion.button>
  );
};
