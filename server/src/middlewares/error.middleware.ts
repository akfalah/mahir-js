import { Request, Response, NextFunction } from 'express';

import { ZodError } from 'zod';

import { ResponseError } from '../errors/response.error';

export const errorMiddleware = async (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (error instanceof ZodError) {
    const messages = error.issues.map((issue) => {
      const field = issue.path.join('.');
      return field ? `${field}: ${issue.message}` : issue.message;
    });

    res.status(400).json({
      errors: messages.length === 1 ? messages[0] : messages,
    });
  } else if (error instanceof ResponseError) {
    res.status(error.status).json({
      errors: error.message,
    });
  } else {
    res.status(500).json({
      errors: error.message,
    });
  }
};
