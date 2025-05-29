import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../src/services/auth.service';
import { User } from '../src/models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      const result = await this.authService.signup(name, email, password);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.authService.refreshToken(refreshToken);
      res.json(tokens);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as { id: string }).id;
      await this.authService.logout(userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as { id: string }).id;
      const user = await this.authService.getCurrentUser(userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };
} 