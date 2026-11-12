import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ThemeProvider, useTheme } from './lib/theme';
import { ToastProvider } from './ui/Toast';
import { OfflineBanner } from './ui/OfflineBanner';
import { SideRail } from './ui/SideRail';
import { BottomDock } from './ui/BottomDock';
import { getSession } from './lib/api';

// Pages
import { Home } from './pages/Home';
import { Onboarding } from './pages/Onboarding';
import { Explore } from './pages/Explore';
import { IdeaDetail } from './pages/IdeaDetail';
import { MakeMode } from './pages/MakeMode';
import { MadeThis } from './pages/MadeThis';
import { Scan } from './pages/Scan';
import { ImpactDashboard } from './pages/ImpactDashboard';
import { Saved } from './pages/Saved';
import { MyMakes } from './pages/MyMakes';
import { Community } from './pages/Community';
import { Shop } from './pages/Shop';
import { PriceCards } from './pages/PriceCards';
import { About } from './pages/About';
import { Method } from './pages/Method';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';
import { Exhibit } from './pages/Exhibit';
import { NotFound } from './pages/NotFound';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminIdeas } from './pages/admin/AdminIdeas';
import { AdminIdeaEditor } from './pages/admin/AdminIdeaEditor';
import { AdminModeration } from './pages/admin/AdminModeration';
import { AdminWasteTypes } from './pages/admin/AdminWasteTypes';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminSettings } from './pages/admin/AdminSettings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getSession()
      .then((s) => setUser(s?.user))
      .catch(() => {});
  }, [location.pathname]);

  const isFullscreen =
    location.pathname === '/exhibit' ||
    location.pathname.endsWith('/make') ||
    location.pathname.startsWith('/shop/price-cards');

  if (isFullscreen) {
    return <main className="min-h-screen">{children}</main>;
  }

  const toggleLanguage = () => {
    const next = isUrdu ? 'en' : 'ur';
    i18n.changeLanguage(next);
    document.documentElement.dir = next === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-kraft-pattern bg-paper text-ink flex flex-col md:flex-row antialiased selection:bg-marigold selection:text-ink">
      <OfflineBanner />

      {/* Desktop Sticky Side Rail */}
      <SideRail user={user} />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="md:hidden sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b-2 border-ink px-4 py-3 flex items-center justify-between shadow-sm">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-marigold border-2 border-ink shadow-[2px_2px_0_#1B2A22] flex items-center justify-center font-display font-black text-ink text-sm">
              R
            </div>
            <span className="font-display font-black text-xl text-ink">ReMake</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border-2 border-ink bg-paper hover:bg-card text-ink"
            >
              {isUrdu ? 'EN' : 'اردو'}
            </button>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border-2 border-ink bg-paper hover:bg-card text-ink"
              title="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto">{children}</main>

        {/* Global Footer */}
        <footer className="border-t-2 border-dashed border-ink/20 py-8 px-4 text-center font-mono text-xs text-ink/70 mt-auto pb-24 md:pb-8">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-2 font-display text-xs">
            <Link to="/about" className="hover:text-leaf underline">
              {isUrdu ? 'ہمارے بارے میں' : 'About ReMake'}
            </Link>
            <span>•</span>
            <Link to="/method" className="hover:text-leaf underline">
              {isUrdu ? 'کاربن میتھڈولوجی' : 'Impact Methodology'}
            </Link>
            <span>•</span>
            <Link to="/shop" className="hover:text-leaf underline">
              {isUrdu ? 'دکان' : 'Studio Shop'}
            </Link>
            <span>•</span>
            <Link to="/exhibit" className="hover:text-leaf underline">
              {isUrdu ? 'اسٹال کیوسک موڈ' : 'Exhibition Kiosk Mode'}
            </Link>
          </div>
          <p className="text-[11px] text-ink/50">
            National University of Computer & Emerging Sciences (NUCES) • Environmental Science & Sustainability for Business
          </p>
        </footer>

        {/* Mobile Bottom Dock */}
        <BottomDock />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/ideas/:slug" element={<IdeaDetail />} />
                <Route path="/ideas/:slug/make" element={<MakeMode />} />
                <Route path="/ideas/:slug/made" element={<MadeThis />} />
                <Route path="/ideas/:slug/made-this" element={<MadeThis />} />
                <Route path="/made-this" element={<MadeThis />} />
                <Route path="/scan" element={<Scan />} />
                <Route path="/impact" element={<ImpactDashboard />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/my-makes" element={<MyMakes />} />
                <Route path="/community" element={<Community />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/price-cards" element={<PriceCards />} />
                <Route path="/about" element={<About />} />
                <Route path="/method" element={<Method />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/me" element={<Settings />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/exhibit" element={<Exhibit />} />

                {/* Admin Management Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/ideas" element={<AdminIdeas />} />
                <Route path="/admin/ideas/new" element={<AdminIdeaEditor />} />
                <Route path="/admin/ideas/:id" element={<AdminIdeaEditor />} />
                <Route path="/admin/moderation" element={<AdminModeration />} />
                <Route path="/admin/waste-types" element={<AdminWasteTypes />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/settings" element={<AdminSettings />} />

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

