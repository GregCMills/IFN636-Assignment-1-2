import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MaintenanceTab from './MaintenanceTab';
import type { AdminTabProps } from '../../../types/assets';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const assetTypes = [
  { id: 't1', groupId: 'g1', name: 'MacBook Air M2' },
  { id: 't2', groupId: 'g2', name: 'Sony Camera' },
];

const productGroups = [
  { id: 'g1', name: 'Laptops' },
  { id: 'g2', name: 'Cameras' },
];

const makeProps = (overrides: Partial<AdminTabProps> = {}): AdminTabProps => ({
  users:               [],
  assets:              [],
  assetTypes,
  productGroups,
  updateAssetStatuses: vi.fn().mockResolvedValue(undefined),
  createProductGroup:  vi.fn().mockResolvedValue({ id: 'x', name: 'X' }),
  deleteProductGroup:  vi.fn().mockResolvedValue(undefined),
  createAssetType:     vi.fn().mockResolvedValue({ id: 'x', groupId: 'g1', name: 'X' }),
  deleteAssetType:     vi.fn().mockResolvedValue(undefined),
  createAsset:         vi.fn().mockResolvedValue({ id: 'x', typeId: 't1', name: 'X', status: 'Available' as const }),
  createAssets:        vi.fn().mockResolvedValue([]),
  deleteAsset:         vi.fn().mockResolvedValue(undefined),
  uploadPhoto:         vi.fn().mockResolvedValue(undefined),
  deletePhoto:         vi.fn().mockResolvedValue(undefined),
  updateEntity:        vi.fn().mockResolvedValue({ name: 'X' }),
  ...overrides,
});

// ── Empty state ───────────────────────────────────────────────────────────────

describe('MaintenanceTab — empty state', () => {
  it('shows "No Assets in Maintenance" when there are no maintenance assets', () => {
    render(<MaintenanceTab {...makeProps()} />);
    expect(screen.getByText(/no assets in maintenance/i)).toBeInTheDocument();
  });

  it('does not show the empty state when there are maintenance assets', () => {
    render(<MaintenanceTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Maintenance' }],
    })} />);
    expect(screen.queryByText(/no assets in maintenance/i)).not.toBeInTheDocument();
  });

  it('ignores non-maintenance assets and shows the empty state', () => {
    render(<MaintenanceTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Available' },
        { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Rented', rentedByUserId: 'u1' },
      ],
    })} />);
    expect(screen.getByText(/no assets in maintenance/i)).toBeInTheDocument();
  });
});

// ── Content rendering ─────────────────────────────────────────────────────────

describe('MaintenanceTab — content rendering', () => {
  it('shows the asset type name as a section heading', () => {
    render(<MaintenanceTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Maintenance' }],
    })} />);
    expect(screen.getByText('MacBook Air M2')).toBeInTheDocument();
  });

  it('shows the product group name as the outer section heading', () => {
    render(<MaintenanceTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Maintenance' }],
    })} />);
    expect(screen.getByText('Laptops')).toBeInTheDocument();
  });

  it('shows the unit name inside the asset row', () => {
    render(<MaintenanceTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Maintenance' }],
    })} />);
    expect(screen.getByText('Unit 001')).toBeInTheDocument();
  });

  it('shows a unit count badge for each type section', () => {
    render(<MaintenanceTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Maintenance' },
        { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Maintenance' },
      ],
    })} />);
    // "2 units" appears at both the product-type (group) level and the asset-type level
    expect(screen.getAllByText('2 units').length).toBeGreaterThanOrEqual(1);
  });

  it('uses "unit" (singular) in the badge when there is exactly one asset', () => {
    render(<MaintenanceTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Maintenance' }],
    })} />);
    // "1 unit" appears at both the product-type (group) level and the asset-type level
    expect(screen.getAllByText('1 unit').length).toBeGreaterThanOrEqual(1);
  });

  it('groups assets of the same type under one section heading', () => {
    render(<MaintenanceTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Maintenance' },
        { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Maintenance' },
      ],
    })} />);
    expect(screen.getAllByText('MacBook Air M2')).toHaveLength(1);
  });

  it('creates separate sections for different asset types', () => {
    render(<MaintenanceTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Maintenance' },
        { id: 'a2', typeId: 't2', name: 'Unit 001', status: 'Maintenance' },
      ],
    })} />);
    expect(screen.getByText('MacBook Air M2')).toBeInTheDocument();
    expect(screen.getByText('Sony Camera')).toBeInTheDocument();
  });
});

