/**
 * @module AssetStateMachine
 *
 * The **Context** class in the State design pattern.  Wraps an asset's
 * current status string and delegates transition validation to the
 * appropriate state object.
 *
 * ## Usage
 *
 * ```js
 * const machine = new AssetStateMachine(asset.status);
 * const authoriser = new AdminAuthoriser();
 *
 * if (machine.canTransitionTo('Maintenance', authoriser)) {
 *   // transition is valid for this user role
 * }
 * ```
 *
 * ## Architecture
 *
 * State objects are pre-instantiated singletons stored in `STATE_MAP`.
 * They have no mutable state — they only define transition rules.
 * The `AssetStateMachine` holds a reference to one state object and
 * is created per-request (lightweight, garbage-collected after use).
 *
 * ## Two-phase validation
 *
 * 1. **Structural**: the state object checks if the transition is
 *    logically valid (e.g. `Available → Rented` is not).
 * 2. **Authorisational**: the `TransitionAuthoriser` checks if the
 *    user's role permits it (e.g. customer cannot set `Maintenance`).
 *
 * Both must pass for `canTransitionTo()` to return true.
 */

import AssetState from './AssetState';
import AvailableState from './AvailableState';
import PendingRentalState from './PendingRentalState';
import RentedState from './RentedState';
import PendingReturnState from './PendingReturnState';
import MaintenanceState from './MaintenanceState';
import { TransitionAuthoriser } from './TransitionAuthoriser';

/**
 * Lookup table mapping status strings to their singleton state objects.
 * Each state is instantiated once — they are stateless and thread-safe.
 */
const STATE_MAP: Record<string, AssetState> = {
  'Available':       new AvailableState(),
  'Pending Rental':  new PendingRentalState(),
  'Rented':          new RentedState(),
  'Pending Return':  new PendingReturnState(),
  'Maintenance':     new MaintenanceState(),
};

export class AssetStateMachine {
  private _state: AssetState;

  /**
   * Creates a state machine for an asset with the given current status.
   *
   * @param {string} currentStatus — the asset's current status string,
   *   e.g. 'Available', 'Rented', 'Pending Return'.
   * @throws {Error} if `currentStatus` is not a recognised status string.
   */
  constructor(currentStatus: string) {
    const state = STATE_MAP[currentStatus];
    if (!state) {
      throw new Error(`Unknown asset status: "${currentStatus}"`);
    }
    /** @private */
    this._state = state;
  }

  /**
   * Returns the human-readable name of the current state.
   *
   * @returns {string} e.g. 'Available', 'Rented'
   */
  getCurrentStatus(): string {
    return this._state.getName();
  }

  /**
   * Returns the list of status strings this state can structurally
   * transition to, regardless of user role.
   *
   * @returns {string[]}
   */
  getValidTransitions(): string[] {
    return this._state.getValidTransitions();
  }

  /**
   * Whether the asset can transition to `newStatus`, given both the
   * structural transition rules AND the user's authorisation level.
   *
   * The check is two-phase:
   * 1. Does the current state allow this transition structurally?
   * 2. Does the user's role permit this transition?
   *
   * Both must be satisfied for the method to return `true`.
   *
   * @param {string} newStatus — the desired target status
   * @param {TransitionAuthoriser} authoriser —
   *   an instance of `AdminAuthoriser` or `CustomerAuthoriser`
   * @returns {boolean}
   */
  canTransitionTo(newStatus: string, authoriser: TransitionAuthoriser): boolean {
    // Phase 1: structural validation (state machine rules)
    if (!this._state.canTransitionTo(newStatus)) {
      return false;
    }
    // Phase 2: authorisation validation (role-based rules)
    return authoriser.canTransition(this._state.getName(), newStatus);
  }

  /**
   * Whether transitioning to `newStatus` should clear rental data by
   * default.  The controller may override this with an explicit
   * `clearRentalData` flag in the request body.
   *
   * @param {string} newStatus — the desired target status
   * @returns {boolean}
   */
  shouldClearRentalData(newStatus: string): boolean {
    return this._state.shouldClearRentalData(newStatus);
  }
}

export default AssetStateMachine;
