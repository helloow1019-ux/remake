import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Flame,
  Plus,
  Scale,
  Award,
  ArrowRight,
  HelpCircle,
  X,
  Sprout,
} from 'lucide-react';
import { getMyImpact, logImpact, getWasteTypes } from '../lib/api';
import { Counter } from '../ui/Counter';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

export const ImpactDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [showLogModal, setShowLogModal] = useState(false);
  const [logWasteSlug, setLogWasteSlug] = useState('plastic-bottle');
  const [logPieces, setLogPieces] = useState(1);
  const [logNote, setLogNote] = useState('');

  const { data: impact, isLoading } = useQuery({
    queryKey: ['my-impact'],
    queryFn: getMyImpact,
  });

  const { data: wasteTypes = [] } = useQuery({
    queryKey: ['waste-types'],
    queryFn: getWasteTypes,
  });

  const logMutation = useMutation({
    mutationFn: () =>
      logImpact({
        wasteTypeSlug: logWasteSlug,
        pieces: Number(logPieces),
        note: logNote.trim() || undefined,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-impact'] });
      showToast('Reuse logged to your ledger!', 'success');
      setShowLogModal(false);
      setLogPieces(1);
      setLogNote('');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to log reuse', 'error');
    },
  });

  if (isLoading || !impact) {
    return <div className="text-center py-20 font-bold text-ink">Loading your impact ledger...</div>;
  }

  const isUrdu = i18n.language === 'ur';
  const totals = impact.totals;
  const kgWaste = Number((totals.wasteG / 1000).toFixed(2));
  const kgCo2 = Number((totals.co2G / 1000).toFixed(2));

  // Garden / tower growth stage based on kg saved (1 to 5)
  const growthStage = Math.min(5, Math.max(1, Math.floor(kgWaste / 0.5) + 1));

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-24 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-ink">
            {t('impact.title', 'Your Impact Dashboard')}
          </h1>
          <p className="text-xs text-ink/75 mt-0.5">
            {t('impact.receiptSub', 'Official ReMake Sustainability Ledger')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Streak indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-marigold/20 text-[#8F5E00] dark:text-marigold border-2 border-marigold text-xs font-display font-bold">
            <Flame className="w-4 h-4 text-chili" />
            <span>{impact.streak.current} Day Streak</span>
          </div>

          <Button variant="primary" size="sm" onClick={() => setShowLogModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            <span>{t('impact.logManual', 'Log Manual Reuse')}</span>
          </Button>
        </div>
      </div>

      {/* Tactile Kraft Paper Receipt Ledger */}
      <div className="bg-card rounded-3xl border-3 border-ink shadow-[0_8px_0_#1B2A22] p-6 md:p-8 relative kraft-texture overflow-hidden">
        {/* Receipt header barcode decoration */}
        <div className="flex items-center justify-between border-b-2 border-dashed border-ink/20 pb-4 mb-6 text-xs font-display font-bold text-ink/60">
          <span>RECEIPT #RMK-{Date.now().toString().slice(-6)}</span>
          <span>ESTIMATED IMPACT</span>
        </div>

        {/* Hero Totals Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink/65 mb-1">
              Waste Kept Out
            </p>
            <p className="text-3xl md:text-4xl font-display font-black text-leaf">
              <Counter value={kgWaste} />
            </p>
            <p className="text-xs font-bold text-ink/70">kg waste</p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink/65 mb-1">
              Carbon Avoided
            </p>
            <p className="text-3xl md:text-4xl font-display font-black text-sky">
              <Counter value={kgCo2} />
            </p>
            <p className="text-xs font-bold text-ink/70">kg CO2e</p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink/65 mb-1">
              Crafts Made
            </p>
            <p className="text-3xl md:text-4xl font-display font-black text-ink">
              <Counter value={totals.ideasMade} />
            </p>
            <p className="text-xs font-bold text-ink/70">projects</p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink/65 mb-1">
              Could Earn
            </p>
            <p className="text-3xl md:text-4xl font-display font-black text-marigold">
              Rs <Counter value={totals.moneyPkr} />
            </p>
            <p className="text-xs font-bold text-ink/70">PKR potential</p>
          </div>
        </div>

        {/* Growing Garden Visual representation */}
        <div className="mt-8 pt-6 border-t-2 border-dashed border-ink/20 flex flex-col items-center">
          <div className="w-full max-w-md h-28 bg-paper rounded-2xl border-2 border-ink flex items-end justify-center p-3 relative overflow-hidden">
            {/* Ground */}
            <div className="absolute inset-x-0 bottom-0 h-4 bg-[#5C3A21] border-t-2 border-ink" />

            {/* Tree / Sprout scaling with stage */}
            <div className="flex items-end gap-6 z-10">
              <div
                className="w-10 bg-leaf rounded-t-full border-2 border-ink transition-all duration-500 shadow-sm"
                style={{ height: `${Math.min(90, growthStage * 18 + 10)}px` }}
              />
              <div
                className="w-14 bg-leaf rounded-t-full border-2 border-ink transition-all duration-500 shadow-sm"
                style={{ height: `${Math.min(100, growthStage * 20 + 20)}px` }}
              />
              <div
                className="w-8 bg-leaf rounded-t-full border-2 border-ink transition-all duration-500 shadow-sm"
                style={{ height: `${Math.min(80, growthStage * 16 + 5)}px` }}
              />
            </div>
          </div>
          <p className="text-xs font-display font-bold text-ink/70 mt-2 flex items-center justify-center gap-1.5">
            <Sprout className="w-4 h-4 text-leaf" />
            <span>Garden Growth Level {growthStage}/5 • Keep recycling to bloom full trees!</span>
          </p>
        </div>
      </div>

      {/* Everyday Equivalents */}
      {impact.equivalents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-display font-black text-ink">
            {t('impact.equivalentsTitle', 'Everyday Equivalents')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {impact.equivalents.map((eq) => (
              <div
                key={eq.key}
                className="p-4 rounded-2xl bg-card border-2 border-ink shadow-[0_3px_0_rgba(27,42,34,0.12)] flex items-center gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-marigold/20 text-[#8F5E00] border-2 border-marigold flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-xs md:text-sm font-display font-bold text-ink leading-snug">
                  {isUrdu ? eq.labelUr : eq.labelEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Activity Chart (Hand-crafted SVG Bars) */}
      <div className="p-6 rounded-3xl bg-card border-3 border-ink shadow-[0_6px_0_#1B2A22]">
        <h2 className="text-xl font-display font-black text-ink mb-1">
          {t('impact.weeklyActivity', 'Weekly Activity')}
        </h2>
        <p className="text-xs text-ink/65 mb-6">Last 8 calendar weeks of waste saved</p>

        <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 border-b-2 border-ink">
          {impact.weekly.map((w, idx) => {
            const maxVal = Math.max(...impact.weekly.map((i) => i.wasteG), 100);
            const heightPct = Math.round((w.wasteG / maxVal) * 100);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-bold text-ink opacity-0 group-hover:opacity-100 transition-opacity">
                  {w.wasteG}g
                </span>
                <div
                  className="w-full max-w-[28px] bg-leaf rounded-t-lg border-2 border-ink transition-all duration-300 group-hover:bg-leaf-hover"
                  style={{ height: `${Math.max(8, heightPct)}%` }}
                />
                <span className="text-[9px] font-bold text-ink/60 mt-1 truncate">
                  {w.weekStart.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges Shelf */}
      <div className="space-y-4">
        <h2 className="text-xl font-display font-black text-ink">
          {t('impact.badgesTitle', 'Your Badge Shelf')}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {impact.badges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border-2 text-center flex flex-col items-center justify-between transition-all select-none ${
                b.earned
                  ? 'bg-card border-ink shadow-[0_4px_0_#1B2A22]'
                  : 'bg-black/5 border-dashed border-ink/20 opacity-50 grayscale'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl border-2 border-ink flex items-center justify-center mb-2 shadow-sm ${
                  b.earned ? 'bg-marigold text-ink' : 'bg-paper text-ink/30'
                }`}
              >
                <Award className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-display font-bold text-ink">
                  {isUrdu ? b.nameUr : b.nameEn}
                </h4>
                <p className="text-[10px] text-ink/70 mt-1 line-clamp-2">
                  {isUrdu ? b.descriptionUr : b.descriptionEn}
                </p>
              </div>
              <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-ink/50">
                {b.earned ? 'Unlocked' : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* How we calculate link */}
      <div className="text-center pt-4">
        <NavLink
          to="/method"
          className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-leaf hover:underline"
        >
          <HelpCircle className="w-4 h-4" />
          <span>{t('impact.howWeCalculate', 'How we calculate these numbers')} →</span>
        </NavLink>
      </div>

      {/* Manual Log Reuse Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card rounded-3xl border-3 border-ink shadow-[0_8px_0_#1B2A22] p-6">
            <div className="flex items-center justify-between pb-3 border-b-2 border-ink mb-4">
              <h3 className="font-display font-black text-lg text-ink">Log My Reuse</h3>
              <button onClick={() => setShowLogModal(false)} className="p-1 rounded-lg hover:bg-black/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                logMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-display font-bold text-ink mb-1.5">
                  Waste Material
                </label>
                <select
                  value={logWasteSlug}
                  onChange={(e) => setLogWasteSlug(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-paper border-2 border-ink text-xs font-bold text-ink"
                >
                  {wasteTypes.map((wt) => (
                    <option key={wt.slug} value={wt.slug}>
                      {isUrdu ? wt.nameUr : wt.nameEn} ({wt.gramsPerPiece}g / piece)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-display font-bold text-ink mb-1.5">
                  Number of Pieces
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={logPieces}
                  onChange={(e) => setLogPieces(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-paper border-2 border-ink text-xs font-bold text-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-display font-bold text-ink mb-1.5">
                  Note / Craft Project (optional)
                </label>
                <input
                  type="text"
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  placeholder="e.g. Made planters for balcony herbs"
                  className="w-full p-2.5 rounded-xl bg-paper border-2 border-ink text-xs text-ink"
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                type="submit"
                disabled={logMutation.isPending}
              >
                {logMutation.isPending ? 'Logging...' : 'Add to Impact Ledger'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
