import bcrypt from 'bcrypt';
import jwt, { TokenExpiredError, JsonWebTokenError, SignOptions } from 'jsonwebtoken';
import { Response } from 'express';

interface TokenPayload {
  userId: string;
}

// Password Hashing
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Token Generation
export const generateAccessToken = (user: { id: string }): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_ACCESS_SECRET!,
    options
  );
};

export const generateRefreshToken = (user: { id: string }): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET!,
    options
  );
};

// Email Verification
export const generateEmailVerificationToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: '24h' // Email verification link expires in 24 hours
  };
  return jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET!,
    options
  );
};

// Token Verification
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new Error('Access token expired');
    }
    if (error instanceof JsonWebTokenError) {
      throw new Error('Invalid access token');
    }
    throw error;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    if (error instanceof JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
};

export const verifyEmailToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new Error('Email verification link expired');
    }
    if (error instanceof JsonWebTokenError) {
      throw new Error('Invalid email verification link');
    }
    throw error;
  }
};

// Cookie Management
export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  // Set access token cookie (short-lived)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  // Set refresh token cookie (long-lived)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
}; 