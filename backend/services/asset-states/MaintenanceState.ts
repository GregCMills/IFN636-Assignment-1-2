import AssetState from './AssetState';

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
export class MaintenanceState extends AssetState {
  getName(): string {
    return 'Maintenance';
  }

  override getValidTransitions(): string[] {
    return ['Available'];
  }
}

export default MaintenanceState;
