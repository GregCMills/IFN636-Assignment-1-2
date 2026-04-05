import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import AdminDashboard from '../components/admin/AdminDashboard';
import CustomerDashboard from '../components/customer/CustomerDashboard';
import {
  initialUsers,
  initialProductGroups,
  initialAssetTypes,
  initialAssets,
} from '../data/seedData';
import type { Asset, AssetStatus, AdminTabProps } from '../types/assets';

const Dashboard = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  const [users]                          = useState(initialUsers);
  const [productGroups, setProductGroups] = useState(initialProductGroups);
  const [assetTypes,    setAssetTypes]    = useState(initialAssetTypes);
  const [assets,        setAssets]        = useState<Asset[]>(initialAssets);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-text-muted">
        Loading…
      </div>
    );
  }

  if (!isSignedIn) return <Navigate to="/login" replace />;

  const updateAssetStatuses = (
    assetIds: string[],
    newStatus: AssetStatus,
    clearData = false
  ) => {
    setAssets(prev =>
      prev.map(a => {
        if (!assetIds.includes(a.id)) return a;
        const updated = { ...a, status: newStatus };
        if (clearData) {
          delete updated.rentedByUserId;
          delete updated.returnDate;
        }
        return updated;
      })
    );
  };

  const tabProps: AdminTabProps = {
    users,
    assets,
    assetTypes,
    productGroups,
    setAssets,
    setAssetTypes,
    setProductGroups,
    updateAssetStatuses,
  };

  // Role is set via Clerk's publicMetadata: { role: 'admin' | 'customer' }
  const isAdmin = (user.publicMetadata?.role as string) === 'admin';

  return (
    <div className="container mx-auto p-6">
      {isAdmin
        ? <AdminDashboard {...tabProps} />
        : <CustomerDashboard />
      }
    </div>
  );
};

export default Dashboard;
