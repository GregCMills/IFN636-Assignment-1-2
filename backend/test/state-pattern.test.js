/**
 * Unit tests for the Asset State pattern.
 *
 * These tests validate the state machine and transition authorisers in
 * isolation — no MongoDB connection or Express server is needed.  They
 * verify that:
 *
 * 1. Each state allows only its defined valid transitions
 * 2. Invalid transitions are correctly rejected
 * 3. `getValidTransitions()` returns the correct array
 * 4. `shouldClearRentalData()` returns the correct default
 * 5. TransitionAuthoriser enforces role-based rules
 * 6. Unknown status strings throw on construction
 *
 * The integration-level tests (API calls through Express) live in
 * `assets.test.js` and test actual HTTP request/response behaviour.
 */

'use strict';

const { expect } = require('chai');
const AssetStateMachine = require('../services/asset-states/AssetStateMachine');
const { AdminAuthoriser, CustomerAuthoriser } = require('../services/asset-states/TransitionAuthoriser');

describe('AssetStateMachine (State pattern)', () => {

  // ── Available state ──────────────────────────────────────────────────────────

  describe('Available state', () => {
    const adminAuth = new AdminAuthoriser();

    it('can transition to Pending Rental', () => {
      const machine = new AssetStateMachine('Available');
      expect(machine.canTransitionTo('Pending Rental', adminAuth)).to.be.true;
    });

    it('can transition to Maintenance', () => {
      const machine = new AssetStateMachine('Available');
      expect(machine.canTransitionTo('Maintenance', adminAuth)).to.be.true;
    });

    it('cannot transition directly to Rented (must go through Pending Rental)', () => {
      const machine = new AssetStateMachine('Available');
      expect(machine.canTransitionTo('Rented', adminAuth)).to.be.false;
    });

    it('cannot transition to Pending Return', () => {
      const machine = new AssetStateMachine('Available');
      expect(machine.canTransitionTo('Pending Return', adminAuth)).to.be.false;
    });

    it('returns correct valid transitions', () => {
      const machine = new AssetStateMachine('Available');
      expect(machine.getValidTransitions()).to.deep.equal(['Pending Rental', 'Maintenance']);
    });

    it('should not clear rental data on any transition (no rental data to clear)', () => {
      const machine = new AssetStateMachine('Available');
      expect(machine.shouldClearRentalData('Pending Rental')).to.be.false;
      expect(machine.shouldClearRentalData('Maintenance')).to.be.false;
    });
  });

  // ── Pending Rental state ──────────────────────────────────────────────────────

  describe('Pending Rental state', () => {
    const adminAuth = new AdminAuthoriser();

    it('can transition to Rented (approve)', () => {
      const machine = new AssetStateMachine('Pending Rental');
      expect(machine.canTransitionTo('Rented', adminAuth)).to.be.true;
    });

    it('can transition to Available (deny)', () => {
      const machine = new AssetStateMachine('Pending Rental');
      expect(machine.canTransitionTo('Available', adminAuth)).to.be.true;
    });

    it('should clear rental data when returning to Available (denying request)', () => {
      const machine = new AssetStateMachine('Pending Rental');
      expect(machine.shouldClearRentalData('Available')).to.be.true;
    });

    it('should preserve rental data when transitioning to Rented (approving)', () => {
      const machine = new AssetStateMachine('Pending Rental');
      expect(machine.shouldClearRentalData('Rented')).to.be.false;
    });
  });

  // ── Rented state ──────────────────────────────────────────────────────────────

  describe('Rented state', () => {
    const adminAuth = new AdminAuthoriser();

    it('can transition to Pending Return', () => {
      const machine = new AssetStateMachine('Rented');
      expect(machine.canTransitionTo('Pending Return', adminAuth)).to.be.true;
    });

    it('can transition to Maintenance', () => {
      const machine = new AssetStateMachine('Rented');
      expect(machine.canTransitionTo('Maintenance', adminAuth)).to.be.true;
    });

    it('cannot transition directly to Available (must go through Pending Return)', () => {
      const machine = new AssetStateMachine('Rented');
      expect(machine.canTransitionTo('Available', adminAuth)).to.be.false;
    });

    it('cannot transition to Pending Rental (already rented)', () => {
      const machine = new AssetStateMachine('Rented');
      expect(machine.canTransitionTo('Pending Rental', adminAuth)).to.be.false;
    });
  });

  // ── Pending Return state ──────────────────────────────────────────────────────

  describe('Pending Return state', () => {
    const adminAuth = new AdminAuthoriser();

    it('can transition to Available (approve return)', () => {
      const machine = new AssetStateMachine('Pending Return');
      expect(machine.canTransitionTo('Available', adminAuth)).to.be.true;
    });

    it('can transition to Rented (deny return)', () => {
      const machine = new AssetStateMachine('Pending Return');
      expect(machine.canTransitionTo('Rented', adminAuth)).to.be.true;
    });

    it('can transition to Maintenance', () => {
      const machine = new AssetStateMachine('Pending Return');
      expect(machine.canTransitionTo('Maintenance', adminAuth)).to.be.true;
    });

    it('should clear rental data when transitioning to Available', () => {
      const machine = new AssetStateMachine('Pending Return');
      expect(machine.shouldClearRentalData('Available')).to.be.true;
    });

    it('should clear rental data when transitioning to Maintenance', () => {
      const machine = new AssetStateMachine('Pending Return');
      expect(machine.shouldClearRentalData('Maintenance')).to.be.true;
    });

    it('should preserve rental data when transitioning back to Rented (deny)', () => {
      const machine = new AssetStateMachine('Pending Return');
      expect(machine.shouldClearRentalData('Rented')).to.be.false;
    });

    it('returns correct valid transitions', () => {
      const machine = new AssetStateMachine('Pending Return');
      expect(machine.getValidTransitions()).to.deep.equal(['Available', 'Rented', 'Maintenance']);
    });
  });

  // ── Maintenance state ─────────────────────────────────────────────────────────

  describe('Maintenance state', () => {
    const adminAuth = new AdminAuthoriser();

    it('can only transition to Available', () => {
      const machine = new AssetStateMachine('Maintenance');
      expect(machine.canTransitionTo('Available', adminAuth)).to.be.true;
      expect(machine.canTransitionTo('Rented', adminAuth)).to.be.false;
      expect(machine.canTransitionTo('Pending Rental', adminAuth)).to.be.false;
      expect(machine.canTransitionTo('Pending Return', adminAuth)).to.be.false;
    });

    it('returns correct valid transitions', () => {
      const machine = new AssetStateMachine('Maintenance');
      expect(machine.getValidTransitions()).to.deep.equal(['Available']);
    });
  });

  // ── TransitionAuthoriser (Strategy pattern) ───────────────────────────────────

  describe('TransitionAuthoriser (Strategy pattern)', () => {

    describe('AdminAuthoriser', () => {
      it('allows any transition (admin has no status-based restrictions)', () => {
        const auth = new AdminAuthoriser();
        expect(auth.canTransition('Available', 'Maintenance')).to.be.true;
        expect(auth.canTransition('Rented', 'Pending Return')).to.be.true;
        expect(auth.canTransition('Pending Return', 'Available')).to.be.true;
      });
    });

    describe('CustomerAuthoriser', () => {
      it('allows Rented and Pending Return (customer-facing statuses)', () => {
        const auth = new CustomerAuthoriser();
        expect(auth.canTransition('Rented', 'Pending Return')).to.be.true;
        expect(auth.canTransition('Pending Return', 'Rented')).to.be.true;
      });

      it('blocks Available (customers cannot put items into inventory)', () => {
        const auth = new CustomerAuthoriser();
        expect(auth.canTransition('Pending Return', 'Available')).to.be.false;
      });

      it('blocks Maintenance (customers cannot put items into service)', () => {
        const auth = new CustomerAuthoriser();
        expect(auth.canTransition('Rented', 'Maintenance')).to.be.false;
      });

      it('blocks Pending Rental (customers cannot request rentals via status change)', () => {
        const auth = new CustomerAuthoriser();
        expect(auth.canTransition('Available', 'Pending Rental')).to.be.false;
      });
    });
  });

  // ── Two-phase validation: State + Strategy together ───────────────────────────

  describe('Two-phase validation (State + Strategy)', () => {
    it('rejects structurally valid but unauthorised transition (customer → Maintenance)', () => {
      const machine = new AssetStateMachine('Available');
      // Structurally valid: Available → Maintenance
      // Authorisationally invalid: CustomerAuthoriser blocks Maintenance
      const customerAuth = new CustomerAuthoriser();
      expect(machine.canTransitionTo('Maintenance', customerAuth)).to.be.false;
    });

    it('rejects structurally invalid but authorised transition (admin → Available→Rented)', () => {
      const machine = new AssetStateMachine('Available');
      // Structurally invalid: Available → Rented (must go through Pending Rental)
      // Admin authoriser says yes, but structural check comes first
      const adminAuth = new AdminAuthoriser();
      expect(machine.canTransitionTo('Rented', adminAuth)).to.be.false;
    });

    it('allows structurally valid AND authorised transition (customer Rented→Pending Return)', () => {
      const machine = new AssetStateMachine('Rented');
      const customerAuth = new CustomerAuthoriser();
      expect(machine.canTransitionTo('Pending Return', customerAuth)).to.be.true;
    });
  });

  // ── Error handling ────────────────────────────────────────────────────────────

  describe('Error handling', () => {
    it('throws on unknown status string', () => {
      expect(() => new AssetStateMachine('Unknown')).to.throw(
        'Unknown asset status: "Unknown"',
      );
    });

    it('throws on empty status string', () => {
      expect(() => new AssetStateMachine('')).to.throw('Unknown asset status');
    });

    it('getCurrentStatus() returns the correct state name', () => {
      expect(new AssetStateMachine('Available').getCurrentStatus()).to.equal('Available');
      expect(new AssetStateMachine('Maintenance').getCurrentStatus()).to.equal('Maintenance');
    });
  });
});
