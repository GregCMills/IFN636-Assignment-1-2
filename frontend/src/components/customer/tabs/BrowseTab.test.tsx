import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BrowseTab from './BrowseTab';
import type { CustomerTabProps } from '../../../types/assets';

// ── Fixtures ─────────────────────────────────────────────────────────────────

const productGroups = [
  { id: 'g1', name: 'Laptops' },
  { id: 'g2', name: 'Cameras' },
];

const assetTypes = [
  { id: 't1', groupId: 'g1', name: 'MacBook Air M2' },   // 2 available
  { id: 't2', groupId: 'g1', name: 'Dell XPS 15' },       // 0 available
  { id: 't3', groupId: 'g2', name: 'Sony A7III Camera' }, // 1 available
];

const assets = [
  { id: 'a1', typeId: 't1', name: 'Unit 001', status: 'Available'   as const },
  { id: 'a2', typeId: 't1', name: 'Unit 002', status: 'Available'   as const },
  { id: 'a3', typeId: 't1', name: 'Unit 003', status: 'Rented'      as const },
  { id: 'a4', typeId: 't2', name: 'Unit 001', status: 'Maintenance' as const },
  { id: 'a5', typeId: 't3', name: 'Unit 001', status: 'Available'   as const },
];

const makeProps = (overrides: Partial<CustomerTabProps> = {}): CustomerTabProps => ({
  assets,
  assetTypes,
  productGroups,
  requestRental:       vi.fn().mockResolvedValue(undefined),
  updateAssetStatuses: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

/** Finds the date input and sets its value via fireEvent (more reliable than user.type for date inputs). */
const setDateInput = (value: string) => {
  const input = document.querySelector('input[type="date"]') as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
};

// ── Catalogue ─────────────────────────────────────────────────────────────────

describe('BrowseTab — catalogue', () => {
  it('renders a heading for each product group that has types', () => {
    render(<BrowseTab {...makeProps()} />);
    expect(screen.getByRole('heading', { name: 'Laptops' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cameras' })).toBeInTheDocument();
  });

  it('renders every asset type name under its group', () => {
    render(<BrowseTab {...makeProps()} />);
    expect(screen.getByText('MacBook Air M2')).toBeInTheDocument();
    expect(screen.getByText('Dell XPS 15')).toBeInTheDocument();
    expect(screen.getByText('Sony A7III Camera')).toBeInTheDocument();
  });

  it('shows the correct available count per type', () => {
    render(<BrowseTab {...makeProps()} />);
    expect(screen.getByText('2 available')).toBeInTheDocument(); // MacBook
    expect(screen.getByText('1 available')).toBeInTheDocument(); // Sony
    expect(screen.getByText('None available')).toBeInTheDocument(); // Dell
  });

  it('hides a group heading when the group has no asset types', () => {
    const props = makeProps({
      productGroups: [...productGroups, { id: 'g3', name: 'Audio' }],
    });
    render(<BrowseTab {...props} />);
    expect(screen.queryByRole('heading', { name: 'Audio' })).not.toBeInTheDocument();
  });

  it('shows an empty-state message when there are no product groups', () => {
    render(<BrowseTab {...makeProps({ productGroups: [] })} />);
    expect(screen.getByText(/no products available/i)).toBeInTheDocument();
  });
});

// ── Cart controls ─────────────────────────────────────────────────────────────

describe('BrowseTab — cart controls', () => {
  it('disables the + button when no units are available', () => {
    render(<BrowseTab {...makeProps()} />);
    // Dell XPS 15 has 0 available units
    expect(
      screen.getByRole('button', { name: /add one dell xps 15/i }),
    ).toBeDisabled();
  });

  it('disables the − button when nothing is in the cart yet', () => {
    render(<BrowseTab {...makeProps()} />);
    expect(
      screen.getByRole('button', { name: /remove one macbook air/i }),
    ).toBeDisabled();
  });

  it('clicking + shows "in cart" label on the card', async () => {
    const user = userEvent.setup();
    render(<BrowseTab {...makeProps()} />);
    await user.click(screen.getByRole('button', { name: /add one macbook air/i }));
    expect(screen.getByText('1 in cart')).toBeInTheDocument();
  });

  it('clicking + multiple times up to the available count then disables the button', async () => {
    const user = userEvent.setup();
    render(<BrowseTab {...makeProps()} />);
    const addBtn = screen.getByRole('button', { name: /add one macbook air/i });
    await user.click(addBtn); // qty → 1
    await user.click(addBtn); // qty → 2 (equals available count)
    expect(addBtn).toBeDisabled();
  });

  it('clicking − decrements the cart quantity', async () => {
    const user = userEvent.setup();
    render(<BrowseTab {...makeProps()} />);
    const addBtn = screen.getByRole('button', { name: /add one macbook air/i });
    await user.click(addBtn);
    await user.click(addBtn);
    expect(screen.getByText('2 in cart')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /remove one macbook air/i }));
    expect(screen.getByText('1 in cart')).toBeInTheDocument();
  });

  it('hides the "in cart" label when the quantity is decremented back to 0', async () => {
    const user = userEvent.setup();
    render(<BrowseTab {...makeProps()} />);
    await user.click(screen.getByRole('button', { name: /add one macbook air/i }));
    await user.click(screen.getByRole('button', { name: /remove one macbook air/i }));
    expect(screen.queryByText(/in cart/i)).not.toBeInTheDocument();
  });
});

// ── Floating cart button (FAB) ─────────────────────────────────────────────────

describe('BrowseTab — cart FAB', () => {
  it('does not show a badge when the cart is empty', () => {
    render(<BrowseTab {...makeProps()} />);
    // The FAB aria-label reports "0 items"; the badge span should not render
    expect(
      screen.getByRole('button', { name: /open cart \(0 items\)/i }),
    ).toBeInTheDocument();
    // No visible numeric badge
    expect(screen.queryByText(/^[1-9]\d*$/)).not.toBeInTheDocument();
  });

  it('shows a badge with the total number of items in the cart', async () => {
    const user = userEvent.setup();
    render(<BrowseTab {...makeProps()} />);
    await user.click(screen.getByRole('button', { name: /add one macbook air/i }));
    await user.click(screen.getByRole('button', { name: /add one sony a7iii/i }));
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('updates the FAB aria-label to reflect the cart size', async () => {
    const user = userEvent.setup();
    render(<BrowseTab {...makeProps()} />);
    await user.click(screen.getByRole('button', { name: /add one macbook air/i }));
    expect(
      screen.getByRole('button', { name: /open cart \(1 items\)/i }),
    ).toBeInTheDocument();
  });
});

// ── Cart modal ────────────────────────────────────────────────────────────────

describe('BrowseTab — cart modal', () => {
  it('opens when the FAB is clicked', async () => {
    const user = userEvent.setup();
    render(<BrowseTab {...makeProps()} />);
    await user.click(screen.getByRole('button', { name: /open cart/i }));
    expect(screen.getByRole('heading', { name: /your cart/i })).toBeInTheDocument();
  });

  it('shows an empty-cart message when the cart is empty', async () => {
    const user = userEvent.setup();
    render(<BrowseTab {...makeProps()} />);
    await user.click(screen.getByRole('button', { name: /open cart/i }));
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('lists items with their type names and quantities', async () => {
    const user = userEvent.setup();
    render(<BrowseTab {...makeProps()} />);
    const addMac = screen.getByRole('button', { name: /add one macbook air/i });
    await user.click(addMac);
    await user.click(addMac);
    await user.click(screen.getByRole('button', { name: /open cart/i }));

    // The type name now appears in both the catalogue card and the cart modal row
    expect(screen.getAllByText('MacBook Air M2')).toHaveLength(2);
    // "Quantity:" text is unique to the cart modal
    expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
  });

  it('closes when the × button is clicked', async () => {
    const user = userEvent.setup();
    render(<BrowseTab {...makeProps()} />);
    await user.click(screen.getByRole('button', { name: /open cart/i }));
    await user.click(screen.getByRole('button', { name: /close cart/i }));
    expect(screen.queryByRole('heading', { name: /your cart/i })).not.toBeInTheDocument();
  });

  it('removes an item from the cart when the trash icon button is clicked', async () => {
    const user = userEvent.setup();
    render(<BrowseTab {...makeProps()} />);
    await user.click(screen.getByRole('button', { name: /add one macbook air/i }));
    await user.click(screen.getByRole('button', { name: /open cart/i }));
    await user.click(screen.getByRole('button', { name: /remove macbook air m2 from cart/i }));
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('keeps "Request Rent" button disabled when the cart is empty', async () => {
    const user = userEvent.setup();
    render(<BrowseTab {...makeProps()} />);
    await user.click(screen.getByRole('button', { name: /open cart/i }));
    expect(screen.getByRole('button', { name: /request rent/i })).toBeDisabled();
  });
});

// ── Return date validation ────────────────────────────────────────────────────

describe('BrowseTab — return date validation', () => {
  it('shows an error if the user tries to submit without selecting a return date', async () => {
    const user = userEvent.setup();
    render(<BrowseTab {...makeProps()} />);
    await user.click(screen.getByRole('button', { name: /add one macbook air/i }));
    await user.click(screen.getByRole('button', { name: /open cart/i }));
    await user.click(screen.getByRole('button', { name: /request rent/i }));
    expect(screen.getByText(/please select a return date/i)).toBeInTheDocument();
  });

  it('clears the validation error once a date is chosen', async () => {
    const user = userEvent.setup();
    render(<BrowseTab {...makeProps()} />);
    await user.click(screen.getByRole('button', { name: /add one macbook air/i }));
    await user.click(screen.getByRole('button', { name: /open cart/i }));
    // Trigger the error
    await user.click(screen.getByRole('button', { name: /request rent/i }));
    expect(screen.getByText(/please select a return date/i)).toBeInTheDocument();
    // Set a date — the error should disappear
    setDateInput('2026-06-01');
    expect(screen.queryByText(/please select a return date/i)).not.toBeInTheDocument();
  });
});

// ── Rental submission ─────────────────────────────────────────────────────────

describe('BrowseTab — rental submission', () => {
  it('calls requestRental with the correct items and date', async () => {
    const user = userEvent.setup();
    const requestRental = vi.fn().mockResolvedValue(undefined);
    render(<BrowseTab {...makeProps({ requestRental })} />);

    const addMac = screen.getByRole('button', { name: /add one macbook air/i });
    await user.click(addMac);
    await user.click(addMac);
    await user.click(screen.getByRole('button', { name: /open cart/i }));
    setDateInput('2026-06-01');
    await user.click(screen.getByRole('button', { name: /request rent/i }));

    expect(requestRental).toHaveBeenCalledWith(
      [{ typeId: 't1', quantity: 2 }],
      '2026-06-01',
    );
  });

  it('clears the cart and closes the modal after a successful submission', async () => {
    const user = userEvent.setup();
    render(<BrowseTab {...makeProps()} />);

    await user.click(screen.getByRole('button', { name: /add one macbook air/i }));
    await user.click(screen.getByRole('button', { name: /open cart/i }));
    setDateInput('2026-06-01');
    await user.click(screen.getByRole('button', { name: /request rent/i }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /your cart/i })).not.toBeInTheDocument();
    });
    // Cart badge should be gone
    expect(screen.queryByText(/^[1-9]\d*$/)).not.toBeInTheDocument();
  });

  it('shows an API error message when requestRental rejects', async () => {
    const user = userEvent.setup();
    const requestRental = vi.fn().mockRejectedValue(new Error('Network error'));
    render(<BrowseTab {...makeProps({ requestRental })} />);

    await user.click(screen.getByRole('button', { name: /add one macbook air/i }));
    await user.click(screen.getByRole('button', { name: /open cart/i }));
    setDateInput('2026-06-01');
    await user.click(screen.getByRole('button', { name: /request rent/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to submit request/i)).toBeInTheDocument();
    });
    // Modal should still be open
    expect(screen.getByRole('heading', { name: /your cart/i })).toBeInTheDocument();
  });

  it('keeps requestRental uncalled when there is no return date', async () => {
    const user = userEvent.setup();
    const requestRental = vi.fn();
    render(<BrowseTab {...makeProps({ requestRental })} />);

    await user.click(screen.getByRole('button', { name: /add one macbook air/i }));
    await user.click(screen.getByRole('button', { name: /open cart/i }));
    await user.click(screen.getByRole('button', { name: /request rent/i }));

    expect(requestRental).not.toHaveBeenCalled();
  });
});
