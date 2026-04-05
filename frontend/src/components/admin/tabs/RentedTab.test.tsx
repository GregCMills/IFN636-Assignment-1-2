import { render, screen } from '@testing-library/react';
import RentedTab from './RentedTab';
import type { AdminTabProps } from '../../../types/assets';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const assetTypes = [
  { id: 't1', groupId: 'g1', name: 'MacBook Air M2' },
  { id: 't2', groupId: 'g1', name: 'Sony Camera' },
];

const makeProps = (overrides: Partial<AdminTabProps> = {}): AdminTabProps => ({
  users:               [],
  assets:              [],
  assetTypes,
  productGroups:       [],
  updateAssetStatuses: vi.fn().mockResolvedValue(undefined),
  createProductGroup:  vi.fn().mockResolvedValue({ id: 'x', name: 'X' }),
  deleteProductGroup:  vi.fn().mockResolvedValue(undefined),
  createAssetType:     vi.fn().mockResolvedValue({ id: 'x', groupId: 'g1', name: 'X' }),
  deleteAssetType:     vi.fn().mockResolvedValue(undefined),
  createAsset:         vi.fn().mockResolvedValue({ id: 'x', typeId: 't1', name: 'X', status: 'Available' as const }),
  createAssets:        vi.fn().mockResolvedValue([]),
  deleteAsset:         vi.fn().mockResolvedValue(undefined),
  resetToSeedData:     vi.fn().mockResolvedValue({ skipped: [] }),
  ...overrides,
});

// ── Empty state ───────────────────────────────────────────────────────────────

describe('RentedTab — empty state', () => {
  it('shows "No Assets Currently Rented" when no assets are rented', () => {
    render(<RentedTab {...makeProps()} />);
    expect(screen.getByText(/no assets currently rented/i)).toBeInTheDocument();
  });

  it('does not show the empty state when there are rented assets', () => {
    render(<RentedTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: 'u1', rentedByUserName: 'Alice' }],
    })} />);
    expect(screen.queryByText(/no assets currently rented/i)).not.toBeInTheDocument();
  });

  it('ignores non-rented assets and shows the empty state', () => {
    render(<RentedTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Available' },
        { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Pending Rental', rentedByUserId: 'u1' },
      ],
    })} />);
    expect(screen.getByText(/no assets currently rented/i)).toBeInTheDocument();
  });
});

// ── User label ────────────────────────────────────────────────────────────────

describe('RentedTab — user label', () => {
  it('shows the full name when rentedByUserName is set', () => {
    render(<RentedTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: 'u1', rentedByUserName: 'Greg Mills' }],
    })} />);
    expect(screen.getByRole('heading', { name: 'Greg Mills' })).toBeInTheDocument();
  });

  it('falls back to email when name is absent', () => {
    render(<RentedTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: 'u1', rentedByUserEmail: 'alice@mail.com' }],
    })} />);
    expect(screen.getByRole('heading', { name: 'alice@mail.com' })).toBeInTheDocument();
  });

  it('falls back to the Clerk user ID when name and email are both absent', () => {
    render(<RentedTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: 'user_xyz' }],
    })} />);
    expect(screen.getByRole('heading', { name: 'user_xyz' })).toBeInTheDocument();
  });

  it('shows "Unknown User" when no user information is present on the asset', () => {
    render(<RentedTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented' }],
    })} />);
    expect(screen.getByRole('heading', { name: /unknown user/i })).toBeInTheDocument();
  });
});

// ── Content rendering ─────────────────────────────────────────────────────────

describe('RentedTab — content rendering', () => {
  it('shows the asset type name', () => {
    render(<RentedTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: 'u1' }],
    })} />);
    expect(screen.getByText('MacBook Air M2')).toBeInTheDocument();
  });

  it('shows the unit name inside the asset row', () => {
    render(<RentedTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: 'u1' }],
    })} />);
    expect(screen.getByText('Unit 001')).toBeInTheDocument();
  });

  it('shows the return date formatted as DD-MM-YYYY', () => {
    render(<RentedTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: 'u1', returnDate: '2026-08-20' }],
    })} />);
    expect(screen.getByText(/return by: 20-08-2026/i)).toBeInTheDocument();
  });

  it('does not show a return date chip when returnDate is absent', () => {
    render(<RentedTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: 'u1' }],
    })} />);
    expect(screen.queryByText(/return by/i)).not.toBeInTheDocument();
  });

  it('shows a unit count badge for each renter', () => {
    render(<RentedTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: 'u1' },
        { id: 'a2', typeId: 't2', name: 'Unit 001', status: 'Rented', rentedByUserId: 'u1' },
      ],
    })} />);
    expect(screen.getByText('2 units')).toBeInTheDocument();
  });

  it('uses "unit" (singular) in the badge when the renter has exactly one asset', () => {
    render(<RentedTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: 'u1' }],
    })} />);
    expect(screen.getByText('1 unit')).toBeInTheDocument();
  });

  it('groups assets from different users into separate sections', () => {
    render(<RentedTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: 'u1', rentedByUserName: 'Alice' },
        { id: 'a2', typeId: 't2', name: 'Unit 001', status: 'Rented', rentedByUserId: 'u2', rentedByUserName: 'Bob' },
      ],
    })} />);
    expect(screen.getByRole('heading', { name: 'Alice' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bob' })).toBeInTheDocument();
  });

  it('groups assets of the same type under a type heading within a user section', () => {
    render(<RentedTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: 'u1' },
        { id: 'a2', typeId: 't2', name: 'Unit 001', status: 'Rented', rentedByUserId: 'u1' },
      ],
    })} />);
    expect(screen.getByText('MacBook Air M2')).toBeInTheDocument();
    expect(screen.getByText('Sony Camera')).toBeInTheDocument();
  });
});

// ── Read-only (no actions) ────────────────────────────────────────────────────

describe('RentedTab — read-only', () => {
  it('renders no action buttons', () => {
    render(<RentedTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: 'u1', rentedByUserName: 'Alice' }],
    })} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
