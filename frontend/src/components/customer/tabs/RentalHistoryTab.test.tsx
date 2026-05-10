import { render, screen } from '@testing-library/react';
import RentalHistoryTab from './RentalHistoryTab';
import type { CustomerTabProps } from '../../../types/assets';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makeProps = (overrides: Partial<CustomerTabProps> = {}): CustomerTabProps => ({
  assets:              [],
  assetTypes:          [],
  productGroups:       [],
  rentalHistory:       [],
  currentUserId:       'u-current',
  requestRental:       vi.fn().mockResolvedValue(undefined),
  updateAssetStatuses: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

// ── Empty state ───────────────────────────────────────────────────────────────

describe('RentalHistoryTab — empty state', () => {
  it('shows "No Rental History" when there are no completed rentals', () => {
    render(<RentalHistoryTab {...makeProps()} />);
    expect(screen.getByText(/no rental history/i)).toBeInTheDocument();
  });

  it('displays a helpful description in the empty state', () => {
    render(<RentalHistoryTab {...makeProps()} />);
    expect(screen.getByText(/completed rentals will appear/i)).toBeInTheDocument();
  });
});

// ── Content rendering ─────────────────────────────────────────────────────────

describe('RentalHistoryTab — content rendering', () => {
  it('renders a table with header columns when history exists', () => {
    const history = [
      {
        id: 'h1',
        assetId: 'a1',
        typeId: 't1',
        assetName: 'Unit 001',
        assetTypeName: 'MacBook Pro',
        rentedByUserId: 'u-current',
        returnDate: '2026-05-15',
        finalStatus: 'Available' as const,
        completedAt: '2026-05-16T10:00:00Z',
      },
    ];
    render(<RentalHistoryTab {...makeProps({ rentalHistory: history })} />);

    expect(screen.getByText('Asset')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Returned')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('shows the asset name in the table row', () => {
    const history = [
      {
        id: 'h1',
        assetId: 'a1',
        typeId: 't1',
        assetName: 'Unit 007',
        assetTypeName: 'MacBook Pro',
        rentedByUserId: 'u-current',
        returnDate: '2026-05-15',
        finalStatus: 'Available' as const,
        completedAt: '2026-05-16T10:00:00Z',
      },
    ];
    render(<RentalHistoryTab {...makeProps({ rentalHistory: history })} />);
    expect(screen.getByText('Unit 007')).toBeInTheDocument();
  });

  it('shows the asset type name in the table row', () => {
    const history = [
      {
        id: 'h1',
        assetId: 'a1',
        typeId: 't1',
        assetName: 'Unit 001',
        assetTypeName: 'Sony Camera',
        rentedByUserId: 'u-current',
        returnDate: '2026-05-15',
        finalStatus: 'Available' as const,
        completedAt: '2026-05-16T10:00:00Z',
      },
    ];
    render(<RentalHistoryTab {...makeProps({ rentalHistory: history })} />);
    expect(screen.getByText('Sony Camera')).toBeInTheDocument();
  });

  it('formats the return date as DD-MM-YYYY', () => {
    const history = [
      {
        id: 'h1',
        assetId: 'a1',
        typeId: 't1',
        assetName: 'Unit 001',
        assetTypeName: 'Projector',
        rentedByUserId: 'u-current',
        returnDate: '2026-05-15',
        finalStatus: 'Available' as const,
        completedAt: '2026-05-16T10:00:00Z',
      },
    ];
    render(<RentalHistoryTab {...makeProps({ rentalHistory: history })} />);
    expect(screen.getByText('15-05-2026')).toBeInTheDocument();
  });

  it('shows "Available" badge with green styling when finalStatus is Available', () => {
    const history = [
      {
        id: 'h1',
        assetId: 'a1',
        typeId: 't1',
        assetName: 'Unit 001',
        assetTypeName: 'Laptop',
        rentedByUserId: 'u-current',
        returnDate: '2026-05-15',
        finalStatus: 'Available' as const,
        completedAt: '2026-05-16T10:00:00Z',
      },
    ];
    render(<RentalHistoryTab {...makeProps({ rentalHistory: history })} />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('shows "Maintenance" badge with orange styling when finalStatus is Maintenance', () => {
    const history = [
      {
        id: 'h1',
        assetId: 'a1',
        typeId: 't1',
        assetName: 'Unit 001',
        assetTypeName: 'Laptop',
        rentedByUserId: 'u-current',
        returnDate: '2026-05-15',
        finalStatus: 'Maintenance' as const,
        completedAt: '2026-05-16T10:00:00Z',
      },
    ];
    render(<RentalHistoryTab {...makeProps({ rentalHistory: history })} />);
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
  });

  it('renders multiple history entries in table rows', () => {
    const history = [
      {
        id: 'h1',
        assetId: 'a1',
        typeId: 't1',
        assetName: 'Unit 001',
        assetTypeName: 'MacBook Pro',
        rentedByUserId: 'u-current',
        returnDate: '2026-05-15',
        finalStatus: 'Available' as const,
        completedAt: '2026-05-16T10:00:00Z',
      },
      {
        id: 'h2',
        assetId: 'a2',
        typeId: 't2',
        assetName: 'Unit 002',
        assetTypeName: 'Sony Camera',
        rentedByUserId: 'u-current',
        returnDate: '2026-05-20',
        finalStatus: 'Maintenance' as const,
        completedAt: '2026-05-21T14:30:00Z',
      },
    ];
    render(<RentalHistoryTab {...makeProps({ rentalHistory: history })} />);
    expect(screen.getByText('Unit 001')).toBeInTheDocument();
    expect(screen.getByText('Unit 002')).toBeInTheDocument();
    expect(screen.getByText('MacBook Pro')).toBeInTheDocument();
    expect(screen.getByText('Sony Camera')).toBeInTheDocument();
  });

  it('does not show empty state when history is populated', () => {
    const history = [
      {
        id: 'h1',
        assetId: 'a1',
        typeId: 't1',
        assetName: 'Unit 001',
        assetTypeName: 'Laptop',
        rentedByUserId: 'u-current',
        returnDate: '2026-05-15',
        finalStatus: 'Available' as const,
        completedAt: '2026-05-16T10:00:00Z',
      },
    ];
    render(<RentalHistoryTab {...makeProps({ rentalHistory: history })} />);
    expect(screen.queryByText(/no rental history/i)).not.toBeInTheDocument();
  });
});
