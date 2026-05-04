/**
 * @module AssetState
 *
 * Base class defining the State interface for the Asset status state machine.
 * Each concrete state (Available, PendingRental, Rented, PendingReturn,
 * Maintenance) extends this class and overrides the relevant methods to
 * define state-specific behaviour.
 *
 * ## Role in the State Pattern
 *
 * This is the **State** interface. Concrete state classes are the **Concrete
 * States**.  `AssetStateMachine` is the **Context** that delegates to the
 * current state object.
 *
 * State objects are **stateless singletons** — they only define transition
 * rules and have no mutable state of their own.  The AssetStateMachine creates
 * a lightweight wrapper per request that holds a reference to the appropriate
 * singleton state object.
 */
export abstract class AssetState {

  /**
   * Human-readable name of this state (e.g. 'Available', 'Rented').
   * Must be overridden by every concrete subclass.
   *
   * @returns {string}
   */
  abstract getName(): string;

  /**
   * Returns the set of status strings this state can transition to,
   * regardless of user role.  These are the *structurally* valid transitions.
   *
   * Role-based restrictions (e.g. customers can only set Rented/Pending
   * Return) are enforced by the TransitionAuthoriser strategy, not by the
   * state itself.
   *
   * @returns {string[]} Array of valid target status strings.
   */
  getValidTransitions(): string[] {
    return [];
  }

  /**
   * Whether this state can structurally transition to the given status.
   * Checks the new status against {@link getValidTransitions}.
   *
   * Does NOT consider user role — that is the TransitionAuthoriser's
   * responsibility.
   *
   * @param {string} newStatus — the target status string
   * @returns {boolean}
   */
  canTransitionTo(newStatus: string): boolean {
    return this.getValidTransitions().includes(newStatus);
  }

  /**
   * Whether transitioning to `newStatus` should automatically clear
   * rental data fields (`rentedByUserId`, `returnDate`).
   *
   * The controller can still override this with an explicit
   * `clearRentalData` flag in the request body.  This method provides
   * the *default* behaviour for the state machine.
   *
   * @param {string} newStatus — the target status string
   * @returns {boolean} — true if rental data should be cleared by default
   */
  shouldClearRentalData(newStatus: string): boolean {
    return false;
  }
}

export default AssetState;
