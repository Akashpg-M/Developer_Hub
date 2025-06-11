import { Request, Response } from 'express';
import { PrismaClient, Prisma, CommunityRole } from '@prisma/client';
import { CommunityService } from './community.service';
import { z } from 'zod';

// Validation schemas
const communityIdSchema = z.string().min(1);

const createCommunitySchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().min(10).max(500),
  isPrivate: z.boolean().optional(),
});

const updateCommunitySchema = z.object({
  name: z.string().min(3).max(50).optional(),
  description: z.string().min(10).max(500).optional(),
  isPrivate: z.boolean().optional(),
});

const updateMemberRoleSchema = z.object({
  userId: z.string(),
  role: z.string().transform(val => val.trim()).pipe(z.nativeEnum(CommunityRole)),
});

// Extend Express Request type
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    provider: string;
    isEmailVerified: boolean;
    role: string;
  };
}

export class CommunityController {
  private prisma: PrismaClient;
  private communityService: CommunityService;

  constructor() {
    this.prisma = new PrismaClient();
    this.communityService = new CommunityService(this.prisma);
    
    // Bind all methods to preserve 'this' context
    this.createCommunity = this.createCommunity.bind(this);
    this.getCommunities = this.getCommunities.bind(this);
    this.getCommunity = this.getCommunity.bind(this);
    this.updateCommunity = this.updateCommunity.bind(this);
    this.deleteCommunity = this.deleteCommunity.bind(this);
    this.joinCommunity = this.joinCommunity.bind(this);
    this.leaveCommunity = this.leaveCommunity.bind(this);
    this.updateMemberRole = this.updateMemberRole.bind(this);
    this.getCommunityMembers = this.getCommunityMembers.bind(this);
    this.generateInviteLink = this.generateInviteLink.bind(this);
    this.getUserCommunities = this.getUserCommunities.bind(this);
  }

  async createCommunity(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const validatedData = createCommunitySchema.parse(req.body);
      const userId = req.user.id;

      const community = await this.communityService.createCommunity({
        ...validatedData,
        isPrivate: validatedData.isPrivate ?? false,
        creatorId: userId
      });

      return res.status(201).json(community);
    } catch (error) {
      console.log('Raw error in createCommunity:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return res.status(400).json({ error: 'Database error occurred' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getCommunities(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const sortBy = (req.query.sortBy as 'name' | 'createdAt' | 'memberCount') || 'createdAt';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc'; 

      const communities = await this.communityService.getCommunities({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      });

      return res.json(communities);
    } catch (error) {
      console.log('Raw error in getCommunities:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getCommunity(req: Request, res: Response): Promise<Response> {
    try {
      const id = communityIdSchema.parse(req.params.communityId);
      const community = await this.communityService.getCommunityById(id);
      return res.json(community);
    } catch (error) {
      console.log('Raw error in getCommunity:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      if (error.message === 'Community not found') {
        return res.status(404).json({ error: 'Community not found' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateCommunity(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const id = communityIdSchema.parse(req.params.communityId);
      const updates = updateCommunitySchema.parse(req.body);
      const userId = req.user.id;

      const isAdmin = await this.communityService.isUserAdmin(id, userId);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only admins can update community details' });
      }

      const community = await this.communityService.updateCommunity(id, updates);
      return res.json(community);
    } catch (error) {
      console.log('Raw error in updateCommunity:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return res.status(400).json({ error: 'Database error occurred' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteCommunity(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const id = communityIdSchema.parse(req.params.communityId);
      const userId = req.user.id;

      const isAdmin = await this.communityService.isUserAdmin(id, userId);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only admins can delete the community' });
      }

      const community = await this.prisma.community.findUnique({
        where: { id },
      });

      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      await this.communityService.deleteCommunity(id);
      return res.status(204).send();
    } catch (error) {
      console.log('Raw error in deleteCommunity:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async joinCommunity(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const id = communityIdSchema.parse(req.params.communityId);
      const userId = req.user.id;

      const membership = await this.communityService.joinCommunity(id, userId);
      return res.status(201).json(membership);
    } catch (error) {
      console.log('Raw error in joinCommunity:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return res.status(400).json({ error: 'Already a member of this community' });
        }
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async leaveCommunity(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const id = communityIdSchema.parse(req.params.communityId);
      const userId = req.user.id;

      const community = await this.prisma.community.findUnique({ where: { id } });
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      const membership = await this.prisma.communityMember.findUnique({
        where: {
          communityId_userId: {
            userId,
            communityId: id,
          },
        },
      });

      if (!membership) {
        return res.status(400).json({ error: 'You are not a member of this community' });
      }

      // If the leaving member is the owner, delete the entire community
      if (membership.role === CommunityRole.OWNER) {
        await this.communityService.deleteCommunity(id);
        return res.status(200).json({ message: 'Community deleted as owner left' });
      }

      // For other roles, just remove the member
      await this.prisma.communityMember.delete({
        where: {
          communityId_userId: {
            userId,
            communityId: id,
          },
        },
      });

      return res.status(200).json({ message: 'Left the community successfully' });
    } catch (error) {
      console.log('Raw error in leaveCommunity:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateMemberRole(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      const id = communityIdSchema.parse(req.params.communityId);
      const { userId, role } = updateMemberRoleSchema.parse(req.body);
      const requesterId = req.user.id;

      const isAdmin = await this.communityService.isUserAdmin(id, requesterId);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only admins can change roles' });
      }

      const updated = await this.prisma.communityMember.update({
        where: {
          communityId_userId: {
            userId,
            communityId: id,
          },
        },
        data: { role },
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.log('Raw error in updateMemberRole:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getCommunityMembers(req: Request, res: Response): Promise<Response> {
    try {
      const id = communityIdSchema.parse(req.params.communityId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const members = await this.prisma.communityMember.findMany({
        where: { communityId: id },
        include: {
          user: {
            select: { id: true, name: true, email: true, profilePicture: true } // be specific if needed
          }
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      return res.json({ status: 'success', data: members });
    } catch (error) {
      console.error('error in getCommunityMembers:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ status: 'error', error: { message: 'Invalid community ID' } });
      }
      return res.status(500).json({ status: 'error', error: { message: 'Internal server error' } });
    }
  }


  async generateInviteLink(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const id = communityIdSchema.parse(req.params.communityId);
      const userId = req.user.id;

      const isAdmin = await this.communityService.isUserAdmin(id, userId);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only admins can generate invite links' });
      }

      const inviteLink = await this.communityService.generateInviteLink(id, userId);
      return res.json({ inviteLink });
    } catch (error) {
      console.log('Raw error in generateInviteLink:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUserCommunities(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const sortBy = req.query.sortBy as 'name' | 'createdAt' | 'memberCount' || 'createdAt';
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';
      const userId = req.user.id;

      const communities = await this.communityService.getUserCommunities(userId, {
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      });

      return res.json(communities);
    } catch (error) {
      console.log('Raw error in getUserCommunities:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
