import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PendingRentalTab from './PendingRentalTab';
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
  uploadPhoto:         vi.fn().mockResolvedValue(undefined),
  deletePhoto:         vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

// ── Empty state ───────────────────────────────────────────────────────────────

describe('PendingRentalTab — empty state', () => {
  it('shows "No Pending Rental Requests" when there are no pending assets', () => {
    render(<PendingRentalTab {...makeProps()} />);
    expect(screen.getByText(/no pending rental requests/i)).toBeInTheDocument();
  });

  it('does not show the empty state when there are pending assets', () => {
    render(<PendingRentalTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'u1', rentedByUserName: 'Bob' }],
    })} />);
    expect(screen.queryByText(/no pending rental requests/i)).not.toBeInTheDocument();
  });

  it('ignores non-pending assets and shows the empty state', () => {
    render(<PendingRentalTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Rented Unit', status: 'Rented', rentedByUserId: 'u1' },
        { id: 'a2', typeId: 't1', name: 'Available Unit', status: 'Available' },
      ],
    })} />);
    expect(screen.getByText(/no pending rental requests/i)).toBeInTheDocument();
  });
});

// ── User label ────────────────────────────────────────────────────────────────

describe('PendingRentalTab — user label', () => {
  it('shows the full name when rentedByUserName is set', () => {
    render(<PendingRentalTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'u1', rentedByUserName: 'Greg Mills' }],
    })} />);
    expect(screen.getByRole('heading', { name: 'Greg Mills' })).toBeInTheDocument();
  });

  it('falls back to email when name is absent', () => {
    render(<PendingRentalTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'u1', rentedByUserEmail: 'bob@mail.com' }],
    })} />);
    expect(screen.getByRole('heading', { name: 'bob@mail.com' })).toBeInTheDocument();
  });

  it('falls back to the Clerk user ID when name and email are both absent', () => {
    render(<PendingRentalTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'user_abc123' }],
    })} />);
    expect(screen.getByRole('heading', { name: 'user_abc123' })).toBeInTheDocument();
  });

  it('shows "Unknown User" when no user information is present on the asset', () => {
    render(<PendingRentalTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental' }],
    })} />);
    expect(screen.getByRole('heading', { name: /unknown user/i })).toBeInTheDocument();
  });
});

// ── Content rendering ─────────────────────────────────────────────────────────

describe('PendingRentalTab — content rendering', () => {
  it('shows the asset type name', () => {
    render(<PendingRentalTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'u1' }],
    })} />);
    expect(screen.getByText('MacBook Air M2')).toBeInTheDocument();
  });

  it('shows the unit name inside the asset row', () => {
    render(<PendingRentalTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'u1' }],
    })} />);
    expect(screen.getByText('Unit 001')).toBeInTheDocument();
  });

  it('shows the return date formatted as DD-MM-YYYY', () => {
    render(<PendingRentalTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'u1', returnDate: '2026-06-15' }],
    })} />);
    expect(screen.getByText(/return: 15-06-2026/i)).toBeInTheDocument();
  });

  it('does not show a return date chip when returnDate is absent', () => {
    render(<PendingRentalTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'u1' }],
    })} />);
    expect(screen.queryByText(/return:/i)).not.toBeInTheDocument();
  });

  it('groups assets from different users into separate sections', () => {
    render(<PendingRentalTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'u1', rentedByUserName: 'Alice' },
        { id: 'a2', typeId: 't2', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'u2', rentedByUserName: 'Bob' },
      ],
    })} />);
    expect(screen.getByRole('heading', { name: 'Alice' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bob' })).toBeInTheDocument();
  });
});

// ── Type-level bulk buttons ───────────────────────────────────────────────────

describe('PendingRentalTab — type-level bulk buttons', () => {
  it('shows type-level approve/deny buttons when a user has more than one unit of the same type', () => {
    render(<PendingRentalTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'u1' },
        { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Pending Rental', rentedByUserId: 'u1' },
      ],
    })} />);
    expect(screen.getByRole('button', { name: /approve macbook air m2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /deny macbook air m2/i })).toBeInTheDocument();
  });

  it('hides type-level buttons when there is only one unit of a type', () => {
    render(<PendingRentalTab {...makeProps({
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'u1' }],
    })} />);
    expect(screen.queryByRole('button', { name: /approve macbook air m2/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /deny macbook air m2/i })).not.toBeInTheDocument();
  });
});

// ── Approve actions ───────────────────────────────────────────────────────────

