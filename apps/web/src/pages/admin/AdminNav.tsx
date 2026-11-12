import React from 'react';
import { NavLink, Link } from 'react-router-dom';

export const AdminNav: React.FC = () => {
  const navItems = [
    { label: 'Overview', path: '/admin', end: true },
    { label: 'Ideas & Steps', path: '/admin/ideas' },
    { label: 'Make Moderation', path: '/admin/moderation' },
    { label: 'Waste & Factors', path: '/admin/waste-types' },
    { label: 'Products & Shop', path: '/admin/products' },
    { label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="border-b-2 border-kraft-300 dark:border-kraft-700 bg-kraft-100 dark:bg-kraft-800/80 mb-8 -mx-4 px-4 sm:-mx-8 sm:px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-forest-green text-white font-bold">
            ADMIN WORKBENCH
          </span>
          <Link to="/" className="font-mono text-xs text-kraft-500 hover:text-kraft-800 dark:hover:text-kraft-200">
            ← Return to App
          </Link>
        </div>

        <nav className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 sm:pb-0">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg font-mono text-xs whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-kraft-900 text-white dark:bg-kraft-100 dark:text-kraft-900 font-bold shadow-sm'
                    : 'text-kraft-700 dark:text-kraft-300 hover:bg-kraft-200 dark:hover:bg-kraft-700'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

