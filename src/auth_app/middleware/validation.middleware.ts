import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { validationResult } from 'express-validator';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateRequest = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {   
      schema.parse(req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      
      next();
    } catch (error) {
      console.error('Validation error:', error);
      if (error.errors) {
        res.status(400).json({ errors: error.errors });
        return;
      }
      res.status(400).json({ error: 'Validation failed' });
    }
  };
}; 