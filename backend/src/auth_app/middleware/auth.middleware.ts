import { Request, Response, NextFunction } from "express";
import { PrismaClient } from '@prisma/client';
import { 
  verifyAccessToken, 
  verifyRefreshToken, 
  generateAccessToken, 
  generateRefreshToken,
  setAuthCookies 
} from '../utils/auth.utils';

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

export const protectRoute = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!accessToken && !refreshToken) {
      res.status(401).json({ message: 'Not authorized, no tokens' });
      return;
    }

    try {
      // Try to verify access token first
      const decoded = verifyAccessToken(accessToken);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          provider: true,
          isEmailVerified: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      req.user = user;
      next();
    } catch (error) {
      // If access token is invalid or expired, try refresh token
      if (error instanceof Error && error.message === 'Access token expired' && refreshToken) {
        try {
          const decoded = verifyRefreshToken(refreshToken);
          const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              provider: true,
              isEmailVerified: true
            }
          });

          if (!user) {
            throw new Error('User not found');
          }

          // Generate new tokens
          const newAccessToken = generateAccessToken(user);
          const newRefreshToken = generateRefreshToken(user);

          // Set new cookies
          setAuthCookies(res, newAccessToken, newRefreshToken);

          req.user = user;
          next();
        } catch (refreshError) {
          console.error('Refresh token error:', refreshError);
          res.status(401).json({ message: 'Not authorized, refresh token failed' });
        }
      } else {
        console.error('Access token error:', error);
        res.status(401).json({ message: 'Not authorized, access token failed' });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
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