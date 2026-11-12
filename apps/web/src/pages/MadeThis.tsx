import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Smile,
  Meh,
  Frown,
  Star,
  Camera,
  Sparkles,
  Flame,
  Award,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { getIdeaBySlug, submitMake } from '../lib/api';
import { Button } from '../ui/Button';
import { triggerCraftConfetti } from '../ui/Confetti';
import { useToast } from '../ui/Toast';

export const MadeThis: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [outcome, setOutcome] = useState<'WORKED' | 'PARTLY' | 'FAILED'>('WORKED');
  const [timeTakenMin, setTimeTakenMin] = useState<number>(20);
  const [difficultyFelt, setDifficultyFelt] = useState<number>(1);
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [celebrationData, setCelebrationData] = useState<any>(null);

  const { data: idea, isLoading } = useQuery({
    queryKey: ['idea', slug],
    queryFn: () => getIdeaBySlug(slug!),
    enabled: !!slug,
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea || isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('outcome', outcome);
    formData.append('timeTakenMin', String(timeTakenMin));
    formData.append('difficultyFelt', String(difficultyFelt));
    formData.append('rating', String(rating));
    if (notes.trim()) formData.append('notes', notes.trim());
    if (photoFile) formData.append('photo', photoFile);

    try {
      const res = await submitMake(idea.id, formData);
      setCelebrationData(res);
      triggerCraftConfetti();
    } catch (err: any) {
      showToast(err.message || 'Could not record project', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !idea) {
    return <div className="text-center py-20 font-bold text-ink">Loading recipe...</div>;
  }

  const isUrdu = i18n.language === 'ur';

  // Celebration screen view
  if (celebrationData) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 text-center animate-in zoom-in-95 duration-300">
        <div className="bg-card rounded-3xl border-3 border-ink shadow-[0_8px_0_#1B2A22] p-8 space-y-6">
          <div className="w-20 h-20 rounded-full bg-leaf text-white border-3 border-ink flex items-center justify-center mx-auto shadow-lg -rotate-3">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div>
            <h2 className="text-3xl font-display font-black text-ink">
              {t('feedback.celebrationTitle', 'Impact Added to Your Ledger!')}
            </h2>
            <p className="text-xs text-ink/70 mt-1">
              Your make has been officially recorded in the ReMake course sustainability database.
            </p>
          </div>

          {/* Impact Added Ledger Stub */}
          <div className="p-4 rounded-2xl bg-paper border-2 border-dashed border-ink/30 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] font-bold uppercase text-ink/60">Waste Saved</p>
              <p className="text-lg font-black text-leaf">+{celebrationData.impactAdded.wasteG}g</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-ink/60">CO2 Avoided</p>
              <p className="text-lg font-black text-sky">+{celebrationData.impactAdded.co2G}g</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-ink/60">Potential Value</p>
              <p className="text-lg font-black text-marigold">Rs {celebrationData.impactAdded.moneyPkr}</p>
            </div>
          </div>

          {/* Streak Banner */}
          {celebrationData.streak && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-marigold/20 text-[#8F5E00] dark:text-marigold border-2 border-marigold text-sm font-display font-bold">
              <Flame className="w-5 h-5 text-chili" />
              <span>{t('feedback.streakBanner', { count: celebrationData.streak.current })}</span>
            </div>
          )}

          {/* Newly Awarded Badges */}
          {celebrationData.newBadges && celebrationData.newBadges.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-display font-bold text-ink uppercase tracking-wider">
                {t('feedback.badgeUnlocked', 'New Badge Unlocked:')}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {celebrationData.newBadges.map((badge: any) => (
                  <span
                    key={badge.id}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-leaf text-white border-2 border-ink text-xs font-display font-bold shadow-sm"
                  >
                    <Award className="w-4 h-4" />
                    <span>{isUrdu ? badge.nameUr : badge.nameEn}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex flex-col gap-2.5">
            <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/impact')}>
              <span>{t('feedback.viewImpact', 'View Impact Dashboard')}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
            <Button variant="outline" size="md" fullWidth onClick={() => navigate('/')}>
              {t('feedback.backHome', 'Back to Home')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-6 pb-24">
      <div className="bg-card rounded-3xl border-3 border-ink shadow-[0_8px_0_#1B2A22] p-6 md:p-8 space-y-6">
        <div>
          <span className="text-xs font-display font-bold uppercase tracking-wider text-leaf">
            Project Feedback
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-black text-ink mt-0.5">
            {t('feedback.title', 'I Made This!')}
          </h1>
          <p className="text-xs text-ink/75 mt-1 font-body">
            For: <span className="font-bold">{isUrdu && idea.titleUr ? idea.titleUr : idea.titleEn}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Outcome Faces */}
          <div>
            <label className="block text-xs font-display font-bold text-ink mb-2">
              {t('feedback.howDidItGo', 'How did your project turn out?')}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { key: 'WORKED', label: t('feedback.worked', 'Worked Great!'), icon: Smile, color: 'text-leaf' },
                { key: 'PARTLY', label: t('feedback.partly', 'Partly worked'), icon: Meh, color: 'text-marigold' },
                { key: 'FAILED', label: t('feedback.failed', "Didn't work out"), icon: Frown, color: 'text-chili' },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = outcome === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setOutcome(opt.key as any)}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-ink bg-paper shadow-[0_4px_0_#1B2A22]'
                        : 'border-ink/20 hover:border-ink/50 bg-card'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${opt.color}`} />
                    <span className="text-[11px] font-display font-bold text-ink leading-tight text-center">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Time, Difficulty, Star Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-display font-bold text-ink mb-1.5">
                {t('feedback.timeTaken', 'How long did it take? (mins)')}
              </label>
              <input
                type="number"
                min="1"
                max="480"
                value={timeTakenMin}
                onChange={(e) => setTimeTakenMin(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-paper border-2 border-ink text-sm font-bold text-ink"
              />
            </div>

            <div>
              <label className="block text-xs font-display font-bold text-ink mb-1.5">
                {t('feedback.difficultyFelt', 'Difficulty felt')}
              </label>
              <select
                value={difficultyFelt}
                onChange={(e) => setDifficultyFelt(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-paper border-2 border-ink text-sm font-bold text-ink"
              >
                <option value="1">Level 1 (Easy)</option>
                <option value="2">Level 2 (Medium)</option>
                <option value="3">Level 3 (Hard)</option>
              </select>
            </div>
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-xs font-display font-bold text-ink mb-1.5">
              {t('feedback.rating', 'Your overall rating')}
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'fill-marigold text-marigold' : 'text-ink/30'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-display font-bold text-ink mb-1.5">
              Maker's Notes & Observations
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('feedback.notesPlaceholder', 'Any tips or modifications for fellow makers?')}
              className="w-full p-3 rounded-xl bg-paper border-2 border-ink text-xs text-ink placeholder:text-ink/40 font-body focus:outline-none"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-display font-bold text-ink mb-1.5">
              {t('feedback.addPhoto', 'Add a photo of what you made (optional)')}
            </label>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Make preview"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-ink"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-paper border-2 border-dashed border-ink/40 flex items-center justify-center text-ink/40">
                  <Camera className="w-8 h-8" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-2 file:border-ink file:bg-paper file:text-ink file:font-bold hover:file:bg-card cursor-pointer"
                />
                <p className="text-[10px] text-ink/60 mt-1">
                  {t('feedback.photoNote', 'Appears on the community wall after review.')}
                </p>
              </div>
            </div>
          </div>

          <Button variant="primary" size="lg" fullWidth type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Recording Your Make...' : t('feedback.submit', 'Submit & Claim Impact')}
          </Button>
        </form>
      </div>
    </div>
  );
};
