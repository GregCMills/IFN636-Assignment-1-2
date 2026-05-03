/**
 * @module ClerkAuthAdapter
 * Concrete authentication adapter for Clerk (@clerk/express).
 *
 * All Clerk-specific code lives here. No other file in the application should
 * import from @clerk/express.  Consumers import this singleton and call the
 * adapter methods — they never touch Clerk internals directly.
 *
 * The module exports a singleton instance (Node.js module caching).
 */

const AuthAdapter = require('./AuthAdapter');

class ClerkAuthAdapter extends AuthAdapter {

  contextMiddleware() {
    const { clerkMiddleware } = require('@clerk/express');
    return clerkMiddleware();
  }

  requireAuth() {
    const { requireAuth } = require('@clerk/express');
    return requireAuth();
  }

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

  getUserId(req) {
    return typeof req.auth === 'function' ? req.auth()?.userId : req.auth?.userId;
  }

  async getUser(userId) {
    const { clerkClient } = require('@clerk/express');
    const user = await clerkClient.users.getUser(userId);
    return this._normaliseUser(user);
  }

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
