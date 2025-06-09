import { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient} from '@prisma/client';
import { Permissions } from '../utils/roleManagement';
import { roleGuard } from '../utils/roleManagement';

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

const updateProjectSchema = createProjectSchema;

import {
  createProjectService,
  deleteProjectService,
  getProjectAnalyticsService,
  getProjectByIdAndCommunityIdService,
  getProjectsInCommunityService,
  updateProjectService,
  joinProjectService,
  leaveProjectService,
  getProjectMembersService,
} from "./project.services";

// Helper function to check community membership
const checkCommunityMembership = async (userId: string, communityId: string) => {
  const member = await prisma.communityMember.findFirst({
    where: { communityId, userId },
  });
  if (!member) {
    throw new Error('You are not a member of this community');
  }
  return member;
};

export const createProject = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { communityId } = communityIdSchema.parse(req.params);
    const body = createProjectSchema.parse(req.body);
    const userId = (req as any).user.id;

    // Check permissions
    const member = await checkCommunityMembership(userId, communityId);
    roleGuard(member.role, [Permissions.CREATE_PROJECT]);

    const result = await createProjectService(userId, communityId, body);
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error.message === 'You are not a member of this community') {
      return res.status(403).json({ error: error.message });
    }
    return res.status(400).json({ error: (error as Error).message });
  }
};

export const getProjectsInCommunity = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { communityId } = communityIdSchema.parse(req.params);
    const userId = (req as any).user.id;

    // Check community membership
    await checkCommunityMembership(userId, communityId);

    const pageSize = Number(req.query.pageSize) || 10;
    const pageNumber = Number(req.query.pageNumber) || 1;

    const result = await getProjectsInCommunityService(communityId, pageSize, pageNumber);
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error.message === 'You are not a member of this community') {
      return res.status(403).json({ error: error.message });
    }
    return res.status(400).json({ error: (error as Error).message });
  }
};

export const getProjectByIdAndCommunityId = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { communityId, projectId } = projectIdSchema.parse(req.params);
    const userId = (req as any).user.id;

    // Check community membership
    await checkCommunityMembership(userId, communityId);

    const result = await getProjectByIdAndCommunityIdService(communityId, projectId);
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error.message === 'You are not a member of this community') {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(400).json({ error: (error as Error).message });
  }
};

export const getProjectAnalytics = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { communityId, projectId } = projectIdSchema.parse(req.params);
    const userId = (req as any).user.id;

    // Check community membership
    await checkCommunityMembership(userId, communityId);

    const result = await getProjectAnalyticsService(communityId, projectId);
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error.message === 'You are not a member of this community') {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(400).json({ error: (error as Error).message });
  }
};

export const joinProject = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { communityId, projectId } = projectIdSchema.parse(req.params);
    const userId = (req as any).user.id;

    // Check community membership
    await checkCommunityMembership(userId, communityId);

    const result = await joinProjectService(userId, communityId, projectId);
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error.message === 'You are not a member of this community') {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(400).json({ error: (error as Error).message });
  }
};

export const leaveProject = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { communityId, projectId } = projectIdSchema.parse(req.params);
    const userId = (req as any).user.id;

    // Check community membership
    await checkCommunityMembership(userId, communityId);

    const result = await leaveProjectService(userId, communityId, projectId);
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error.message === 'You are not a member of this community') {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(400).json({ error: (error as Error).message });
  }
};

export const getProjectMembers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { communityId, projectId } = projectIdSchema.parse(req.params);
    const userId = (req as any).user.id;

    // Check community membership
    await checkCommunityMembership(userId, communityId);

    const pageSize = Number(req.query.pageSize) || 10;
    const pageNumber = Number(req.query.pageNumber) || 1;

    const result = await getProjectMembersService(communityId, projectId, pageSize, pageNumber);
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error.message === 'You are not a member of this community') {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(400).json({ error: (error as Error).message });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { communityId, projectId } = projectIdSchema.parse(req.params);
    const body = updateProjectSchema.parse(req.body);
    const userId = (req as any).user.id;

    // Check community membership and permissions
    const member = await checkCommunityMembership(userId, communityId);
    roleGuard(member.role, [Permissions.EDIT_PROJECT]);

    const result = await updateProjectService(communityId, projectId, userId, body);
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error.message === 'You are not a member of this community') {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { communityId, projectId } = projectIdSchema.parse(req.params);
    const userId = (req as any).user.id;

    // Check community membership and permissions
    const member = await checkCommunityMembership(userId, communityId);
    roleGuard(member.role, [Permissions.DELETE_PROJECT]);

    await deleteProjectService(communityId, projectId, userId);
    return res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error.message === 'You are not a member of this community') {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(400).json({ error: (error as Error).message });
  }
};
