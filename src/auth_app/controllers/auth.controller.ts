import { Request, Response } from "express";
import { AuthProvider, UserRole } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { 
  hashPassword, 
  comparePassword, 
  setAuthCookies, 
  clearAuthCookies,
  generateAccessToken,
  generateRefreshToken
} from "../utils/auth.utils";
import prisma from "../lib/prisma";

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

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
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

    if (newUser) {
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
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in SignUp controller", (error as Error).message);
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
    console.error('Login error:', error);
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
    console.log("Error in update profile : ", (error as Error).message);
    return res.status(500).json({ message: "Internal server Error" });
  }
};

export const checkAuth = (req: AuthenticatedRequest, res: Response): Response => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkauth Controller", (error as Error).message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}; 