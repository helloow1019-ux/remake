import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  X,
  Sparkles,
  Lightbulb,
} from 'lucide-react';
import { getIdeaBySlug } from '../lib/api';
import { Button } from '../ui/Button';
import { ProgressStitch } from '../ui/ProgressStitch';
import { triggerCraftConfetti } from '../ui/Confetti';

export const MakeMode: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [wakeLock, setWakeLock] = useState<any>(null);

  const { data: idea, isLoading } = useQuery({
    queryKey: ['idea', slug],
    queryFn: () => getIdeaBySlug(slug!),
    enabled: !!slug,
  });

  // Wake lock to keep screen on while making
  useEffect(() => {
    if ('wakeLock' in navigator) {
      navigator.wakeLock
        .request('screen')
        .then((lock) => setWakeLock(lock))
        .catch(() => {});
    }
    return () => {
      if (wakeLock) wakeLock.release();
    };
  }, []);

  const steps = idea?.steps || [];
  const currentStep = steps[currentStepIdx];
  const isFinished = currentStepIdx >= steps.length;

  // Sync step timer
  useEffect(() => {
    if (currentStep?.timerSeconds) {
      setTimerSecondsLeft(currentStep.timerSeconds);
      setIsTimerRunning(false);
    } else {
      setTimerSecondsLeft(null);
      setIsTimerRunning(false);
    }
  }, [currentStepIdx, currentStep]);

  // Timer interval countdown
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft !== null && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => (prev !== null ? prev - 1 : 0));
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Haptic feedback vibration
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft]);

  // Keyboard navigation (Left / Right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentStepIdx < steps.length) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && currentStepIdx > 0) {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIdx, steps.length]);

  const handleNext = () => {
    if (currentStepIdx < steps.length) {
      setCurrentStepIdx(currentStepIdx + 1);
      if (currentStepIdx + 1 >= steps.length) {
        triggerCraftConfetti();
      }
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  if (isLoading || !idea) {
    return (
      <div className="fixed inset-0 bg-paper flex items-center justify-center p-4">
        <p className="font-display font-bold text-ink">Loading Make Mode...</p>
      </div>
    );
  }

  const isUrdu = i18n.language === 'ur';

  return (
    <div className="fixed inset-0 z-50 bg-paper flex flex-col justify-between p-4 md:p-8 select-none">
      {/* Top Header bar */}
      <div className="max-w-2xl w-full mx-auto flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(`/ideas/${idea.slug}`)}
          className="p-2 rounded-xl bg-card border-2 border-ink text-ink hover:bg-paper active:scale-95 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 max-w-md">
          <ProgressStitch current={Math.min(currentStepIdx + 1, steps.length)} total={steps.length} />
        </div>

        <span className="text-xs font-display font-bold text-ink bg-card px-2.5 py-1 rounded-lg border-2 border-ink">
          {idea.timeMinutes} mins
        </span>
      </div>

      {/* Main Step Index Card Area */}
      <div className="max-w-2xl w-full mx-auto my-auto flex items-center justify-center py-4">
        <AnimatePresence mode="wait">
          {!isFinished && currentStep ? (
            <motion.div
              key={currentStep.position}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full bg-card rounded-3xl border-3 border-ink shadow-[0_8px_0_#1B2A22] p-6 md:p-8 relative"
            >
              {/* Step number badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-2xl bg-marigold border-2 border-ink font-display font-black text-lg text-ink flex items-center justify-center -rotate-3">
                  {currentStep.position}
                </span>

                {currentStep.timerSeconds && (
                  <div className="flex items-center gap-2 bg-paper px-3 py-1.5 rounded-xl border-2 border-ink text-xs font-display font-bold">
                    <span>⏱ {timerSecondsLeft}s</span>
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="p-1 rounded-md hover:bg-ink/10"
                    >
                      {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerSecondsLeft(currentStep.timerSeconds ?? null);
                      }}
                      className="p-1 rounded-md hover:bg-ink/10"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Step Media */}
              {currentStep.imageUrl && (
                <div className="w-full h-44 md:h-56 rounded-2xl overflow-hidden border-2 border-ink mb-5 bg-paper-muted">
                  <img
                    src={currentStep.imageUrl}
                    alt={`Step ${currentStep.position}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Step Instruction text */}
              <p className="text-lg md:text-xl font-body font-bold text-ink leading-relaxed">
                {isUrdu && currentStep.textUr ? currentStep.textUr : currentStep.textEn}
              </p>

              {/* Hand-written style Maker's Tip */}
              {currentStep.tipEn && (
                <div className="mt-5 p-3.5 rounded-xl bg-leaf/10 border-2 border-dashed border-leaf text-xs font-hand text-leaf leading-relaxed flex items-start gap-1.5">
                  <Lightbulb className="w-4 h-4 shrink-0 text-leaf mt-0.5" />
                  <span>{t('makeMode.tip', "Maker's Tip")}: {currentStep.tipEn}</span>
                </div>
              )}
            </motion.div>
          ) : (
            /* Finished Card */
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-card rounded-3xl border-3 border-ink shadow-[0_8px_0_#1B2A22] p-8 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-leaf text-white border-3 border-ink flex items-center justify-center mx-auto mb-5 shadow-lg">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <h2 className="text-3xl font-display font-black text-ink mb-2">
                {t('makeMode.congrats', 'Hooray! You made it!')}
              </h2>
              <p className="text-sm text-ink/75 max-w-sm mx-auto mb-6">
                {t(
                  'makeMode.congratsSub',
                  'Share how it went and claim your impact badges.'
                )}
              </p>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate(`/ideas/${idea.slug}/made-this`)}
              >
                <span>{t('makeMode.logMakeButton', 'Log my Make & see impact')}</span>
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons footer */}
      {!isFinished && (
        <div className="max-w-2xl w-full mx-auto flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="md"
            onClick={handlePrev}
            disabled={currentStepIdx === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <span>{currentStepIdx === steps.length - 1 ? 'Finish!' : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
