import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, Smartphone, TreePine, AlertTriangle } from 'lucide-react';
import { getImpactMethod } from '../lib/api';
import { PaperSheet } from '../ui/PaperSheet';
import { Skeleton } from '../ui/Skeleton';

export const Method: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getImpactMethod()
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      {/* Title */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="font-mono text-xs uppercase tracking-widest text-forest-green dark:text-forest-light bg-forest-green/10 px-3 py-1 rounded-full border border-forest-green/30">
          {isUrdu ? 'کھلی سائنس اور شفافیت' : 'Open Science & Methodology'}
        </span>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-kraft-900 dark:text-kraft-100 mt-3 mb-2">
          {isUrdu ? 'کاربن بچت کا حساب کتاب' : 'How We Calculate Impact'}
        </h1>
        <p className="font-serif italic text-kraft-600 dark:text-kraft-400 text-sm sm:text-base">
          {isUrdu
            ? 'کوئی سبز دعوے نہیں، صرف سائنسی لٹریچر اور قدامت پسندانہ فارمولے۔'
            : 'Zero greenwashing. Transparent emission factors, conservative displacement, and reproducible math.'}
        </p>
      </div>

      {/* The Core Formula */}
      <PaperSheet pinColor="brass" className="mb-8">
        <h2 className="font-display font-bold text-xl text-kraft-900 dark:text-kraft-100 mb-3 border-b border-dashed border-kraft-300 dark:border-kraft-700 pb-2">
          {isUrdu ? 'بنیادی مساوات (Core Formula)' : '1. The Core Carbon Formula'}
        </h2>

        <div className="p-4 bg-kraft-100 dark:bg-kraft-900/60 rounded-xl font-mono text-xs sm:text-sm text-forest-green dark:text-forest-light border border-kraft-300 dark:border-kraft-700 my-4 overflow-x-auto">
          CO₂e Saved (kg) = Waste Weight (kg) × [ Virgin Factor − Recycled Factor ] × 0.5
        </div>

        <div className="space-y-3 font-sans text-sm text-kraft-700 dark:text-kraft-300 leading-relaxed">
          <p>
            <strong>{isUrdu ? 'ڈسپلیسمنٹ فیکٹر (0.5)' : 'Conservative Displacement (0.5)'}: </strong>
            {isUrdu
              ? 'ہم یہ فرض نہیں کرتے کہ ہاتھ سے بنائی گئی چیز 100% نئی تجارتی پیداوار کی جگہ لے لیتی ہے۔ ری باؤنڈ ایفیکٹ اور متغیر زندگی کو مدنظر رکھتے ہوئے ہم ایک قدامت پسند 50% ڈسپلیسمنٹ ماڈل استعمال کرتے ہیں۔'
              : 'Most calculators assume 100% substitution (every upcycled item replaces 1 new commercial product). We conservatively assume only 50% substitution (factor of 0.5) to account for rebound effects and varying handmade lifespans.'}
          </p>
          <p>
            <strong>{isUrdu ? 'سرور سائیڈ ویلیڈیشن' : 'Server-Side Strictness'}: </strong>
            {isUrdu
              ? 'ری میک ویژن صرف کچرے کے مواد کی شناخت کرتا ہے؛ اے آئی کو کبھی بھی ماحولیاتی اعدادوشمار خود گھڑنے کی اجازت نہیں دی جاتی۔ تمام امپیکٹ سرور کے ڈیٹا بیس میں موجود مستند فیکٹرز سے ریاضیاتی طور پر نکلتے ہیں۔'
              : 'ReMake Vision strictly identifies the waste materials; generative models are prohibited from inventing emission numbers. All math is computed deterministically on our server against vetted database emission factors.'}
          </p>
        </div>
      </PaperSheet>

      {/* Emission Factors Table */}
      <div className="mb-10">
        <h2 className="font-display font-bold text-xl text-kraft-900 dark:text-kraft-100 mb-4 flex items-center justify-between">
          <span>{isUrdu ? '2. ڈیٹا بیس فیکٹرز کی جدول' : '2. Database Emission Factors'}</span>
          <span className="font-mono text-xs text-kraft-500 font-normal">
            {isUrdu ? 'لائیو ڈیٹا بیس سے' : 'Live from DB'}
          </span>
        </h2>

        {loading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : (
          <div className="overflow-x-auto border-2 border-kraft-300 dark:border-kraft-700 rounded-xl bg-kraft-50 dark:bg-kraft-800/90 shadow-kraft">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-kraft-200 dark:bg-kraft-700 text-kraft-800 dark:text-kraft-200 border-b border-kraft-300 dark:border-kraft-600">
                <tr>
                  <th className="p-3">{isUrdu ? 'فضلے کی قسم' : 'Waste Type'}</th>
                  <th className="p-3">{isUrdu ? 'زمرہ' : 'Category'}</th>
                  <th className="p-3">{isUrdu ? 'وزن/ٹکڑا' : 'Avg Weight'}</th>
                  <th className="p-3">{isUrdu ? 'کاربن فیکٹر' : 'Emission Factor'}</th>
                  <th className="p-3">{isUrdu ? 'ماخذ / حوالہ' : 'Literature Source'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kraft-200 dark:divide-kraft-700">
                {data?.wasteTypes?.map((w: any) => (
                  <tr key={w.id} className="hover:bg-kraft-100 dark:hover:bg-kraft-750">
                    <td className="p-3 font-bold text-kraft-900 dark:text-kraft-100">
                      {isUrdu && w.nameUr ? w.nameUr : w.nameEn}
                    </td>
                    <td className="p-3 text-kraft-600 dark:text-kraft-400">{w.category}</td>
                    <td className="p-3">{w.defaultWeightGrams}g</td>
                    <td className="p-3 text-forest-green dark:text-forest-light font-bold">
                      {w.co2eFactorKgPerKg} kg CO₂/kg
                    </td>
                    <td className="p-3 text-kraft-500 text-[11px] truncate max-w-xs" title={w.source}>
                      {w.source || 'EPA WARM v15 / Ecoinvent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Real-world Equivalents */}
      <PaperSheet pinColor="silver" className="mb-8">
        <h2 className="font-display font-bold text-xl text-kraft-900 dark:text-kraft-100 mb-3 border-b border-dashed border-kraft-300 dark:border-kraft-700 pb-2">
          {isUrdu ? '3. عملی موازنے (Equivalents)' : '3. Tangible Equivalencies'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mt-4">
          <div className="p-3 bg-kraft-100 dark:bg-kraft-900/50 rounded-xl border border-kraft-200 dark:border-kraft-700">
            <Car className="w-6 h-6 text-leaf mx-auto mb-1" />
            <div className="font-bold text-sm text-kraft-900 dark:text-kraft-100">Car Driving</div>
            <div className="text-xs font-mono text-kraft-500 mt-1">1 km driven = ~120g CO₂e</div>
          </div>
          <div className="p-3 bg-kraft-100 dark:bg-kraft-900/50 rounded-xl border border-kraft-200 dark:border-kraft-700">
            <Smartphone className="w-6 h-6 text-sky mx-auto mb-1" />
            <div className="font-bold text-sm text-kraft-900 dark:text-kraft-100">Phone Charges</div>
            <div className="text-xs font-mono text-kraft-500 mt-1">1 full charge = ~8.2g CO₂e</div>
          </div>
          <div className="p-3 bg-kraft-100 dark:bg-kraft-900/50 rounded-xl border border-kraft-200 dark:border-kraft-700">
            <TreePine className="w-6 h-6 text-forest-green mx-auto mb-1" />
            <div className="font-bold text-sm text-kraft-900 dark:text-kraft-100">Tree Absorption</div>
            <div className="text-xs font-mono text-kraft-500 mt-1">1 mature tree-day = ~60g CO₂e</div>
          </div>
        </div>
      </PaperSheet>

      {/* Honesty Disclaimer */}
      <div className="p-4 bg-cardboard-amber/15 border-2 border-dashed border-cardboard-amber/50 rounded-xl text-xs font-mono text-kraft-800 dark:text-kraft-200 leading-relaxed flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-cardboard-amber shrink-0 mt-0.5" />
        <div>
          <strong>HONESTY & TRANSPARENCY NOTICE:</strong> The baseline values shown above are illustrative defaults derived from EPA WARM v15 and peer-reviewed life-cycle analyses. In an upcoming phase of our NUCES course project, local Karachi waste compositions will be physically measured with digital scales in the laboratory to calibrate localized emission factors.
        </div>
      </div>
    </div>
  );
};

