/**
 * @module PendingReturnState
 *
 * Concrete State: the customer has requested to return the asset but an
 * admin has not yet approved or denied the return.
 *
 * ## Valid Transitions
 *
 * - **Available** — admin approves the return; asset goes back to inventory
 * - **Rented** — admin denies the return; asset stays checked out
 * - **Maintenance** — asset needs service before returning to inventory
 *
 * ## Rental Data Behaviour
 *
 * When the return is approved (Available) or the asset is sent to
 * Maintenance, the rental data should be cleared automatically — the
 * asset is no longer associated with the renter.
 *
 * When the return is denied (Rented), the rental data is preserved so
 * the customer retains the asset.
 */

const AssetState = require('./AssetState');

class PendingReturnState extends AssetState {
  getName() {
    return 'Pending Return';
  }

  getValidTransitions() {
    return ['Available', 'Rented', 'Maintenance'];
  }

  /**
   * Clear rental data when the return is approved (Available) or the
   * asset goes to Maintenance.  Preserve rental data when the return
   * is denied (back to Rented).
   */
  shouldClearRentalData(newStatus) {
    return newStatus === 'Available' || newStatus === 'Maintenance';
  }
}

module.exports = PendingReturnState;
