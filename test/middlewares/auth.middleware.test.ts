import { Response } from 'express';
import { verifyAccessToken } from '../../src/auth-system/utils/token';
import { authenticateJWT, checkRole } from '../../src/auth-system/middlewares/auth.middleware';
import { mockUser, generateTestToken } from '../utils/testUtils';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        provider: string;
        isEmailVerified: boolean;
      };
    }
  }
}

jest.mock('../../src/auth-system/utils/token');
jest.mock('../../src/lib/prisma', () => ({
  user: {
    findUnique: jest.fn(),
  },
}));

describe('Auth Middleware', () => {
  let mockNext: jest.Mock;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockNext = jest.fn();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('authenticateJWT', () => {
    it('should authenticate user successfully', async () => {
      const mockReq = {
        headers: {
          authorization: `Bearer ${generateTestToken(mockUser)}`,
        },
        user: undefined,
      };

      (verifyAccessToken as jest.Mock).mockReturnValue({ userId: mockUser.id });
      (require('../../src/lib/prisma').user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await authenticateJWT(mockReq as any, mockRes as Response, mockNext);

      expect(verifyAccessToken).toHaveBeenCalledWith(generateTestToken(mockUser));
      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should return 401 if no authorization header', async () => {
      const mockReq = {
        headers: {},
        user: undefined,
      };

      await authenticateJWT(mockReq as any, mockRes as Response, mockNext);

      expect(verifyAccessToken).not.toHaveBeenCalled();
      expect(mockReq.user).toBeUndefined();
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'No token provided' });
    });

    it('should return 401 if token is invalid', async () => {
      const mockReq = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
        user: undefined,
      };

      (verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authenticateJWT(mockReq as any, mockRes as Response, mockNext);

      expect(verifyAccessToken).toHaveBeenCalledWith('invalid-token');
      expect(mockReq.user).toBeUndefined();
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    });
  });

  describe('checkRole', () => {
    it('should allow access for admin role', async () => {
      const mockReq = {
        user: mockUser,
      };

      (require('../../src/lib/prisma').user.findUnique as jest.Mock).mockResolvedValue({ role: 'admin' });

      await checkRole(['admin'])(mockReq as any, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should return 403 for insufficient role', async () => {
      const mockReq = {
        user: mockUser,
      };

      (require('../../src/lib/prisma').user.findUnique as jest.Mock).mockResolvedValue({ role: 'user' });

      await checkRole(['admin'])(mockReq as any, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Insufficient permissions' });
    });

    it('should return 401 if user not authenticated', async () => {
      const mockReq = {
        user: undefined,
      };

      await checkRole(['admin'])(mockReq as any, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Authentication required' });
    });
  });
}); 