describe('PendingRentalTab — approve actions', () => {
  it('item-level Approve calls updateAssetStatuses with the single id and "Rented"', async () => {
    const user = userEvent.setup();
    const updateAssetStatuses = vi.fn().mockResolvedValue(undefined);
    render(<PendingRentalTab {...makeProps({
      updateAssetStatuses,
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'u1' }],
    })} />);

    await user.click(screen.getByRole('button', { name: /^approve$/i }));

    await waitFor(() => expect(updateAssetStatuses).toHaveBeenCalledWith(['a1'], 'Rented'));
  });

  it('Approve All calls updateAssetStatuses with all asset ids for that user', async () => {
    const user = userEvent.setup();
    const updateAssetStatuses = vi.fn().mockResolvedValue(undefined);
    render(<PendingRentalTab {...makeProps({
      updateAssetStatuses,
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'u1' },
        { id: 'a2', typeId: 't2', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'u1' },
      ],
    })} />);

    await user.click(screen.getByRole('button', { name: /approve all/i }));

    await waitFor(() => expect(updateAssetStatuses).toHaveBeenCalledWith(['a1', 'a2'], 'Rented'));
  });

  it('type-level Approve calls updateAssetStatuses with only that type\'s ids', async () => {
    const user = userEvent.setup();
    const updateAssetStatuses = vi.fn().mockResolvedValue(undefined);
    render(<PendingRentalTab {...makeProps({
      updateAssetStatuses,
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'u1' },
        { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Pending Rental', rentedByUserId: 'u1' },
      ],
    })} />);

    await user.click(screen.getByRole('button', { name: /approve macbook air m2/i }));

    await waitFor(() => expect(updateAssetStatuses).toHaveBeenCalledWith(['a1', 'a2'], 'Rented'));
  });
});

// ── Deny actions ──────────────────────────────────────────────────────────────

describe('PendingRentalTab — deny actions', () => {
  it('item-level Deny calls updateAssetStatuses with "Available" and clearData=true immediately', async () => {
    const user = userEvent.setup();
    const updateAssetStatuses = vi.fn().mockResolvedValue(undefined);
    render(<PendingRentalTab {...makeProps({
      updateAssetStatuses,
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'u1' }],
    })} />);

    await user.click(screen.getByRole('button', { name: /^deny$/i }));

    await waitFor(() => expect(updateAssetStatuses).toHaveBeenCalledWith(['a1'], 'Available', true));
  });

  it('Deny All opens a confirmation modal without calling updateAssetStatuses', async () => {
    const user = userEvent.setup();
    const updateAssetStatuses = vi.fn().mockResolvedValue(undefined);
    render(<PendingRentalTab {...makeProps({
      updateAssetStatuses,
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'u1' }],
    })} />);

    await user.click(screen.getByRole('button', { name: /deny all/i }));

    expect(screen.getByRole('heading', { name: /deny rental request/i })).toBeInTheDocument();
    expect(updateAssetStatuses).not.toHaveBeenCalled();
  });

  it('confirming the deny modal calls updateAssetStatuses with all user ids and clearData=true', async () => {
    const user = userEvent.setup();
    const updateAssetStatuses = vi.fn().mockResolvedValue(undefined);
    render(<PendingRentalTab {...makeProps({
      updateAssetStatuses,
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'u1' }],
    })} />);

    await user.click(screen.getByRole('button', { name: /deny all/i }));
    // The modal's confirm "Deny" button is the last button with that name in the DOM
    const denyButtons = screen.getAllByRole('button', { name: /^deny$/i });
    await user.click(denyButtons[denyButtons.length - 1]);

    await waitFor(() => expect(updateAssetStatuses).toHaveBeenCalledWith(['a1'], 'Available', true));
  });

  it('cancelling the deny modal closes it without calling updateAssetStatuses', async () => {
    const user = userEvent.setup();
    const updateAssetStatuses = vi.fn().mockResolvedValue(undefined);
    render(<PendingRentalTab {...makeProps({
      updateAssetStatuses,
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'u1' }],
    })} />);

    await user.click(screen.getByRole('button', { name: /deny all/i }));
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(updateAssetStatuses).not.toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: /deny rental request/i })).not.toBeInTheDocument();
  });
});

// ── Error handling ────────────────────────────────────────────────────────────

describe('PendingRentalTab — error handling', () => {
  it('displays the server error message when updateAssetStatuses rejects with an API error', async () => {
    const user = userEvent.setup();
    const updateAssetStatuses = vi.fn().mockRejectedValue({ response: { data: { message: 'Server error' } } });
    render(<PendingRentalTab {...makeProps({
      updateAssetStatuses,
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'u1' }],
    })} />);

    await user.click(screen.getByRole('button', { name: /^approve$/i }));

    await waitFor(() => expect(screen.getByText('Server error')).toBeInTheDocument());
  });

  it('shows a generic error message when the rejection has no API message', async () => {
    const user = userEvent.setup();
    const updateAssetStatuses = vi.fn().mockRejectedValue(new Error('Network failure'));
    render(<PendingRentalTab {...makeProps({
      updateAssetStatuses,
      assets: [{ id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Pending Rental', rentedByUserId: 'u1' }],
    })} />);

    await user.click(screen.getByRole('button', { name: /^approve$/i }));

    await waitFor(() => expect(screen.getByText(/an error occurred/i)).toBeInTheDocument());
  });
});
