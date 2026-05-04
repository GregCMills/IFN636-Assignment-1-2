/**
 * @module MaintenanceState
 *
 * Concrete State: the asset is out of service for repairs, inspection, or
 * other maintenance activities.
 *
 * ## Valid Transitions
 *
 * - **Available** — maintenance is complete; asset is back in inventory
 *
 * Maintenance is a terminal state for the rental workflow — the only way
 * out is back to Available.  An asset in maintenance cannot be rented
 * directly.
 */

const AssetState = require('./AssetState');

class MaintenanceState extends AssetState {
  getName() {
    return 'Maintenance';
  }

  getValidTransitions() {
    return ['Available'];
  }
}

module.exports = MaintenanceState;
