import React, { useEffect, useState } from 'react';
import { getAdminSettings, updateAdminSettings } from '../../lib/api';
import { AdminNav } from './AdminNav';
import { PaperSheet } from '../../ui/PaperSheet';
import { Button } from '../../ui/Button';
import { Skeleton } from '../../ui/Skeleton';
import { useToast } from '../../ui/Toast';

export const AdminSettings: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<any>({
    contactWhatsapp: '+92 300 1234567',
    instagramUrl: 'https://instagram.com/remakestudio',
    exhibitionModeDefault: false,
    idleTimeoutSeconds: 60,
    groqVisionModel: 'llama-3.2-11b-vision-preview',
    groqTextModel: 'llama-3.3-70b-versatile',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminSettings()
      .then((res) => {
        if (res) setSettings(res);
      })
      .catch((err: any) => {
        showToast(err.message || 'Failed to load settings', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAdminSettings(settings);
      showToast('Settings saved successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AdminNav />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      <AdminNav />

      <div className="mb-6">
        <h1 className="font-display font-black text-2xl sm:text-3xl text-kraft-900 dark:text-kraft-100">
          ReMake Platform Configuration
        </h1>
        <p className="font-serif italic text-kraft-600 dark:text-kraft-400 text-sm mt-1">
          Adjust contact channels, exhibition stall parameters, and AI model routing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <PaperSheet pinColor="brass">
          <h2 className="font-display font-bold text-lg text-kraft-900 dark:text-kraft-100 mb-4 border-b border-dashed border-kraft-300 pb-2">
            1. Social & WhatsApp Deep Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-kraft-700 dark:text-kraft-300 mb-1">
                WhatsApp Phone Number
              </label>
              <input
                type="text"
                value={settings.contactWhatsapp || ''}
                onChange={(e) => setSettings({ ...settings, contactWhatsapp: e.target.value })}
                placeholder="+92 300 1234567"
                className="w-full px-3 py-2 text-sm bg-kraft-50 dark:bg-kraft-900 border border-kraft-300 dark:border-kraft-700 rounded-lg font-mono"
              />
              <p className="text-[11px] text-kraft-500 mt-1 font-mono">
                Used for instant 1-tap product orders from the workshop store.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-kraft-700 dark:text-kraft-300 mb-1">
                Instagram URL
              </label>
              <input
                type="text"
                value={settings.instagramUrl || ''}
                onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/remake"
                className="w-full px-3 py-2 text-sm bg-kraft-50 dark:bg-kraft-900 border border-kraft-300 dark:border-kraft-700 rounded-lg font-mono"
              />
            </div>
          </div>
        </PaperSheet>

        <PaperSheet pinColor="yellow">
          <h2 className="font-display font-bold text-lg text-kraft-900 dark:text-kraft-100 mb-4 border-b border-dashed border-kraft-300 pb-2">
            2. Live Exhibition Kiosk Configuration
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-kraft-700 dark:text-kraft-300 mb-1">
                Idle Reset Timeout (Seconds)
              </label>
              <input
                type="number"
                value={settings.idleTimeoutSeconds || 60}
                onChange={(e) => setSettings({ ...settings, idleTimeoutSeconds: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-kraft-50 dark:bg-kraft-900 border border-kraft-300 dark:border-kraft-700 rounded-lg font-mono"
              />
              <p className="text-[11px] text-kraft-500 mt-1 font-mono">
                Kiosk screen resets back to idle attract mode if unvisited. Default: 60s.
              </p>
            </div>
          </div>
        </PaperSheet>

        <PaperSheet pinColor="blue">
          <h2 className="font-display font-bold text-lg text-kraft-900 dark:text-kraft-100 mb-4 border-b border-dashed border-kraft-300 pb-2">
            3. AI Model Fallback Routing
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-kraft-700 dark:text-kraft-300 mb-1">
                Primary Vision Model (ReMake Vision Engine)
              </label>
              <input
                type="text"
                value={settings.groqVisionModel || 'llama-3.2-11b-vision-preview'}
                onChange={(e) => setSettings({ ...settings, groqVisionModel: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-kraft-50 dark:bg-kraft-900 border border-kraft-300 dark:border-kraft-700 rounded-lg font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-kraft-700 dark:text-kraft-300 mb-1">
                Primary Text Model (ReMake Suggestion Engine)
              </label>
              <input
                type="text"
                value={settings.groqTextModel || 'llama-3.3-70b-versatile'}
                onChange={(e) => setSettings({ ...settings, groqTextModel: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-kraft-50 dark:bg-kraft-900 border border-kraft-300 dark:border-kraft-700 rounded-lg font-mono text-xs"
              />
            </div>
          </div>
        </PaperSheet>

        <div className="flex justify-end">
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save All Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};

