/**
 * @module AuthAdapter
 * Base class defining the authentication adapter interface.
 *
 * All methods throw "Not implemented" so a concrete adapter that forgets
 * to override a method fails loudly at runtime.
 */

class AuthAdapter {
  /** Returns Express middleware that attaches auth context to every request. */
  contextMiddleware() { throw new Error('Not implemented'); }

  /** Returns Express middleware that rejects unauthenticated requests (401). */
  requireAuth()       { throw new Error('Not implemented'); }

  /** Returns Express middleware that rejects non-admin requests (403). */
  adminOnly()         { throw new Error('Not implemented'); }

  /** Extracts the authenticated user's ID from an Express request object. */
  getUserId(req)      { throw new Error('Not implemented'); }

  /** Fetches a single user's normalised profile by ID. */
  async getUser(userId)    { throw new Error('Not implemented'); }

  /** Fetches multiple user profiles in batch. Returns a map keyed by user ID. */
  async getUsers(userIds)  { throw new Error('Not implemented'); }
}

module.exports = AuthAdapter;
