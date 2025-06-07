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
): void => {
  console.log('Validating request:', {
    body: req.body,
    path: req.path
  });

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    res.status(400).json({ 
      status: 'error',
      errors: errors.array() 
    });
    return;
  }
  next();
}; 