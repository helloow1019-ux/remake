import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Product, PublicSettings } from '@remake/shared';
import { Sparkles, Tag, Camera, MessageSquare, Recycle } from 'lucide-react';
import { getProducts, getPublicSettings } from '../lib/api';
import { TapeCard } from '../ui/TapeCard';
import { Stamp } from '../ui/Stamp';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { useToast } from '../ui/Toast';

export const Shop: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getPublicSettings()])
      .then(([prods, sets]) => {
        setProducts(prods);
        setSettings(sets);
      })
      .catch((err: any) => {
        showToast(err.message || 'Failed to load shop items', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  const getWhatsAppLink = (product: Product) => {
    const phone = settings?.whatsappNumber?.replace(/[^0-9]/g, '') || '923001234567';
    const text = encodeURIComponent(
      `Hi ReMake team! I would like to order: ${product.nameEn} (Rs. ${product.pricePkr}). Could you confirm availability?`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      {/* Shop Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b-2 border-dashed border-kraft-400 dark:border-kraft-700 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-green/10 text-forest-green dark:text-forest-light text-xs font-mono mb-3 border border-forest-green/30">
            <Sparkles className="w-3.5 h-3.5 text-marigold" />
            <span>{isUrdu ? 'ری میک اسٹوڈیو شاپ' : 'Handmade by NUCES Students'}</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-kraft-900 dark:text-kraft-100">
            {isUrdu ? 'ری میک دستکاری دکان' : 'The ReMake Workshop Store'}
          </h1>
          <p className="font-serif italic text-kraft-600 dark:text-kraft-400 mt-2 max-w-xl text-sm sm:text-base">
            {isUrdu
              ? 'کیمپس اور مقامی کچرے سے ہاتھ سے تیار کردہ اصلی مصنوعات۔ ہر خریداری ری میک اسٹوڈیو کے کام کو سپورٹ کرتی ہے۔'
              : 'Physical, finished upcycled products crafted from campus & household waste. 100% of proceeds fund workshop tools and community cleanups.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/shop/price-cards">
            <Button variant="secondary" size="sm" className="inline-flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'اسٹال پرائس کارڈز' : 'Printable Stall Tags'}</span>
            </Button>
          </Link>
          {settings?.instagramUrl && (
            <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="inline-flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 px-4 bg-kraft-100/50 dark:bg-kraft-800/40 border-2 border-dashed border-kraft-300 dark:border-kraft-700 rounded-2xl max-w-md mx-auto">
          <h3 className="font-display font-bold text-lg text-kraft-800 dark:text-kraft-200 mb-2">
            {isUrdu ? 'اس وقت دکان خالی ہے' : 'No Products Currently In Stock'}
          </h3>
          <p className="text-sm font-sans text-kraft-600 dark:text-kraft-400">
            {isUrdu
              ? 'ہماری ٹیم فی الحال نئی اشیاء تیار کر رہی ہے۔ جلد دوبارہ ملاحظہ فرمائیں!'
              : 'The workshop is busy crafting new batches. Check back soon or message us on WhatsApp!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const name = isUrdu && product.nameUr ? product.nameUr : product.nameEn;
            const desc = product.descriptionEn;

            return (
              <TapeCard key={product.id} className="flex flex-col justify-between">
                <div>
                  {/* Photo / Product Image */}
                  <div className="relative aspect-square rounded bg-kraft-100 dark:bg-kraft-900 overflow-hidden mb-4 border border-kraft-200 dark:border-kraft-700">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-mono text-xs text-kraft-400">
                        [ {name} ]
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <Stamp variant={product.active ? 'tested' : 'draft'} size="sm">
                        {product.active ? (isUrdu ? 'دستیاب' : 'IN STOCK') : (isUrdu ? 'تیار شدہ آرڈر' : 'CUSTOM ORDER')}
                      </Stamp>
                    </div>
                  </div>

                  {/* Title & Price */}
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h2 className="font-display font-bold text-base text-kraft-900 dark:text-kraft-100 line-clamp-1">
                      {name}
                    </h2>
                    <span className="font-mono font-black text-sm text-forest-green dark:text-forest-light whitespace-nowrap">
                      Rs. {product.pricePkr}
                    </span>
                  </div>

                  <p className="font-sans text-xs text-kraft-600 dark:text-kraft-400 line-clamp-2 mb-3">
                    {desc}
                  </p>

                  {/* Materials Diverted Tag */}
                  <div className="text-[11px] font-mono text-kraft-500 bg-kraft-100 dark:bg-kraft-900/60 p-2 rounded mb-3 border border-kraft-200 dark:border-kraft-800 flex items-center gap-1.5">
                    <Recycle className="w-3.5 h-3.5 text-leaf shrink-0" />
                    <span>{product.wasteGrams}g waste diverted ({product.wasteTypeSlugs})</span>
                  </div>
                </div>

                {/* WhatsApp Action Button */}
                <div className="pt-3 border-t border-dashed border-kraft-300 dark:border-kraft-700">
                  <a
                    href={getWhatsAppLink(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button variant="primary" className="w-full text-xs py-2 inline-flex items-center justify-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>{isUrdu ? 'واٹس ایپ پر آرڈر کریں' : 'Order via WhatsApp'}</span>
                    </Button>
                  </a>
                </div>
              </TapeCard>
            );
          })}
        </div>
      )}

      {/* Custom Orders Card */}
      <div className="mt-12 bg-cardboard-pattern bg-kraft-100 dark:bg-kraft-800/80 p-6 sm:p-8 rounded-2xl border-2 border-kraft-300 dark:border-kraft-700 flex flex-col md:flex-row items-center justify-between gap-6 shadow-kraft">
        <div>
          <h3 className="font-display font-black text-xl text-kraft-900 dark:text-kraft-100 mb-1">
            {isUrdu ? 'کیا آپ کے پاس مخصوص فضلہ ہے؟' : 'Need Custom Campus Merchandise or Bulk Upcycling?'}
          </h3>
          <p className="font-sans text-sm text-kraft-700 dark:text-kraft-300 max-w-xl">
            {isUrdu
              ? 'اگر آپ اپنے ڈیپارٹمنٹ یا ایونٹ کے لیے پرانے بینرز، کارڈ بورڈ یا بوتلوں سے بیجز، فولڈرز اور گفٹس تیار کروانا چاہتے ہیں تو ہم سے رابطہ کریں۔'
              : 'We take custom orders for university departments, societies, and eco-conscious businesses using your own collected waste.'}
          </p>
        </div>
        <a
          href={`https://wa.me/${settings?.whatsappNumber?.replace(/[^0-9]/g, '') || '923001234567'}?text=${encodeURIComponent(
            'Hi ReMake team! I want to inquire about a custom upcycling project / bulk order.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="secondary" className="whitespace-nowrap">
            {isUrdu ? 'ہم سے رابطہ کریں' : 'Inquire Custom Order →'}
          </Button>
        </a>
      </div>
    </div>
  );
};
