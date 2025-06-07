import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CommunityController {
  async listMembers(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const [members, total] = await Promise.all([
        prisma.communityMember.findMany({
          include: {
            user: true
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: [
            { points: 'desc' },
            { joinedAt: 'desc' }
          ]
        }),
        prisma.communityMember.count()
      ]);

      return res.json({
        members,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      return next(error);
    }
  }

  async searchMembers(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { query } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const [members, total] = await Promise.all([
        prisma.communityMember.findMany({
          where: {
            OR: [
              { user: { name: { contains: query as string, mode: 'insensitive' } } },
              { user: { email: { contains: query as string, mode: 'insensitive' } } }
            ]
          },
          include: {
            user: true
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: [
            { points: 'desc' },
            { joinedAt: 'desc' }
          ]
        }),
        prisma.communityMember.count({
          where: {
            OR: [
              { user: { name: { contains: query as string, mode: 'insensitive' } } },
              { user: { email: { contains: query as string, mode: 'insensitive' } } }
            ]
          }
        })
      ]);

      return res.json({
        members,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      return next(error);
    }
  }

  async getMemberRank(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { userId } = req.params;
      const member = await prisma.communityMember.findFirst({
        where: { userId }
      });

      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }

      return res.json({ rank: member.rank });
    } catch (error) {
      return next(error);
    }
  }
} 