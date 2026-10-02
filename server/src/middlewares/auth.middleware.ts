import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { Role } from '../../generated/prisma/enums';

import { prisma } from '../applications/database';

import { ResponseError } from '../errors/response.error';

import { JwtClaims, JwtPayload } from '../models/auth.model';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

async function resolveUserFromToken(token: string): Promise<JwtPayload> {
  const claims = jwt.verify(
    token,
    process.env.JWT_SECRET as string,
  ) as JwtClaims;

  const user = await prisma.user.findUnique({
    where: { id: claims.id },
    select: { id: true, email: true, name: true, role: true },
  });

  // Token signature is valid, but the user no longer exists (deleted) —
  // treat this the same as an invalid token, not a 404.
  if (!user) throw new ResponseError(401, 'Invalid or expired token');

  return user;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) throw new ResponseError(401, 'Unauthorized');

  try {
    req.user = await resolveUserFromToken(token);

    next();
  } catch (e) {
    const isAuthFailure =
      e instanceof jwt.JsonWebTokenError || e instanceof ResponseError;

    next(
      isAuthFailure ? new ResponseError(401, 'Invalid or expired token') : e,
    );
  }
}

export function roleMiddleware(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) throw new ResponseError(401, 'Unauthorized');

    if (!roles.includes(req.user.role as Role)) {
      throw new ResponseError(403, 'Forbidden');
    }

    next();
  };
}

export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return next();
  }

  try {
    req.user = await resolveUserFromToken(token);
  } catch (e) {
    // Bad signature, expired token, or deleted user: continue as a guest.
    // Anything else (e.g. the database is down) is a real error, so pass it on.
    const isAuthFailure =
      e instanceof jwt.JsonWebTokenError || e instanceof ResponseError;

    if (!isAuthFailure) return next(e);
  }

  next();
}
