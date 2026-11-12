import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Clock, Sparkles, AlertCircle, Camera, Check } from 'lucide-react';
import { getIdeas, getWasteTypes, submitSuggestion } from '../lib/api';
import { TapeCard } from '../ui/TapeCard';
import { Stamp } from '../ui/Stamp';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { useToast } from '../ui/Toast';

export const Explore: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter state synced with URL params
  const wasteParam = searchParams.get('waste') || '';
  const selectedWaste = wasteParam ? wasteParam.split(',').filter(Boolean) : [];
  const qParam = searchParams.get('q') || '';
  const difficultyParam = searchParams.get('difficulty') || '';
  const maxTimeParam = searchParams.get('maxTime') || '';
  const canSellParam = searchParams.get('canSell') === 'true';
  const statusParam = searchParams.get('status') || '';
  const sortParam = searchParams.get('sort') || 'match';

  const [searchInput, setSearchInput] = useState(qParam);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestText, setSuggestText] = useState('');

  // Fetch waste types
  const { data: wasteTypes = [] } = useQuery({
    queryKey: ['waste-types'],
    queryFn: getWasteTypes,
  });

  // Fetch ideas matching current filters
  const { data: ideasData, isLoading } = useQuery({
    queryKey: [
      'ideas',
      wasteParam,
      qParam,
      difficultyParam,
      maxTimeParam,
      canSellParam,
      statusParam,
      sortParam,
    ],
    queryFn: () =>
      getIdeas({
        waste: wasteParam,
        q: qParam,
        difficulty: difficultyParam ? Number(difficultyParam) : undefined,
        maxTime: maxTimeParam ? Number(maxTimeParam) : undefined,
        canSell: canSellParam ? true : undefined,
        status: statusParam || undefined,
        sort: sortParam,
      }),
  });

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const toggleWasteFilter = (slug: string) => {
    let nextList: string[];
    if (selectedWaste.includes(slug)) {
      nextList = selectedWaste.filter((s) => s !== slug);
    } else {
      nextList = [...selectedWaste, slug];
    }
    updateParam('waste', nextList.length > 0 ? nextList.join(',') : null);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('q', searchInput.trim() || null);
  };

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestText.trim()) return;
    try {
      await submitSuggestion({ kind: 'IDEA', text: suggestText });
      showToast('Thank you! Your idea suggestion was sent to the ReMake team.', 'success');
      setSuggestText('');
    } catch {
      showToast('Could not submit suggestion. Please try again.', 'error');
    }
  };

  const isUrdu = i18n.language === 'ur';

  return (
    <div className="space-y-6 pb-20">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('search.placeholder', 'Search crafts, waste, or materials...')}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-card border-2 border-ink shadow-[0_2px_0_rgba(27,42,34,0.15)] text-ink placeholder:text-ink/40 font-body text-sm focus:outline-none focus:ring-3 focus:ring-marigold"
          />
        </form>

        <div className="flex gap-2">
          {/* Filter toggle button */}
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            size="md"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            <span>{t('search.filters', 'Filters')}</span>
          </Button>

          {/* Sort dropdown */}
          <select
            value={sortParam}
            onChange={(e) => updateParam('sort', e.target.value)}
            aria-label="Sort ideas"
            className="px-4 py-2.5 rounded-2xl bg-card border-2 border-ink shadow-[0_2px_0_rgba(27,42,34,0.15)] text-ink font-display font-bold text-xs focus:outline-none cursor-pointer"
          >
            <option value="match">{t('search.sortMatch', 'Best match')}</option>
            <option value="time">{t('search.sortTime', 'Quickest')}</option>
            <option value="cost">{t('search.sortCost', 'Cheapest')}</option>
            <option value="profit">{t('search.sortProfit', 'Highest profit')}</option>
            <option value="impact">{t('search.sortImpact', 'Most waste saved')}</option>
          </select>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {wasteTypes.map((wt) => (
          <Chip
            key={wt.id}
            label={isUrdu ? wt.nameUr : wt.nameEn}
            selected={selectedWaste.includes(wt.slug)}
            onClick={() => toggleWasteFilter(wt.slug)}
          />
        ))}
      </div>

      {/* Expanded Filter Drawer */}
      {showFilters && (
        <div className="p-5 rounded-2xl bg-card border-2 border-ink shadow-[0_4px_0_rgba(27,42,34,0.15)] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-display">
          <div>
            <label className="block font-bold text-ink mb-1.5">{t('search.difficulty', 'Difficulty')}</label>
            <select
              value={difficultyParam}
              onChange={(e) => updateParam('difficulty', e.target.value || null)}
              className="w-full p-2 rounded-xl bg-paper border-2 border-ink text-ink font-bold"
            >
              <option value="">{t('search.anyDifficulty', 'Any difficulty')}</option>
              <option value="1">Level 1 (Easy)</option>
              <option value="2">Level 2 (Medium)</option>
              <option value="3">Level 3 (Challenging)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-ink mb-1.5">{t('search.maxTime', 'Max Time')}</label>
            <select
              value={maxTimeParam}
              onChange={(e) => updateParam('maxTime', e.target.value || null)}
              className="w-full p-2 rounded-xl bg-paper border-2 border-ink text-ink font-bold"
            >
              <option value="">Any duration</option>
              <option value="20">Under 20 mins</option>
              <option value="30">Under 30 mins</option>
              <option value="60">Under 60 mins</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-ink mb-1.5">Recipe Status</label>
            <select
              value={statusParam}
              onChange={(e) => updateParam('status', e.target.value || null)}
              className="w-full p-2 rounded-xl bg-paper border-2 border-ink text-ink font-bold"
            >
              <option value="">All tested & curated</option>
              <option value="TESTED">Tested by ReMake Only</option>
              <option value="UNTESTED">Untested Curated</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="canSellCheck"
              checked={canSellParam}
              onChange={(e) => updateParam('canSell', e.target.checked ? 'true' : null)}
              className="w-4 h-4 rounded border-2 border-ink text-leaf focus:ring-0 cursor-pointer"
            />
            <label htmlFor="canSellCheck" className="font-bold text-ink cursor-pointer select-none">
              {t('search.canSell', 'Can sell for profit')}
            </label>
          </div>
        </div>
      )}

      {/* Ideas Result Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-ink/10 animate-pulse border-2 border-dashed border-ink/20" />
          ))}
        </div>
      ) : ideasData?.items && ideasData.items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {ideasData.items.map((idea) => (
            <TapeCard
              key={idea.id}
              onClick={() => navigate(`/ideas/${idea.slug}`)}
              className="cursor-pointer hover:-translate-y-1 transition-transform overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="h-44 bg-paper-muted relative overflow-hidden flex items-center justify-center border-b-2 border-ink">
                  <img
                    src={idea.coverImage || `/seed/waste-${idea.waste[0]?.slug || 'other'}.jpg`}
                    alt={idea.titleEn}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Stamp status={idea.status} />
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-display font-bold text-lg text-ink leading-snug line-clamp-1">
                    {isUrdu && idea.titleUr ? idea.titleUr : idea.titleEn}
                  </h3>
                  <p className="text-xs text-ink/70 mt-1 line-clamp-2">
                    {isUrdu && idea.summaryUr ? idea.summaryUr : idea.summaryEn}
                  </p>
                  {/* Waste types chips */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {idea.waste.map((w) => (
                      <span
                        key={w.slug}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-ink/10 text-ink/80"
                      >
                        {w.pieces}x {w.slug}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 flex items-center justify-between border-t border-ink/10 text-xs font-display font-bold">
                <div className="flex items-center gap-1.5 text-ink/80">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{idea.timeMinutes} {t('common.mins', 'mins')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-leaf font-bold">
                    +{idea.wasteGrams}g saved
                  </span>
                  {idea.sellPricePkr && (
                    <span className="bg-marigold/30 px-2 py-0.5 rounded text-ink font-bold">
                      Rs {idea.sellPricePkr}
                    </span>
                  )}
                </div>
              </div>
            </TapeCard>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-card rounded-3xl p-8 border-2 border-ink shadow-[0_6px_0_rgba(27,42,34,0.1)] text-center max-w-lg mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-marigold/20 text-[#8F5E00] border-2 border-marigold flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-display font-black text-ink">
            {t('search.noResults', 'No matching ideas found')}
          </h3>
          <p className="text-xs text-ink/70 mt-1 max-w-sm mx-auto">
            {isUrdu
              ? 'تلاش تبدیل کریں یا ری میک کیمرے کے ذریعے کچرا اسکین کریں۔'
              : 'Try adjusting your search terms or scan the waste directly with ReMake Vision to get fresh ideas.'}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" size="md" onClick={() => navigate('/scan')}>
              <Camera className="w-4 h-4 mr-1.5" />
              <span>{isUrdu ? 'کچرا اسکین کریں' : 'Scan for Waste'}</span>
            </Button>
          </div>

          {/* Suggest waste form */}
          <form onSubmit={handleSuggestionSubmit} className="mt-8 pt-6 border-t border-dashed border-ink/20">
            <p className="text-xs font-bold text-ink/80 mb-2">
              {t('search.suggestWaste', 'Suggest a waste type or idea to our student team:')}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={suggestText}
                onChange={(e) => setSuggestText(e.target.value)}
                placeholder="e.g. Toothpaste tubes or egg cartons..."
                className="flex-1 px-3 py-2 rounded-xl bg-paper border-2 border-ink text-xs text-ink"
              />
              <Button variant="secondary" size="sm" type="submit">
                Send
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
