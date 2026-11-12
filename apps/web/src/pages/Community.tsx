import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CommunityMakeItem, WasteType } from '@remake/shared';
import { getCommunityMakes, getWasteTypes, toggleLikeMake } from '../lib/api';
import { TapeCard } from '../ui/TapeCard';
import { Chip } from '../ui/Chip';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { useToast } from '../ui/Toast';

export const Community: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const { showToast } = useToast();

  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [selectedWaste, setSelectedWaste] = useState<string>('');
  const [makes, setMakes] = useState<CommunityMakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    getWasteTypes().then((types) => setWasteTypes(types)).catch(() => {});
  }, []);

  const loadCommunity = async (wasteSlug: string, pageNum: number, append = false) => {
    try {
      setLoading(true);
      const res = await getCommunityMakes(wasteSlug || undefined, pageNum);
      if (append) {
        setMakes((prev) => [...prev, ...res.items]);
      } else {
        setMakes(res.items);
      }
      setTotalPages(res.totalPages || Math.ceil(res.total / res.pageSize) || 1);
      setPage(res.page);
    } catch (err: any) {
      showToast(err.message || 'Failed to load community makes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunity(selectedWaste, 1, false);
  }, [selectedWaste]);

  const handleLike = async (makeId: string, currentLiked: boolean) => {
    try {
      // Optimistic update
      setMakes((prev) =>
        prev.map((m) =>
          m.id === makeId
            ? {
                ...m,
                hasLiked: !currentLiked,
                likesCount: currentLiked ? m.likesCount - 1 : m.likesCount + 1,
              }
            : m
        )
      );

      const res = await toggleLikeMake(makeId, currentLiked);
      setMakes((prev) =>
        prev.map((m) =>
          m.id === makeId ? { ...m, hasLiked: res.liked, likesCount: res.likesCount } : m
        )
      );
    } catch (err: any) {
      // Revert on error
      showToast(err.message || 'Could not update like', 'error');
      loadCommunity(selectedWaste, page, false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      {/* Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="font-mono text-xs uppercase tracking-widest text-forest-green dark:text-forest-light bg-forest-green/10 dark:bg-forest-green/20 px-3 py-1 rounded-full border border-forest-green/30">
          {isUrdu ? 'کمیونٹی گیلری' : 'The Maker Community'}
        </span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-kraft-900 dark:text-kraft-100 mt-3 mb-2">
          {isUrdu ? 'ہماری کمیونٹی کے شاہکار' : 'Crafted with Care & Trash'}
        </h1>
        <p className="font-serif italic text-kraft-600 dark:text-kraft-400 text-sm sm:text-base">
          {isUrdu
            ? 'طلباء اور کاریگروں کی بنائی ہوئی اشیاء۔ حقیقی فضلہ، حقیقی دستکاری، اور تصدیق شدہ ماحولیاتی اثر۔'
            : 'Real creations built by students and local makers. Each piece diverted trash from landfill.'}
        </p>
      </div>

      {/* Filter by Waste */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        <Chip
          label={isUrdu ? 'تمام مواد' : 'All Materials'}
          selected={selectedWaste === ''}
          onClick={() => setSelectedWaste('')}
        />
        {wasteTypes.map((w) => (
          <Chip
            key={w.id}
            label={isUrdu && w.nameUr ? w.nameUr : w.nameEn}
            selected={selectedWaste === w.slug}
            onClick={() => setSelectedWaste(w.slug)}
          />
        ))}
      </div>

      {/* Grid */}
      {loading && makes.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
      ) : makes.length === 0 ? (
        <div className="text-center py-16 px-4 bg-kraft-100/50 dark:bg-kraft-800/40 border-2 border-dashed border-kraft-300 dark:border-kraft-700 rounded-2xl max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 text-kraft-400 dark:text-kraft-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 002.175 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          </div>
          <h3 className="font-display font-bold text-lg text-kraft-800 dark:text-kraft-200 mb-2">
            {isUrdu ? 'اس زمرے میں ابھی کوئی تخلیق نہیں' : 'No Community Makes Yet'}
          </h3>
          <p className="text-sm font-sans text-kraft-600 dark:text-kraft-400 mb-6">
            {isUrdu
              ? 'پہلے کاریگر بنیں! ایک آئیڈیا منتخب کریں، اسے بنائیں اور اپنی تصویر شیئر کریں۔'
              : 'Be the first pioneer! Pick an idea, build it in Make Mode, and share your photo.'}
          </p>
          <Link to="/explore">
            <Button variant="primary">
              {isUrdu ? 'کاریگری شروع کریں' : 'Start Making'}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {makes.map((item) => {
            const title = isUrdu && item.ideaTitleUr ? item.ideaTitleUr : item.ideaTitleEn;

            return (
              <TapeCard key={item.id} className="flex flex-col justify-between">
                <div>
                  {/* Photo */}
                  <div className="relative aspect-square rounded bg-kraft-100 dark:bg-kraft-900 overflow-hidden mb-3 border border-kraft-200 dark:border-kraft-700">
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt={title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-mono text-xs text-kraft-400">
                        [ Made Project ]
                      </div>
                    )}
                  </div>

                  {/* Header & Author */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-xs font-semibold text-kraft-700 dark:text-kraft-300">
                      @{item.userName}
                    </span>
                    <span className="font-mono text-[11px] text-kraft-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <Link to={`/ideas/${item.ideaSlug}`} className="block group">
                    <h3 className="font-display font-bold text-base text-kraft-900 dark:text-kraft-100 group-hover:text-forest-green dark:group-hover:text-forest-light transition-colors line-clamp-1">
                      {title}
                    </h3>
                  </Link>

                  {item.notes && (
                    <p className="font-sans text-xs text-kraft-600 dark:text-kraft-400 mt-2 line-clamp-2 italic">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                {/* Footer with Like Button */}
                <div className="pt-3 mt-3 border-t border-dashed border-kraft-200 dark:border-kraft-700/60 flex items-center justify-between">
                  <div className="text-xs font-mono text-forest-green dark:text-forest-light font-bold">
                    ✓ Verified
                  </div>

                  <button
                    onClick={() => handleLike(item.id, item.hasLiked)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-colors ${
                      item.hasLiked
                        ? 'bg-caution-red/10 text-caution-red border border-caution-red/30'
                        : 'bg-kraft-100 dark:bg-kraft-800 text-kraft-600 dark:text-kraft-400 hover:bg-kraft-200'
                    }`}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill={item.hasLiked ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span>{item.likesCount}</span>
                  </button>
                </div>
              </TapeCard>
            );
          })}
        </div>
      )}

      {/* Pagination Load More */}
      {page < totalPages && (
        <div className="text-center mt-10">
          <Button
            variant="secondary"
            onClick={() => loadCommunity(selectedWaste, page + 1, true)}
            disabled={loading}
          >
            {loading ? (isUrdu ? 'لوڈ ہو رہا ہے...' : 'Loading...') : (isUrdu ? 'مزید لوڈ کریں' : 'Load More Creations')}
          </Button>
        </div>
      )}
    </div>
  );
};
