import React, { useState } from 'react';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  Search,
  Sparkles,
  Clock,
  ArrowRight,
  Tag,
  Hammer,
  ShieldCheck,
  CheckCircle2,
  TreePine,
  TrendingUp,
  Box,
  Layers,
  Scissors,
  Zap,
  X,
} from 'lucide-react';
import { Sticker } from '../ui/Sticker';
import { Button } from '../ui/Button';
import { Stamp } from '../ui/Stamp';
import { TapeCard } from '../ui/TapeCard';
import { Counter } from '../ui/Counter';
import { getWasteTypes, getTrendingIdeas, getQuickWinsIdeas, getMyImpact } from '../lib/api';

export const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const isUrdu = i18n.language === 'ur';

  // Queries
  const { data: wasteTypes = [] } = useQuery({
    queryKey: ['waste-types'],
    queryFn: getWasteTypes,
  });

  const { data: trending = [] } = useQuery({
    queryKey: ['ideas', 'trending'],
    queryFn: getTrendingIdeas,
  });

  const { data: quickWins = [] } = useQuery({
    queryKey: ['ideas', 'quick-wins'],
    queryFn: getQuickWinsIdeas,
  });

  const { data: impact } = useQuery({
    queryKey: ['my-impact'],
    queryFn: getMyImpact,
  });

  const toggleWaste = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleShowIdeas = () => {
    if (selectedSlugs.length > 0) {
      navigate(`/explore?waste=${selectedSlugs.join(',')}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="space-y-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-10 pb-4">
        {/* Decorative Workbench Badge */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-marigold/20 text-[#8F5E00] dark:text-marigold border border-marigold/40 text-xs font-mono font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NUCES Environmental Science & Sustainability</span>
          </div>
          <span className="hidden sm:inline-block text-xs font-mono text-ink/40">•</span>
          <span className="text-xs font-mono text-leaf dark:text-leaf-light font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Tested Student Blueprints</span>
          </span>
        </div>

        {/* Hero Title & Subheading */}
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-ink tracking-tight leading-[1.15]">
            {isUrdu ? (
              <span>جو پھینکتے ہیں، اسے <span className="text-leaf">قیمتی بنائیں</span></span>
            ) : (
              <span>Turn What You Throw Into <span className="text-leaf underline decoration-wavy decoration-marigold/60">What You Grow</span></span>
            )}
          </h1>
          <p className="text-base sm:text-lg text-ink/75 mt-3 max-w-2xl font-body leading-relaxed">
            {isUrdu
              ? 'اپنے پاس موجود فضلہ منتخب کریں یا کیمرے سے اسکین کریں۔ ہم آپ کو مرحلہ وار دستکاری کے آزمودہ طریقے دکھائیں گے۔'
              : 'Pick or scan your household trash. ReMake Smart Vision detects plastic, cardboard, and cloth, matching them with verified university blueprints.'}
          </p>
        </div>

        {/* Search & AI Camera Action Bar */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3.5 items-stretch max-w-3xl">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isUrdu ? 'آئیڈیاز، فضلہ یا مواد تلاش کریں...' : 'Search crafts, bottles, cardboard, planter...'}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-card border-2 border-ink shadow-[0_3px_0_rgba(27,42,34,0.15)] text-ink placeholder:text-ink/40 font-body text-sm focus:outline-none focus:ring-4 focus:ring-marigold/30 transition-all"
            />
          </form>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/scan')}
            className="sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-display font-bold shadow-[0_4px_0_#1B2A22]"
          >
            <Camera className="w-5 h-5" />
            <span>{isUrdu ? 'فضلہ اسکین کریں' : 'Scan for Waste'}</span>
          </Button>
        </div>

        {/* Quick Sample Action Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-mono text-ink/60">
          <span className="font-bold">{isUrdu ? 'فوری ٹیسٹ:' : 'Quick try:'}</span>
          <button
            onClick={() => navigate('/explore?waste=plastic-bottle')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-paper-muted border border-ink/20 hover:border-ink hover:text-ink transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-leaf" />
            <span>{isUrdu ? 'پلاسٹک بوتل' : 'Plastic Bottles'}</span>
          </button>
          <button
            onClick={() => navigate('/explore?waste=cardboard')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-paper-muted border border-ink/20 hover:border-ink hover:text-ink transition-colors"
          >
            <Box className="w-3.5 h-3.5 text-cardboard-amber" />
            <span>{isUrdu ? 'کارڈ بورڈ' : 'Cardboard'}</span>
          </button>
          <button
            onClick={() => navigate('/explore?waste=old-cloth')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-paper-muted border border-ink/20 hover:border-ink hover:text-ink transition-colors"
          >
            <Scissors className="w-3.5 h-3.5 text-sky" />
            <span>{isUrdu ? 'پرانا کپڑا' : 'Old Cloth'}</span>
          </button>
        </div>
      </section>

      {/* Waste Bin Interactive Picker */}
      <section className="bg-card/85 backdrop-blur-md rounded-3xl p-6 sm:p-8 border-2 border-ink shadow-[0_6px_0_rgba(27,42,34,0.12)] relative cutting-mat-grid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Box className="w-6 h-6 text-leaf" />
              <h2 className="text-2xl font-display font-black text-ink">
                {isUrdu ? 'اپنے کچرے کا انتخاب کریں' : 'The Workbench Waste Bin'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-ink/70 mt-0.5">
              {isUrdu
                ? 'جو بھی فضلہ آپ کے پاس موجود ہے اس پر ٹیپ کریں'
                : 'Select one or more items on your workbench to discover recipes'}
            </p>
          </div>
          {selectedSlugs.length > 0 && (
            <button
              onClick={() => setSelectedSlugs([])}
              className="inline-flex items-center gap-1 text-xs font-mono font-bold text-chili hover:underline cursor-pointer self-start sm:self-center"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'انتخاب ختم کریں' : 'Clear Selection'}</span>
            </button>
          )}
        </div>

        {/* Stickers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {wasteTypes.map((wt) => (
            <Sticker
              key={wt.id}
              slug={wt.slug}
              name={isUrdu && wt.nameUr ? wt.nameUr : wt.nameEn}
              count={wt.ideaCount}
              selected={selectedSlugs.includes(wt.slug)}
              onClick={() => toggleWaste(wt.slug)}
            />
          ))}
        </div>

        {/* Sticky Action Footer */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t-2 border-dashed border-ink/15">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-leaf animate-pulse" />
            <span className="text-xs sm:text-sm font-display font-bold text-ink/80">
              {selectedSlugs.length > 0
                ? isUrdu
                  ? `${selectedSlugs.length} مواد منتخب کیے گئے ہیں`
                  : `${selectedSlugs.length} waste stream(s) selected`
                : isUrdu
                ? 'آئیڈیاز دیکھنے کے لیے اوپر کسی بھی مواد پر ٹیپ کریں'
                : 'Tap any waste sticker to see matching builds'}
            </span>
          </div>

          <Button
            variant={selectedSlugs.length > 0 ? 'secondary' : 'outline'}
            size="md"
            onClick={handleShowIdeas}
            className="w-full sm:w-auto flex items-center justify-center gap-2 font-display font-bold"
          >
            <span>{isUrdu ? 'منصوبے دیکھیں' : 'Show Matching Blueprints'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Impact Jar & Equivalents Banner */}
      <section className="bg-card rounded-3xl p-6 sm:p-8 border-2 border-ink shadow-[0_6px_0_rgba(27,42,34,0.12)] flex flex-col lg:flex-row items-stretch lg:items-center gap-6 justify-between relative overflow-hidden">
        {/* Left: Summary Numbers */}
        <div className="flex items-start sm:items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-leaf/15 border-2 border-leaf flex items-center justify-center -rotate-2 text-leaf shrink-0 shadow-sm">
            <TreePine className="w-9 h-9 sm:w-11 sm:h-11" />
          </div>
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-leaf/10 text-leaf mb-1">
              {isUrdu ? 'ماحولیاتی کھاتہ' : 'Verified Eco-Ledger'}
            </div>
            <h3 className="font-display font-black text-xl sm:text-2xl text-ink">
              {isUrdu ? 'آپ کا کچرا کھاتہ (Impact Jar)' : 'Your Workbench Impact'}
            </h3>
            <p className="text-xs text-ink/70">
              {isUrdu
                ? 'ہر دستکاری پاکستان کے لینڈ فل سے کچرے کو کم کرتی ہے۔'
                : 'Zero greenwashing. Conservative 50% displacement formula from DB lifecycle factors.'}
            </p>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-3xl sm:text-4xl font-display font-black text-leaf">
                <Counter value={Number(((impact?.totals.wasteG || 0) / 1000).toFixed(2))} />
              </span>
              <span className="text-xs font-mono font-bold text-ink/70">
                kg {isUrdu ? 'کچرا بچایا' : 'trash diverted'}
              </span>
              <span className="text-ink/30">•</span>
              <span className="text-sm font-mono font-bold text-forest-green dark:text-leaf-light">
                -{Math.round(impact?.totals.co2G || 0)}g CO₂e
              </span>
            </div>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/method" className="text-xs font-mono text-ink/60 hover:text-ink underline">
            {isUrdu ? 'فارمولہ دیکھیں' : 'Formula Breakdown'}
          </Link>
          <Button variant="primary" size="sm" onClick={() => navigate('/impact')}>
            <span>{isUrdu ? 'مکمل کھاتہ دیکھیں' : 'View Impact Ledger'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </section>

      {/* Trending Blueprints Carousel/Grid */}
      {trending.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-marigold" />
                <h2 className="text-2xl sm:text-3xl font-display font-black text-ink">
                  {isUrdu ? 'اس ہفتے کے مقبول ترین منصوبے' : 'Trending Workbench Recipes'}
                </h2>
              </div>
              <p className="text-xs text-ink/60 mt-0.5">
                {isUrdu
                  ? 'طلباء کے سب سے زیادہ بنائے گئے اور آزمائے گئے منصوبے'
                  : 'Most crafted upcycling blueprints with step-by-step guides'}
              </p>
            </div>
            <NavLink
              to="/explore"
              className="text-xs sm:text-sm font-display font-bold text-leaf hover:underline shrink-0 flex items-center gap-1"
            >
              <span>{isUrdu ? 'تمام دیکھیں' : 'View all recipes'}</span>
              <span>→</span>
            </NavLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.slice(0, 3).map((idea) => {
              const title = isUrdu && idea.titleUr ? idea.titleUr : idea.titleEn;
              const summary = isUrdu && idea.summaryUr ? idea.summaryUr : idea.summaryEn;

              return (
                <Link
                  key={idea.id}
                  to={`/ideas/${idea.slug}`}
                  className="group block focus:outline-none"
                >
                  <TapeCard className="h-full flex flex-col justify-between p-5 hover:translate-y-[-2px] transition-transform">
                    <div>
                      {/* Photo or SVG cover */}
                      <div className="relative aspect-video rounded-xl bg-paper-muted overflow-hidden mb-4 border-2 border-ink shadow-inner">
                        {idea.coverImage ? (
                          <img
                            src={idea.coverImage}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-mono text-xs text-ink/40">
                            [ ReMake Blueprint ]
                          </div>
                        )}
                        <div className="absolute top-2.5 left-2.5">
                          <Stamp
                            variant={idea.status === 'TESTED' ? 'tested' : idea.status === 'AI_DRAFT' ? 'draft' : 'untested'}
                            size="sm"
                          >
                            {idea.status}
                          </Stamp>
                        </div>
                      </div>

                      <h3 className="font-display font-black text-lg text-ink group-hover:text-leaf transition-colors line-clamp-1">
                        {title}
                      </h3>
                      <p className="text-xs text-ink/75 font-body line-clamp-2 mt-1.5 leading-relaxed">
                        {summary}
                      </p>
                    </div>

                    {/* Metadata Footer */}
                    <div className="pt-4 mt-4 border-t-2 border-dashed border-ink/15 flex items-center justify-between text-xs font-mono text-ink/70">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{idea.timeMinutes}m</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-cardboard-amber" />
                        <span>{idea.difficulty === 1 ? 'Easy' : idea.difficulty === 2 ? 'Medium' : 'Hard'}</span>
                      </span>
                      <span className="font-bold text-leaf">
                        -{Math.round(idea.co2SavedG)}g CO₂
                      </span>
                    </div>
                  </TapeCard>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Quick Wins (15-Minute Crafts) */}
      {quickWins.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-leaf" />
                <h2 className="text-2xl sm:text-3xl font-display font-black text-ink">
                  {isUrdu ? '15 منٹ کے فوری منصوبے' : 'Quick Wins (Under 15 Mins)'}
                </h2>
              </div>
              <p className="text-xs text-ink/60 mt-0.5">
                {isUrdu ? 'تیزی سے بننے والی آسان اشیاء' : 'Fast, beginner-friendly builds requiring minimal tools'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickWins.slice(0, 3).map((idea) => {
              const title = isUrdu && idea.titleUr ? idea.titleUr : idea.titleEn;
              const summary = isUrdu && idea.summaryUr ? idea.summaryUr : idea.summaryEn;

              return (
                <Link
                  key={idea.id}
                  to={`/ideas/${idea.slug}`}
                  className="group block focus:outline-none"
                >
                  <TapeCard className="h-full flex flex-col justify-between p-5 hover:translate-y-[-2px] transition-transform">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Stamp
                          variant={idea.status === 'TESTED' ? 'tested' : 'untested'}
                          size="sm"
                        >
                          {idea.status}
                        </Stamp>
                        <span className="font-mono text-xs text-forest-green font-bold">
                          ⏱ {idea.timeMinutes} mins
                        </span>
                      </div>

                      <h3 className="font-display font-black text-base text-ink group-hover:text-leaf transition-colors line-clamp-1">
                        {title}
                      </h3>
                      <p className="text-xs text-ink/75 font-body line-clamp-2 mt-1 leading-relaxed">
                        {summary}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t-2 border-dashed border-ink/15 flex items-center justify-between text-xs font-mono">
                      <span className="text-ink/60">
                        {idea.waste[0]?.nameEn || 'Upcycled Waste'}
                      </span>
                      <span className="font-bold text-leaf">
                        -{Math.round(idea.co2SavedG)}g CO₂
                      </span>
                    </div>
                  </TapeCard>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Physical Workshop Store Teaser */}
      <section className="bg-paper-muted rounded-3xl p-6 sm:p-8 border-2 border-ink shadow-[0_6px_0_rgba(27,42,34,0.12)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-marigold/30 text-ink mb-1">
            {isUrdu ? 'ری میک دکان' : 'Handmade by NUCES Students'}
          </div>
          <h3 className="font-display font-black text-2xl text-ink">
            {isUrdu ? 'تیار شدہ دستکاری مصنوعات' : 'The ReMake Workshop Store'}
          </h3>
          <p className="text-xs sm:text-sm text-ink/70 max-w-xl mt-1">
            {isUrdu
              ? 'کیمپس اور مقامی کچرے سے ہاتھ سے تیار کردہ اصلی مصنوعات۔ 100% آمدنی ورکشاپ کے اوزاروں کے لیے استعمال ہوتی ہے۔'
              : 'Physical, finished upcycled products crafted from campus & household waste. 100% of proceeds fund workshop tools and cleanups.'}
          </p>
        </div>
        <Link to="/shop">
          <Button variant="secondary" size="md" className="whitespace-nowrap font-display font-bold">
            <span>{isUrdu ? 'دکان دیکھیں' : 'Browse Workshop Store'}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      </section>
    </div>
  );
};
