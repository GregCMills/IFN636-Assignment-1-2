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
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Your Profile</h1>
        <p className="mb-2">Name: {user?.fullName}</p>
        <p className="mb-4">Email: {user?.primaryEmailAddress?.emailAddress}</p>
        <input type="text" placeholder="University" value={formData.university}
          onChange={(e) => setFormData({ ...formData, university: e.target.value })}
          className="w-full mb-4 p-2 border rounded" />
        <input type="text" placeholder="Address" value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full mb-4 p-2 border rounded" />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Update Profile</button>
      </form>
    </div>
  );
};

export default Profile;