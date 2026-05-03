/**
 * @module ClerkAuthAdapter
 * Concrete authentication adapter for Clerk (@clerk/express).
 *
 * All Clerk-specific code lives here. No other file in the application should
 * import from @clerk/express.  Consumers import this singleton and call the
 * adapter methods — they never touch Clerk internals directly.
 *
 * ## Lazy requires
 *
 * `require('@clerk/express')` is called inside each method rather than at the
 * module top level.  This matches the existing codebase convention and allows
 * test mocks (which replace entries in the Node.js require cache) to take
 * effect correctly.
 *
 * ## Singleton
 *
 * The module exports an instance (`new ClerkAuthAdapter()`).  Node.js module
 * caching ensures every consumer receives the same object.
 */

const AuthAdapter = require('./AuthAdapter');

class ClerkAuthAdapter extends AuthAdapter {

  /**
   * Returns Express middleware that attaches Clerk auth context to every
   * request.  Called once in server.js with `app.use()`.
   *
   * @returns {import('express').RequestHandler}
   */
  contextMiddleware() {
    const { clerkMiddleware } = require('@clerk/express');
    return clerkMiddleware();
  }

  /**
   * Returns Express middleware that rejects unauthenticated requests with 401.
   * Used as the first middleware in protected route chains.
   *
   * @returns {import('express').RequestHandler}
   */
  requireAuth() {
    const { requireAuth } = require('@clerk/express');
    return requireAuth();
  }

  /**
   * Returns Express middleware that rejects non-admin requests with 403.
   * Must be used after {@link requireAuth} so `req.auth` is populated.
   *
   * Internally calls {@link getUser} and {@link getUserId} — no direct Clerk
   * API access at middleware level.
   *
   * @returns {import('express').RequestHandler}
   */
  adminOnly() {
    return async (req, res, next) => {
      try {
        const user = await this.getUser(this.getUserId(req));
        if (user.role !== 'admin') {
          return res.status(403).json({ message: 'Admin access required' });
        }
        next();
      } catch (err) {
        console.error('[adminOnly] error:', err?.message ?? err);
        res.status(403).json({ message: 'Admin access required' });
      }
    };
  }

  /**
   * Extracts the authenticated user's ID from an Express request object.
   *
   * Handles both Clerk API versions transparently:
   * - **v2**: `req.auth` is a function — call it first, then read `.userId`.
   * - **v1 / test stubs**: `req.auth` is a plain object — read `.userId` directly.
   *
   * @param {import('express').Request} req
   * @returns {string | undefined} The Clerk user ID, or undefined if no auth
   *   context is present.
   */
  getUserId(req) {
    return typeof req.auth === 'function' ? req.auth()?.userId : req.auth?.userId;
  }

  /**
   * Fetches a single user's profile by Clerk ID and returns a normalised
   * object.  Consumers never see provider-specific structures like
   * `emailAddresses` arrays or `publicMetadata` nesting.
   *
   * @param {string} userId — Clerk user ID
   * @returns {Promise<{ id: string, email: string, name: string | null, role: string | null }>}
   * @see {@link _normaliseUser}
   */
  async getUser(userId) {
    const { clerkClient } = require('@clerk/express');
    const user = await clerkClient.users.getUser(userId);
    return this._normaliseUser(user);
  }

  /**
   * Fetches multiple user profiles in a single batch call.  Returns a map
   * keyed by Clerk user ID.  IDs that have no match are simply absent from
   * the map.
   *
   * Degrades gracefully: returns `{}` (empty object) if `userIds` is
   * null/empty, or if the Clerk API call fails for any reason.  This matches
   * the existing `enrichWithClerkUsers` behaviour — callers see empty
   * enrichment rather than a thrown error.
   *
   * @param {string[] | null | undefined} userIds
   * @returns {Promise<Object<string, { email: string, name: string | null }>>}
   */
  async getUsers(userIds) {
    if (!userIds || userIds.length === 0) return {};

    const { clerkClient } = require('@clerk/express');
    try {
      const { data: users } = await clerkClient.users.getUserList({
        userId: userIds,
      });
      const map = {};
      users.forEach(u => { map[u.id] = this._normaliseUser(u); });
      return map;
    } catch {
      return {};
    }
  }

  /**
   * Translates a raw Clerk user object into the normalised shape consumed by
   * the rest of the application.  This is the only place in the codebase that
   * knows about Clerk's response structure.
   *
   * Field mapping:
   *
   * | Clerk field                        | Normalised field | Fallback |
   * |------------------------------------|------------------|----------|
   * | `clerkUser.id`                     | `id`             | —        |
   * | `emailAddresses[0]?.emailAddress`  | `email`          | `''`     |
   * | `firstName` + `lastName`           | `name`           | `null`   |
   * | `publicMetadata?.role`             | `role`           | `null`   |
   *
   * Name assembly uses `filter(Boolean)` so that when only one of
   * `firstName`/`lastName` is set (or one is an empty string), the result is
   * the single available name rather than `"Alice "` or `" Smith"`.
   *
   * @param {object} clerkUser — raw Clerk user object from the API
   * @returns {{ id: string, email: string, name: string | null, role: string | null }}
   */
  _normaliseUser(clerkUser) {
    return {
      id:    clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
      name:  [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
      role:  clerkUser.publicMetadata?.role ?? null,
    };
  }
}

module.exports = new ClerkAuthAdapter();
