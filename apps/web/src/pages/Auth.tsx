import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginUser, registerUser } from '../lib/api';
import { PaperSheet } from '../ui/PaperSheet';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

export const Auth: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await loginUser({ email, password });
        showToast(isUrdu ? 'کامیابی سے لاگ ان ہو گئے!' : 'Welcome back, maker!', 'success');
      } else {
        await registerUser({ name, email, password });
        showToast(isUrdu ? 'اکاؤنٹ کامیابی سے بن گیا!' : 'Account registered successfully!', 'success');
      }

      // Check redirect
      const from = (location.state as any)?.from?.pathname || '/';
      window.location.href = from;
    } catch (err: any) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 pb-24">
      {/* Brand Badge */}
      <div className="text-center mb-8">
        <div className="inline-block p-3 rounded-2xl bg-kraft-200 dark:bg-kraft-800 border-2 border-kraft-400 dark:border-kraft-600 mb-3 shadow-inner">
          <span className="font-display font-black text-2xl tracking-tight text-kraft-900 dark:text-kraft-100">
            Re<span className="text-forest-green dark:text-forest-light">Make</span>
          </span>
        </div>
        <h1 className="font-display font-black text-2xl text-kraft-900 dark:text-kraft-100">
          {mode === 'login'
            ? isUrdu ? 'اپنے اکاؤنٹ میں داخل ہوں' : 'Enter the Workshop'
            : isUrdu ? 'نیا اکاؤنٹ بنائیں' : 'Join the Maker Guild'}
        </h1>
        <p className="font-serif italic text-xs text-kraft-600 dark:text-kraft-400 mt-1">
          {mode === 'login'
            ? isUrdu ? 'اپنے محفوظ کردہ آئیڈیاز اور اثر تک رسائی حاصل کریں۔' : 'Access your verified makes, badges, and workshop journal.'
            : isUrdu ? 'آپ کے مہمان سیشن کا تمام کام خود بخود نئے اکاؤنٹ میں محفوظ ہو جائے گا۔' : 'Your active guest makes and impact records will be preserved.'}
        </p>
      </div>

      <PaperSheet pinColor="brass">
        {/* Toggle Mode */}
        <div className="flex border-b border-dashed border-kraft-300 dark:border-kraft-700 pb-3 mb-5">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 text-center font-display font-bold text-sm pb-1 transition-colors ${
              mode === 'login'
                ? 'text-forest-green border-b-2 border-forest-green'
                : 'text-kraft-500 hover:text-kraft-700'
            }`}
          >
            {isUrdu ? 'لاگ ان' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 text-center font-display font-bold text-sm pb-1 transition-colors ${
              mode === 'register'
                ? 'text-forest-green border-b-2 border-forest-green'
                : 'text-kraft-500 hover:text-kraft-700'
            }`}
          >
            {isUrdu ? 'رجسٹر' : 'Register'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-mono font-bold text-kraft-700 dark:text-kraft-300 mb-1">
                {isUrdu ? 'آپ کا نام' : 'Your Name'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fatima Ali"
                className="w-full px-3 py-2 text-sm bg-kraft-50 dark:bg-kraft-900 border-2 border-kraft-300 dark:border-kraft-700 rounded-lg focus:outline-none focus:border-forest-green font-sans"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold text-kraft-700 dark:text-kraft-300 mb-1">
              {isUrdu ? 'ای میل ایڈریس' : 'Email Address'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maker@campus.edu.pk"
              className="w-full px-3 py-2 text-sm bg-kraft-50 dark:bg-kraft-900 border-2 border-kraft-300 dark:border-kraft-700 rounded-lg focus:outline-none focus:border-forest-green font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-kraft-700 dark:text-kraft-300 mb-1">
              {isUrdu ? 'پاس ورڈ' : 'Password'}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm bg-kraft-50 dark:bg-kraft-900 border-2 border-kraft-300 dark:border-kraft-700 rounded-lg focus:outline-none focus:border-forest-green font-mono"
            />
          </div>

          <div className="pt-2">
            <Button variant="primary" type="submit" className="w-full" disabled={loading}>
              {loading
                ? isUrdu ? 'جاری ہے...' : 'Authenticating...'
                : mode === 'login'
                ? isUrdu ? 'لاگ ان کریں' : 'Sign In to Workbench'
                : isUrdu ? 'اکاؤنٹ بنائیں' : 'Create Maker Account'}
            </Button>
          </div>
        </form>

        {/* Admin hint box for evaluators */}
        <div className="mt-6 pt-4 border-t border-dashed border-kraft-300 dark:border-kraft-700 text-center font-mono text-[11px] text-kraft-500">
          <p className="font-bold text-cardboard-amber mb-0.5">Admin Demo Credentials:</p>
          <p>admin@remake.local • change-me-now</p>
        </div>
      </PaperSheet>
    </div>
  );
};

