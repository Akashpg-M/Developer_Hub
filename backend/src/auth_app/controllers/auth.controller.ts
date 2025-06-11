import { Request, Response } from "express";
import { AuthProvider, UserRole } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { 
  hashPassword, 
  comparePassword, 
  setAuthCookies, 
  clearAuthCookies,
  generateAccessToken,
  generateRefreshToken,
  //verifyRefreshToken
} from "../utils/auth.utils";
import jwt from 'jsonwebtoken';
import prisma from "../lib/prisma";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

interface SignUpBody {
  name: string;
  password: string;
  email: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export const signUp = async (req: Request<{}, {}, SignUpBody>, res: Response): Promise<Response> => {
  const { name, password, email } = req.body;
  try {
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        provider: AuthProvider.LOCAL,
        isEmailVerified: true,
        role: UserRole.USER
      }
    });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      provider: newUser.provider,
      isEmailVerified: newUser.isEmailVerified,
      role: newUser.role,
      message: "Please check your email to verify your account"
    });

  } catch (error) {
    console.error("Error in signUp controller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req: Request<{}, {}, LoginBody>, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        provider: true,
        isEmailVerified: true,
        role: true
      }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.provider !== AuthProvider.LOCAL) {
      return res.status(400).json({ message: `Please login with ${user.provider.toLowerCase()}` });
    }

    if (!user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(401).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Invalid credentials'
    });
  }
};

export const logout = (_req: Request, res: Response): Response => {
  clearAuthCookies(res);
  return res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { name, email } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email }
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateProfile:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ 
        status: 'error',
        message: "Unauthorized" 
      });
    }

    const refreshToken = req.cookies.refreshToken;
    const user = await authService.getCurrentUser(req.user.id, refreshToken);
    
    return res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error("Error in checkAuth controller:", error);
    return res.status(401).json({ 
      status: 'error',
      message: error instanceof Error ? error.message : 'Unauthorized'
    });
  }
};

// export const refreshToken = async (req: Request, res: Response): Promise<Response> => {
//   try {
//     const refreshToken = req.cookies.refreshToken;

//     if (!refreshToken) {
//       return res.status(401).json({
//         status: 'error',
//         message: 'No refresh token provided'
//       });
//     }

//     const decoded = verifyRefreshToken(refreshToken);
//     const user = await prisma.user.findUnique({
//       where: { id: decoded.userId },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         role: true,
//         provider: true,
//         isEmailVerified: true
//       }
//     });

//     if (!user) {
//       return res.status(401).json({
//         status: 'error',
//         message: 'User not found'
//       });
//     }

//     const newAccessToken = generateAccessToken(user);
//     const newRefreshToken = generateRefreshToken(user);
//     setAuthCookies(res, newAccessToken, newRefreshToken);

//     return res.status(200).json({
//       status: 'success',
//       message: 'Tokens refreshed successfully'
//     });
//   } catch (error) {
//     console.error("Refresh token error:", error);
//     return res.status(401).json({
//       status: 'error',
//       message: error instanceof Error ? error.message : 'Token refresh failed'
//     });
//   }
// };
export const refreshToken = async (req: Request, res: Response) => {
  try {
    console.log("✅ Refresh token route hit");
  console.log("Cookies:", req.cookies);
  
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ status: 'error', error: { message: 'No token' } });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string };

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ status: 'error', error: { message: 'Invalid refresh token' } });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken }
    });

    // Set cookies (optional)
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      }
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    return res.status(401).json({ status: 'error', error: { message: 'Invalid refresh token' } });
  }
};
