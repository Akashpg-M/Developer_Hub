import { AuthService } from '../../src/auth-system/services/auth.service';
import { mockUser } from '../utils/testUtils';
import { hash, compare } from '../../src/auth-system/utils/hash';
import jwt from 'jsonwebtoken';

// Mock the PrismaClient module
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
  };
});

// Get the mocked Prisma instance
const mockPrisma = (new (require('@prisma/client').PrismaClient)()).user;

jest.mock('../../src/auth-system/utils/hash');
jest.mock('../../src/auth-system/utils/token', () => ({
  generateAccessToken: jest.fn(() => 'mock-access-token'),
  generateRefreshToken: jest.fn(() => 'mock-refresh-token'),
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockPrisma.findUnique.mockResolvedValue(null);
      (hash as jest.Mock).mockResolvedValue('hashedPassword123');
      mockPrisma.create.mockResolvedValue(mockUser);

      const result = await authService.signup(userData.name, userData.email, userData.password);

      expect(result).toBeDefined();
      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(mockPrisma.create).toHaveBeenCalledWith({
        data: {
          name: userData.name,
          email: userData.email,
          password: 'hashedPassword123',
          provider: 'LOCAL',
          isEmailVerified: false,
        },
      });
    });

    it('should throw error if email already registered', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockPrisma.findUnique.mockResolvedValue(mockUser);

      await expect(authService.signup(userData.name, userData.email, userData.password))
        .rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockPrisma.findUnique.mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(loginData.email, loginData.password);

      expect(result).toBeDefined();
      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
    });

    it('should throw error if user not found', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockPrisma.findUnique.mockResolvedValue(null);

      await expect(authService.login(loginData.email, loginData.password))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw error if password is incorrect', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockPrisma.findUnique.mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginData.email, loginData.password))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'valid-refresh-token';

      (jwt.verify as jest.Mock).mockReturnValue({ userId: mockUser.id });
      mockPrisma.findUnique.mockResolvedValue(mockUser);

      const result = await authService.refreshToken(refreshToken);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(jwt.verify).toHaveBeenCalledWith(refreshToken, process.env.JWT_REFRESH_SECRET);
    });

    it('should throw error if token is invalid', async () => {
      const refreshToken = 'invalid-refresh-token';

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshToken(refreshToken))
        .rejects.toThrow('Invalid refresh token');
    });

    it('should throw error if user not found', async () => {
      const refreshToken = 'valid-refresh-token';

      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'nonexistent-id' });
      mockPrisma.findUnique.mockResolvedValue(null);

      await expect(authService.refreshToken(refreshToken))
        .rejects.toThrow('User not found');
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      mockPrisma.findUnique.mockResolvedValue(mockUser);

      const result = await authService.logout(mockUser.id);

      expect(result).toBe(true);
    });

    it('should throw error if user not found', async () => {
      mockPrisma.findUnique.mockResolvedValue(null);

      await expect(authService.logout('nonexistent-id'))
        .rejects.toThrow('User not found');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      mockPrisma.findUnique.mockResolvedValue(mockUser);

      const result = await authService.getCurrentUser(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(mockPrisma.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: {
          id: true,
          name: true,
          email: true,
          provider: true,
          isEmailVerified: true,
          role: true,
        },
      });
    });

    it('should throw error if user not found', async () => {
      mockPrisma.findUnique.mockResolvedValue(null);

      await expect(authService.getCurrentUser('nonexistent-id'))
        .rejects.toThrow('User not found');
    });
  });
}); 