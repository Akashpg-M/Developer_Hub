import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export class ValidationError extends Error {
  constructor(public errors: any[]) {
    super('Validation Error');
    this.name = 'ValidationError';
  }
}

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array());
  }
  next();
}; 