// ── Bulk action visibility ────────────────────────────────────────────────────

describe('MaintenanceTab — bulk action button', () => {
  it('does not show "Mark All Available" when a type has only one unit', () => {
    render(<MaintenanceTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Maintenance' }],
    })} />);
    expect(screen.queryByRole('button', { name: /mark all available/i })).not.toBeInTheDocument();
  });

  it('shows "Mark All Available" when a type has more than one unit', () => {
    render(<MaintenanceTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Maintenance' },
        { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Maintenance' },
      ],
    })} />);
    // Appears at both the product-type level and the asset-type level
    expect(screen.getAllByRole('button', { name: /mark all available/i }).length).toBeGreaterThanOrEqual(1);
  });
});

// ── Interactions ──────────────────────────────────────────────────────────────

describe('MaintenanceTab — interactions', () => {
  it('calls updateAssetStatuses with the asset id and "Available" when "Mark Available" is clicked', async () => {
    const updateAssetStatuses = vi.fn().mockResolvedValue(undefined);
    render(<MaintenanceTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Maintenance' }],
      updateAssetStatuses,
    })} />);

    await userEvent.click(screen.getByRole('button', { name: /mark available/i }));

    await waitFor(() => {
      expect(updateAssetStatuses).toHaveBeenCalledWith(['a1'], 'Available');
    });
  });

  it('calls updateAssetStatuses with all ids when "Mark All Available" is clicked', async () => {
    const updateAssetStatuses = vi.fn().mockResolvedValue(undefined);
    render(<MaintenanceTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Maintenance' },
        { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Maintenance' },
      ],
      updateAssetStatuses,
    })} />);

    // Click the first "Mark All Available" (product-type level)
    await userEvent.click(screen.getAllByRole('button', { name: /mark all available/i })[0]);

    await waitFor(() => {
      expect(updateAssetStatuses).toHaveBeenCalledWith(['a1', 'a2'], 'Available');
    });
  });

  it('disables buttons while an action is submitting', async () => {
    let resolve!: () => void;
    const updateAssetStatuses = vi.fn().mockReturnValue(new Promise<void>(r => { resolve = r; }));

    render(<MaintenanceTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Maintenance' }],
      updateAssetStatuses,
    })} />);

    const btn = screen.getByRole('button', { name: /mark available/i });
    await userEvent.click(btn);

    expect(btn).toBeDisabled();
    resolve();
    await waitFor(() => expect(btn).not.toBeDisabled());
  });
});

// ── API error ─────────────────────────────────────────────────────────────────

describe('MaintenanceTab — API error', () => {
  it('displays an error message when updateAssetStatuses rejects', async () => {
    const updateAssetStatuses = vi.fn().mockRejectedValue({
      response: { data: { message: 'Server error' } },
    });

    render(<MaintenanceTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Maintenance' }],
      updateAssetStatuses,
    })} />);

    await userEvent.click(screen.getByRole('button', { name: /mark available/i }));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('shows a generic error message when no response data is available', async () => {
    const updateAssetStatuses = vi.fn().mockRejectedValue(new Error('Network error'));

    render(<MaintenanceTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Maintenance' }],
      updateAssetStatuses,
    })} />);

    await userEvent.click(screen.getByRole('button', { name: /mark available/i }));

    await waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
    });
  });
});
