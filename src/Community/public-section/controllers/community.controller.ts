import { Request, Response, NextFunction } from 'express';
import { CommunityService } from '../services/community.service';

export class CommunityController {
  private communityService: CommunityService;

  constructor() {
    this.communityService = new CommunityService();
  }

  listMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.communityService.listMembers(page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  searchMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const result = await this.communityService.searchMembers(query as string, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getMemberRank = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const rank = await this.communityService.getMemberRank(userId);
      res.json({ rank });
    } catch (error) {
      next(error);
    }
  };
} 