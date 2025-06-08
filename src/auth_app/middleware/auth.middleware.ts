import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    provider: string;
    isEmailVerified: boolean;
    role: string;
  };
}

interface TokenPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        provider: string;
        isEmailVerified: boolean;
        role: string;
      };
    }
  }
}

export const protectRoute = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies.accessToken;
    
    if (!token) {
      console.log('No token found in cookies:', req.cookies);
      res.status(401).json({ message: 'Not authorized, no token' });
      return;
    }

    if (!process.env.JWT_ACCESS_SECRET) {
      console.error('JWT_ACCESS_SECRET is not configured in environment variables');
      throw new Error('JWT_ACCESS_SECRET is not configured');
    }

    console.log('Verifying token:', token);
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET) as TokenPayload;
    console.log('Decoded token payload:', decoded);
    
    if (!decoded.userId) {
      console.error('Token payload missing userId:', decoded);
      throw new Error('Invalid token payload');
    }

    console.log('Finding user with ID:', decoded.userId);
    prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        provider: true,
        isEmailVerified: true
      }
    }).then(user => {
      if (!user) {
        console.error('User not found for ID:', decoded.userId);
        res.status(401).json({ message: 'User not found' });
        return;
      }
      console.log('User found:', user);
      req.user = user;
      next();
    }).catch(error => {
      console.error('Database error in auth middleware:', {
        error: error,
        stack: error.stack,
        message: error.message,
        code: error.code
      });
      res.status(401).json({ message: 'Not authorized, token failed' });
    });
  } catch (error) {
    console.error('Auth middleware error:', {
      error: error,
      stack: error instanceof Error ? error.stack : 'No stack trace',
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const checkRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { role: true },
      });

      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      return next();
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}; 