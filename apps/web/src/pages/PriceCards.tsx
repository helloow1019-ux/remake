import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Printer, Scissors, Recycle } from 'lucide-react';
import { Product } from '@remake/shared';
import { getProducts } from '../lib/api';
import { Button } from '../ui/Button';

export const PriceCards: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((data) => setProducts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Non-print toolbar */}
      <div className="print:hidden flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-kraft-100 dark:bg-kraft-800 p-4 rounded-xl border border-kraft-300 dark:border-kraft-700">
        <div>
          <h1 className="font-display font-bold text-xl text-kraft-900 dark:text-kraft-100">
            {isUrdu ? 'اسٹال پرائس ٹیگز (پرنٹ کے لیے تیار)' : 'Exhibition Table Price Cards'}
          </h1>
          <p className="text-xs font-mono text-kraft-600 dark:text-kraft-400">
            {isUrdu
              ? 'نمائش کے اسٹال پر مصنوعات کے سامنے رکھنے کے لیے پرنٹ کریں۔'
              : 'Print on A4 kraft cardstock or standard paper. Cut along dashed scissors lines.'}
          </p>
        </div>
        <Button variant="primary" onClick={() => window.print()} className="inline-flex items-center gap-2">
          <Printer className="w-4 h-4" />
          <span>{isUrdu ? 'پرنٹ کریں (A4)' : 'Print All Cards'}</span>
        </Button>
      </div>

      {/* Cards Grid formatted for A4 print */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 print:m-0">
        {products.map((product) => (
          <div
            key={product.id}
            className="relative p-6 bg-amber-50/80 text-kraft-900 border-2 border-dashed border-kraft-400 rounded-xl flex flex-col justify-between min-h-[220px] print:break-inside-avoid print:bg-white print:border-black shadow-sm"
          >
            {/* Cut line decoration */}
            <div className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-mono text-kraft-500 uppercase tracking-wider flex items-center gap-1.5 print:text-black">
              <Scissors className="w-3 h-3" />
              <span>CUT LINE</span>
            </div>

            <div>
              <div className="flex items-start justify-between gap-4 border-b border-dashed border-kraft-300 pb-3 mb-3">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-forest-green font-bold block mb-0.5">
                    REMAKE STUDIO • NUCES
                  </span>
                  <h2 className="font-display font-black text-xl text-kraft-900 leading-tight">
                    {product.nameEn}
                  </h2>
                  {product.nameUr && (
                    <div className="font-urdu text-base text-kraft-700 font-bold mt-0.5" dir="rtl">
                      {product.nameUr}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span className="font-mono text-[10px] uppercase text-kraft-500 block">PRICE</span>
                  <div className="font-mono font-black text-2xl text-forest-green">
                    Rs. {product.pricePkr}
                  </div>
                </div>
              </div>

              <p className="font-sans text-xs text-kraft-700 line-clamp-2 mb-3">
                {product.descriptionEn}
              </p>

              <div className="bg-kraft-200/50 p-2 rounded text-[11px] font-mono text-kraft-800 flex items-center gap-1.5 print:bg-gray-100 print:text-black">
                <Recycle className="w-3.5 h-3.5 text-forest-green shrink-0" />
                <span>{product.wasteGrams}g upcycled material ({product.wasteTypeSlugs})</span>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-dashed border-kraft-300 flex items-center justify-between text-[10px] font-mono text-kraft-500 print:text-black">
              <span>100% UPCYCLED & HANDMADE</span>
              <span>PROCEEDS FUND WORKSHOP TOOLS</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
