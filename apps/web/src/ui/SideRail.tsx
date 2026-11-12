import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Compass,
  Camera,
  Sparkles,
  User,
  ShoppingBag,
  Users,
  Bookmark,
  Settings as SettingsIcon,
  Shield,
  Sun,
  Moon,
  Globe,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../lib/theme';
import { clsx } from 'clsx';

export const SideRail: React.FC<{ user?: any }> = ({ user }) => {
  const { t, i18n } = useTranslation();
  const { effectiveTheme, setTheme } = useTheme();

  const toggleLanguage = () => {
    const next = i18n.language === 'ur' ? 'en' : 'ur';
    i18n.changeLanguage(next);
  };

  const toggleTheme = () => {
    setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
  };

  const links = [
    { to: '/', label: t('nav.home', 'Home'), icon: Home },
    { to: '/explore', label: t('nav.explore', 'Explore'), icon: Compass },
    { to: '/scan', label: t('nav.scan', 'Scan for Waste'), icon: Camera, highlight: true },
    { to: '/impact', label: t('nav.impact', 'Impact'), icon: Sparkles },
    { to: '/community', label: t('nav.community', 'Community'), icon: Users },
    { to: '/shop', label: t('nav.shop', 'Shop'), icon: ShoppingBag },
    { to: '/saved', label: t('nav.saved', 'Saved'), icon: Bookmark },
    { to: '/me', label: t('nav.me', 'Me'), icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r-2 border-ink bg-card h-screen sticky top-0 p-5 shadow-[4px_0_0_rgba(27,42,34,0.06)] z-30 justify-between select-none">
      <div>
        {/* Logo / Brand Banner */}
        <NavLink to="/" className="flex items-center gap-3 mb-8 group">
          <div className="w-11 h-11 rounded-2xl bg-marigold border-2 border-ink shadow-[2px_2px_0_#1B2A22] flex items-center justify-center -rotate-2 group-hover:rotate-0 transition-transform">
            <span className="font-display font-black text-xl text-ink">R</span>
          </div>
          <div>
            <h1 className="font-display font-black text-2xl tracking-tight text-ink leading-none">
              ReMake
            </h1>
            <p className="text-[10px] font-bold text-ink/60 uppercase tracking-widest mt-0.5">
              Waste to Value
            </p>
          </div>
        </NavLink>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1.5">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-display font-bold transition-all',
                    isActive
                      ? 'bg-leaf text-white border-2 border-ink shadow-[2px_2px_0_#1B2A22]'
                      : 'text-ink/80 hover:bg-paper hover:text-ink border-2 border-transparent',
                    item.highlight && !isActive && 'bg-marigold/20 text-ink border-dashed border-marigold'
                  )
                }
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {user?.role === 'ADMIN' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-display font-bold transition-all mt-2',
                  isActive
                    ? 'bg-chili text-white border-2 border-ink shadow-[2px_2px_0_#1B2A22]'
                    : 'text-chili hover:bg-chili/10 border-2 border-chili/30'
                )
              }
            >
              <Shield className="w-5 h-5 stroke-[2.2]" />
              <span>{t('nav.admin', 'Admin Panel')}</span>
            </NavLink>
          )}
        </nav>
      </div>

      {/* Footer Controls: Language, Theme, Settings */}
      <div className="pt-4 border-t-2 border-dashed border-ink/20 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border-2 border-ink bg-card text-xs font-display font-bold hover:bg-paper transition-all"
            title="Toggle English / اردو"
          >
            <Globe className="w-4 h-4" />
            <span>{i18n.language === 'ur' ? 'English' : 'اردو'}</span>
          </button>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border-2 border-ink bg-card text-ink hover:bg-paper transition-all"
            title="Toggle Daylight / Workshop Theme"
          >
            {effectiveTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-marigold" />
            ) : (
              <Moon className="w-4 h-4 text-ink" />
            )}
          </button>

          {/* Settings */}
          <NavLink
            to="/settings"
            className="p-2 rounded-xl border-2 border-ink bg-card text-ink hover:bg-paper transition-all"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </NavLink>
        </div>

        {/* User Status */}
        <div className="flex items-center gap-2 px-1 text-xs text-ink/70">
          <span className="w-2 h-2 rounded-full bg-leaf" />
          <span className="truncate font-medium">{user?.name || 'Guest Maker'}</span>
        </div>
      </div>
    </aside>
  );
};
