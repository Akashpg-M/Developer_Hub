import { Response } from "express";
import { Request } from "express";
import { AuthenticatedRequest } from "../../types/express";
import { PrismaClient, AuthProvider, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const prisma = new PrismaClient();

export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Generate JWT token with role
export const generateToken = (user: { id: string; role: UserRole }, res: Response) => {
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" }
  );
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600000, // 1 hour
  });
};

// --------------------- SIGN UP ---------------------
export const signUp = async (req: Request, res: Response) => {
  try {
    const parsed = signUpSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }

    const { name, email, password }: SignUpInput = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        provider: AuthProvider.LOCAL,
        role: UserRole.USER, // Default to USER role
      },
    });

    generateToken({ id: newUser.id, role: newUser.role }, res);

    return res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error: unknown) {
    console.error("Error in signUp:", error instanceof Error ? error.message : "Unknown error");
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// --------------------- LOGIN ---------------------
export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }

    const { email, password }: LoginInput = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken({ id: user.id, role: user.role }, res);

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error: unknown) {
    console.error("Error in login:", error instanceof Error ? error.message : "Unknown error");
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// --------------------- LOGOUT ---------------------
export const logout = (_req: Request, res: Response) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error: unknown) {
    console.error("Logout error:", error instanceof Error ? error.message : "Unknown error");
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// --------------------- CHECK AUTH ---------------------
export const checkAuth = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
        role: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(user);
  } catch (error: unknown) {
    console.error("CheckAuth error:", error instanceof Error ? error.message : "Unknown error");
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
