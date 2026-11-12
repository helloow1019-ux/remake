import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Scale } from 'lucide-react';
import { PaperSheet } from '../ui/PaperSheet';
import { TapeCard } from '../ui/TapeCard';
import { Button } from '../ui/Button';

export const About: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';

  const teamMembers = [
    { name: 'Hamza Shah', role: isUrdu ? 'پروجیکٹ لیڈ اور سسٹمز' : 'Project Lead & Architecture' },
    { name: 'Muhammad Hashim', role: isUrdu ? 'پروڈکٹ اور مٹیریل ڈیزائن' : 'Product & Materials Design' },
    { name: 'Abdullah Nauman', role: isUrdu ? 'اے آئی اور ویژن انٹیگریشن' : 'AI & Vision Integration' },
    { name: 'Mehmood', role: isUrdu ? 'امپیکٹ ریسرچ اور ماحولیاتی ماڈلنگ' : 'Impact Research & Eco-Modeling' },
    { name: 'Mohid', role: isUrdu ? 'ورکشاپ فیبریکیشن اور ٹیسٹنگ' : 'Workshop Fabrication & Testing' },
    { name: 'Hamza Mansoor', role: isUrdu ? 'کمیونٹی اور آؤٹ ریچ' : 'Community & Maker Outreach' },
    { name: 'Muhammad Hamza Rizwan', role: isUrdu ? 'فرنٹ اینڈ اور یوزر ایکسپیرینس' : 'Frontend & UI Craftsmanship' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="font-mono text-xs uppercase tracking-widest text-cardboard-amber bg-cardboard-amber/10 dark:bg-cardboard-amber/20 px-3 py-1 rounded-full border border-cardboard-amber/30">
          {isUrdu ? 'ری میک کے بارے میں' : 'About ReMake'}
        </span>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-kraft-900 dark:text-kraft-100 mt-3 mb-4">
          {isUrdu ? 'کچرے کو تخلیق میں بدلنا' : 'Turning Waste into Value'}
        </h1>
        <p className="font-serif italic text-kraft-700 dark:text-kraft-300 text-base sm:text-lg leading-relaxed">
          {isUrdu
            ? 'نیشنل یونیورسٹی آف کمپیوٹر اینڈ ایمرجنگ سائنسز (NUCES) میں ماحولیاتی سائنس اور کاروبار کے لیے پائیداری کے کورس کا پروجیکٹ۔'
            : 'A sustainability initiative born at the National University of Computer & Emerging Sciences (NUCES) for the course "Environmental Science and Sustainability for Business".'}
        </p>
      </div>

      {/* Manifesto Paper */}
      <PaperSheet pinColor="brass" className="mb-12">
        <h2 className="font-display font-bold text-2xl text-kraft-900 dark:text-kraft-100 mb-4 border-b border-dashed border-kraft-300 dark:border-kraft-700 pb-2">
          {isUrdu ? 'ہمارا منشور: ایماندارانہ ماحولیاتی اقدام' : 'The ReMake Manifesto'}
        </h2>
        <div className="space-y-4 font-sans text-sm sm:text-base text-kraft-700 dark:text-kraft-300 leading-relaxed">
          <p>
            {isUrdu
              ? 'پاکستان کے شہروں اور یونیورسٹی کیمپسز میں ہر روز ٹنوں کے حساب سے پلاسٹک کی بوتلیں، ڈھکن، گتے کے ڈبے اور کپڑے کا فضلہ کچرے دانوں کی زینت بنتے ہیں۔ ری میک کا مقصد اس فضلے کو بیکار سمجھنے کے بجائے قیمتی وسائل میں تبدیل کرنا ہے۔'
              : 'Every single day, thousands of plastic bottles, HDPE bottle caps, cardboard delivery boxes, and fabric scraps are thrown into incinerators and open dumps across Pakistan. ReMake proves that trash is just raw material without an idea.'}
          </p>
          <p>
            {isUrdu
              ? 'ہم گرین واشنگ (سبز دھوکے) کے خلاف ہیں۔ ہم فرضی دعوے نہیں کرتے: ہر آئیڈیا پر واضح طور پر درج ہوتا ہے کہ آیا یہ ہماری ورکشاپ میں آزمایا گیا ہے یا یہ اے آئی کا ابتدائی خاکہ ہے۔ تمام ماحولیاتی اعدادوشمار اوپن سائنس کے مستند کاربن فیکٹرز اور 50% ڈسپلیسمنٹ ماڈل پر مبنی ہیں۔'
              : 'We reject greenwashing. We do not invent numbers or claim that making a craft automatically saves the world. Every single craft is labeled honestly — Tested, Untested, or AI Draft — and our carbon savings are calculated strictly using published emission factors with a conservative 50% virgin-displacement model.'}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-kraft-200 dark:border-kraft-700 flex flex-wrap items-center justify-between gap-4">
          <span className="font-mono text-xs text-kraft-500">
            {isUrdu ? 'مکمل فارمولہ اور ماخذ دیکھیں:' : 'Inspect our mathematical models:'}
          </span>
          <Link to="/method">
            <Button variant="secondary" size="sm" className="inline-flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'امپیکٹ میتھڈولوجی' : 'View Impact Methodology →'}</span>
            </Button>
          </Link>
        </div>
      </PaperSheet>

      {/* Team Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-display font-black text-2xl text-kraft-900 dark:text-kraft-100">
            {isUrdu ? 'ہماری ٹیم' : 'The Student Maker Team'}
          </h2>
          <div className="flex-1 h-px bg-kraft-300 dark:bg-kraft-700" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {teamMembers.map((member, idx) => (
            <TapeCard key={member.name} tapePosition={idx % 2 === 0 ? 'top-left' : 'top-right'} tapeColor="yellow" className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-kraft-200 dark:bg-kraft-700 flex items-center justify-center font-display font-bold text-kraft-700 dark:text-kraft-300">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-kraft-900 dark:text-kraft-100">
                    {member.name}
                  </h3>
                  <p className="font-mono text-xs text-kraft-500">
                    {member.role}
                  </p>
                </div>
              </div>
            </TapeCard>
          ))}
        </div>
      </div>

      {/* Institution Info */}
      <div className="bg-kraft-100 dark:bg-kraft-800/60 p-6 rounded-2xl border border-kraft-300 dark:border-kraft-700 text-center font-mono text-xs text-kraft-600 dark:text-kraft-400">
        <div>National University of Computer & Emerging Sciences (NUCES)</div>
        <div className="mt-1">Course: Environmental Science and Sustainability for Business • Spring 2025</div>
      </div>
    </div>
  );
};

