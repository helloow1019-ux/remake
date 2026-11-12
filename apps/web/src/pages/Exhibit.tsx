import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { WasteType, TodayStatsResponse, IdeaPublic } from '@remake/shared';
import { Clock, Zap, Leaf, Box } from 'lucide-react';
import { getWasteTypes, getTodayStats, getIdeas } from '../lib/api';
import { Counter } from '../ui/Counter';
import { Stamp } from '../ui/Stamp';
import { Button } from '../ui/Button';

export const Exhibit: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';

  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [stats, setStats] = useState<TodayStatsResponse>({
    makesToday: 0,
    wasteGToday: 0,
    scansToday: 0,
    visitorsToday: 0,
  });
  const [selectedWaste, setSelectedWaste] = useState<WasteType | null>(null);
  const [ideas, setIdeas] = useState<IdeaPublic[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [activeIdea, setActiveIdea] = useState<IdeaPublic | null>(null);

  // 60-second Idle Reset Timer
  const IDLE_TIMEOUT_MS = 60000;
  const idleTimerRef = useRef<any>(null);

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      // Auto-reset state to attract screen
      setSelectedWaste(null);
      setActiveIdea(null);
    }, IDLE_TIMEOUT_MS);
  };

  useEffect(() => {
    const handleUserActivity = () => resetIdleTimer();
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    resetIdleTimer();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
    };
  }, []);

  // Poll stats every 15s
  useEffect(() => {
    getWasteTypes().then((types) => setWasteTypes(types)).catch(() => {});

    const fetchStats = () => {
      getTodayStats().then((data) => setStats(data)).catch(() => {});
    };

    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  // When waste tile selected, load top ideas for that waste
  useEffect(() => {
    if (selectedWaste) {
      setLoadingIdeas(true);
      getIdeas({ waste: selectedWaste.slug, limit: 6 })
        .then((res) => setIdeas(res.items))
        .catch(() => setIdeas([]))
        .finally(() => setLoadingIdeas(false));
    }
  }, [selectedWaste]);

  const toggleLanguage = () => {
    const nextLang = isUrdu ? 'en' : 'ur';
    i18n.changeLanguage(nextLang);
    document.documentElement.dir = nextLang === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = nextLang;
  };

  return (
    <div className="min-h-screen bg-kraft-100 dark:bg-kraft-900 text-kraft-900 dark:text-kraft-100 flex flex-col p-4 sm:p-8 select-none">
      {/* Top Kiosk Header */}
      <header className="flex items-center justify-between border-b-2 border-dashed border-kraft-300 dark:border-kraft-700 pb-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-forest-green text-white flex items-center justify-center font-display font-black text-2xl shadow-kraft">
            R
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight">
                Re<span className="text-forest-green dark:text-forest-light">Make</span>
              </h1>
              <span className="px-2 py-0.5 bg-cardboard-amber/20 text-cardboard-amber border border-cardboard-amber/40 rounded text-[10px] font-mono uppercase tracking-widest">
                LIVE STALL KIOSK
              </span>
            </div>
            <p className="font-serif italic text-xs text-kraft-600 dark:text-kraft-400">
              National University of Computer & Emerging Sciences (NUCES)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-lg bg-kraft-200 dark:bg-kraft-800 border border-kraft-400 dark:border-kraft-600 font-mono text-xs hover:bg-kraft-300 transition-colors"
          >
            {isUrdu ? 'English' : 'اردو'}
          </button>
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-xs">
              ✕ {isUrdu ? 'خارج ہوں' : 'Exit Kiosk'}
            </Button>
          </Link>
        </div>
      </header>

      {/* Live Impact Counters Ticker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-kraft-50 dark:bg-kraft-800/80 p-4 rounded-xl border border-kraft-300 dark:border-kraft-700 shadow-sm text-center">
          <span className="text-[10px] font-mono uppercase text-kraft-500 block mb-1">
            {isUrdu ? 'آج کی بنائی گئی اشیاء' : 'MAKES CRAFTED TODAY'}
          </span>
          <div className="font-mono font-black text-2xl sm:text-3xl text-forest-green dark:text-forest-light">
            <Counter value={stats.makesToday} />
          </div>
        </div>
        <div className="bg-kraft-50 dark:bg-kraft-800/80 p-4 rounded-xl border border-kraft-300 dark:border-kraft-700 shadow-sm text-center">
          <span className="text-[10px] font-mono uppercase text-kraft-500 block mb-1">
            {isUrdu ? 'بچایا گیا کچرا' : 'WASTE DIVERTED'}
          </span>
          <div className="font-mono font-black text-2xl sm:text-3xl text-cardboard-amber">
            <Counter value={stats.wasteGToday} /> <span className="text-xs font-normal">g</span>
          </div>
        </div>
        <div className="bg-kraft-50 dark:bg-kraft-800/80 p-4 rounded-xl border border-kraft-300 dark:border-kraft-700 shadow-sm text-center">
          <span className="text-[10px] font-mono uppercase text-kraft-500 block mb-1">
            {isUrdu ? 'کیے گئے اسکینز' : 'SCANS RUN TODAY'}
          </span>
          <div className="font-mono font-black text-2xl sm:text-3xl text-forest-green dark:text-forest-light">
            <Counter value={stats.scansToday} />
          </div>
        </div>
        <div className="bg-kraft-50 dark:bg-kraft-800/80 p-4 rounded-xl border border-kraft-300 dark:border-kraft-700 shadow-sm text-center">
          <span className="text-[10px] font-mono uppercase text-kraft-500 block mb-1">
            {isUrdu ? 'اسٹال وزیٹرز' : 'STALL VISITORS'}
          </span>
          <div className="font-mono font-black text-2xl sm:text-3xl text-kraft-900 dark:text-kraft-100">
            <Counter value={stats.visitorsToday} />
          </div>
        </div>
      </div>

      {/* Main Interactive Touch Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-8">
        {/* Left: Waste Tiles or Ideas List */}
        <div className="flex-1 flex flex-col">
          {!selectedWaste ? (
            <div>
              <div className="mb-4">
                <h2 className="font-display font-black text-xl sm:text-2xl text-kraft-900 dark:text-kraft-100">
                  {isUrdu ? 'اپنے ہاتھ کا کچرا منتخب کریں:' : 'Touch What Trash You Have:'}
                </h2>
                <p className="font-serif italic text-xs text-kraft-600 dark:text-kraft-400">
                  {isUrdu ? 'اسٹال پر موجود ڈبوں میں سے مواد چنیں۔' : 'Tap any waste stream below to see verified student blueprints.'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {wasteTypes.map((waste) => (
                  <button
                    key={waste.id}
                    onClick={() => setSelectedWaste(waste)}
                    className="p-4 bg-kraft-50 dark:bg-kraft-800 rounded-2xl border-2 border-kraft-300 dark:border-kraft-700 hover:border-forest-green dark:hover:border-forest-light hover:scale-105 transition-all text-center flex flex-col items-center justify-center group shadow-kraft"
                  >
                    <div className="w-16 h-16 mb-2 flex items-center justify-center overflow-hidden rounded-xl border border-kraft-300 dark:border-kraft-700 shadow-sm bg-kraft-100 dark:bg-kraft-900">
                      <img
                        src={`/seed/waste-${waste.slug}.jpg`}
                        alt={waste.nameEn}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <span className="font-display font-bold text-sm text-kraft-900 dark:text-kraft-100 group-hover:text-forest-green">
                      {isUrdu && waste.nameUr ? waste.nameUr : waste.nameEn}
                    </span>
                    <span className="text-[10px] font-mono text-kraft-500 mt-0.5">
                      ~{waste.gramsPerPiece}g / pc
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Back button to waste selector */}
              <div className="flex items-center justify-between mb-4 border-b border-dashed border-kraft-300 dark:border-kraft-700 pb-3">
                <button
                  onClick={() => setSelectedWaste(null)}
                  className="flex items-center gap-2 font-mono text-xs text-forest-green hover:underline"
                >
                  ← {isUrdu ? 'دیگر مواد دیکھیں' : 'Back to Materials'}
                </button>
                <div className="font-display font-bold text-base text-kraft-900 dark:text-kraft-100 flex items-center gap-2">
                  <span>{isUrdu && selectedWaste.nameUr ? selectedWaste.nameUr : selectedWaste.nameEn}</span>
                  <span className="font-mono text-xs text-kraft-500">({ideas.length} ideas)</span>
                </div>
              </div>

              {loadingIdeas ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-40 bg-kraft-200 dark:bg-kraft-800 animate-pulse rounded-xl" />
                  <div className="h-40 bg-kraft-200 dark:bg-kraft-800 animate-pulse rounded-xl" />
                </div>
              ) : ideas.length === 0 ? (
                <div className="text-center py-12 bg-kraft-50 dark:bg-kraft-800 rounded-xl">
                  <p className="text-sm font-sans text-kraft-600 dark:text-kraft-400">
                    {isUrdu ? 'اس مواد کے لیے ابھی کوئی آئیڈیا نہیں ہے۔' : 'No blueprints found for this material yet.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ideas.map((idea) => (
                    <div
                      key={idea.id}
                      onClick={() => setActiveIdea(idea)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        activeIdea?.id === idea.id
                          ? 'border-forest-green bg-forest-green/10 shadow-kraft'
                          : 'border-kraft-300 dark:border-kraft-700 bg-kraft-50 dark:bg-kraft-800 hover:border-kraft-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Stamp variant={idea.status === 'TESTED' ? 'tested' : 'draft'} size="sm">
                          {idea.status}
                        </Stamp>
                        <span className="font-mono text-xs text-forest-green font-bold">
                          -{Math.round(idea.co2SavedG)}g CO₂
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-base text-kraft-900 dark:text-kraft-100 mb-1">
                        {isUrdu && idea.titleUr ? idea.titleUr : idea.titleEn}
                      </h3>
                      <p className="text-xs font-sans text-kraft-600 dark:text-kraft-400 line-clamp-2">
                        {isUrdu && idea.summaryUr ? idea.summaryUr : idea.summaryEn}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: QR Code for visitors + Quick Detail */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          {/* Quick detail view if an idea is clicked */}
          {activeIdea && (
            <div className="bg-kraft-50 dark:bg-kraft-800 p-5 rounded-2xl border-2 border-forest-green shadow-kraft">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-mono text-[10px] uppercase text-forest-green font-bold">
                  PROJECT PREVIEW
                </span>
                <button
                  onClick={() => setActiveIdea(null)}
                  className="text-kraft-400 hover:text-kraft-700 text-xs font-mono"
                >
                  ✕
                </button>
              </div>

              <h4 className="font-display font-bold text-lg text-kraft-900 dark:text-kraft-100 mb-1">
                {isUrdu && activeIdea.titleUr ? activeIdea.titleUr : activeIdea.titleEn}
              </h4>
              <p className="text-xs font-sans text-kraft-600 dark:text-kraft-400 mb-4">
                {isUrdu && activeIdea.summaryUr ? activeIdea.summaryUr : activeIdea.summaryEn}
              </p>

              <div className="space-y-1.5 font-mono text-xs text-kraft-700 dark:text-kraft-300 mb-4 bg-kraft-100 dark:bg-kraft-900 p-3 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-kraft-500" />
                  <span>Time: {activeIdea.timeMinutes} mins</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cardboard-amber" />
                  <span>Difficulty: {activeIdea.difficulty === 1 ? 'Easy' : activeIdea.difficulty === 2 ? 'Medium' : 'Hard'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-forest-green" />
                  <span>Waste Diverted: {Math.round(activeIdea.wasteGrams)}g</span>
                </div>
              </div>

              <Link to={`/ideas/${activeIdea.slug}`} target="_blank">
                <Button variant="primary" className="w-full text-xs">
                  {isUrdu ? 'مکمل طریقہ کار کھولیں →' : 'Launch Full Step-by-Step →'}
                </Button>
              </Link>
            </div>
          )}

          {/* QR Code Card for Stall Visitors */}
          <div className="bg-cardboard-amber/15 border-2 border-dashed border-cardboard-amber/60 p-6 rounded-2xl text-center shadow-kraft">
            <div className="w-36 h-36 mx-auto mb-3 bg-white p-2 rounded-xl shadow border border-kraft-300 flex items-center justify-center">
              {/* SVG QR Code Illustration */}
              <svg viewBox="0 0 100 100" className="w-full h-full text-kraft-900">
                <rect width="100" height="100" fill="white" />
                <path
                  d="M10,10 h30 v30 h-30 z M15,15 h20 v20 h-20 z M20,20 h10 v10 h-10 z"
                  fill="currentColor"
                />
                <path
                  d="M60,10 h30 v30 h-30 z M65,15 h20 v20 h-20 z M70,20 h10 v10 h-10 z"
                  fill="currentColor"
                />
                <path
                  d="M10,60 h30 v30 h-30 z M15,65 h20 v20 h-20 z M20,70 h10 v10 h-10 z"
                  fill="currentColor"
                />
                <rect x="50" y="15" width="5" height="10" fill="currentColor" />
                <rect x="15" y="50" width="10" height="5" fill="currentColor" />
                <rect x="50" y="50" width="10" height="10" fill="currentColor" />
                <rect x="65" y="65" width="15" height="5" fill="currentColor" />
                <rect x="70" y="75" width="10" height="15" fill="currentColor" />
                <rect x="85" y="50" width="5" height="20" fill="currentColor" />
              </svg>
            </div>
            <div className="font-display font-bold text-sm text-kraft-900 dark:text-kraft-100">
              {isUrdu ? 'اپنے فون پر کھولیں' : 'Open ReMake On Your Phone'}
            </div>
            <p className="font-mono text-[11px] text-kraft-600 dark:text-kraft-400 mt-1">
              Scan with mobile camera to test AI waste vision live.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
