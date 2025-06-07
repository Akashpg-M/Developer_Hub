import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

export const mockRequest = (body = {}, params = {}, query = {}, headers = {}) => {
  return {
    body,
    params,
    query,
    headers,
  } as Request;
};

export const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
};

export const generateTestToken = (user: Partial<User>) => {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

export const generateTestRefreshToken = (user: Partial<User>) => {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET || 'test-refresh-secret',
    { expiresIn: '7d' }
  );
};

export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedPassword123',
  provider: 'LOCAL',
  isEmailVerified: false,
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date(),
} as User;

export const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}; 