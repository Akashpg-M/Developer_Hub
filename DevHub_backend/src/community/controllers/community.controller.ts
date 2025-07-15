import { Response, Request } from 'express';
import { PrismaClient, Prisma, CommunityRole } from '@prisma/client';
import { z } from 'zod';
import { AuthenticatedRequest } from '../../types/express';

const prisma = new PrismaClient();

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

// Custom error classes
class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class ForbiddenError extends Error {
  statusCode = 403;
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

// Helper functions
const checkCommunityMembership = async (userId: string, communityId: string) => {
  const member = await prisma.communityMember.findFirst({
    where: { communityId, userId },
  });
  if (!member) throw new NotFoundError('You are not a member of this community');
  return member;
};

const isUserAdminOrOwner = async (communityId: string, userId: string) => {
  const member = await prisma.communityMember.findUnique({
    where: { communityId_userId: { communityId, userId } },
  });
  if (!member) throw new NotFoundError('You are not a member of this community');
  if (member.role !== 'ADMIN' && member.role !== 'OWNER') {
    throw new ForbiddenError('Only admins or owners can perform this action');
  }
  return true;
};

// Controller functions
export const createCommunity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenError('Unauthorized');

    const validatedData = createCommunitySchema.parse(req.body);

    const community = await prisma.$transaction(async (tx) => {
      return await tx.community.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          isPrivate: validatedData.isPrivate ?? false,
          createdBy: userId,
          communityMembers: {
            create: {
              userId,
              role: 'OWNER',
            },
          },
        },
        include: {
          communityMembers: {
            include: {
              user: {
                select: { id: true, name: true, email: true, profilePicture: true },
              },
            },
          },
        },
      });
    });

    return res.status(201).json(community);
  } catch (error) {
    throw error;
  }
};

export const getCommunities = async (req: Request & { query: any }, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const sortBy = (req.query.sortBy as 'name' | 'createdAt' | 'memberCount') || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const order = { [sortBy]: sortOrder };

    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where,
        skip,
        take: limit,
        orderBy: order,
        include: {
          _count: { select: { communityMembers: true } },
        },
      }),
      prisma.community.count({ where }),
    ]);

    return res.json({
      communities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    throw error;
  }
};

export const getCommunity = async (req: Request & { params: { communityId: string } }, res: Response) => {
  try {
    const id = communityIdSchema.parse(req.params.communityId);

    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        communityMembers: {
          include: {
            user: { select: { id: true, name: true, email: true, profilePicture: true } },
          },
        },
        _count: { select: { communityMembers: true } },
      },
    });

    if (!community) throw new NotFoundError('Community not found');

    return res.json({
      ...community,
      memberCount: community._count.communityMembers,
    });
  } catch (error) {
    throw error;
  }
};

export const updateCommunity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenError('Unauthorized');

    const id = communityIdSchema.parse(req.params.communityId);
    const updates = updateCommunitySchema.parse(req.body);

    await isUserAdminOrOwner(id, userId);

    const community = await prisma.community.update({
      where: { id },
      data: updates,
      include: {
        communityMembers: {
          include: {
            user: { select: { id: true, name: true, email: true, profilePicture: true } },
          },
        },
      },
    });

    return res.json(community);
  } catch (error) {
    throw error;
  }
};

export const deleteCommunity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenError('Unauthorized');

    const id = communityIdSchema.parse(req.params.communityId);

    await isUserAdminOrOwner(id, userId);

    await prisma.$transaction([
      prisma.communityMember.deleteMany({ where: { communityId: id } }),
      prisma.communityInvite.deleteMany({ where: { communityId: id } }),
      prisma.community.delete({ where: { id } }),
    ]);

    return res.status(204).send();
  } catch (error) {
    throw error;
  }
};

