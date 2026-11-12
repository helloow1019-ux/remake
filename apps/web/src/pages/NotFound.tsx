import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

export const NotFound: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md p-8 bg-kraft-100 dark:bg-kraft-800 rounded-3xl border-2 border-dashed border-kraft-400 dark:border-kraft-600 shadow-kraft relative overflow-hidden">
        {/* Caution stripe tape */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stripes-caution w-36 h-6 border border-black/20 shadow transform -rotate-2" />

        <div className="font-mono text-6xl font-black text-kraft-400 dark:text-kraft-600 mb-2 mt-2">
          404
        </div>
        <h1 className="font-display font-black text-2xl text-kraft-900 dark:text-kraft-100 mb-2">
          {isUrdu ? 'ورکشاپ میں راستہ گم ہو گیا!' : 'Lost in the Workshop'}
        </h1>
        <p className="font-sans text-sm text-kraft-600 dark:text-kraft-400 mb-6">
          {isUrdu
            ? 'معاف کیجیے، یہ بلیو پرنٹ یا صفحہ ری میک کے ورک بینچ پر موجود نہیں ہے۔'
            : 'The blueprint or scrap item you were looking for seems to have been recycled elsewhere.'}
        </p>
        <Link to="/">
          <Button variant="primary">
            {isUrdu ? 'مرکزی ورک بینچ پر واپس جائیں' : 'Back to Workbench'}
          </Button>
        </Link>
      </div>
    </div>
  );
};

