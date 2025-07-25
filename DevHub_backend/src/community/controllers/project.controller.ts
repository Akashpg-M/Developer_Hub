import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient, Prisma } from '@prisma/client';
import { roleGuard, Permissions } from '../utils/communityManagement';

const prisma = new PrismaClient();

// Validation schemas
const communityIdSchema = z.object({
  communityId: z.string().min(1),
});

const projectIdSchema = communityIdSchema.extend({
  projectId: z.string().min(1),
});

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  emoji: z.string().optional(),
});

const updateProjectSchema = createProjectSchema.partial();

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

// Helper function to check community membership
const checkCommunityMembership = async (userId: string, communityId: string) => {
  const member = await prisma.communityMember.findFirst({
    where: { communityId, userId },
  });
  if (!member) throw new NotFoundError('You are not a member of this community');
  return member;
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const { communityId } = communityIdSchema.parse(req.params);
    const body = createProjectSchema.parse(req.body);
    const userId = (req as any).user.id;

    const member = await checkCommunityMembership(userId, communityId);
    roleGuard(member.role, [Permissions.CREATE_PROJECT]);

    const project = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const project = await tx.project.create({
        data: {
          name: body.name,
          description: body.description,
          emoji: body.emoji,
          communityId,
          createdById: userId,
        },
        include: {
          createdBy: { select: { id: true, name: true, profilePicture: true } },
          members: {
            select: {
              id: true,
              user: { select: { id: true, name: true, profilePicture: true } },
            },
          },
        },
      });

      await tx.projectMember.create({
        data: { projectId: project.id, userId },
      });

      return project;
    });

    return res.status(201).json(project);
  } catch (error) {
    throw error;
  }
};

export const getProjectsInCommunity = async (req: Request, res: Response) => {
  try {
    const { communityId } = communityIdSchema.parse(req.params);
    const userId = (req as any).user.id;

    await checkCommunityMembership(userId, communityId);

    const pageSize = Number(req.query.pageSize) || 10;
    const pageNumber = Number(req.query.pageNumber) || 1;
    const skip = (pageNumber - 1) * pageSize;

    const [total, projects] = await Promise.all([
      prisma.project.count({ where: { communityId } }),
      prisma.project.findMany({
        where: { communityId },
        skip,
        take: pageSize,
        include: {
          createdBy: { select: { id: true, name: true, profilePicture: true } },
          members: {
            select: {
              id: true,
              user: { select: { id: true, name: true, profilePicture: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return res.json({
      projects,
      total,
      pageNumber,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    throw error;
  }
};

export const getProjectByIdAndCommunityId = async (req: Request, res: Response) => {
  try {
    const { communityId, projectId } = projectIdSchema.parse(req.params);
    const userId = (req as any).user.id;

    await checkCommunityMembership(userId, communityId);

    const project = await prisma.project.findFirst({
      where: { id: projectId, communityId },
      include: {
        createdBy: { select: { id: true, name: true, profilePicture: true } },
        members: {
          select: {
            id: true,
            user: { select: { id: true, name: true, profilePicture: true } },
          },
        },
      },
    });

    if (!project) throw new NotFoundError('Project not found');

    return res.json(project);
  } catch (error) {
    throw error;
  }
};

export const joinProject = async (req: Request, res: Response) => {
  try {
    const { communityId, projectId } = projectIdSchema.parse(req.params);
    const userId = (req as any).user.id;

    await checkCommunityMembership(userId, communityId);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const project = await tx.project.findFirst({
        where: { id: projectId, communityId },
      });
      if (!project) throw new NotFoundError('Project not found');

      const existingMember = await tx.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } },
      });
      if (existingMember) throw new Error('User is already a member of this project');

      const member = await tx.projectMember.create({
        data: { projectId, userId },
        include: {
          user: { select: { id: true, name: true, profilePicture: true } },
        },
      });

      return member;
    });

    return res.status(201).json(result);
  } catch (error) {
    throw error;
  }
};

export const leaveProject = async (req: Request, res: Response) => {
  try {
    const { communityId, projectId } = projectIdSchema.parse(req.params);
    const userId = (req as any).user.id;

    await checkCommunityMembership(userId, communityId);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const project = await tx.project.findFirst({
        where: { id: projectId, communityId },
      });
      if (!project) throw new NotFoundError('Project not found');

      const member = await tx.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } },
      });
      if (!member) throw new Error('User is not a member of this project');

      await tx.projectMember.delete({
        where: { projectId_userId: { projectId, userId } },
      });

      return { success: true, message: 'Successfully left the project' };
    });

    return res.json(result);
  } catch (error) {
    throw error;
  }
};

export const getProjectMembers = async (req: Request, res: Response) => {
  try {
    const { communityId, projectId } = projectIdSchema.parse(req.params);
    const userId = (req as any).user.id;
    const pageSize = Number(req.query.pageSize) || 10;
    const pageNumber = Number(req.query.pageNumber) || 1;
    const skip = (pageNumber - 1) * pageSize;

    await checkCommunityMembership(userId, communityId);

    const project = await prisma.project.findFirst({
      where: { id: projectId, communityId },
    });
    if (!project) throw new NotFoundError('Project not found');

    const [total, members] = await Promise.all([
      prisma.projectMember.count({ where: { projectId } }),
      prisma.projectMember.findMany({
        where: { projectId },
        skip,
        take: pageSize,
        include: {
          user: { select: { id: true, name: true, email: true, profilePicture: true } },
        },
      }),
    ]);

    return res.json({
      members: members.map(m => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        profilePicture: m.user.profilePicture,
        joinedAt: m.joinedAt,
      })),
      total,
      pageNumber,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    throw error;
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { communityId, projectId } = projectIdSchema.parse(req.params);
    const userId = (req as any).user.id;
    const data = updateProjectSchema.parse(req.body);

    const member = await checkCommunityMembership(userId, communityId);
    roleGuard(member.role, [Permissions.EDIT_PROJECT]);

    const project = await prisma.project.findFirst({
      where: { id: projectId, communityId },
    });
    if (!project) throw new NotFoundError('Project not found');

    if (project.createdById !== userId && member.role !== 'ADMIN' && member.role !== 'OWNER') {
      throw new ForbiddenError('Only the project creator or community admin can update this project');
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: data.name,
        description: data.description,
        emoji: data.emoji,
      },
      include: {
        createdBy: { select: { id: true, name: true, profilePicture: true } },
        members: {
          select: {
            id: true,
            user: { select: { id: true, name: true, profilePicture: true } },
          },
        },
      },
    });

    return res.json(updatedProject);
  } catch (error) {
    throw error;
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { communityId, projectId } = projectIdSchema.parse(req.params);
    const userId = (req as any).user.id;

    const member = await checkCommunityMembership(userId, communityId);
    roleGuard(member.role, [Permissions.DELETE_PROJECT]);

    const project = await prisma.project.findFirst({
      where: { id: projectId, communityId },
    });
    if (!project) throw new NotFoundError('Project not found');

    if (project.createdById !== userId && member.role !== 'ADMIN' && member.role !== 'OWNER') {
      throw new ForbiddenError('Only the project creator or community admin can delete this project');
    }

    await prisma.$transaction([
      prisma.projectMember.deleteMany({ where: { projectId } }),
      prisma.task.updateMany({
        where: { projectId },
        data: { projectId: null },
      }),
      prisma.project.delete({ where: { id: projectId } }),
    ]);

    return res.status(204).send();
  } catch (error) {
    throw error;
  }
};