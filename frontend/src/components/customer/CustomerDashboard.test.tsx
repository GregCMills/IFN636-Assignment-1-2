import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomerDashboard from './CustomerDashboard';
import type { CustomerTabProps } from '../../types/assets';

// ── Fixtures ─────────────────────────────────────────────────────────────────

const productGroups = [{ id: 'g1', name: 'Laptops' }];
const assetTypes    = [{ id: 't1', groupId: 'g1', name: 'MacBook Air M2' }];
const assets        = [
  { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Available' as const },
];

const makeProps = (overrides: Partial<CustomerTabProps> = {}): CustomerTabProps => ({
  assets,
  assetTypes,
  productGroups,
  requestRental:       vi.fn().mockResolvedValue(undefined),
  updateAssetStatuses: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('CustomerDashboard — rendering', () => {
  it('renders the "Customer Dashboard" heading', () => {
    render(<CustomerDashboard {...makeProps()} />);
    expect(screen.getByRole('heading', { name: /customer dashboard/i })).toBeInTheDocument();
  });

  it('renders Browse, My Rentals, and Pending tab buttons', () => {
    render(<CustomerDashboard {...makeProps()} />);
    expect(screen.getByRole('button', { name: /browse/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /my rentals/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pending/i })).toBeInTheDocument();
  });

  it('shows the Browse tab content (catalogue) by default', () => {
    render(<CustomerDashboard {...makeProps()} />);
    // BrowseTab renders the product group heading
    expect(screen.getByRole('heading', { name: 'Laptops' })).toBeInTheDocument();
  });
});

// ── Tab switching ─────────────────────────────────────────────────────────────

describe('CustomerDashboard — tab switching', () => {
  it('switching to "My Rentals" hides the catalogue and shows the coming-soon placeholder', async () => {
    const user = userEvent.setup();
    render(<CustomerDashboard {...makeProps()} />);
    await user.click(screen.getByRole('button', { name: /my rentals/i }));

    expect(screen.queryByRole('heading', { name: 'Laptops' })).not.toBeInTheDocument();
    expect(screen.getByText('This tab will be available soon.')).toBeInTheDocument();
  });

  it('switching to "Pending" hides the catalogue and shows the coming-soon placeholder', async () => {
    const user = userEvent.setup();
    render(<CustomerDashboard {...makeProps()} />);
    await user.click(screen.getByRole('button', { name: /^pending$/i }));

    expect(screen.queryByRole('heading', { name: 'Laptops' })).not.toBeInTheDocument();
    expect(screen.getByText('This tab will be available soon.')).toBeInTheDocument();
  });

  it('switching back to Browse restores the catalogue', async () => {
    const user = userEvent.setup();
    render(<CustomerDashboard {...makeProps()} />);
    await user.click(screen.getByRole('button', { name: /my rentals/i }));
    await user.click(screen.getByRole('button', { name: /browse/i }));

    expect(screen.getByRole('heading', { name: 'Laptops' })).toBeInTheDocument();
  });
});

// ── Props forwarding ──────────────────────────────────────────────────────────

describe('CustomerDashboard — props forwarding', () => {
  it('passes productGroups to BrowseTab so group headings are rendered', () => {
    const groups = [
      { id: 'g1', name: 'Cameras' },
      { id: 'g2', name: 'Audio' },
    ];
    const types = [
      { id: 't1', groupId: 'g1', name: 'Sony A7III' },
      { id: 't2', groupId: 'g2', name: 'Rode Wireless' },
    ];
    render(<CustomerDashboard {...makeProps({ productGroups: groups, assetTypes: types })} />);
    expect(screen.getByRole('heading', { name: 'Cameras' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Audio' })).toBeInTheDocument();
  });

  it('passes assets to BrowseTab so available counts are reflected', () => {
    const moreAssets = [
      { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Available' as const },
      { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Available' as const },
      { id: 'a3', typeId: 't1', name: 'Unit 003', status: 'Available' as const },
    ];
    render(<CustomerDashboard {...makeProps({ assets: moreAssets })} />);
    expect(screen.getByText('3 available')).toBeInTheDocument();
  });
});
