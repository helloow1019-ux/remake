import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminIdeas, deleteAdminIdea, promoteAdminIdea } from '../../lib/api';
import { AdminNav } from './AdminNav';
import { Stamp } from '../../ui/Stamp';
import { Button } from '../../ui/Button';
import { Skeleton } from '../../ui/Skeleton';
import { useToast } from '../../ui/Toast';

export const AdminIdeas: React.FC = () => {
  const { showToast } = useToast();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAdminIdeas();
      setIdeas(res.ideas || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load ideas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete blueprint "${title}"?`)) return;
    try {
      await deleteAdminIdea(id);
      setIdeas((prev) => prev.filter((i) => i.id !== id));
      showToast('Idea blueprint deleted', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete idea', 'error');
    }
  };

  const handlePromote = async (id: string) => {
    try {
      await promoteAdminIdea(id);
      showToast('AI Draft successfully promoted to Tested Blueprint!', 'success');
      load();
    } catch (err: any) {
      showToast(err.message || 'Failed to promote idea', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      <AdminNav />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-kraft-900 dark:text-kraft-100">
            Blueprints & Idea Catalog
          </h1>
          <p className="font-serif italic text-kraft-600 dark:text-kraft-400 text-sm mt-1">
            Curate verified student builds, edit step-by-step instructions, and promote AI drafts.
          </p>
        </div>

        <Link to="/admin/ideas/new">
          <Button variant="primary" size="sm">
            + Create New Idea
          </Button>
        </Link>
      </div>

      {loading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : ideas.length === 0 ? (
        <div className="text-center py-16 bg-kraft-100 dark:bg-kraft-800 rounded-xl">
          <p className="text-kraft-600 dark:text-kraft-400 font-sans">No blueprints in database yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-kraft-300 dark:border-kraft-700 rounded-xl bg-kraft-50 dark:bg-kraft-800 shadow-kraft">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-kraft-200 dark:bg-kraft-700 text-kraft-800 dark:text-kraft-200 border-b border-kraft-300 dark:border-kraft-600">
              <tr>
                <th className="p-3">Title & Slug</th>
                <th className="p-3">Primary Waste</th>
                <th className="p-3">Status</th>
                <th className="p-3">Time & Diff</th>
                <th className="p-3">CO₂e Offset</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kraft-200 dark:divide-kraft-700">
              {ideas.map((idea) => (
                <tr key={idea.id} className="hover:bg-kraft-100 dark:hover:bg-kraft-750">
                  <td className="p-3">
                    <div className="font-bold text-kraft-900 dark:text-kraft-100 font-sans text-sm">
                      {idea.titleEn}
                    </div>
                    {idea.titleUr && (
                      <div className="font-urdu text-kraft-600 dark:text-kraft-400 text-xs">
                        {idea.titleUr}
                      </div>
                    )}
                    <span className="text-[10px] text-kraft-400">{idea.slug}</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-kraft-200 dark:bg-kraft-700 text-kraft-800 dark:text-kraft-200">
                      {idea.primaryWasteType?.nameEn || 'General'}
                    </span>
                  </td>
                  <td className="p-3">
                    <Stamp
                      variant={idea.status === 'TESTED' ? 'tested' : idea.status === 'AI_DRAFT' ? 'draft' : 'untested'}
                      size="sm"
                    >
                      {idea.status}
                    </Stamp>
                  </td>
                  <td className="p-3 text-kraft-600 dark:text-kraft-400">
                    {idea.timeMinutes}m • {idea.difficulty}
                  </td>
                  <td className="p-3 font-bold text-forest-green dark:text-forest-light">
                    -{Math.round(idea.co2eGramsSaved)}g
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {idea.status === 'AI_DRAFT' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-[10px] py-1 px-2"
                        onClick={() => handlePromote(idea.id)}
                      >
                        Promote to Tested
                      </Button>
                    )}
                    <Link to={`/admin/ideas/${idea.id}`}>
                      <Button variant="ghost" size="sm" className="text-[10px] py-1 px-2">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      className="text-[10px] py-1 px-2"
                      onClick={() => handleDelete(idea.id, idea.titleEn)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

