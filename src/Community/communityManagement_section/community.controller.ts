import { Request, Response } from 'express';
import { PrismaClient, Prisma, CommunityRole } from '@prisma/client';
import { CommunityService } from './community.service';
import { z } from 'zod';

const prisma = new PrismaClient();
const communityService = new CommunityService(prisma);

// Validation schemas
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
  role: z.nativeEnum(CommunityRole),
});

const communityIdSchema = z.string();

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
  // Create a new community
  async createCommunity(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const validatedData = createCommunitySchema.parse(req.body);
      const userId = req.user.id;

      const community = await communityService.createCommunity({
        ...validatedData,
        isPrivate: validatedData.isPrivate ?? false,
        creatorId: userId,
      });

      return res.status(201).json(community);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return res.status(400).json({ error: 'Database error occurred' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all communities
  async getCommunities(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const communities = await communityService.getCommunities({
        page,
        limit,
        search,
      });

      res.json(communities);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get a specific community
  async getCommunity(req: Request, res: Response) {
    try {
      const id = communityIdSchema.parse(req.params.id);
      const community = await communityService.getCommunityById(id);
      return res.json(community);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      if (error.message === 'Community not found') {
        return res.status(404).json({ error: 'Community not found' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update community
  async updateCommunity(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const id = communityIdSchema.parse(req.params.id);
      const updates = updateCommunitySchema.parse(req.body);
      const userId = req.user.id;

      const isAdmin = await communityService.isUserAdmin(id, userId);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only admins can update community details' });
      }

      const community = await communityService.updateCommunity(id, updates);
      return res.json(community);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return res.status(400).json({ error: 'Database error occurred' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete community
  async deleteCommunity(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const id = communityIdSchema.parse(req.params.id);
      const userId = req.user.id;

      const isAdmin = await communityService.isUserAdmin(id, userId);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only admins can delete the community' });
      }

      const community = await prisma.community.findUnique({
        where: { id },
      });

      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      await communityService.deleteCommunity(id);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Join community
  async joinCommunity(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const id = communityIdSchema.parse(req.params.id);
      const userId = req.user.id;

      const membership = await communityService.joinCommunity(id, userId);
      return res.status(201).json(membership);
    } catch (error) {
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

  // Leave community
  async leaveCommunity(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const id = communityIdSchema.parse(req.params.id);
      const userId = req.user.id;

      const result = await communityService.leaveCommunity(id, userId);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      if (error.message === 'Cannot leave community as the last admin. Please assign another admin first.') {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update member role
  async updateMemberRole(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const id = communityIdSchema.parse(req.params.id);
      const { userId, role } = updateMemberRoleSchema.parse(req.body);
      const adminId = req.user.id;

      const isAdmin = await communityService.isUserAdmin(id, adminId);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only admins can update member roles' });
      }

      const membership = await communityService.updateMemberRole(id, userId, role);
      return res.json(membership);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get community members
  async getCommunityMembers(req: Request, res: Response) {
    try {
      const id = communityIdSchema.parse(req.params.id);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const members = await communityService.getCommunityMembers(id, { page, limit });
      return res.json(members);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Generate invite link
  async generateInviteLink(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const id = communityIdSchema.parse(req.params.id);
      const userId = req.user.id;

      const canInvite = await communityService.canInviteMembers(id, userId);
      if (!canInvite) {
        return res.status(403).json({ error: 'You do not have permission to generate invite links' });
      }

      const inviteLink = await communityService.generateInviteLink(id);
      return res.json({ inviteLink });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid community ID' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
