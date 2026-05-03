# Backend Design Patterns

This document catalogues the design patterns used in the Node.js / Express /
Mongoose / Clerk backend for the equipment rental system.  Each pattern is
evaluated against the textbook definition and scored as **Confirmed** (fully
implemented) or **Partial** (present in spirit but not fully realised).

---

## Pattern Summary

| Pattern | Status | Location | Role |
|---------|--------|----------|------|
| **Adapter** (§1) | Confirmed | `services/auth/ClerkAuthAdapter.js`, `services/auth/AuthAdapter.js` | Shields the app from Clerk API changes |
| **Singleton** (§2) | Confirmed | `services/auth/ClerkAuthAdapter.js` (module export), `services/asset-states/AssetStateMachine.js` (STATE_MAP) | Single instance via Node.js module caching |
| **Composite** (§3) | Confirmed | `services/inventory/` | Uniform delete behaviour across a 3-level tree |
| **Strategy** (§4) | Confirmed | `services/asset-states/TransitionAuthoriser.js` | Role-based authorisation selected at runtime |
| **State** (§5) | Confirmed | `services/asset-states/` | Encapsulates per-status transition rules and side effects |

---

## §1 Adapter — AuthAdapter / ClerkAuthAdapter

**Status:** Confirmed ✅

The `AuthAdapter` base class defines a uniform authentication interface.
`ClerkAuthAdapter` implements that interface for Clerk.  The rest of the
application imports the singleton `ClerkAuthAdapter` instance, never touches
`@clerk/express` directly, and never sees Clerk-specific data structures like
`emailAddresses` arrays or `publicMetadata`.

### Files

| File | Role |
|------|------|
| `services/auth/AuthAdapter.js` | Base class — defines the adapter interface |
| `services/auth/ClerkAuthAdapter.js` | Concrete adapter — translates Clerk API calls |

### Why Adapter

- **There is a client interface** (`AuthAdapter` with `getUser`, `getUsers`,
  `getUserId`, `contextMiddleware`, `requireAuth`, `adminOnly`).
- **There is a service** (Clerk's `@clerk/express` SDK with its own data
  shapes and API).
- **The two don't match.** `getUser()` normalises Clerk's nested response into
  a flat `{ id, email, name, role }` object.  `getUserId()` handles both Clerk
  v1 (plain object) and v2 (function-call) request shapes transparently.
- **The adapter is the only file that imports `@clerk/express`.** All other
  modules import the adapter singleton.

```js
// controller code: never sees Clerk internals
const auth = require('../services/auth/ClerkAuthAdapter');
const authUser = await auth.getUser(auth.getUserId(req));
const isAdmin  = authUser.role === 'admin';
```

---

## §2 Singleton

**Status:** Confirmed ✅

Two singletons exist, both leveraging Node.js module caching:

1. **ClerkAuthAdapter** — exported as `module.exports = new ClerkAuthAdapter()`.
   Every `require()` call returns the same object.

2. **State singletons** (`AssetStateMachine.STATE_MAP`) — the five concrete
   state objects are instantiated once and shared across all requests.

No explicit `getInstance()` methods are needed; Node.js `require` cache is the
singleton registry.

---

## §3 Composite — InventoryComponent

**Status:** Confirmed ✅

### Files

| File | Role |
|------|------|
| `services/inventory/InventoryComponent.js` | Base class — 5 interface methods |
| `services/inventory/ProductGroupComponent.js` | Composite — holds `AssetTypeComponent[]` children |
| `services/inventory/AssetTypeComponent.js` | Composite — holds `AssetComponent[]` children |
| `services/inventory/AssetComponent.js` | Leaf — `getChildren()` returns `[]` |
| `services/inventory/InventoryTreeBuilder.js` | Factory — builds trees from MongoDB |

### Why Composite

The three-level entity hierarchy (`ProductGroup → AssetType → Asset`) is
treated uniformly through a shared `InventoryComponent` interface.  Client code
calls `delete()` on any node without knowing whether it's a leaf or the root
of a multi-level tree.  Deletion cascades recursively: children are deleted
first, then the parent.

```js
// All three controllers follow the same pattern:
const root = await InventoryTreeBuilder.fromGroupId(req.params.id);
if (!root) return res.status(404).json({ message: 'Group not found' });
await root.delete(null);
res.json({ success: true });
```

---

