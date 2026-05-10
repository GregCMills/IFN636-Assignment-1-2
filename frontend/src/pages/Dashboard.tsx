import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import AdminDashboard from '../components/admin/AdminDashboard';
import CustomerDashboard from '../components/customer/CustomerDashboard';
import axiosInstance from '../axiosConfig';
import type { Asset, AssetStatus, AssetType, ProductGroup, RentalHistoryEntry, AdminTabProps, CustomerTabProps } from '../types/assets';

const Dashboard = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken }                   = useAuth();

  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [assetTypes,    setAssetTypes]    = useState<AssetType[]>([]);
  const [assets,        setAssets]        = useState<Asset[]>([]);
  const [rentalHistory, setRentalHistory] = useState<RentalHistoryEntry[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');

  // ── Auth header helper ────────────────────────────────────────────────────

  const authHeaders = useCallback(async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  }, [getToken]);

  // ── Load all data on mount ────────────────────────────────────────────────

  useEffect(() => {
    if (!isSignedIn) return;
    const load = async () => {
      try {
        const headers = await authHeaders();
        const [g, t, a, r] = await Promise.all([
          axiosInstance.get('/api/groups', { headers }),
          axiosInstance.get('/api/types',  { headers }),
          axiosInstance.get('/api/assets', { headers }),
          axiosInstance.get('/api/assets/rental-history', { headers }),
        ]);
        setProductGroups(g.data);
        setAssetTypes(t.data);
        setAssets(a.data);
        setRentalHistory(r.data);
      } catch {
        setError('Failed to load data. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isSignedIn, authHeaders]);

  // ── Action functions ──────────────────────────────────────────────────────

  const updateAssetStatuses = async (ids: string[], status: AssetStatus, clearData = false) => {
    const headers = await authHeaders();
    const { data } = await axiosInstance.patch(
      '/api/assets/bulk-status',
      { ids, status, clearRentalData: clearData },
      { headers }
    );
    const updatedMap = new Map<string, Asset>(data.map((a: Asset) => [a.id, a]));
    setAssets(prev => prev.map(a => updatedMap.get(a.id) ?? a));
  };

  const createProductGroup = async (name: string): Promise<ProductGroup> => {
    const headers = await authHeaders();
    const { data } = await axiosInstance.post('/api/groups', { name }, { headers });
    setProductGroups(prev => [...prev, data]);
    return data;
  };

  const deleteProductGroup = async (id: string) => {
    const headers = await authHeaders();
    await axiosInstance.delete(`/api/groups/${id}`, { headers });
    setProductGroups(prev => prev.filter(g => g.id !== id));
  };

  const createAssetType = async (groupId: string, name: string): Promise<AssetType> => {
    const headers = await authHeaders();
    const { data } = await axiosInstance.post('/api/types', { groupId, name }, { headers });
    setAssetTypes(prev => [...prev, data]);
    return data;
  };

  const deleteAssetType = async (id: string) => {
    const headers = await authHeaders();
    await axiosInstance.delete(`/api/types/${id}`, { headers });
    setAssetTypes(prev => prev.filter(t => t.id !== id));
  };

  const createAsset = async (typeId: string, name: string): Promise<Asset> => {
    const headers = await authHeaders();
    const { data } = await axiosInstance.post('/api/assets', { typeId, name }, { headers });
    setAssets(prev => [...prev, data]);
    return data;
  };

  const createAssets = async (typeId: string, names: string[]): Promise<Asset[]> => {
    const headers = await authHeaders();
    const { data } = await axiosInstance.post('/api/assets/batch', { typeId, names }, { headers });
    setAssets(prev => [...prev, ...data]);
    return data;
  };

  const deleteAsset = async (id: string) => {
    const headers = await authHeaders();
    await axiosInstance.delete(`/api/assets/${id}`, { headers });
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const uploadPhoto = async (entityType: 'group' | 'type' | 'asset', id: string, file: File) => {
    const token = await getToken();
    const formData = new FormData();
    formData.append('photo', file);
    const plural = entityType === 'asset' ? 'assets' : `${entityType}s`;
    const { data } = await axiosInstance.post(`/api/${plural}/${id}/photo`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Append cache-buster to force browser re-fetch — the backend reuses the
    // same filename (entityId.ext) so the URL would otherwise be identical.
    const cacheBust = `?t=${Date.now()}`;
    const updater = <T extends { id: string }>(prev: T[]): T[] =>
      prev.map(item => item.id === id ? { ...item, imageUrl: data.imageUrl + cacheBust, thumbnailUrl: data.thumbnailUrl + cacheBust } as T : item);
    if (entityType === 'group') setProductGroups(updater);
    else if (entityType === 'type') setAssetTypes(updater);
    else setAssets(updater);
  };

  const deletePhoto = async (entityType: 'group' | 'type' | 'asset', id: string) => {
    const token = await getToken();
    const plural = entityType === 'asset' ? 'assets' : `${entityType}s`;
    await axiosInstance.delete(`/api/${plural}/${id}/photo`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const updater = <T extends { id: string; imageUrl?: string; thumbnailUrl?: string }>(prev: T[]): T[] =>
      prev.map(item => item.id === id ? { ...item, imageUrl: undefined, thumbnailUrl: undefined } as T : item);
    if (entityType === 'group') setProductGroups(updater);
    else if (entityType === 'type') setAssetTypes(updater);
    else setAssets(updater);
  };

  const updateEntity = async (
    entityType: 'group' | 'type' | 'asset',
    id: string,
    updates: { name?: string; description?: string },
  ) => {
    const headers = await authHeaders();
    const plural = entityType === 'asset' ? 'assets' : `${entityType}s`;
    const { data } = await axiosInstance.patch(`/api/${plural}/${id}`, updates, { headers });
    const updater = <T extends { id: string }>(prev: T[]): T[] =>
      prev.map(item => item.id === id ? { ...item, ...data } as T : item);
    if (entityType === 'group') setProductGroups(updater);
    else if (entityType === 'type') setAssetTypes(updater);
    else setAssets(updater);
    return data;
  };

  const requestRental = async (
    items: { typeId: string; quantity: number }[],
    returnDate: string,
  ) => {
    const headers = await authHeaders();
    const { data } = await axiosInstance.post(
      '/api/assets/request-rental',
      { items, returnDate },
      { headers },
    );
    const updatedMap = new Map<string, Asset>((data as Asset[]).map(a => [a.id, a]));
    setAssets(prev => prev.map(a => updatedMap.get(a.id) ?? a));
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (!isLoaded || (isSignedIn && loading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-text-muted">
        Loading…
      </div>
    );
  }

  if (!isSignedIn) return <Navigate to="/login" replace />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-status-danger">{error}</p>
      </div>
    );
  }

  const isAdmin = (user?.publicMetadata?.role as string) === 'admin';

  const adminProps: AdminTabProps = {
    users: [],
    assets,
    assetTypes,
    productGroups,
    updateAssetStatuses,
    createProductGroup,
    deleteProductGroup,
    createAssetType,
    deleteAssetType,
    createAsset,
    createAssets,
    deleteAsset,
    uploadPhoto,
    deletePhoto,
    updateEntity,
  };

  const customerProps: CustomerTabProps = {
    assets,
    assetTypes,
    productGroups,
    rentalHistory,
    currentUserId: user!.id,
    requestRental,
    updateAssetStatuses,
  };

  return (
    <div className="container mx-auto p-6">
      {isAdmin
        ? <AdminDashboard {...adminProps} />
        : <CustomerDashboard {...customerProps} />
      }
    </div>
  );
};

export default Dashboard;
