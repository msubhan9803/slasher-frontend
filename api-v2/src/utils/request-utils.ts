import { Request } from 'express';
import { UserDocument } from '../schemas/user.schema';

/**
 * Extracts the user property (if present) from the given request object.
 * @param request
 * @returns A UserDocument (or null if user was not set on request object)
 */
export const getUserFromRequest = function (request: Request): UserDocument | null {
  const { user } = request as any;
  return user ? user as UserDocument : null;
};
