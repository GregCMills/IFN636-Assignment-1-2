import { useUser, useAuth } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';

const Profile = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({ university: '', address: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await getToken();
      const res = await axiosInstance.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({ university: res.data.university || '', address: res.data.address || '' });
    };
    if (user) fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();
    await axiosInstance.put('/api/auth/profile', formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert('Profile updated!');
  };

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
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
            <label className="block text-sm font-medium text-text-label mb-1">University</label>
            <input
              type="text"
              placeholder="Your university"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              className="input-base"
            />
          </div>
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
          <button type="submit" className="btn-primary w-full mt-2">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
