import React, { useEffect, useState } from 'react';
import { getProducts, uploadAdminImage } from '../../lib/api';
import { Product } from '@remake/shared';
import { AdminNav } from './AdminNav';
import { Stamp } from '../../ui/Stamp';
import { Button } from '../../ui/Button';
import { Skeleton } from '../../ui/Skeleton';
import { useToast } from '../../ui/Toast';

export const AdminProducts: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      setProducts(res);
    } catch (err: any) {
      showToast(err.message || 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      <AdminNav />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-kraft-900 dark:text-kraft-100">
            Finished Physical Products
          </h1>
          <p className="font-serif italic text-kraft-600 dark:text-kraft-400 text-sm mt-1">
            Student-crafted goods showcased in the workshop store and at live exhibition booths.
          </p>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-kraft-100 dark:bg-kraft-800 rounded-xl">
          <p className="text-kraft-600 dark:text-kraft-400">No products configured yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="p-4 bg-kraft-50 dark:bg-kraft-800 rounded-2xl border-2 border-kraft-300 dark:border-kraft-700 shadow-kraft flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square rounded-lg bg-kraft-100 dark:bg-kraft-900 overflow-hidden mb-3 border border-kraft-200 dark:border-kraft-700">
                  {p.image ? (
                    <img src={p.image} alt={p.nameEn} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-xs text-kraft-400">
                      [ No Image ]
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Stamp variant={p.active ? 'tested' : 'draft'} size="sm">
                      {p.active ? 'IN STOCK' : 'OUT OF STOCK'}
                    </Stamp>
                  </div>
                </div>

                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h3 className="font-display font-bold text-base text-kraft-900 dark:text-kraft-100">
                    {p.nameEn}
                  </h3>
                  <span className="font-mono font-bold text-forest-green">
                    Rs. {p.pricePkr}
                  </span>
                </div>

                {p.nameUr && (
                  <div className="font-urdu text-xs text-kraft-600 dark:text-kraft-400 mb-2" dir="rtl">
                    {p.nameUr}
                  </div>
                )}

                <p className="text-xs font-sans text-kraft-600 dark:text-kraft-400 line-clamp-2 mb-2">
                  {p.descriptionEn}
                </p>

                <div className="text-[11px] font-mono text-kraft-500 bg-kraft-100 dark:bg-kraft-900 p-1.5 rounded">
                  ♻ {p.wasteGrams}g ({p.wasteTypeSlugs})
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-dashed border-kraft-300 dark:border-kraft-700 text-xs font-mono text-kraft-500">
                Slug: {p.slug}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
