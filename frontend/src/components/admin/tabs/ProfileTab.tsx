import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Bug, RefreshCw } from 'lucide-react';
import type { AdminTabProps } from '../../../types/assets';
import ConfirmModal from '../../ConfirmModal';

const ProfileTab = ({ resetToSeedData }: AdminTabProps) => {
  const { user } = useUser();

  const [confirming, setConfirming] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  const handleReset = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { skipped } = await resetToSeedData();
      const skippedNote = skipped.length > 0
        ? ` (${skipped.length} type(s) not found in DB and were skipped: ${skipped.join(', ')})`
        : '';
      setSuccess(`Assets reset to seed data successfully.${skippedNote}`);
    } catch {
      setError('Failed to reset asset data. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || '—';
  const email       = user?.primaryEmailAddress?.emailAddress ?? '—';
  const role        = String(user?.publicMetadata?.role ?? '—');

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* ── Profile info ─────────────────────────────────────────────── */}
      <section className="card p-6">
        <h2 className="text-xl font-bold text-text-primary mb-4">Profile</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex gap-3">
            <dt className="w-16 text-text-muted shrink-0">Name</dt>
            <dd className="text-text-secondary">{displayName}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-16 text-text-muted shrink-0">Email</dt>
            <dd className="text-text-secondary">{email}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-16 text-text-muted shrink-0">Role</dt>
            <dd className="text-text-secondary capitalize">{role}</dd>
          </div>
        </dl>
      </section>

      {/* ── Debug tools ──────────────────────────────────────────────── */}
      <section className="card p-6 border border-status-danger/20">
        <div className="flex items-center gap-2 mb-1">
          <Bug size={18} className="text-status-danger" />
          <h2 className="text-xl font-bold text-text-primary">Debug Tools</h2>
        </div>
        <p className="text-text-subtle text-sm mb-6">
          These actions modify live data and are intended for development and testing only.
        </p>

        {error   && <p className="text-status-danger text-sm mb-4">{error}</p>}
        {success && <p className="text-green-400 text-sm mb-4">{success}</p>}

        <div className="flex items-start justify-between gap-4 p-4 bg-surface-elevated/40 rounded-lg border border-border-default">
          <div className="min-w-0">
            <p className="font-medium text-text-primary text-sm">Reset Assets to Seed Data</p>
            <p className="text-text-subtle text-xs mt-1">
              Deletes all asset records and replaces them with the default seed data.
              Product groups and types are not affected.
            </p>
          </div>
          <button
            onClick={() => setConfirming(true)}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                       text-status-danger border border-status-danger/30
                       hover:bg-status-danger-dim/40 transition whitespace-nowrap shrink-0
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Resetting…' : 'Reset Assets'}
          </button>
        </div>
      </section>

      <ConfirmModal
        isOpen={confirming}
        title="Reset all assets?"
        message="This will permanently delete every asset record and replace them with the seed data."
        detail="Product groups and types will not be affected."
        confirmLabel="Yes, reset assets"
        onConfirm={() => { setConfirming(false); handleReset(); }}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
};

export default ProfileTab;
