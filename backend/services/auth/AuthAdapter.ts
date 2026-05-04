import { Request, RequestHandler } from 'express';

/**
 * @module AuthAdapter
 * Base class defining the authentication adapter interface.
 *
 * All methods throw "Not implemented" so a concrete adapter that forgets
 * to override a method fails loudly at runtime.
 */

export interface NormalisedUser {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
}

export abstract class AuthAdapter {
  /** Returns Express middleware that attaches auth context to every request. */
  abstract contextMiddleware(): RequestHandler;

  /** Returns Express middleware that rejects unauthenticated requests (401). */
  abstract requireAuth(): RequestHandler;

  /** Returns Express middleware that rejects non-admin requests (403). */
  abstract adminOnly(): RequestHandler;

  /** Extracts the authenticated user's ID from an Express request object. */
  abstract getUserId(req: Request): string | undefined | null;

  /** Fetches a single user's normalised profile by ID. */
  abstract getUser(userId: string): Promise<NormalisedUser>;

  /** Fetches multiple user profiles in batch. Returns a map keyed by user ID. */
  abstract getUsers(userIds: string[] | null | undefined): Promise<Record<string, NormalisedUser>>;
}

export default AuthAdapter;
