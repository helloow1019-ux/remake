import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Zap } from 'lucide-react';
import { IdeaPublic } from '@remake/shared';
import { getSavedIdeas, unsaveIdea } from '../lib/api';
import { TapeCard } from '../ui/TapeCard';
import { Stamp } from '../ui/Stamp';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { useToast } from '../ui/Toast';

export const Saved: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const { showToast } = useToast();
  const [ideas, setIdeas] = useState<IdeaPublic[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = async () => {
    try {
      setLoading(true);
      const res = await getSavedIdeas();
      setIdeas(res.items || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load saved ideas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleUnsave = async (e: React.MouseEvent, ideaId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await unsaveIdea(ideaId);
      setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
      showToast(isUrdu ? 'محفوظات سے ہٹا دیا گیا' : 'Removed from saved ideas', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to unsave', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b-2 border-dashed border-kraft-400 dark:border-kraft-700 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-kraft-900 dark:text-kraft-100">
              {isUrdu ? 'آپ کے محفوظ کردہ منصوبے' : 'Saved Workbench Ideas'}
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 bg-cardboard-amber/20 text-cardboard-amber border border-cardboard-amber/40 rounded">
              {ideas.length}
            </span>
          </div>
          <p className="font-serif italic text-kraft-600 dark:text-kraft-400 mt-1 text-sm">
            {isUrdu
              ? 'وہ تمام آئیڈیاز جنہیں آپ نے بعد میں بنانے کے لیے پن کیا ہے۔'
              : 'Projects you pinned to craft later on your workbench.'}
          </p>
        </div>

        <Link to="/explore">
          <Button variant="secondary" size="sm">
            {isUrdu ? '+ مزید تلاش کریں' : '+ Discover More'}
          </Button>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-16 px-4 bg-kraft-100/50 dark:bg-kraft-800/40 border-2 border-dashed border-kraft-300 dark:border-kraft-700 rounded-2xl max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 text-kraft-400 dark:text-kraft-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </div>
          <h3 className="font-display font-bold text-lg text-kraft-800 dark:text-kraft-200 mb-2">
            {isUrdu ? 'ابھی کوئی منصوبہ محفوظ نہیں' : 'Workbench is Empty'}
          </h3>
          <p className="text-sm font-sans text-kraft-600 dark:text-kraft-400 mb-6">
            {isUrdu
              ? 'مختلف فضلے کے آئیڈیاز تلاش کریں اور اپنے پسندیدہ منصوبوں کو یہاں پن کریں۔'
              : 'Explore waste upcycling ideas and pin your favorites here with craft tape.'}
          </p>
          <Link to="/explore">
            <Button variant="primary">
              {isUrdu ? 'آئیڈیاز دیکھیں' : 'Explore Ideas'}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {ideas.map((idea) => {
            const title = isUrdu && idea.titleUr ? idea.titleUr : idea.titleEn;
            const desc = isUrdu && idea.summaryUr ? idea.summaryUr : idea.summaryEn;

            return (
              <Link key={idea.id} to={`/ideas/${idea.slug}`} className="group block focus:outline-none">
                <TapeCard tapePosition="top-right" tapeColor="yellow" className="h-full flex flex-col justify-between">
                  <div>
                    {/* Image / Illustration */}
                    <div className="relative aspect-video rounded bg-kraft-100 dark:bg-kraft-900 overflow-hidden mb-3 border border-kraft-200 dark:border-kraft-700">
                      {idea.coverImage ? (
                        <img
                          src={idea.coverImage}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-kraft-400 font-mono text-xs">
                          [ ReMake Studio ]
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <Stamp
                          variant={idea.status === 'TESTED' ? 'tested' : idea.status === 'AI_DRAFT' ? 'draft' : 'untested'}
                          size="sm"
                        >
                          {idea.status}
                        </Stamp>
                      </div>
                      <button
                        onClick={(e) => handleUnsave(e, idea.id)}
                        title={isUrdu ? 'ہٹائیں' : 'Remove'}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-kraft-900/80 text-white flex items-center justify-center hover:bg-caution-red transition-colors shadow"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    <h2 className="font-display font-bold text-base text-kraft-900 dark:text-kraft-100 group-hover:text-forest-green dark:group-hover:text-forest-light transition-colors line-clamp-2">
                      {title}
                    </h2>
                    <p className="text-xs text-kraft-600 dark:text-kraft-400 font-sans mt-1 line-clamp-2">
                      {desc}
                    </p>
                  </div>

                  {/* Foot stats */}
                  <div className="pt-3 mt-3 border-t border-kraft-200 dark:border-kraft-700/60 flex items-center justify-between text-xs font-mono text-kraft-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{idea.timeMinutes}m</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-cardboard-amber" />
                      <span>{idea.difficulty === 1 ? 'Easy' : idea.difficulty === 2 ? 'Medium' : 'Hard'}</span>
                    </span>
                    <span className="text-forest-green dark:text-forest-light font-bold">
                      -{Math.round(idea.co2SavedG)}g CO₂
                    </span>
                  </div>
                </TapeCard>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
