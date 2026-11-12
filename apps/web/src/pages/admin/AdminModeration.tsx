import React, { useEffect, useState } from 'react';
import { getAdminMakes, approveAdminMake, rejectAdminMake } from '../../lib/api';
import { AdminNav } from './AdminNav';
import { TapeCard } from '../../ui/TapeCard';
import { Stamp } from '../../ui/Stamp';
import { Button } from '../../ui/Button';
import { Skeleton } from '../../ui/Skeleton';
import { useToast } from '../../ui/Toast';

export const AdminModeration: React.FC = () => {
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [makes, setMakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const load = async (status: string) => {
    try {
      setLoading(true);
      const res = await getAdminMakes(status);
      setMakes(res.makes || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load submissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(statusFilter);
  }, [statusFilter]);

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await approveAdminMake(id);
      setMakes((prev) => prev.filter((m) => m.id !== id));
      showToast('Make approved and published to community wall!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Please enter the reason for rejecting this make (will be shown to user):', 'Photo does not clearly show an upcycled craft.');
    if (!reason) return;

    try {
      setProcessingId(id);
      await rejectAdminMake(id, reason);
      setMakes((prev) => prev.filter((m) => m.id !== id));
      showToast('Make rejected with feedback provided', 'info');
    } catch (err: any) {
      showToast(err.message || 'Rejection failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      <AdminNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-kraft-900 dark:text-kraft-100">
            Student Submission Moderation
          </h1>
          <p className="font-serif italic text-kraft-600 dark:text-kraft-400 text-sm mt-1">
            Review uploaded craft photos to protect the community feed against inappropriate content and non-craft items.
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 bg-kraft-200 dark:bg-kraft-800 p-1 rounded-xl">
          {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                statusFilter === s
                  ? 'bg-kraft-900 text-white dark:bg-kraft-100 dark:text-kraft-900 shadow-sm'
                  : 'text-kraft-600 dark:text-kraft-400 hover:text-kraft-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
      ) : makes.length === 0 ? (
        <div className="text-center py-16 bg-kraft-100 dark:bg-kraft-800 rounded-2xl border-2 border-dashed border-kraft-300 dark:border-kraft-700">
          <p className="text-kraft-600 dark:text-kraft-400 font-sans text-sm">
            No submissions found in {statusFilter} status.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {makes.map((make) => (
            <TapeCard key={make.id} tapePosition="top-right" tapeColor="yellow" className="flex flex-col justify-between">
              <div>
                {/* Photo */}
                <div className="relative aspect-video rounded bg-kraft-100 dark:bg-kraft-900 overflow-hidden mb-3 border border-kraft-200 dark:border-kraft-700">
                  {make.photoUrl ? (
                    <img src={make.photoUrl} alt="Submission" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-xs text-kraft-400">
                      No Photo Provided
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Stamp
                      variant={make.status === 'APPROVED' ? 'tested' : make.status === 'REJECTED' ? 'danger' : 'draft'}
                      size="sm"
                    >
                      {make.status}
                    </Stamp>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-kraft-500 mb-1">
                  <span>@{make.user?.name || 'Guest Maker'}</span>
                  <span>{new Date(make.createdAt).toLocaleDateString()}</span>
                </div>

                <h3 className="font-display font-bold text-base text-kraft-900 dark:text-kraft-100 mb-1">
                  {make.idea?.titleEn || 'Custom Creation'}
                </h3>

                {make.notes && (
                  <p className="font-sans text-xs text-kraft-700 dark:text-kraft-300 italic mb-3 bg-kraft-100 dark:bg-kraft-900/60 p-2 rounded">
                    "{make.notes}"
                  </p>
                )}

                {make.rejectionReason && (
                  <div className="text-[11px] font-mono text-caution-red bg-caution-red/10 p-2 rounded mb-3">
                    Rejection note: {make.rejectionReason}
                  </div>
                )}
              </div>

              {/* Moderation Actions */}
              {statusFilter === 'PENDING' && (
                <div className="pt-3 border-t border-dashed border-kraft-300 dark:border-kraft-700 flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1 text-xs"
                    disabled={processingId === make.id}
                    onClick={() => handleReject(make.id)}
                  >
                    ✕ Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 text-xs"
                    disabled={processingId === make.id}
                    onClick={() => handleApprove(make.id)}
                  >
                    ✓ Approve
                  </Button>
                </div>
              )}
            </TapeCard>
          ))}
        </div>
      )}
    </div>
  );
};

