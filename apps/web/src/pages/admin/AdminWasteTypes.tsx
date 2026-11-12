import React, { useEffect, useState } from 'react';
import { getAdminWasteTypes, updateAdminWasteType } from '../../lib/api';
import { AdminNav } from './AdminNav';
import { Button } from '../../ui/Button';
import { Skeleton } from '../../ui/Skeleton';
import { useToast } from '../../ui/Toast';

export const AdminWasteTypes: React.FC = () => {
  const { showToast } = useToast();
  const [wasteTypes, setWasteTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAdminWasteTypes();
      setWasteTypes(res);
    } catch (err: any) {
      showToast(err.message || 'Failed to load waste types', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (w: any) => {
    setEditingId(w.id);
    setEditForm({ ...w });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id: string) => {
    try {
      setSaving(true);
      await updateAdminWasteType(id, {
        nameEn: editForm.nameEn,
        nameUr: editForm.nameUr,
        category: editForm.category,
        defaultWeightGrams: Number(editForm.defaultWeightGrams),
        co2eFactorKgPerKg: Number(editForm.co2eFactorKgPerKg),
        source: editForm.source,
      });
      showToast('Waste factor updated successfully', 'success');
      setEditingId(null);
      load();
    } catch (err: any) {
      showToast(err.message || 'Failed to update factor', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      <AdminNav />

      <div className="mb-6">
        <h1 className="font-display font-black text-2xl sm:text-3xl text-kraft-900 dark:text-kraft-100">
          Waste Streams & Lifecycle Emission Factors
        </h1>
        <p className="font-serif italic text-kraft-600 dark:text-kraft-400 text-sm mt-1">
          Calibrate emission factors (kg CO₂e / kg) and default material piece weights. All server-side impact math references these values.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <div className="overflow-x-auto border-2 border-kraft-300 dark:border-kraft-700 rounded-xl bg-kraft-50 dark:bg-kraft-800 shadow-kraft">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-kraft-200 dark:bg-kraft-700 text-kraft-800 dark:text-kraft-200 border-b border-kraft-300 dark:border-kraft-600">
              <tr>
                <th className="p-3">Waste Stream</th>
                <th className="p-3">Category</th>
                <th className="p-3">Weight (g/pc)</th>
                <th className="p-3">Factor (kg CO₂/kg)</th>
                <th className="p-3">Source & Notes</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kraft-200 dark:divide-kraft-700">
              {wasteTypes.map((w) => {
                const isEditing = editingId === w.id;

                return (
                  <tr key={w.id} className="hover:bg-kraft-100 dark:hover:bg-kraft-750">
                    <td className="p-3">
                      {isEditing ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={editForm.nameEn || ''}
                            onChange={(e) => setEditForm({ ...editForm, nameEn: e.target.value })}
                            className="px-2 py-1 text-xs bg-white dark:bg-kraft-900 border rounded w-full"
                          />
                          <input
                            type="text"
                            dir="rtl"
                            value={editForm.nameUr || ''}
                            onChange={(e) => setEditForm({ ...editForm, nameUr: e.target.value })}
                            className="px-2 py-1 text-xs bg-white dark:bg-kraft-900 border rounded w-full font-urdu"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold text-kraft-900 dark:text-kraft-100 font-sans text-sm">
                            {w.nameEn}
                          </div>
                          {w.nameUr && (
                            <div className="font-urdu text-kraft-600 dark:text-kraft-400 text-xs">
                              {w.nameUr}
                            </div>
                          )}
                          <span className="text-[10px] text-kraft-400">{w.slug}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.category || ''}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="px-2 py-1 text-xs bg-white dark:bg-kraft-900 border rounded w-28"
                        />
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-kraft-200 dark:bg-kraft-700 text-kraft-700 dark:text-kraft-300">
                          {w.category}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.defaultWeightGrams}
                          onChange={(e) => setEditForm({ ...editForm, defaultWeightGrams: e.target.value })}
                          className="px-2 py-1 text-xs bg-white dark:bg-kraft-900 border rounded w-20"
                        />
                      ) : (
                        <span>{w.defaultWeightGrams}g</span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-forest-green dark:text-forest-light">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.co2eFactorKgPerKg}
                          onChange={(e) => setEditForm({ ...editForm, co2eFactorKgPerKg: e.target.value })}
                          className="px-2 py-1 text-xs bg-white dark:bg-kraft-900 border rounded w-20"
                        />
                      ) : (
                        <span>{w.co2eFactorKgPerKg}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.source || ''}
                          onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                          className="px-2 py-1 text-xs bg-white dark:bg-kraft-900 border rounded w-full"
                        />
                      ) : (
                        <span className="text-kraft-500 text-[11px] truncate block max-w-xs" title={w.source}>
                          {w.source || 'EPA WARM v15'}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {isEditing ? (
                        <div className="space-x-1">
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-[10px] py-1 px-2"
                            disabled={saving}
                            onClick={() => handleSave(w.id)}
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10px] py-1 px-2"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-[10px] py-1 px-2"
                          onClick={() => startEdit(w)}
                        >
                          Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

