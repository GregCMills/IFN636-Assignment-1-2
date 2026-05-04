import AssetState from './AssetState';

/**
 * @module RentedState
 *
 * Concrete State: the asset is currently checked out to a customer.
 *
 * ## Valid Transitions
 *
 * - **Pending Return** — customer has initiated a return request
 * - **Maintenance** — asset is taken out of service while rented
 *
 * An asset in Rented state cannot go directly to Available (must pass
 * through the Pending Return → approval workflow) or to Pending Rental
 * (can't request something that's already out).
 */
export class RentedState extends AssetState {
  getName(): string {
    return 'Rented';
  }

  override getValidTransitions(): string[] {
    return ['Pending Return', 'Maintenance'];
  }
}

export default RentedState;
