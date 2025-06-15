import { UserRole, AuthProvider } from '@prisma/client';

// Define the base user type that matches what's added by the auth middleware
type BaseUser = {
  id: string;
  name: string;
  email: string;
  provider: AuthProvider;
  profilePicture?: string | null;
};

// The AuthUser type includes the role
// This ensures compatibility with both the auth middleware and our authorization
// The auth middleware adds the user without the role, and our authorization adds it
type AuthUser = BaseUser & {
  role: UserRole;
};

declare global {
  namespace Express {
    // Extend the Request interface to include the user property
    // Make it accept both with and without role for better compatibility
    interface Request {
      user?: AuthUser | (BaseUser & { role?: UserRole });
    }
  }
}

export {};
