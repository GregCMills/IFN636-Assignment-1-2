const { clerkClient } = require('@clerk/express');

/**
 * Fetches the Clerk user and checks publicMetadata.role === 'admin'.
 * Must be used after protect (requireAuth) middleware so req.auth.userId exists.
 *
 * Note: @clerk/express v2 exposes req.auth as a function; calling req.auth()
 * returns the auth object. This middleware handles both forms for compatibility.
 */
const adminOnly = async (req, res, next) => {
  try {
    const userId = typeof req.auth === 'function' ? req.auth()?.userId : req.auth?.userId;
    const user   = await clerkClient.users.getUser(userId);
    if (user.publicMetadata?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (err) {
    console.error('[adminOnly] error:', err?.message ?? err);
    res.status(403).json({ message: 'Admin access required' });
  }
};

module.exports = { adminOnly };
