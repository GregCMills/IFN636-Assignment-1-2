/**
 * @module TransitionAuthoriser
 *
 * Strategy pattern for role-based authorisation of asset status transitions.
 *
 * ## Design
 *
 * The State pattern validates whether a transition is *structurally* valid
 * (e.g. Available → Rented is not).  The TransitionAuthoriser validates
 * whether a transition is *authorisationally* valid for the user's role
 * (e.g. a customer cannot set Maintenance regardless of current state).
 *
 * Both checks must pass for a transition to be permitted.  This separation
 * keeps role logic out of the state classes and state logic out of the
 * authorisation classes — each has a single responsibility.
 *
 * ## Extending
 *
 * To add a new role (e.g. "manager" with some admin privileges), create a
 * new class extending TransitionAuthoriser and override `canTransition()`.
 * No changes to the controller or state classes are needed.
 */

/**
 * Base class: all authorisers must implement canTransition() and
 * verifyOwnership().  Throws if called directly — serves as an
 * interface contract.
 */
class TransitionAuthoriser {
  /**
   * Determines whether a user with this authorisation level can transition
   * from `currentStatus` to `newStatus`.
   *
   * @param {string} currentStatus — the asset's current status (e.g. 'Rented')
   * @param {string} newStatus     — the desired target status
   * @returns {boolean}
   */
  canTransition(currentStatus, newStatus) {
    throw new Error('Not implemented');
  }

  /**
   * Whether the authenticated user owns (and therefore may modify) the
   * given asset.  Admins always pass this check; customers must have
   * `rentedByUserId` matching their Clerk ID.
   *
   * @param {object}  asset  — a Mongoose Asset document (must have `.rentedByUserId`)
   * @param {string}  userId — the authenticated user's Clerk ID
   * @returns {boolean}
   */
  verifyOwnership(asset, userId) {
    throw new Error('Not implemented');
  }
}

/**
 * Admin authoriser: admins can perform any structurally valid transition.
 * The state machine's `canTransitionTo()` already filters out invalid
 * transitions, so this always returns true.
 */
class AdminAuthoriser extends TransitionAuthoriser {
  /** @returns {boolean} Always true — admins have no role-based restrictions. */
  canTransition(currentStatus, newStatus) {
    return true;
  }

  /** @returns {boolean} Always true — admins are exempt from ownership checks. */
  verifyOwnership(asset, userId) {
    return true;
  }
}

/**
 * Customer authoriser: customers may only set Rented or Pending Return
 * on assets they personally own.
 *
 * ## Allowed transitions for customers
 *
 * - **Rented**: customer confirms they've received the rented asset
 * - **Pending Return**: customer initiates a return request
 *
 * Customers cannot set Available, Pending Rental, or Maintenance.
 */
class CustomerAuthoriser extends TransitionAuthoriser {
  /**
   * @returns {boolean} True only if newStatus is one of the two statuses
   *   customers are permitted to set (Rented, Pending Return).
   */
  canTransition(currentStatus, newStatus) {
    return ['Rented', 'Pending Return'].includes(newStatus);
  }

  /**
   * Customers may only modify assets where `rentedByUserId` matches their ID.
   *
   * @param {object} asset  — Mongoose Asset document with `.rentedByUserId`
   * @param {string} userId — the authenticated user's Clerk ID
   * @returns {boolean}
   */
  verifyOwnership(asset, userId) {
    return asset.rentedByUserId === userId;
  }
}

module.exports = { TransitionAuthoriser, AdminAuthoriser, CustomerAuthoriser };
