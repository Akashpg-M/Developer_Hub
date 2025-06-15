import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { PrismaClient, UserRole, AuthProvider } from '@prisma/client';

const prisma = new PrismaClient();

interface DecodedToken extends JwtPayload {
  userId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    provider: AuthProvider;
    profilePicture?: string | null;
    role: UserRole;
  };
}


//Get the JWT token from the request
//Checks both Authorization header and cookies

const getToken = (req: Request): string | null => {
  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  
  // Fall back to cookies
  return req.cookies?.jwt || null;
};


 // Middleware to protect routes that require authentication

export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // 1) Get token and check if it exists
    const token = getToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'You are not logged in. Please log in to get access.',
      });
    }

    // 2) Verify token
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          error: 'Your token has expired. Please log in again.',
        });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token. Please log in again.',
        });
      }
      throw error;
    }

    // 3) Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
        profilePicture: true,
        role: true,
        // Add any other user fields you need
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'The user belonging to this token no longer exists.',
      });
    }


    // 4) Grant access to protected route
    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred during authentication. Please try again later.',
    });
  }
};

/**
 * Middleware to restrict routes to specific roles
 */
export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to perform this action',
      });
    }
    
    return next();
  };
};
