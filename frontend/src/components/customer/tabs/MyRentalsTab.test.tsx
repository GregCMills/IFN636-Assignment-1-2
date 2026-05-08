import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyRentalsTab from './MyRentalsTab';
import type { CustomerTabProps } from '../../../types/assets';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const CURRENT_USER_ID = 'u-current';
const OTHER_USER_ID   = 'u-other';

const assetTypes = [
  { id: 't1', groupId: 'g1', name: 'MacBook Air M2' },
  { id: 't2', groupId: 'g1', name: 'Sony Camera' },
];

const makeProps = (overrides: Partial<CustomerTabProps> = {}): CustomerTabProps => ({
  assets:              [],
  assetTypes,
  productGroups:       [],
  rentalHistory:       [],
  currentUserId:       CURRENT_USER_ID,
  requestRental:       vi.fn().mockResolvedValue(undefined),
  updateAssetStatuses: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

// ── Empty state ───────────────────────────────────────────────────────────────

describe('MyRentalsTab — empty state', () => {
  it('shows "No Active Rentals" when the asset list is empty', () => {
    render(<MyRentalsTab {...makeProps()} />);
    expect(screen.getByText(/no active rentals/i)).toBeInTheDocument();
  });

  it('shows the empty state when the user has no Rented assets', () => {
    render(<MyRentalsTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Available' },
        { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Pending Rental', rentedByUserId: CURRENT_USER_ID },
      ],
    })} />);
    expect(screen.getByText(/no active rentals/i)).toBeInTheDocument();
  });

  it('shows the empty state when Rented assets exist but belong to another user', () => {
    render(<MyRentalsTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: OTHER_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.getByText(/no active rentals/i)).toBeInTheDocument();
  });

  it('does not show the empty state when the current user has a Rented asset', () => {
    render(<MyRentalsTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.queryByText(/no active rentals/i)).not.toBeInTheDocument();
  });
});

// ── Content rendering ─────────────────────────────────────────────────────────

