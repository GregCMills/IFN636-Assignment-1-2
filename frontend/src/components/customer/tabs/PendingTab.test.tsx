import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PendingTab from './PendingTab';
import type { CustomerTabProps } from '../../../types/assets';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const CURRENT_USER_ID = 'u-current';
const OTHER_USER_ID   = 'u-other';

const productGroups = [
  { id: 'g1', name: 'Laptops' },
  { id: 'g2', name: 'Cameras' },
];

const assetTypes = [
  { id: 't1', groupId: 'g1', name: 'MacBook Air M2' },
  { id: 't2', groupId: 'g1', name: 'Dell XPS 15' },
  { id: 't3', groupId: 'g2', name: 'Sony A7III' },
];

const makeProps = (overrides: Partial<CustomerTabProps> = {}): CustomerTabProps => ({
  assets:              [],
  assetTypes,
  productGroups,
  currentUserId:       CURRENT_USER_ID,
  requestRental:       vi.fn().mockResolvedValue(undefined),
  updateAssetStatuses: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

// ── Empty states ──────────────────────────────────────────────────────────────

describe('PendingTab — empty states', () => {
  it('shows both section headings regardless of data', () => {
    render(<PendingTab {...makeProps()} />);
    expect(screen.getByText(/pending rentals/i)).toBeInTheDocument();
    expect(screen.getByText(/pending returns/i)).toBeInTheDocument();
  });

  it('shows "No pending rental requests." when there are no Pending Rental assets', () => {
    render(<PendingTab {...makeProps()} />);
    expect(screen.getByText('No pending rental requests.')).toBeInTheDocument();
  });

  it('shows "No pending return requests." when there are no Pending Return assets', () => {
    render(<PendingTab {...makeProps()} />);
    expect(screen.getByText('No pending return requests.')).toBeInTheDocument();
  });

  it('shows the rental empty state when Pending Rental assets belong to a different user', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: OTHER_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.getByText('No pending rental requests.')).toBeInTheDocument();
  });

  it('shows the return empty state when Pending Return assets belong to a different user', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Return', rentedByUserId: OTHER_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.getByText('No pending return requests.')).toBeInTheDocument();
  });

  it('does not show the rental empty state when the current user has a Pending Rental asset', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.queryByText('No pending rental requests.')).not.toBeInTheDocument();
  });

  it('does not show the return empty state when the current user has a Pending Return asset', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Return', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.queryByText('No pending return requests.')).not.toBeInTheDocument();
  });
});

// ── Content rendering — Pending Rentals ──────────────────────────────────────

describe('PendingTab — Pending Rentals content', () => {
  it('shows the return date formatted as DD-MM-YYYY in the request header', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-15' },
      ],
    })} />);
    expect(screen.getByText(/return by: 15-06-2026/i)).toBeInTheDocument();
  });

  it('shows the product group name', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.getByText('Laptops')).toBeInTheDocument();
  });

  it('shows the asset type name', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.getByText('MacBook Air M2')).toBeInTheDocument();
  });

  it('shows the unit name in the asset row', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 007', status: 'Pending Rental', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.getByText('Unit 007')).toBeInTheDocument();
  });

  it('shows "Unknown Product" when typeId has no matching asset type', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 'unknown', name: 'Mystery Unit', status: 'Pending Rental', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.getByText('Unknown Product')).toBeInTheDocument();
  });

  it('shows "Uncategorised" when the type has no matching product group', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
      productGroups: [],
    })} />);
    expect(screen.getByText('Uncategorised')).toBeInTheDocument();
  });

  it('groups assets with the same return date under a single request header', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
        { id: 'a2', typeId: 't2', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.getAllByText(/return by: 01-06-2026/i)).toHaveLength(1);
  });

  it('creates separate request headers for assets with different return dates', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
        { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Pending Rental', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-07-15' },
      ],
    })} />);
    expect(screen.getByText(/return by: 01-06-2026/i)).toBeInTheDocument();
    expect(screen.getByText(/return by: 15-07-2026/i)).toBeInTheDocument();
  });

  it('groups assets by product group within a request', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
        { id: 'a2', typeId: 't3', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.getByText('Laptops')).toBeInTheDocument();
    expect(screen.getByText('Cameras')).toBeInTheDocument();
  });

  it('groups assets by type within a product group', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
        { id: 'a2', typeId: 't2', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.getByText('MacBook Air M2')).toBeInTheDocument();
    expect(screen.getByText('Dell XPS 15')).toBeInTheDocument();
  });

  it('shows "No Return Date" as the header label when returnDate is absent', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: CURRENT_USER_ID },
      ],
    })} />);
    expect(screen.getByText(/return by: no return date/i)).toBeInTheDocument();
  });

  it('only renders assets belonging to the current user', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'My Unit',    status: 'Pending Rental', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
        { id: 'a2', typeId: 't1', name: 'Other Unit', status: 'Pending Rental', rentedByUserId: OTHER_USER_ID,   returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.getByText('My Unit')).toBeInTheDocument();
    expect(screen.queryByText('Other Unit')).not.toBeInTheDocument();
  });

  it('does not render a Cancel Return button for Pending Rental assets', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.queryByRole('button', { name: /cancel return/i })).not.toBeInTheDocument();
  });
});

