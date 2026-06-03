import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { Role } from '../../generated/prisma/enums';

import { ResponseError } from '../errors/response.error';

import { JwtPayload } from '../models/auth.model';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) throw new ResponseError(401, 'Unauthorized');

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    req.user = payload;
    next();
  } catch (e) {
    next(new ResponseError(401, 'Invalid or expired token'));
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
