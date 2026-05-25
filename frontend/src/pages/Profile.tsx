import { useUser, useAuth } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import { Bug, RefreshCw, Copy, Check } from 'lucide-react';
import axiosInstance from '../axiosConfig';
import ConfirmModal from '../components/ConfirmModal';

const Profile = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({ address: '', phone: '' });

  const isAdmin = (user?.publicMetadata?.role as string) === 'admin';

  // ── Debug reset state ──────────────────────────────────────────────────────
  const [confirming,    setConfirming]    = useState(false);
  const [resetLoading,  setResetLoading]  = useState(false);
  const [resetError,    setResetError]    = useState('');
  const [resetSuccess,  setResetSuccess]  = useState('');
  const [bearerToken,   setBearerToken]   = useState('');
  const [tokenCopied,   setTokenCopied]   = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await getToken();
      const res = await axiosInstance.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({ address: res.data.address || '', phone: res.data.phone || '' });
    };
    const fetchBearerToken = async () => {
      const token = await getToken({ template: 'postman' });
      if (token) setBearerToken(token);
    };
    if (user) {
      fetchProfile();
      fetchBearerToken();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();
    await axiosInstance.put('/api/auth/profile', formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert('Profile updated!');
  };

  const handleResetAssets = async () => {
    setResetLoading(true);
    setResetError('');
    setResetSuccess('');
    try {
      const token = await getToken();
      const { data } = await axiosInstance.post(
        '/api/assets/reset-seed',
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const skippedNote = data.skipped?.length
        ? ` (${data.skipped.length} type(s) not found and skipped: ${data.skipped.join(', ')})`
        : '';
      setResetSuccess(`Assets reset to seed data successfully.${skippedNote}`);
      // Navigate to dashboard so it re-fetches the fresh state
      setTimeout(() => { window.location.assign('/dashboard'); }, 1200);
    } catch {
      setResetError('Failed to reset asset data.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 px-4 flex flex-col gap-6">
      <div className="card p-8">
        <h1 className="text-2xl font-bold mb-6 text-text-primary">Your Profile</h1>

        <div className="mb-6 space-y-1 border-b border-border-default pb-6">
          <p className="text-sm text-text-muted">Name</p>
          <p className="font-medium text-text-secondary">{user?.fullName ?? '—'}</p>
          <p className="text-sm text-text-muted mt-3">Email</p>
          <p className="font-medium text-text-secondary">{user?.primaryEmailAddress?.emailAddress ?? '—'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-label mb-1">Address</label>
            <input
              type="text"
              placeholder="Your address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-label mb-1">Phone Number</label>
            <input
              type="tel"
              placeholder="Your phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-base"
            />
          </div>
          <button type="submit" className="btn-primary w-full mt-2">
            Update Profile
          </button>
        </form>
      </div>

      {/* ── API Bearer Token ────────────────────────────────────────────────── */}
      <div className="card p-6">
        <p className="font-medium text-text-primary text-sm mb-1">API Bearer Token</p>
        <p className="text-text-subtle text-xs mb-3">
          Copy this token into Postman's Authorization tab (Bearer Token).
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={bearerToken || 'Loading token…'}
            className="input-base text-xs font-mono flex-1 select-all truncate"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(bearerToken);
              setTokenCopied(true);
              setTimeout(() => setTokenCopied(false), 2000);
            }}
            disabled={!bearerToken}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                       border border-border-default hover:bg-surface-elevated/60 transition shrink-0
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {tokenCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {tokenCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* ── Admin debug tools ────────────────────────────────────────────────── */}
      {isAdmin && (
        <div className="card p-6 border border-status-danger/20">
          <div className="flex items-center gap-2 mb-1">
            <Bug size={18} className="text-status-danger" />
            <h2 className="text-lg font-bold text-text-primary">Debug Tools</h2>
          </div>
          <p className="text-text-subtle text-sm mb-5">
            These actions modify live data and are for development and testing only.
          </p>

          {resetError   && <p className="text-status-danger text-sm mb-4">{resetError}</p>}
          {resetSuccess && <p className="text-green-400 text-sm mb-4">{resetSuccess}</p>}

          <div className="flex items-start justify-between gap-4 p-4 bg-surface-elevated/40 rounded-lg border border-border-default">
            <div className="min-w-0">
              <p className="font-medium text-text-primary text-sm">Reset Assets to Seed Data</p>
              <p className="text-text-subtle text-xs mt-1">
                Deletes all asset records, product types, and groups, and replaces them with the default seed data.
              </p>
            </div>
            <button
              onClick={() => setConfirming(true)}
              disabled={resetLoading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                         text-status-danger border border-status-danger/30
                         hover:bg-status-danger-dim/40 transition whitespace-nowrap shrink-0
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={14} className={resetLoading ? 'animate-spin' : ''} />
              {resetLoading ? 'Resetting…' : 'Reset Assets'}
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirming}
        title="Reset all assets?"
        message="This will permanently delete every asset, product type, and group, and replace them with the seed data."
        detail="This action cannot be undone."
        confirmLabel="Yes, reset assets"
        onConfirm={() => { setConfirming(false); handleResetAssets(); }}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
};

export default Profile;