## §4 Strategy — TransitionAuthoriser

**Status:** Confirmed ✅

### Files

| File | Role |
|------|------|
| `services/asset-states/TransitionAuthoriser.js` | Base class + `AdminAuthoriser` + `CustomerAuthoriser` |

### Why Strategy

The controller selects an authorisation strategy at runtime based on the user's
role, then calls the uniform `canTransition()` interface.  Adding a future role
(e.g. "manager") means creating one new class — no controller or state class
changes needed.

```js
const authoriser = isAdmin ? new AdminAuthoriser() : new CustomerAuthoriser();
// ... later ...
if (!machine.canTransitionTo(status, authoriser)) { /* reject */ }
```

- **AdminAuthoriser**: always returns `true` — admins have no status-based
  restrictions (structural validation is handled by the State pattern).
- **CustomerAuthoriser**: only permits `Rented` and `Pending Return`.

### Relationship with State

The Strategy and State patterns work together in a two-phase validation:

1. **State** (structural): "Is Available → Rented a valid transition?"
   → No.  Reject.
2. **Strategy** (authorisational): "Does this user's role permit setting
   Maintenance?" → Customer: No.  Reject.

Both must pass for the transition to be permitted.

---

## §5 State — AssetStateMachine

**Status:** Confirmed ✅

### Files

| File | Role |
|------|------|
| `services/asset-states/AssetState.js` | Base class — defines the State interface |
| `services/asset-states/AvailableState.js` | Concrete state: in inventory, ready for rental |
| `services/asset-states/PendingRentalState.js` | Concrete state: rental requested, awaiting approval |
| `services/asset-states/RentedState.js` | Concrete state: checked out to customer |
| `services/asset-states/PendingReturnState.js` | Concrete state: return requested, awaiting approval |
| `services/asset-states/MaintenanceState.js` | Concrete state: out of service |
| `services/asset-states/AssetStateMachine.js` | Context — wraps current status and delegates |

### Why State

Before this refactoring, asset status management used a string enum in the
Mongoose schema and **inline conditional logic** in the controller.  There was
**no validation of valid transitions** — an asset could be set from any status
to any other status, which was a data integrity bug.

The State pattern replaces that with:

1. **One class per state** — each state knows what transitions are valid from
   itself (e.g., `AvailableState` permits `Pending Rental` and `Maintenance`).

2. **Context delegation** — `AssetStateMachine` wraps the current status string
   and delegates to the appropriate state object.

3. **Self-documenting transitions** — each state class lists its permitted
   transitions in one place.  The full lifecycle is visible from the class
   hierarchy alone.

4. **Encapsulated side effects** — states define default behaviour for clearing
   rental data (e.g., `PendingReturnState` clears data when returning to
   `Available` or `Maintenance`).

### State machine transitions

```
Available ────────→ Pending Rental ──→ Rented ──→ Pending Return ──→ Available
    │                      │              │              │
    └──→ Maintenance        └──→ Available └──→ Maintenance └──→ Rented
                                                                 └──→ Maintenance
                                                 Maintenance ──→ Available
```

### Controller integration

```js
// Fetch assets first to validate against current statuses
const assets = await Asset.find({ _id: { $in: ids } });

for (const asset of assets) {
  const machine = new AssetStateMachine(asset.status);
  if (!machine.canTransitionTo(status, authoriser)) {
    return res.status(403).json({
      message: `Not authorised to transition "${asset.name}" from ${asset.status} to ${status}`,
    });
  }
}
```

---

## Verification

- **State**: All five states are confirmed with 30 dedicated unit tests
  (`test/state-pattern.test.js`).  All 138 backend tests pass.
- **Strategy**: The `TransitionAuthoriser` is confirmed via 4 dedicated unit
  tests in the same suite.  Customer/Admin role distinction is verified by
  integration tests in `test/assets.test.js`.
- **Adapter**: The `ClerkAuthAdapter` is confirmed via 20 dedicated unit tests
  (`test/adapter.test.js`).  The adapter correctly handles Clerk v1 and v2
  request shapes, normalises user objects, and degrades gracefully on API
  failures.
- **Composite**: Confirmed via 14 dedicated integration tests
  (`test/composite.test.js`).
- **All patterns coexist cleanly**: No pattern conflicts with another.
  Controllers use Adapter + Composite + State + Strategy in a single request
  flow without any pattern fighting for control.
