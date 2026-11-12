import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { ArrowRight, Sparkles, Camera, Hammer, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface OnboardingProps {
  onComplete?: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({
  onComplete = () => {
    window.location.href = '/explore';
  },
}) => {
  const [slide, setSlide] = useState(0);
  const { t } = useTranslation();

  const slides = [
    {
      titleEn: 'What have you got?',
      titleUr: 'آپ کے پاس کیا کچرا ہے؟',
      descEn: 'Snap a photo of discarded household items. ReMake Smart Vision instantly detects plastic bottles, caps, cardboard, and cloth.',
      descUr: 'اپنے کچرے کی تصویر کھینچیں۔ ری میک اسکینر فوراً پہچان لے گا کہ کون سا مواد دوبارہ استعمال ہو سکتا ہے۔',
      icon: Camera,
      color: 'bg-[#D2EBF7]',
      border: 'border-[#4F9BC9]',
    },
    {
      titleEn: 'Maker-tested craft recipes',
      titleUr: 'آزمودہ اور محفوظ طریقے',
      descEn: 'Step-by-step interactive Make mode with timers, materials checklists, time, cost, and potential resale value.',
      descUr: 'وقت، خرچ اور فروخت کی قیمت کے ساتھ آسان مرحلہ وار رہنمائی، تاکہ آپ خود یا بچوں کے ساتھ بنا سکیں۔',
      icon: Hammer,
      color: 'bg-[#FCE3AA]',
      border: 'border-[#F4B63F]',
    },
    {
      titleEn: 'Watch your impact grow',
      titleUr: 'اپنے ماحولیاتی اثر کو بڑھتے دیکھیں',
      descEn: 'Every make saves waste and carbon. Earn milestone badges, keep streaks, and show your work on the community wall.',
      descUr: 'ہر پروجیکٹ کچرا کم کرتا ہے۔ بیجز کمائیں، گرین اسٹریک برقرار رکھیں اور کمیونٹی کے ساتھ شیئر کریں۔',
      icon: Award,
      color: 'bg-[#D6EFD8]',
      border: 'border-[#2E7D4F]',
    },
  ];

  const currentSlide = slides[slide]!;
  const Icon = currentSlide.icon;

  const next = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      localStorage.setItem('remake_onboarded', 'true');
      onComplete();
    }
  };

  const skip = () => {
    localStorage.setItem('remake_onboarded', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-paper flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-3xl border-3 border-ink shadow-[0_8px_0_#1B2A22] p-8 relative flex flex-col justify-between min-h-[520px]">
        {/* Skip button */}
        <div className="flex justify-between items-center">
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === slide ? 'w-8 bg-leaf border border-ink' : 'w-2.5 bg-ink/20'
                }`}
              />
            ))}
          </div>
          <button
            onClick={skip}
            className="text-xs font-display font-bold text-ink/60 hover:text-ink cursor-pointer px-2 py-1"
          >
            Skip
          </button>
        </div>

        {/* Animated Slide Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="my-auto flex flex-col items-center text-center py-6"
          >
            <div
              className={`w-28 h-28 rounded-3xl ${currentSlide.color} ${currentSlide.border} border-3 shadow-sticker flex items-center justify-center mb-6 -rotate-2`}
            >
              <Icon className="w-14 h-14 text-ink stroke-[2.2]" />
            </div>

            <h2 className="text-2xl font-display font-black text-ink mb-3 leading-snug">
              {currentSlide.titleEn}
            </h2>
            <p className="text-sm text-ink/80 leading-relaxed max-w-xs">
              {currentSlide.descEn}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Action */}
        <div className="mt-4">
          <Button variant="primary" size="lg" fullWidth onClick={next}>
            <span>{slide === slides.length - 1 ? "Let's Make!" : 'Next Step'}</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
