import type React from 'react';

export type AssetStatus =
  | 'Available'
  | 'Rented'
  | 'Pending Rental'
  | 'Pending Return'
  | 'Maintenance';

export interface ProductGroup {
  id: string;
  name: string;
}

export interface AssetType {
  id: string;
  groupId: string;
  name: string;
}

export interface Asset {
  id: string;
  typeId: string;
  name: string;
  status: AssetStatus;
  rentedByUserId?: string;
  returnDate?: string;
}

export interface AppUser {
  id: string;
  email: string;
  role: 'admin' | 'customer';
}

/** Shared props passed to every admin tab component. */
export interface AdminTabProps {
  users: AppUser[];
  assets: Asset[];
  assetTypes: AssetType[];
  productGroups: ProductGroup[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  setAssetTypes: React.Dispatch<React.SetStateAction<AssetType[]>>;
  setProductGroups: React.Dispatch<React.SetStateAction<ProductGroup[]>>;
  updateAssetStatuses: (
    assetIds: string[],
    newStatus: AssetStatus,
    clearData?: boolean
  ) => void;
}
