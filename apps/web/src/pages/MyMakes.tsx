import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Clock, Zap, Hourglass, CheckCircle2, XCircle } from 'lucide-react';
import { getMyMakes } from '../lib/api';
import { TapeCard } from '../ui/TapeCard';
import { Stamp } from '../ui/Stamp';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { useToast } from '../ui/Toast';

export const MyMakes: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const { showToast } = useToast();
  const [makes, setMakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMakes = async () => {
    try {
      setLoading(true);
      const res = await getMyMakes();
      setMakes(res.makes || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load your makes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMakes();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Stamp variant="tested" size="sm">{isUrdu ? 'منظور شدہ' : 'APPROVED'}</Stamp>;
      case 'REJECTED':
        return <Stamp variant="danger" size="sm">{isUrdu ? 'مسترد' : 'REJECTED'}</Stamp>;
      default:
        return <Stamp variant="draft" size="sm">{isUrdu ? 'زیرِ جائزہ' : 'IN REVIEW'}</Stamp>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b-2 border-dashed border-kraft-400 dark:border-kraft-700 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-kraft-900 dark:text-kraft-100">
              {isUrdu ? 'میری بنائی گئی اشیاء' : 'My Crafted Makes'}
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 bg-forest-green/20 text-forest-green dark:text-forest-light border border-forest-green/40 rounded">
              {makes.length}
            </span>
          </div>
          <p className="font-serif italic text-kraft-600 dark:text-kraft-400 mt-1 text-sm">
            {isUrdu
              ? 'آپ کی دستکاری کا ریکارڈ، تصاویر اور کچرے کی بچت کا اثر۔'
              : 'Your verified crafting journal, submitted creations, and environmental proof.'}
          </p>
        </div>

        <Link to="/explore">
          <Button variant="primary" size="sm">
            {isUrdu ? '+ نیا پروجیکٹ بنائیں' : '+ Craft Another'}
          </Button>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      ) : makes.length === 0 ? (
        <div className="text-center py-16 px-4 bg-kraft-100/50 dark:bg-kraft-800/40 border-2 border-dashed border-kraft-300 dark:border-kraft-700 rounded-2xl max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 text-kraft-400 dark:text-kraft-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>
          <h3 className="font-display font-bold text-lg text-kraft-800 dark:text-kraft-200 mb-2">
            {isUrdu ? 'ابھی کوئی تخلیق لاگ نہیں کی گئی' : 'No Makes Logged Yet'}
          </h3>
          <p className="text-sm font-sans text-kraft-600 dark:text-kraft-400 mb-6">
            {isUrdu
              ? 'کسی بھی آئیڈیا میں "میں نے یہ بنایا" کا انتخاب کریں، اپنی تصویر لگائیں اور بیجز حاصل کریں!'
              : 'Pick an idea from the catalog, finish it in Make Mode, snap a photo and tap "I Made This"!'}
          </p>
          <Link to="/explore">
            <Button variant="primary">
              {isUrdu ? 'آئیڈیاز تلاش کریں' : 'Browse Ideas'}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {makes.map((make) => {
            const ideaTitle = isUrdu && make.idea?.titleUr ? make.idea.titleUr : make.idea?.titleEn || 'Custom Make';

            return (
              <TapeCard key={make.id} tapePosition="top-left" tapeColor="yellow" className="flex flex-col justify-between">
                <div>
                  {/* Photo & Stamp */}
                  <div className="relative aspect-video rounded bg-kraft-100 dark:bg-kraft-900 overflow-hidden mb-4 border border-kraft-200 dark:border-kraft-700">
                    {make.photoUrl ? (
                      <img src={make.photoUrl} alt="Make photo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-mono text-xs text-kraft-400">
                        [ {isUrdu ? 'کوئی تصویر نہیں' : 'No Photo Uploaded'} ]
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(make.status)}
                    </div>
                  </div>

                  {/* Header info */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="font-display font-bold text-lg text-kraft-900 dark:text-kraft-100">
                      {ideaTitle}
                    </h2>
                    <span className="font-mono text-xs text-kraft-500 whitespace-nowrap">
                      {new Date(make.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* User notes */}
                  {make.notes && (
                    <p className="font-sans text-sm text-kraft-700 dark:text-kraft-300 italic mb-4 bg-kraft-50 dark:bg-kraft-900/40 p-2.5 rounded border border-kraft-200 dark:border-kraft-800">
                      "{make.notes}"
                    </p>
                  )}

                  {/* Rating & difficulty feedback */}
                  <div className="flex items-center gap-3 text-xs font-mono text-kraft-600 dark:text-kraft-400 mb-2">
                    {make.rating && (
                      <span className="flex items-center gap-1 text-cardboard-amber">
                        <Star className="w-3.5 h-3.5 fill-marigold text-marigold" />
                        <span>{make.rating}/5</span>
                      </span>
                    )}
                    {make.timeSpentMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{make.timeSpentMinutes} min</span>
                      </span>
                    )}
                    {make.difficultyRating && (
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-cardboard-amber" />
                        <span>{make.difficultyRating}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer impact */}
                <div className="pt-3 border-t border-dashed border-kraft-300 dark:border-kraft-700 flex items-center justify-between text-xs font-mono">
                  <span className="text-kraft-500">
                    {make.status === 'APPROVED' ? (
                      <span className="text-forest-green dark:text-forest-light inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'کمیونٹی گیلری میں لائیو' : 'Live on Community Wall'}</span>
                      </span>
                    ) : make.status === 'REJECTED' ? (
                      <span className="text-caution-red inline-flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'جائزہ مسترد' : 'Rejection Reason'}: {make.rejectionReason || 'Policy'}</span>
                      </span>
                    ) : (
                      <span className="text-cardboard-amber inline-flex items-center gap-1">
                        <Hourglass className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'انتظامیہ کا انتظار' : 'Pending Admin Verification'}</span>
                      </span>
                    )}
                  </span>
                  {make.idea?.slug && (
                    <Link to={`/ideas/${make.idea.slug}`} className="text-forest-green hover:underline">
                      {isUrdu ? 'آئیڈیا دیکھیں →' : 'View Idea →'}
                    </Link>
                  )}
                </div>
              </TapeCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

