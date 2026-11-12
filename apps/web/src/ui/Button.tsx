import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-display font-semibold transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl cursor-pointer';

    const variants = {
      primary:
        'bg-marigold text-ink shadow-[0_4px_0_#C98F1E] hover:bg-marigold-hover active:translate-y-1 active:shadow-none border-2 border-ink',
      secondary:
        'bg-leaf text-card shadow-[0_4px_0_#1E5636] hover:bg-leaf-hover active:translate-y-1 active:shadow-none border-2 border-ink',
      danger:
        'bg-chili text-white shadow-[0_4px_0_#9E351B] hover:opacity-90 active:translate-y-1 active:shadow-none border-2 border-ink',
      ghost: 'bg-transparent text-ink hover:bg-black/5 active:bg-black/10 border-2 border-transparent',
      outline:
        'bg-card text-ink border-2 border-ink shadow-[0_3px_0_rgba(27,42,34,0.15)] hover:bg-paper active:translate-y-0.5 active:shadow-none',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm min-h-[38px]',
      md: 'px-5 py-2.5 text-base min-h-[46px]',
      lg: 'px-7 py-3.5 text-lg min-h-[54px]',
    };

    return (
      <button
        ref={ref}
        className={clsx(
          base,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
