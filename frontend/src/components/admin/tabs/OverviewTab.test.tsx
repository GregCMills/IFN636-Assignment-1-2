import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OverviewTab from './OverviewTab';
import type { AdminTabProps } from '../../../types/assets';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const productGroups = [
  { id: 'g1', name: 'Laptops' },
  { id: 'g2', name: 'Cameras' },
];

const assetTypes = [
  { id: 't1', groupId: 'g1', name: 'MacBook Air M2' },
  { id: 't2', groupId: 'g1', name: 'Dell XPS 15' },
  { id: 't3', groupId: 'g2', name: 'Sony A7III Camera' },
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
  ...overrides,
});

// ── Filter dropdown ───────────────────────────────────────────────────────────

describe('OverviewTab — filter dropdown', () => {
  it('renders a status filter dropdown', () => {
    render(<OverviewTab {...makeProps()} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('defaults the filter to "Available"', () => {
    render(<OverviewTab {...makeProps()} />);
    expect(screen.getByRole('combobox')).toHaveValue('Available');
  });

  it('lists all five statuses as options', () => {
    render(<OverviewTab {...makeProps()} />);
    const options = screen.getAllByRole('option').map(o => o.textContent);
    expect(options).toEqual([
      'Available',
      'Rented',
      'Pending Rental',
      'Pending Return',
      'Maintenance',
    ]);
  });
});

// ── Product group headings ────────────────────────────────────────────────────

describe('OverviewTab — product group headings', () => {
  it('renders a heading for each group that has asset types', () => {
    render(<OverviewTab {...makeProps()} />);
    expect(screen.getByRole('heading', { name: 'Laptops' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cameras' })).toBeInTheDocument();
  });

  it('does not render a heading for a group that has no asset types', () => {
    render(<OverviewTab {...makeProps({ productGroups: [...productGroups, { id: 'g3', name: 'Audio' }] })} />);
    expect(screen.queryByRole('heading', { name: 'Audio' })).not.toBeInTheDocument();
  });

  it('renders all type names within their group', () => {
    render(<OverviewTab {...makeProps()} />);
    expect(screen.getByText('MacBook Air M2')).toBeInTheDocument();
    expect(screen.getByText('Dell XPS 15')).toBeInTheDocument();
    expect(screen.getByText('Sony A7III Camera')).toBeInTheDocument();
  });
});

// ── Empty state ───────────────────────────────────────────────────────────────

describe('OverviewTab — empty state', () => {
  it('shows "No Products Found" when there are no asset types in any group', () => {
    render(<OverviewTab {...makeProps({ assetTypes: [] })} />);
    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });

  it('does not show the empty state when there is at least one asset type', () => {
    render(<OverviewTab {...makeProps()} />);
    expect(screen.queryByText(/no products found/i)).not.toBeInTheDocument();
  });

  it('shows the empty state when there are no product groups at all', () => {
    render(<OverviewTab {...makeProps({ productGroups: [], assetTypes: [] })} />);
    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });
});

// ── Count display ─────────────────────────────────────────────────────────────

describe('OverviewTab — count display', () => {
  it('shows 0 for a type with no assets matching the default filter', () => {
    render(<OverviewTab {...makeProps()} />);
    const counts = screen.getAllByText('0');
    expect(counts.length).toBeGreaterThan(0);
  });

  it('shows the correct count of available assets for a type', () => {
    render(<OverviewTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Available' },
        { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Available' },
        { id: 'a3', typeId: 't1', name: 'Unit 003', status: 'Rented', rentedByUserId: 'u1' },
      ],
    })} />);
    // MacBook Air M2 has 2 available
    const macbookCard = screen.getByText('MacBook Air M2').closest('div');
    expect(macbookCard).toHaveTextContent('2');
  });

  it('does not count assets from a different type towards another type\'s count', () => {
    render(<OverviewTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Available' },
        { id: 'a2', typeId: 't2', name: 'Unit 001', status: 'Available' },
        { id: 'a3', typeId: 't2', name: 'Unit 002', status: 'Available' },
      ],
    })} />);
    const macbookCard = screen.getByText('MacBook Air M2').closest('div');
    const dellCard    = screen.getByText('Dell XPS 15').closest('div');
    expect(macbookCard).toHaveTextContent('1');
    expect(dellCard).toHaveTextContent('2');
  });

  it('does not count assets with a different status towards the displayed count', () => {
    render(<OverviewTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: 'u1' },
        { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Maintenance' },
      ],
    })} />);
    // Default filter is Available, so MacBook Air M2 should show 0
    const macbookCard = screen.getByText('MacBook Air M2').closest('div');
    expect(macbookCard).toHaveTextContent('0');
  });
});

// ── Status filter interaction ─────────────────────────────────────────────────

describe('OverviewTab — status filter interaction', () => {
  it('updates counts when the filter is changed to "Rented"', async () => {
    const user = userEvent.setup();
    render(<OverviewTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Available' },
        { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Rented', rentedByUserId: 'u1' },
        { id: 'a3', typeId: 't1', name: 'Unit 003', status: 'Rented', rentedByUserId: 'u2' },
      ],
    })} />);

    await user.selectOptions(screen.getByRole('combobox'), 'Rented');

    const macbookCard = screen.getByText('MacBook Air M2').closest('div');
    expect(macbookCard).toHaveTextContent('2');
  });

  it('updates counts when the filter is changed to "Maintenance"', async () => {
    const user = userEvent.setup();
    render(<OverviewTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't3', name: 'Unit 001', status: 'Maintenance' },
        { id: 'a2', typeId: 't3', name: 'Unit 002', status: 'Available' },
      ],
    })} />);

    await user.selectOptions(screen.getByRole('combobox'), 'Maintenance');

    const sonyCard = screen.getByText('Sony A7III Camera').closest('div');
    expect(sonyCard).toHaveTextContent('1');
  });

  it('shows 0 for all types when no assets match the newly selected status', async () => {
    const user = userEvent.setup();
    render(<OverviewTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Available' },
      ],
    })} />);

    await user.selectOptions(screen.getByRole('combobox'), 'Maintenance');

    screen.getAllByText('0').forEach(el => expect(el).toBeInTheDocument());
  });

  it('updates the dropdown value when a new status is selected', async () => {
    const user = userEvent.setup();
    render(<OverviewTab {...makeProps()} />);

    await user.selectOptions(screen.getByRole('combobox'), 'Pending Rental');

    expect(screen.getByRole('combobox')).toHaveValue('Pending Rental');
  });
});
