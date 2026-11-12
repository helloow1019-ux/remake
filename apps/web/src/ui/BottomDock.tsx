import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Camera, Sparkles, User, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';

export const BottomDock: React.FC = () => {
  const { t } = useTranslation();

  const navItems = [
    { to: '/', label: t('nav.home', 'Home'), icon: Home },
    { to: '/explore', label: t('nav.explore', 'Explore'), icon: Compass },
    { to: '/scan', label: t('nav.scan', 'Scan'), icon: Camera, raised: true },
    { to: '/impact', label: t('nav.impact', 'Impact'), icon: Sparkles },
    { to: '/me', label: t('nav.me', 'Me'), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t-2 border-ink z-40 md:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 px-2 relative">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.raised) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'relative -top-5 flex flex-col items-center justify-center w-14 h-14 rounded-full',
                    'bg-marigold text-ink border-2 border-ink shadow-[0_4px_0_#1B2A22]',
                    'active:translate-y-1 active:shadow-none transition-transform',
                    isActive && 'ring-4 ring-marigold/40'
                  )
                }
              >
                <Icon className="w-7 h-7 stroke-[2.5]" />
                <span className="sr-only">{item.label}</span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center flex-1 py-1 text-ink transition-colors',
                  isActive ? 'text-leaf font-bold' : 'text-ink/65 hover:text-ink'
                )
              }
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] font-display mt-0.5">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
