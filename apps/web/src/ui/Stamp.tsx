import React from 'react';
import { clsx } from 'clsx';
import { Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface StampProps {
  status?: 'TESTED' | 'UNTESTED' | 'AI_DRAFT' | 'ARCHIVED';
  variant?: 'tested' | 'draft' | 'untested' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export const Stamp: React.FC<StampProps> = ({
  status,
  variant,
  size = 'md',
  className,
  children,
}) => {
  const { t } = useTranslation();

  const effectiveVariant =
    variant ||
    (status === 'TESTED'
      ? 'tested'
      : status === 'AI_DRAFT'
      ? 'draft'
      : 'untested');

  if (effectiveVariant === 'tested') {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 rounded-md font-display font-bold uppercase tracking-wider',
          'bg-leaf/10 text-leaf border-2 border-leaf shadow-[2px_2px_0_#2E7D4F] -rotate-1',
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
          className
        )}
      >
        <CheckCircle2 className={size === 'sm' ? 'w-3 h-3 stroke-[2.5]' : 'w-3.5 h-3.5 stroke-[2.5]'} />
        {children || t('idea.testedBadge', 'TESTED BY REMAKE')}
      </span>
    );
  }

  if (effectiveVariant === 'draft') {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 rounded-md font-display font-bold uppercase tracking-wider',
          'bg-marigold/20 text-[#8F5E00] dark:text-marigold border-2 border-dashed border-marigold rotate-1',
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
          className
        )}
      >
        <Sparkles className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        {children || t('idea.aiDraftBadge', 'AI DRAFT IDEA')}
      </span>
    );
  }

  if (effectiveVariant === 'danger') {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 rounded-md font-display font-bold uppercase tracking-wider',
          'bg-chili/15 text-chili border-2 border-chili shadow-[1px_1px_0_#D9532F]',
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
          className
        )}
      >
        ✕ {children || 'REJECTED'}
      </span>
    );
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-md font-display font-bold uppercase tracking-wider',
        'bg-black/5 text-ink/70 border-2 border-ink/40 shadow-[1px_1px_0_rgba(0,0,0,0.2)]',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        className
      )}
    >
      <HelpCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {children || t('idea.untestedBadge', 'NOT YET TESTED')}
    </span>
  );
};
