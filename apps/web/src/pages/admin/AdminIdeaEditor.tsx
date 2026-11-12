import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getWasteTypes,
  getIdeaBySlug,
  getAdminIdeas,
  createAdminIdea,
  updateAdminIdea,
  uploadAdminImage,
} from '../../lib/api';
import { WasteType } from '@remake/shared';
import { AdminNav } from './AdminNav';
import { PaperSheet } from '../../ui/PaperSheet';
import { Button } from '../../ui/Button';
import { useToast } from '../../ui/Toast';

export const AdminIdeaEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<any>({
    titleEn: '',
    titleUr: '',
    slug: '',
    summaryEn: '',
    summaryUr: '',
    primaryWasteTypeId: '',
    status: 'TESTED',
    difficulty: 'EASY',
    timeMinutes: 20,
    wasteWeightGrams: 50,
    co2eGramsSaved: 75,
    costPkr: 0,
    sellPricePkr: 150,
    safetyNotesEn: 'Wear gloves when handling cut plastic edges.',
    safetyNotesUr: 'پلاسٹک کے تیز کناروں سے بچنے کے لیے دستانے استعمال کریں۔',
    heroImage: '',
    steps: [
      {
        stepNumber: 1,
        titleEn: 'Prepare the Materials',
        titleUr: 'مواد کی تیاری',
        instructionEn: 'Clean and dry all plastic scraps before beginning.',
        instructionUr: 'کام شروع کرنے سے پہلے تمام پلاسٹک کو دھو کر سکھا لیں۔',
        imageUrl: '',
        tipEn: 'Use warm soapy water.',
        tipUr: 'ہلکے گرم صابن والے پانی کا استعمال کریں۔',
      },
    ],
    materials: [
      { nameEn: 'Plastic Scrap', nameUr: 'پلاسٹک کا ٹکڑا', quantity: '2 pcs', isWaste: true },
    ],
  });

  useEffect(() => {
    getWasteTypes().then((types) => {
      setWasteTypes(types);
      if (isNew && types.length > 0 && !formData.primaryWasteTypeId) {
        const first = types[0];
        if (first) {
          setFormData((prev: any) => ({ ...prev, primaryWasteTypeId: first.id }));
        }
      }
    });

    if (!isNew && id) {
      getAdminIdeas()
        .then((res) => {
          const match = res.ideas.find((i: any) => i.id === id);
          if (match) {
            setFormData({
              ...match,
              primaryWasteTypeId: match.primaryWasteTypeId || '',
              steps: match.steps?.length ? match.steps : formData.steps,
              materials: match.materials?.length ? match.materials : formData.materials,
            });
          }
        })
        .catch((err) => showToast('Failed to load blueprint details', 'error'))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await uploadAdminImage(data);
      setFormData((prev: any) => ({ ...prev, heroImage: res.url }));
      showToast('Hero image uploaded', 'success');
    } catch (err: any) {
      showToast(err.message || 'Image upload failed', 'error');
    }
  };

  const handleStepUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await uploadAdminImage(data);
      const updatedSteps = [...formData.steps];
      updatedSteps[index].imageUrl = res.url;
      setFormData({ ...formData, steps: updatedSteps });
      showToast(`Step ${index + 1} photo uploaded`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Image upload failed', 'error');
    }
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          stepNumber: formData.steps.length + 1,
          titleEn: `Step ${formData.steps.length + 1}`,
          titleUr: `مرحلہ ${formData.steps.length + 1}`,
          instructionEn: '',
          instructionUr: '',
          imageUrl: '',
        },
      ],
    });
  };

  const removeStep = (idx: number) => {
    if (formData.steps.length <= 1) return;
    const updated = formData.steps.filter((_: any, i: number) => i !== idx);
    setFormData({
      ...formData,
      steps: updated.map((s: any, i: number) => ({ ...s, stepNumber: i + 1 })),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isNew) {
        await createAdminIdea(formData);
        showToast('New idea blueprint created successfully!', 'success');
      } else {
        await updateAdminIdea(id!, formData);
        showToast('Idea blueprint updated successfully!', 'success');
      }
      navigate('/admin/ideas');
    } catch (err: any) {
      showToast(err.message || 'Failed to save idea blueprint', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AdminNav />
        <div className="text-center py-12 font-mono text-sm">Loading blueprint editor...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      <AdminNav />

      <div className="flex items-center justify-between mb-8 border-b-2 border-dashed border-kraft-300 dark:border-kraft-700 pb-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-kraft-900 dark:text-kraft-100">
            {isNew ? 'Author New Blueprint' : `Editing: ${formData.titleEn}`}
          </h1>
          <p className="font-serif italic text-kraft-600 dark:text-kraft-400 text-sm mt-1">
            Build step-by-step instructions, upload high-res workbench photos, and define verified metrics.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Info */}
        <PaperSheet pinColor="brass">
          <h2 className="font-display font-bold text-lg text-kraft-900 dark:text-kraft-100 mb-4 border-b border-dashed border-kraft-300 pb-2">
            1. Overview & Categorization
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-mono font-bold text-kraft-700 dark:text-kraft-300 mb-1">
                Title (English) *
              </label>
              <input
                type="text"
                required
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-kraft-50 dark:bg-kraft-900 border border-kraft-300 dark:border-kraft-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-kraft-700 dark:text-kraft-300 mb-1">
                Title (Urdu)
              </label>
              <input
                type="text"
                dir="rtl"
                value={formData.titleUr || ''}
                onChange={(e) => setFormData({ ...formData, titleUr: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-kraft-50 dark:bg-kraft-900 border border-kraft-300 dark:border-kraft-700 rounded-lg font-urdu"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-mono font-bold text-kraft-700 dark:text-kraft-300 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-kraft-50 dark:bg-kraft-900 border border-kraft-300 dark:border-kraft-700 rounded-lg font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-kraft-700 dark:text-kraft-300 mb-1">
                Primary Waste Type *
              </label>
              <select
                value={formData.primaryWasteTypeId}
                onChange={(e) => setFormData({ ...formData, primaryWasteTypeId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-kraft-50 dark:bg-kraft-900 border border-kraft-300 dark:border-kraft-700 rounded-lg font-mono text-xs"
              >
                {wasteTypes.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.nameEn}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-kraft-700 dark:text-kraft-300 mb-1">
                Honesty Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-kraft-50 dark:bg-kraft-900 border border-kraft-300 dark:border-kraft-700 rounded-lg font-mono text-xs"
              >
                <option value="TESTED">TESTED (ReMake Team)</option>
                <option value="UNTESTED">UNTESTED (Student Draft)</option>
                <option value="AI_DRAFT">AI_DRAFT (Generated)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-mono font-bold text-kraft-700 dark:text-kraft-300 mb-1">
                Summary (English) *
              </label>
              <textarea
                rows={2}
                required
                value={formData.summaryEn}
                onChange={(e) => setFormData({ ...formData, summaryEn: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-kraft-50 dark:bg-kraft-900 border border-kraft-300 dark:border-kraft-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-kraft-700 dark:text-kraft-300 mb-1">
                Summary (Urdu)
              </label>
              <textarea
                rows={2}
                dir="rtl"
                value={formData.summaryUr || ''}
                onChange={(e) => setFormData({ ...formData, summaryUr: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-kraft-50 dark:bg-kraft-900 border border-kraft-300 dark:border-kraft-700 rounded-lg font-urdu"
              />
            </div>
          </div>

          {/* Hero Image upload */}
          <div>
            <label className="block text-xs font-mono font-bold text-kraft-700 dark:text-kraft-300 mb-1">
              Hero Image (SVG or Photo)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={formData.heroImage || ''}
                onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                placeholder="/seed/idea-planter.svg or upload below"
                className="flex-1 px-3 py-2 text-xs bg-kraft-50 dark:bg-kraft-900 border border-kraft-300 dark:border-kraft-700 rounded-lg font-mono"
              />
              <label className="cursor-pointer">
                <span className="px-3 py-2 bg-kraft-200 dark:bg-kraft-700 hover:bg-kraft-300 rounded-lg text-xs font-mono">
                  Browse File
                </span>
                <input type="file" accept="image/*" onChange={handleHeroUpload} className="hidden" />
              </label>
            </div>
          </div>
        </PaperSheet>

        {/* Metrics & Impact */}
        <PaperSheet pinColor="yellow">
          <h2 className="font-display font-bold text-lg text-kraft-900 dark:text-kraft-100 mb-4 border-b border-dashed border-kraft-300 pb-2">
            2. Impact & Effort Parameters
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-mono text-kraft-600 dark:text-kraft-400 mb-1">
                Time (Minutes)
              </label>
              <input
                type="number"
                value={formData.timeMinutes}
                onChange={(e) => setFormData({ ...formData, timeMinutes: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-sm bg-kraft-50 dark:bg-kraft-900 border border-kraft-300 dark:border-kraft-700 rounded font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-kraft-600 dark:text-kraft-400 mb-1">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-1.5 text-sm bg-kraft-50 dark:bg-kraft-900 border border-kraft-300 dark:border-kraft-700 rounded font-mono"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-kraft-600 dark:text-kraft-400 mb-1">
                Waste Diverted (g)
              </label>
              <input
                type="number"
                value={formData.wasteWeightGrams}
                onChange={(e) => setFormData({ ...formData, wasteWeightGrams: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-sm bg-kraft-50 dark:bg-kraft-900 border border-kraft-300 dark:border-kraft-700 rounded font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-kraft-600 dark:text-kraft-400 mb-1">
                CO₂e Saved (g)
              </label>
              <input
                type="number"
                value={formData.co2eGramsSaved}
                onChange={(e) => setFormData({ ...formData, co2eGramsSaved: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-sm bg-kraft-50 dark:bg-kraft-900 border border-kraft-300 dark:border-kraft-700 rounded font-mono"
              />
            </div>
          </div>
        </PaperSheet>

        {/* Step-by-Step Builder */}
        <PaperSheet pinColor="blue">
          <div className="flex items-center justify-between mb-4 border-b border-dashed border-kraft-300 pb-2">
            <h2 className="font-display font-bold text-lg text-kraft-900 dark:text-kraft-100">
              3. Step-by-Step Instructions ({formData.steps.length} Steps)
            </h2>
            <Button variant="secondary" size="sm" type="button" onClick={addStep}>
              + Add Step
            </Button>
          </div>

          <div className="space-y-6">
            {formData.steps.map((step: any, idx: number) => (
              <div
                key={idx}
                className="p-4 bg-kraft-100/70 dark:bg-kraft-900/40 rounded-xl border border-kraft-300 dark:border-kraft-700 relative"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-forest-green">
                    STEP {step.stepNumber || idx + 1}
                  </span>
                  {formData.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="text-caution-red hover:underline text-xs font-mono"
                    >
                      Remove Step
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Step Title (English)"
                    value={step.titleEn || ''}
                    onChange={(e) => {
                      const updated = [...formData.steps];
                      updated[idx].titleEn = e.target.value;
                      setFormData({ ...formData, steps: updated });
                    }}
                    className="px-3 py-1.5 text-xs bg-white dark:bg-kraft-800 border border-kraft-300 dark:border-kraft-700 rounded"
                  />
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="مرحلے کا عنوان (اردو)"
                    value={step.titleUr || ''}
                    onChange={(e) => {
                      const updated = [...formData.steps];
                      updated[idx].titleUr = e.target.value;
                      setFormData({ ...formData, steps: updated });
                    }}
                    className="px-3 py-1.5 text-xs bg-white dark:bg-kraft-800 border border-kraft-300 dark:border-kraft-700 rounded font-urdu"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <textarea
                    rows={2}
                    placeholder="Instruction (English)"
                    value={step.instructionEn || ''}
                    onChange={(e) => {
                      const updated = [...formData.steps];
                      updated[idx].instructionEn = e.target.value;
                      setFormData({ ...formData, steps: updated });
                    }}
                    className="px-3 py-1.5 text-xs bg-white dark:bg-kraft-800 border border-kraft-300 dark:border-kraft-700 rounded"
                  />
                  <textarea
                    rows={2}
                    dir="rtl"
                    placeholder="ہدایات (اردو)"
                    value={step.instructionUr || ''}
                    onChange={(e) => {
                      const updated = [...formData.steps];
                      updated[idx].instructionUr = e.target.value;
                      setFormData({ ...formData, steps: updated });
                    }}
                    className="px-3 py-1.5 text-xs bg-white dark:bg-kraft-800 border border-kraft-300 dark:border-kraft-700 rounded font-urdu"
                  />
                </div>

                {/* Step Image */}
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Image URL or upload"
                    value={step.imageUrl || ''}
                    onChange={(e) => {
                      const updated = [...formData.steps];
                      updated[idx].imageUrl = e.target.value;
                      setFormData({ ...formData, steps: updated });
                    }}
                    className="flex-1 px-3 py-1 text-xs bg-white dark:bg-kraft-800 border border-kraft-300 dark:border-kraft-700 rounded font-mono"
                  />
                  <label className="cursor-pointer">
                    <span className="px-2.5 py-1 bg-kraft-200 dark:bg-kraft-700 hover:bg-kraft-300 rounded text-[11px] font-mono">
                      Upload Step Photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleStepUpload(idx, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </PaperSheet>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-kraft-300 dark:border-kraft-700">
          <Button variant="ghost" type="button" onClick={() => navigate('/admin/ideas')}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Saving to Database...' : isNew ? 'Create Blueprint' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};