// ── Content rendering — Pending Returns ──────────────────────────────────────

describe('PendingTab — Pending Returns content', () => {
  it('shows the return date formatted as DD-MM-YYYY in the request header', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Return', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-08-20' },
      ],
    })} />);
    expect(screen.getByText(/return by: 20-08-2026/i)).toBeInTheDocument();
  });

  it('shows the product group and asset type name', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Return', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.getByText('Laptops')).toBeInTheDocument();
    expect(screen.getByText('MacBook Air M2')).toBeInTheDocument();
  });

  it('shows the unit name in the asset row', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 042', status: 'Pending Return', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.getByText('Unit 042')).toBeInTheDocument();
  });

  it('renders a Cancel Return button for each Pending Return asset', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Return', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
        { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Pending Return', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.getAllByRole('button', { name: /cancel return/i })).toHaveLength(2);
  });

  it('only renders assets belonging to the current user', () => {
    render(<PendingTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'My Unit',    status: 'Pending Return', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
        { id: 'a2', typeId: 't1', name: 'Other Unit', status: 'Pending Return', rentedByUserId: OTHER_USER_ID,   returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.getByText('My Unit')).toBeInTheDocument();
    expect(screen.queryByText('Other Unit')).not.toBeInTheDocument();
  });
});

// ── Cancel Return action ──────────────────────────────────────────────────────

describe('PendingTab — Cancel Return action', () => {
  it('calls updateAssetStatuses with the asset id and "Rented" when clicked', async () => {
    const user = userEvent.setup();
    const updateAssetStatuses = vi.fn().mockResolvedValue(undefined);
    render(<PendingTab {...makeProps({
      updateAssetStatuses,
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Return', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);

    await user.click(screen.getByRole('button', { name: /cancel return/i }));

    await waitFor(() => expect(updateAssetStatuses).toHaveBeenCalledWith(['a1'], 'Rented'));
  });

  it('calls updateAssetStatuses with the correct id when multiple assets are shown', async () => {
    const user = userEvent.setup();
    const updateAssetStatuses = vi.fn().mockResolvedValue(undefined);
    render(<PendingTab {...makeProps({
      updateAssetStatuses,
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Return', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
        { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Pending Return', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);

    const buttons = screen.getAllByRole('button', { name: /cancel return/i });
    await user.click(buttons[1]);

    await waitFor(() => expect(updateAssetStatuses).toHaveBeenCalledWith(['a2'], 'Rented'));
  });

  it('disables all Cancel Return buttons while a submission is in progress', async () => {
    const user = userEvent.setup();
    let resolveUpdate!: () => void;
    const updateAssetStatuses = vi.fn().mockImplementation(
      () => new Promise<void>(resolve => { resolveUpdate = resolve; }),
    );
    render(<PendingTab {...makeProps({
      updateAssetStatuses,
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Return', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
        { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Pending Return', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);

    const buttons = screen.getAllByRole('button', { name: /cancel return/i });
    await user.click(buttons[0]);

    for (const btn of screen.getAllByRole('button', { name: /cancel return/i })) {
      expect(btn).toBeDisabled();
    }

    resolveUpdate();
    await waitFor(() => expect(screen.getAllByRole('button', { name: /cancel return/i })[0]).toBeEnabled());
  });
});

// ── Error handling ────────────────────────────────────────────────────────────

describe('PendingTab — error handling', () => {
  it('displays the server error message when updateAssetStatuses rejects with an API error', async () => {
    const user = userEvent.setup();
    const updateAssetStatuses = vi.fn().mockRejectedValue({
      response: { data: { message: 'Asset locked' } },
    });
    render(<PendingTab {...makeProps({
      updateAssetStatuses,
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Return', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);

    await user.click(screen.getByRole('button', { name: /cancel return/i }));

    await waitFor(() => expect(screen.getByText('Asset locked')).toBeInTheDocument());
  });

  it('shows a generic error message when the rejection has no API message', async () => {
    const user = userEvent.setup();
    const updateAssetStatuses = vi.fn().mockRejectedValue(new Error('Network failure'));
    render(<PendingTab {...makeProps({
      updateAssetStatuses,
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Return', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);

    await user.click(screen.getByRole('button', { name: /cancel return/i }));

    await waitFor(() => expect(screen.getByText(/an error occurred/i)).toBeInTheDocument());
  });

  it('clears the error banner after a subsequent successful submission', async () => {
    const user = userEvent.setup();
    const updateAssetStatuses = vi.fn()
      .mockRejectedValueOnce(new Error('Network failure'))
      .mockResolvedValueOnce(undefined);

    render(<PendingTab {...makeProps({
      updateAssetStatuses,
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Return', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);

    const btn = screen.getByRole('button', { name: /cancel return/i });

    await user.click(btn);
    await waitFor(() => expect(screen.getByText(/an error occurred/i)).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /cancel return/i }));
    await waitFor(() => expect(screen.queryByText(/an error occurred/i)).not.toBeInTheDocument());
  });
});
