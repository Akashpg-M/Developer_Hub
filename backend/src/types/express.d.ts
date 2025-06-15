import { Request } from 'express';
import { AuthProvider } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        provider: AuthProvider;
        profilePicture?: string | null;
      };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: NonNullable<Request['user']>;
}
