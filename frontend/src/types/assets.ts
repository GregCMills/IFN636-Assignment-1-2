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
  // Async actions — call the API and update parent state
  updateAssetStatuses:  (ids: string[], status: AssetStatus, clearData?: boolean) => Promise<void>;
  createProductGroup:   (name: string) => Promise<ProductGroup>;
  deleteProductGroup:   (id: string) => Promise<void>;
  createAssetType:      (groupId: string, name: string) => Promise<AssetType>;
  deleteAssetType:      (id: string) => Promise<void>;
  createAsset:          (typeId: string, name: string) => Promise<Asset>;
  createAssets:         (typeId: string, names: string[]) => Promise<Asset[]>;
  deleteAsset:          (id: string) => Promise<void>;
}
