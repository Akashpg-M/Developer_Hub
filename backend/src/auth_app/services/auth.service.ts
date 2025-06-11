import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken } from '../utils/auth.utils';
import { hashPassword as hash, comparePassword as compare } from '../utils/auth.utils';

const prisma = new PrismaClient();

export class AuthService {
  async signup(name: string, email: string, password: string) {
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new Error('Email already registered');
      }

      const hashedPassword = await hash(password);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          provider: 'LOCAL',
          isEmailVerified: false,
        },
      });

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Store refresh token in database
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken }
      });

      return { user, accessToken, refreshToken };
    } catch (error) {
      console.error('Error in signup:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || !user.password) {
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Store refresh token in database
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken }
      });

      return { user, accessToken, refreshToken };
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };

      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) {
        throw new Error('User not found');
      }

      // Check if refresh token is null (user has logged out)
      if (!user.refreshToken) {
        throw new Error('User has logged out');
      }

      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      // Update the refresh token in database
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken }
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      console.error('Error in refreshToken:', error);
      if (error instanceof Error && error.message === 'User not found') {
        throw error;
      }
      if (error instanceof Error && error.message === 'User has logged out') {
        throw error;
      }
      throw new Error('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<boolean> {
    try {
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Clear the refresh token
      await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null }
      });

      return true;
    } catch (error) {
      console.error('Error in logout:', error);
      throw error;
    }
  }

  async getCurrentUser(userId: string, cookieRefreshToken?: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          provider: true,
          isEmailVerified: true,
          role: true,
          refreshToken: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check if user has a valid refresh token and it matches the cookie
      if (!user.refreshToken || !cookieRefreshToken || user.refreshToken !== cookieRefreshToken) {
        throw new Error('User has logged out');
      }

      // Remove refreshToken from response
      const { refreshToken, ...userWithoutToken } = user;
      return userWithoutToken;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      throw error;
    }
  }
}
