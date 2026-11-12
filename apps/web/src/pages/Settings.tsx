import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Globe,
  Palette,
  Eye,
  User,
  ShieldCheck,
  Database,
  Trash2,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { useTheme } from '../lib/theme';
import { getSession, logoutUser, updateMe } from '../lib/api';
import { PaperSheet } from '../ui/PaperSheet';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

export const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => {
    return localStorage.getItem('remake_reduced_motion') === 'true';
  });

  React.useEffect(() => {
    getSession().then((s) => setSession(s)).catch(() => {});
  }, []);

  const handleLanguageChange = async (lang: 'en' | 'ur') => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    try {
      await updateMe({ locale: lang });
    } catch {}
    showToast(lang === 'ur' ? 'زبان اردو میں تبدیل ہو گئی' : 'Language set to English', 'success');
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    try {
      updateMe({ theme: newTheme });
    } catch {}
    showToast(`Theme switched to ${newTheme}`, 'info');
  };

  const handleToggleReducedMotion = () => {
    const nextVal = !reducedMotion;
    setReducedMotion(nextVal);
    localStorage.setItem('remake_reduced_motion', String(nextVal));
    if (nextVal) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    showToast(nextVal ? 'Animations reduced' : 'Animations restored', 'info');
  };

  const handleClearCache = async () => {
    try {
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map((name) => caches.delete(name)));
      }
      localStorage.clear();
      showToast(isUrdu ? 'کیشے صاف کر دیا گیا' : 'Cache and offline storage cleared', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      showToast('Failed to clear cache', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      showToast(isUrdu ? 'آپ لاگ آؤٹ ہو گئے' : 'Signed out successfully', 'success');
      window.location.href = '/';
    } catch (err: any) {
      showToast(err.message || 'Logout failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
      <div className="mb-8 border-b-2 border-dashed border-kraft-400 dark:border-kraft-700 pb-4">
        <h1 className="font-display font-black text-2xl sm:text-3xl text-kraft-900 dark:text-kraft-100">
          {isUrdu ? 'ترتیبات' : 'Workbench Settings'}
        </h1>
        <p className="font-serif italic text-kraft-600 dark:text-kraft-400 text-sm mt-1">
          {isUrdu ? 'اپنی زبان، تھیم اور اکاؤنٹ کی ترتیبات منظم کریں۔' : 'Configure interface language, tactile theme, and account.'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Language Selection */}
        <PaperSheet pinColor="brass">
          <h2 className="font-display font-bold text-lg text-kraft-900 dark:text-kraft-100 mb-2 flex items-center gap-2">
            <Globe className="w-5 h-5 text-leaf" />
            <span>{isUrdu ? 'زبان کا انتخاب' : 'Language / زبان'}</span>
          </h2>
          <p className="text-xs font-sans text-kraft-600 dark:text-kraft-400 mb-4">
            {isUrdu ? 'انگریزی اور اردو (دائیں سے بائیں) کے درمیان منتخب کریں۔' : 'Switch seamlessly between English and Urdu (RTL).'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-mono text-sm border-2 transition-all ${
                !isUrdu
                  ? 'bg-forest-green text-white border-forest-green shadow-sm'
                  : 'bg-kraft-100 dark:bg-kraft-800 text-kraft-800 dark:text-kraft-200 border-kraft-300 dark:border-kraft-700'
              }`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageChange('ur')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-urdu text-base border-2 transition-all ${
                isUrdu
                  ? 'bg-forest-green text-white border-forest-green shadow-sm'
                  : 'bg-kraft-100 dark:bg-kraft-800 text-kraft-800 dark:text-kraft-200 border-kraft-300 dark:border-kraft-700'
              }`}
            >
              اردو (Urdu)
            </button>
          </div>
        </PaperSheet>

        {/* Theme Selection */}
        <PaperSheet pinColor="yellow">
          <h2 className="font-display font-bold text-lg text-kraft-900 dark:text-kraft-100 mb-2 flex items-center gap-2">
            <Palette className="w-5 h-5 text-cardboard-amber" />
            <span>{isUrdu ? 'ورکشاپ تھیم' : 'Tactile Theme'}</span>
          </h2>
          <p className="text-xs font-sans text-kraft-600 dark:text-kraft-400 mb-4">
            {isUrdu ? 'دن کی روشنی کا کرافٹ پیپر یا نائٹ اسٹوڈیو ڈارک موڈ۔' : 'Choose Daylight kraft paper or Workshop dark studio mode.'}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => handleThemeChange(mode)}
                className={`py-2 px-3 rounded-xl font-mono text-xs border-2 capitalize transition-all inline-flex items-center justify-center gap-1.5 ${
                  theme === mode
                    ? 'bg-cardboard-amber text-kraft-900 font-bold border-cardboard-amber shadow-sm'
                    : 'bg-kraft-100 dark:bg-kraft-800 text-kraft-700 dark:text-kraft-300 border-kraft-300 dark:border-kraft-700'
                }`}
              >
                {mode === 'light' ? (
                  <>
                    <Sun className="w-3.5 h-3.5" />
                    <span>Daylight</span>
                  </>
                ) : mode === 'dark' ? (
                  <>
                    <Moon className="w-3.5 h-3.5" />
                    <span>Workshop</span>
                  </>
                ) : (
                  <>
                    <Laptop className="w-3.5 h-3.5" />
                    <span>System</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </PaperSheet>

        {/* Accessibility & Motion */}
        <PaperSheet pinColor="silver">
          <h2 className="font-display font-bold text-lg text-kraft-900 dark:text-kraft-100 mb-2 flex items-center gap-2">
            <Eye className="w-5 h-5 text-sky" />
            <span>{isUrdu ? 'رسائی اور موشن' : 'Accessibility & Motion'}</span>
          </h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-sans text-sm font-semibold text-kraft-900 dark:text-kraft-100">
                {isUrdu ? 'کم حرکت (Reduced Motion)' : 'Reduced Motion'}
              </div>
              <p className="text-xs text-kraft-500 font-sans mt-0.5">
                {isUrdu ? 'اسٹیکرز اور ٹرانزیشنز کی حرکت بند کریں' : 'Disable spring animations and tilt effects'}
              </p>
            </div>
            <button
              onClick={handleToggleReducedMotion}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                reducedMotion ? 'bg-forest-green justify-end' : 'bg-kraft-300 dark:bg-kraft-700 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow" />
            </button>
          </div>
        </PaperSheet>

        {/* Account Info */}
        <PaperSheet pinColor="blue">
          <h2 className="font-display font-bold text-lg text-kraft-900 dark:text-kraft-100 mb-2 flex items-center gap-2">
            <User className="w-5 h-5 text-ink" />
            <span>{isUrdu ? 'اکاؤنٹ کی تفصیلات' : 'Account & Session'}</span>
          </h2>
          <div className="p-3 bg-kraft-100 dark:bg-kraft-900/60 rounded-xl font-mono text-xs text-kraft-700 dark:text-kraft-300 mb-4 border border-kraft-200 dark:border-kraft-800 space-y-1">
            <div>
              <span className="text-kraft-500">Status: </span>
              {session?.user?.isGuest ? (
                <span className="text-cardboard-amber font-bold">Guest Session</span>
              ) : (
                <span className="text-forest-green font-bold">Verified ({session?.user?.role || 'MAKER'})</span>
              )}
            </div>
            {session?.user?.email && (
              <div>
                <span className="text-kraft-500">Email: </span>
                <span>{session.user.email}</span>
              </div>
            )}
            <div>
              <span className="text-kraft-500">Session ID: </span>
              <span className="truncate">{session?.session?.id || 'Active'}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {session?.user?.isGuest ? (
              <Link to="/auth" className="flex-1">
                <Button variant="primary" className="w-full text-xs">
                  {isUrdu ? 'لاگ ان / اکاؤنٹ بنائیں' : 'Sign In or Create Account'}
                </Button>
              </Link>
            ) : (
              <Button
                variant="danger"
                className="flex-1 text-xs"
                onClick={handleLogout}
                disabled={loading}
              >
                {isUrdu ? 'لاگ آؤٹ' : 'Sign Out'}
              </Button>
            )}

            {session?.user?.role === 'ADMIN' && (
              <Link to="/admin" className="flex-1">
                <Button variant="secondary" className="w-full text-xs inline-flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-leaf" />
                  <span>{isUrdu ? 'ایڈمن پینل' : 'Admin Panel'}</span>
                </Button>
              </Link>
            )}
          </div>
        </PaperSheet>

        {/* Offline Cache & Diagnostics */}
        <PaperSheet pinColor="brass">
          <h2 className="font-display font-bold text-lg text-kraft-900 dark:text-kraft-100 mb-2 flex items-center gap-2">
            <Database className="w-5 h-5 text-cardboard-amber" />
            <span>{isUrdu ? 'اسٹوریج اور کیشے' : 'Storage & Cache'}</span>
          </h2>
          <p className="text-xs font-sans text-kraft-600 dark:text-kraft-400 mb-4">
            {isUrdu
              ? 'اگر کوئی مسئلہ ہو تو آف لائن کیشے اور محفوظ کردہ سیشنز کو ری سیٹ کریں۔'
              : 'Clear local caches and stored service-worker assets if you experience display inconsistencies.'}
          </p>
          <Button variant="ghost" size="sm" onClick={handleClearCache} className="inline-flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'کیشے صاف کریں' : 'Clear Offline Cache'}</span>
          </Button>
        </PaperSheet>
      </div>
    </div>
  );
};

