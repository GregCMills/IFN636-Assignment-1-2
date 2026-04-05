import type { AppUser, ProductGroup, AssetType, Asset } from '../types/assets';

export const initialUsers: AppUser[] = [
  { id: 'u1', email: 'bob@mail.com', role: 'customer' },
  { id: 'u2', email: 'john@mail.com', role: 'customer' },
  { id: 'u3', email: 'sally@mail.com', role: 'admin' },
];

export const initialProductGroups: ProductGroup[] = [
  { id: 'g1', name: 'Laptops' },
  { id: 'g2', name: 'Projectors' },
  { id: 'g3', name: 'Cameras' },
  { id: 'g4', name: 'Audio' },
];

export const initialAssetTypes: AssetType[] = [
  { id: 't1', groupId: 'g1', name: 'MacBook Air M2' },
  { id: 't4', groupId: 'g1', name: 'Dell XPS 15' },
  { id: 't2', groupId: 'g2', name: 'Epson 4K Projector' },
  { id: 't3', groupId: 'g3', name: 'Sony A7III Camera' },
  { id: 't5', groupId: 'g4', name: 'Rode Wireless GO II' },
];

export const initialAssets: Asset[] = [
  { id: 'a1', typeId: 't1', status: 'Available', name: 'Unit 001' },
  { id: 'a2', typeId: 't1', status: 'Available', name: 'Unit 002' },
  { id: 'a8', typeId: 't4', status: 'Available', name: 'Unit 001' },
  { id: 'a3', typeId: 't1', status: 'Rented',    name: 'Unit 003', rentedByUserId: 'u1', returnDate: '2026-04-15' },
  { id: 'a4', typeId: 't2', status: 'Pending Rental', name: 'Unit 001', rentedByUserId: 'u2', returnDate: '2026-03-30' },
  { id: 'a5', typeId: 't2', status: 'Maintenance', name: 'Unit 002' },
  { id: 'a6', typeId: 't3', status: 'Available', name: 'Unit 001' },
  { id: 'a7', typeId: 't3', status: 'Pending Return', name: 'Unit 002', rentedByUserId: 'u1', returnDate: '2026-03-20' },
  { id: 'a9', typeId: 't5', status: 'Available', name: 'Mic Set 1' },
];
