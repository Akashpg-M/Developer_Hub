import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateRequest = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData; // Replace with validated data
      next();
    } catch (error) {
      console.error('Validation error:', error);
      if (error.errors) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(400).json({ error: 'Validation failed' });
    }
  };
}; 