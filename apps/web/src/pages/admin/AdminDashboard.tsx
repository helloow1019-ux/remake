import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Activity,
  ClipboardList,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { getAdminDashboard } from '../../lib/api';
import { AdminNav } from './AdminNav';
import { PaperSheet } from '../../ui/PaperSheet';
import { Button } from '../../ui/Button';
import { Skeleton } from '../../ui/Skeleton';
import { useToast } from '../../ui/Toast';

export const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then((res) => setData(res))
      .catch((err: any) => {
        showToast(err.message || 'Failed to load admin metrics', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <AdminNav />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const counts = data?.counts || {};
  const today = data?.todayStats || {};

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      <AdminNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-kraft-900 dark:text-kraft-100">
            ReMake Operations Center
          </h1>
          <p className="font-serif italic text-kraft-600 dark:text-kraft-400 text-sm mt-1">
            Real-time management for ideas catalog, community submissions, and exhibition telemetry.
          </p>
        </div>

        <Link to="/admin/ideas/new">
          <Button variant="primary" size="sm">
            + Author New Blueprint
          </Button>
        </Link>
      </div>

      {/* Alert banner if pending makes */}
      {counts.pendingMakes > 0 && (
        <div className="mb-8 p-4 bg-cardboard-amber/20 border-2 border-dashed border-cardboard-amber rounded-2xl flex items-center justify-between gap-4 shadow-kraft">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-cardboard-amber shrink-0" />
            <div>
              <div className="font-display font-bold text-sm text-kraft-900 dark:text-kraft-100">
                {counts.pendingMakes} Student Make Submissions Awaiting Moderation
              </div>
              <p className="text-xs font-sans text-kraft-600 dark:text-kraft-400">
                Community submissions require admin visual inspection before appearing on the public community wall.
              </p>
            </div>
          </div>
          <Link to="/admin/moderation">
            <Button variant="secondary" size="sm">
              Review Now →
            </Button>
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="p-4 bg-kraft-50 dark:bg-kraft-800 rounded-xl border border-kraft-300 dark:border-kraft-700 shadow-sm text-center">
          <span className="text-[10px] font-mono text-kraft-500 uppercase block mb-1">Total Blueprints</span>
          <div className="font-mono font-black text-2xl text-forest-green dark:text-forest-light">
            {counts.ideas || 0}
          </div>
        </div>

        <div className="p-4 bg-kraft-50 dark:bg-kraft-800 rounded-xl border border-kraft-300 dark:border-kraft-700 shadow-sm text-center">
          <span className="text-[10px] font-mono text-kraft-500 uppercase block mb-1">Total Makes Logged</span>
          <div className="font-mono font-black text-2xl text-kraft-900 dark:text-kraft-100">
            {counts.makes || 0}
          </div>
        </div>

        <div className="p-4 bg-kraft-50 dark:bg-kraft-800 rounded-xl border border-kraft-300 dark:border-kraft-700 shadow-sm text-center">
          <span className="text-[10px] font-mono text-kraft-500 uppercase block mb-1">Pending Moderation</span>
          <div className={`font-mono font-black text-2xl ${counts.pendingMakes > 0 ? 'text-caution-red' : 'text-kraft-400'}`}>
            {counts.pendingMakes || 0}
          </div>
        </div>

        <div className="p-4 bg-kraft-50 dark:bg-kraft-800 rounded-xl border border-kraft-300 dark:border-kraft-700 shadow-sm text-center">
          <span className="text-[10px] font-mono text-kraft-500 uppercase block mb-1">Waste Categories</span>
          <div className="font-mono font-black text-2xl text-cardboard-amber">
            {counts.wasteTypes || 0}
          </div>
        </div>

        <div className="p-4 bg-kraft-50 dark:bg-kraft-800 rounded-xl border border-kraft-300 dark:border-kraft-700 shadow-sm text-center">
          <span className="text-[10px] font-mono text-kraft-500 uppercase block mb-1">Registered Makers</span>
          <div className="font-mono font-black text-2xl text-kraft-900 dark:text-kraft-100">
            {counts.users || 0}
          </div>
        </div>
      </div>

      {/* Exhibition Today Card */}
      <PaperSheet pinColor="brass" className="mb-8">
        <div className="flex items-center justify-between mb-4 border-b border-dashed border-kraft-300 dark:border-kraft-700 pb-2">
          <h2 className="font-display font-bold text-lg text-kraft-900 dark:text-kraft-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-forest-green" />
            <span>Today's Live Stall Activity</span>
          </h2>
          <span className="font-mono text-xs text-kraft-500">{today.date || 'Today'}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-kraft-100 dark:bg-kraft-900/50 rounded-lg">
            <span className="text-xs font-mono text-kraft-500 block">Makes Created</span>
            <span className="font-mono font-bold text-xl text-forest-green">{today.makesCount || 0}</span>
          </div>
          <div className="p-3 bg-kraft-100 dark:bg-kraft-900/50 rounded-lg">
            <span className="text-xs font-mono text-kraft-500 block">Trash Diverted</span>
            <span className="font-mono font-bold text-xl text-cardboard-amber">{Math.round(today.gramsDiverted || 0)}g</span>
          </div>
          <div className="p-3 bg-kraft-100 dark:bg-kraft-900/50 rounded-lg">
            <span className="text-xs font-mono text-kraft-500 block">CO₂ Saved</span>
            <span className="font-mono font-bold text-xl text-forest-green">{Math.round(today.co2eGramsSaved || 0)}g</span>
          </div>
          <div className="p-3 bg-kraft-100 dark:bg-kraft-900/50 rounded-lg">
            <span className="text-xs font-mono text-kraft-500 block">Active Visitors</span>
            <span className="font-mono font-bold text-xl text-kraft-800 dark:text-kraft-200">{today.activeMakers || 0}</span>
          </div>
        </div>
      </PaperSheet>

      {/* Quick Links Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Link
          to="/admin/ideas"
          className="p-5 bg-kraft-50 dark:bg-kraft-800 border-2 border-kraft-300 dark:border-kraft-700 rounded-xl hover:border-forest-green transition-all shadow-kraft group block"
        >
          <ClipboardList className="w-7 h-7 text-forest-green mb-2" />
          <h3 className="font-display font-bold text-base text-kraft-900 dark:text-kraft-100 group-hover:text-forest-green">
            Manage Ideas & Blueprints
          </h3>
          <p className="text-xs font-sans text-kraft-600 dark:text-kraft-400 mt-1">
            Edit step photos, review AI-generated suggestions, and promote verified drafts to Tested status.
          </p>
        </Link>

        <Link
          to="/admin/moderation"
          className="p-5 bg-kraft-50 dark:bg-kraft-800 border-2 border-kraft-300 dark:border-kraft-700 rounded-xl hover:border-forest-green transition-all shadow-kraft group block"
        >
          <ShieldCheck className="w-7 h-7 text-cardboard-amber mb-2" />
          <h3 className="font-display font-bold text-base text-kraft-900 dark:text-kraft-100 group-hover:text-forest-green">
            Submission Moderation
          </h3>
          <p className="text-xs font-sans text-kraft-600 dark:text-kraft-400 mt-1">
            Approve or reject student make submissions with feedback to protect community feed safety.
          </p>
        </Link>

        <Link
          to="/admin/waste-types"
          className="p-5 bg-kraft-50 dark:bg-kraft-800 border-2 border-kraft-300 dark:border-kraft-700 rounded-xl hover:border-forest-green transition-all shadow-kraft group block"
        >
          <Scale className="w-7 h-7 text-forest-green mb-2" />
          <h3 className="font-display font-bold text-base text-kraft-900 dark:text-kraft-100 group-hover:text-forest-green">
            Emission Factors & Waste
          </h3>
          <p className="text-xs font-sans text-kraft-600 dark:text-kraft-400 mt-1">
            Calibrate laboratory-tested material weights and lifecycle CO₂ emission coefficients.
          </p>
        </Link>
      </div>
    </div>
  );
};