describe('MyRentalsTab — content rendering', () => {
  it('shows the return date formatted as DD-MM-YYYY in the section header', () => {
    render(<MyRentalsTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-15' },
      ],
    })} />);
    expect(screen.getByText(/return by: 15-06-2026/i)).toBeInTheDocument();
  });

  it('shows the asset type name', () => {
    render(<MyRentalsTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.getByText('MacBook Air M2')).toBeInTheDocument();
  });

  it('shows the unit name in the asset row', () => {
    render(<MyRentalsTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 007', status: 'Rented', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.getByText('Unit 007')).toBeInTheDocument();
  });

  it('shows "Unknown Product" when the typeId has no matching asset type', () => {
    render(<MyRentalsTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 'unknown-type', name: 'Mystery Unit', status: 'Rented', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.getByText('Unknown Product')).toBeInTheDocument();
  });

  it('groups assets with the same return date under one section header', () => {
    render(<MyRentalsTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
        { id: 'a2', typeId: 't2', name: 'Unit 001', status: 'Rented', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.getAllByText(/return by: 01-06-2026/i)).toHaveLength(1);
  });

  it('creates separate sections for assets with different return dates', () => {
    render(<MyRentalsTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
        { id: 'a2', typeId: 't2', name: 'Unit 001', status: 'Rented', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-07-15' },
      ],
    })} />);
    expect(screen.getByText(/return by: 01-06-2026/i)).toBeInTheDocument();
    expect(screen.getByText(/return by: 15-07-2026/i)).toBeInTheDocument();
  });

  it('shows "No Return Date" as the section header when returnDate is absent', () => {
    render(<MyRentalsTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: CURRENT_USER_ID },
      ],
    })} />);
    expect(screen.getByText(/return by: no return date/i)).toBeInTheDocument();
  });

  it('only renders assets belonging to the current user, not other users', () => {
    render(<MyRentalsTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'My Unit',    status: 'Rented', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
        { id: 'a2', typeId: 't2', name: 'Other Unit', status: 'Rented', rentedByUserId: OTHER_USER_ID,   returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.getByText('My Unit')).toBeInTheDocument();
    expect(screen.queryByText('Other Unit')).not.toBeInTheDocument();
  });

  it('renders a Submit Return button for each rented asset', () => {
    render(<MyRentalsTab {...makeProps({
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
        { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Rented', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);
    expect(screen.getAllByRole('button', { name: /submit return/i })).toHaveLength(2);
  });
});

// ── Submit Return action ──────────────────────────────────────────────────────

describe('MyRentalsTab — Submit Return action', () => {
  it('calls updateAssetStatuses with the asset id and "Pending Return" when clicked', async () => {
    const user = userEvent.setup();
    const updateAssetStatuses = vi.fn().mockResolvedValue(undefined);
    render(<MyRentalsTab {...makeProps({
      updateAssetStatuses,
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);

    await user.click(screen.getByRole('button', { name: /submit return/i }));

    await waitFor(() => expect(updateAssetStatuses).toHaveBeenCalledWith(['a1'], 'Pending Return'));
  });

  it('calls updateAssetStatuses with the correct id when multiple assets are shown', async () => {
    const user = userEvent.setup();
    const updateAssetStatuses = vi.fn().mockResolvedValue(undefined);
    render(<MyRentalsTab {...makeProps({
      updateAssetStatuses,
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
        { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Rented', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);

    const buttons = screen.getAllByRole('button', { name: /submit return/i });
    await user.click(buttons[1]);

    await waitFor(() => expect(updateAssetStatuses).toHaveBeenCalledWith(['a2'], 'Pending Return'));
  });

  it('disables all Submit Return buttons while a submission is in progress', async () => {
    const user = userEvent.setup();
    let resolveUpdate!: () => void;
    const updateAssetStatuses = vi.fn().mockImplementation(
      () => new Promise<void>(resolve => { resolveUpdate = resolve; }),
    );
    render(<MyRentalsTab {...makeProps({
      updateAssetStatuses,
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
        { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Rented', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);

    const buttons = screen.getAllByRole('button', { name: /submit return/i });
    await user.click(buttons[0]);

    // Buttons should be disabled while the promise is pending
    for (const btn of screen.getAllByRole('button', { name: /submit return/i })) {
      expect(btn).toBeDisabled();
    }

    resolveUpdate();
    await waitFor(() => expect(screen.getAllByRole('button', { name: /submit return/i })[0]).toBeEnabled());
  });
});

// ── Error handling ────────────────────────────────────────────────────────────

describe('MyRentalsTab — error handling', () => {
  it('displays the server error message when updateAssetStatuses rejects with an API error', async () => {
    const user = userEvent.setup();
    const updateAssetStatuses = vi.fn().mockRejectedValue({
      response: { data: { message: 'Asset not found' } },
    });
    render(<MyRentalsTab {...makeProps({
      updateAssetStatuses,
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);

    await user.click(screen.getByRole('button', { name: /submit return/i }));

    await waitFor(() => expect(screen.getByText('Asset not found')).toBeInTheDocument());
  });

  it('shows a generic error message when the rejection has no API message', async () => {
    const user = userEvent.setup();
    const updateAssetStatuses = vi.fn().mockRejectedValue(new Error('Network failure'));
    render(<MyRentalsTab {...makeProps({
      updateAssetStatuses,
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);

    await user.click(screen.getByRole('button', { name: /submit return/i }));

    await waitFor(() => expect(screen.getByText(/an error occurred/i)).toBeInTheDocument());
  });

  it('clears the error banner and re-enables buttons after a subsequent successful submission', async () => {
    const user = userEvent.setup();
    const updateAssetStatuses = vi.fn()
      .mockRejectedValueOnce(new Error('Network failure'))
      .mockResolvedValueOnce(undefined);

    render(<MyRentalsTab {...makeProps({
      updateAssetStatuses,
      assets: [
        { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Rented', rentedByUserId: CURRENT_USER_ID, returnDate: '2026-06-01' },
      ],
    })} />);

    const btn = screen.getByRole('button', { name: /submit return/i });

    // First attempt — fails
    await user.click(btn);
    await waitFor(() => expect(screen.getByText(/an error occurred/i)).toBeInTheDocument());

    // Second attempt — succeeds; error should disappear
    await user.click(screen.getByRole('button', { name: /submit return/i }));
    await waitFor(() => expect(screen.queryByText(/an error occurred/i)).not.toBeInTheDocument());
  });
});
