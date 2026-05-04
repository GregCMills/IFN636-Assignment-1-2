import AssetState from './AssetState';

/**
 * @module PendingRentalState
 *
 * Concrete State: a customer has requested this asset but an admin has not
 * yet approved or denied the request.
 *
 * ## Valid Transitions
 *
 * - **Rented** — admin approves the rental request
 * - **Available** — admin denies the rental request
 *
 * ## Rental Data Behaviour
 *
 * When the rental request is denied (transitioning back to Available), the
 * pending rental data (`rentedByUserId`, `returnDate`) should be cleared
 * automatically.  This prevents stale request data from lingering on a
 * newly-available asset.
 */
export class PendingRentalState extends AssetState {
  getName(): string {
    return 'Pending Rental';
  }

  override getValidTransitions(): string[] {
    return ['Rented', 'Available'];
  }

  /**
   * Clear rental data when the request is denied (back to Available).
   * When approved (Rented), the rental data should be preserved so we
   * know who has the asset.
   */
  override shouldClearRentalData(newStatus: string): boolean {
    return newStatus === 'Available';
  }
}

export default PendingRentalState;
