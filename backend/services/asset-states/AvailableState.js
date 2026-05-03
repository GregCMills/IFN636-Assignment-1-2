/**
 * @module AvailableState
 *
 * Concrete State: the asset is in inventory and ready for use.
 *
 * ## Valid Transitions
 *
 * - **Pending Rental** — a customer has requested this asset
 * - **Maintenance** — taken out of service for repairs/inspection
 *
 * An asset in Available state cannot go directly to Rented (must pass
 * through the Pending Rental → approval workflow) or to Pending Return
 * (meaningless — nothing is rented).
 */

const AssetState = require('./AssetState');

class AvailableState extends AssetState {
  getName() {
    return 'Available';
  }

  getValidTransitions() {
    return ['Pending Rental', 'Maintenance'];
  }
}

module.exports = AvailableState;
