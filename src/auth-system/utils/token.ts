import jwt, { TokenExpiredError, JsonWebTokenError, SignOptions } from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
}

// Generate Access Token
export const generateAccessToken = (user: { id: string }): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '1h') as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_ACCESS_SECRET!,
    options
  );
};

// Generate Refresh Token
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

// Verify Access Token
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

// Verify Refresh Token
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