export const joinCommunity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenError('Unauthorized');

    const communityId = communityIdSchema.parse(req.params.communityId);

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });
    if (!community) throw new NotFoundError('Community not found');

    if (community.isPrivate) {
      throw new ForbiddenError('Cannot join private community without invite');
    }

    const existingMember = await prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
    });
    if (existingMember) throw new Error('User is already a member of this community');

    const membership = await prisma.communityMember.create({
      data: { communityId, userId, role: 'VIEWER' },
      include: {
        user: { select: { id: true, name: true, email: true, profilePicture: true } },
      },
    });

    return res.status(201).json(membership);
  } catch (error) {
    throw error;
  }
};

export const leaveCommunity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenError('Unauthorized');

    const communityId = communityIdSchema.parse(req.params.communityId);

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });
    if (!community) throw new NotFoundError('Community not found');

    const membership = await prisma.communityMember.findUnique({
      where: { communityId_userId: { userId, communityId } },
    });
    if (!membership) throw new NotFoundError('You are not a member of this community');

    if (membership.role === 'OWNER') {
      await prisma.$transaction([
        prisma.communityMember.deleteMany({ where: { communityId } }),
        prisma.communityInvite.deleteMany({ where: { communityId } }),
        prisma.community.delete({ where: { id: communityId } }),
      ]);
      return res.status(200).json({ message: 'Community deleted as owner left' });
    }

    if (membership.role === 'ADMIN') {
      const adminCount = await prisma.communityMember.count({
        where: { communityId, role: 'ADMIN' },
      });
      if (adminCount <= 1) {
        throw new Error('Cannot leave as the last admin');
      }
    }

    await prisma.communityMember.delete({
      where: { communityId_userId: { userId, communityId } },
    });

    const remaining = await prisma.communityMember.count({
      where: { communityId },
    });
    if (remaining === 0) {
      await prisma.$transaction([
        prisma.community.delete({ where: { id: communityId } }),
      ]);
    }

    return res.status(200).json({ message: 'Left the community successfully' });
  } catch (error) {
    throw error;
  }
};

export const updateMemberRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenError('Unauthorized');

    const communityId = communityIdSchema.parse(req.params.communityId);
    const { userId: targetUserId, role } = updateMemberRoleSchema.parse(req.body);

    await isUserAdminOrOwner(communityId, userId);

    const updatedMember = await prisma.$transaction(async (tx) => {
      const member = await tx.communityMember.findUnique({
        where: { communityId_userId: { communityId, userId: targetUserId } },
      });
      if (!member) throw new NotFoundError('User is not a member of this community');

      if (member.role === 'ADMIN' && role !== 'ADMIN') {
        const adminCount = await tx.communityMember.count({
          where: { communityId, role: 'ADMIN' },
        });
        if (adminCount <= 1) throw new Error('Cannot demote the last admin');
      }

      return await tx.communityMember.update({
        where: { communityId_userId: { communityId, userId: targetUserId } },
        data: { role },
        include: {
          user: { select: { id: true, name: true, email: true, profilePicture: true } },
        },
      });
    });

    return res.status(200).json(updatedMember);
  } catch (error) {
    throw error;
  }
};

export const getCommunityMembers = async (
  req: Request & { params: { communityId: string }; query: any },
  res: Response
) => {
  try {
    const id = communityIdSchema.parse(req.params.communityId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    await checkCommunityMembership((req as any).user.id, id);

    const members = await prisma.communityMember.findMany({
      where: { communityId: id },
      include: {
        user: { select: { id: true, name: true, email: true, profilePicture: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return res.json({ status: 'success', data: members });
  } catch (error) {
    throw error;
  }
};

export const getUserCommunities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenError('Unauthorized');

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const sortBy = (req.query.sortBy as 'name' | 'createdAt' | 'memberCount') || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    const skip = (page - 1) * limit;
    const where = {
      communityMembers: { some: { userId } },
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {}),
    };

    const order = { [sortBy]: sortOrder };

    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where,
        skip,
        take: limit,
        orderBy: order,
        include: {
          _count: { select: { communityMembers: true } },
          communityMembers: { where: { userId }, select: { role: true } },
        },
      }),
      prisma.community.count({ where }),
    ]);

    return res.json({
      communities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    throw error;
  }
};