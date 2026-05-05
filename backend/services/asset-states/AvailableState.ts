import AssetState from './AssetState';

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
export class AvailableState extends AssetState {
  getName(): string {
    return 'Available';
  }

  override getValidTransitions(): string[] {
    return ['Pending Rental', 'Maintenance'];
  }
}

export default AvailableState;
