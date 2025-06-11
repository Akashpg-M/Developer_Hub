import { AuthController } from '../../src/auth-system/controllers/auth.controller';
import { AuthService } from '../../src/auth-system/services/auth.service';
import { mockRequest, mockResponse, mockUser, generateTestToken } from '../utils/testUtils';

// Mock the AuthService
jest.mock('../../src/auth-system/services/auth.service');

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    // Create a new instance of AuthService for each test
    mockAuthService = new AuthService() as jest.Mocked<AuthService>;
    // Create a new instance of AuthController with the mocked service
    authController = new AuthController();
    // Replace the authService instance with our mock
    (authController as any).authService = mockAuthService;
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user successfully', async () => {
      const req = mockRequest({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      const res = mockResponse();

      const mockSignupResponse = {
        user: mockUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      mockAuthService.signup.mockResolvedValue(mockSignupResponse);

      await authController.signup(req, res, mockNext);

      expect(mockAuthService.signup).toHaveBeenCalledWith(
        'Test User',
        'test@example.com',
        'password123'
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockSignupResponse);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const req = mockRequest({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      const res = mockResponse();
      const error = new Error('Email already registered');

      mockAuthService.signup.mockRejectedValue(error);

      await authController.signup(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'password123',
      });
      const res = mockResponse();

      const mockLoginResponse = {
        user: mockUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      await authController.login(req, res, mockNext);

      expect(mockAuthService.login).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
      expect(res.json).toHaveBeenCalledWith(mockLoginResponse);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
      const res = mockResponse();
      const error = new Error('Invalid credentials');

      mockAuthService.login.mockRejectedValue(error);

      await authController.login(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const req = mockRequest({
        refreshToken: 'valid-refresh-token',
      });
      const res = mockResponse();

      const mockRefreshResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

      await authController.refreshToken(req, res, mockNext);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(res.json).toHaveBeenCalledWith(mockRefreshResponse);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const req = mockRequest({
        refreshToken: 'invalid-refresh-token',
      });
      const res = mockResponse();
      const error = new Error('Invalid refresh token');

      mockAuthService.refreshToken.mockRejectedValue(error);

      await authController.refreshToken(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const req = mockRequest({}, {}, {}, {
        authorization: `Bearer ${generateTestToken(mockUser)}`,
      });
      req.user = mockUser;
      const res = mockResponse();

      mockAuthService.logout.mockResolvedValue(true);

      await authController.logout(req, res, mockNext);

      expect(mockAuthService.logout).toHaveBeenCalledWith(mockUser.id);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const req = mockRequest({}, {}, {}, {
        authorization: `Bearer ${generateTestToken(mockUser)}`,
      });
      req.user = mockUser;
      const res = mockResponse();
      const error = new Error('User not found');

      mockAuthService.logout.mockRejectedValue(error);

      await authController.logout(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const req = mockRequest({}, {}, {}, {
        authorization: `Bearer ${generateTestToken(mockUser)}`,
      });
      req.user = mockUser;
      const res = mockResponse();

      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      await authController.getCurrentUser(req, res, mockNext);

      expect(mockAuthService.getCurrentUser).toHaveBeenCalledWith(mockUser.id);
      expect(res.json).toHaveBeenCalledWith(mockUser);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const req = mockRequest({}, {}, {}, {
        authorization: `Bearer ${generateTestToken(mockUser)}`,
      });
      req.user = mockUser;
      const res = mockResponse();
      const error = new Error('User not found');

      mockAuthService.getCurrentUser.mockRejectedValue(error);

      await authController.getCurrentUser(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
}); 