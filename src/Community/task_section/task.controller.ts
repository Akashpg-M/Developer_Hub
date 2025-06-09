import { Request, Response } from "express";
import { z } from 'zod';
import { PrismaClient, TaskStatus, TaskPriority } from '@prisma/client';
import { roleGuard, NotFoundException, UnauthorizedException, Permissions } from '../utils/roleManagement';
import {
  createTaskService,
  deleteTaskService,
  getAllTasksService,
  getTaskByIdService,
  updateTaskService,
} from "./task.service";

const prisma = new PrismaClient();

// Validation schemas
const taskIdSchema = z.string().min(1);
const projectIdSchema = z.string().min(1);
const communityIdSchema = z.string().min(1);

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  assignedTo: z.string().optional().nullable(),
  dueDate: z.date().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  assignedTo: z.string().optional().nullable(),
  dueDate: z.date().optional(),
});

// Helper function to check project membership
const checkProjectMembership = async (userId: string, projectId: string) => {
  const member = await prisma.projectMember.findFirst({
    where: { projectId, userId },
  });
  if (!member) {
    throw new NotFoundException('You are not a member of this project');
  }
  return member;
};

// Helper function to get member role in community
const getMemberRoleInWorkspace = async (userId: string, communityId: string) => {
  const member = await prisma.communityMember.findFirst({
    where: { communityId, userId },
  });
  if (!member) {
    throw new NotFoundException('You are not a member of this community');
  }
  return member;
};

export const createTaskController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const body = createTaskSchema.parse(req.body);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const communityId = communityIdSchema.parse(req.params.communityId);

    const { role } = await getMemberRoleInWorkspace(userId, communityId);
    roleGuard(role, [Permissions.CREATE_TASK]);

    const { task } = await createTaskService(
      communityId,
      projectId,
      userId,
      body
    );

    return res.status(200).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error instanceof NotFoundException) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof UnauthorizedException) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTaskController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const body = updateTaskSchema.parse(req.body);
    const taskId = taskIdSchema.parse(req.params.taskId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const communityId = communityIdSchema.parse(req.params.communityId);

    const { role } = await getMemberRoleInWorkspace(userId, communityId);
    roleGuard(role, [Permissions.EDIT_TASK]);

    const { updatedTask } = await updateTaskService(
      communityId,
      projectId,
      taskId,
      body
    );

    return res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error instanceof NotFoundException) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof UnauthorizedException) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllTasksController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const communityId = communityIdSchema.parse(req.params.communityId);

    const filters = {
      projectId: req.query.projectId as string | undefined,
      status: req.query.status
        ? (req.query.status as string)?.split(",") as TaskStatus[]
        : undefined,
      priority: req.query.priority
        ? (req.query.priority as string)?.split(",") as TaskPriority[]
        : undefined,
      assignedTo: req.query.assignedTo
        ? (req.query.assignedTo as string)?.split(",")
        : undefined,
      keyword: req.query.keyword as string | undefined,
      dueDate: req.query.dueDate ? new Date(req.query.dueDate as string) : undefined,
    };

    const pagination = {
      pageSize: parseInt(req.query.pageSize as string) || 10,
      pageNumber: parseInt(req.query.pageNumber as string) || 1,
    };

    const { role } = await getMemberRoleInWorkspace(userId, communityId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const result = await getAllTasksService(communityId, filters, pagination);

    return res.status(200).json({
      message: "All tasks fetched successfully",
      ...result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error instanceof NotFoundException) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof UnauthorizedException) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTaskByIdController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const taskId = taskIdSchema.parse(req.params.taskId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const communityId = communityIdSchema.parse(req.params.communityId);

    const { role } = await getMemberRoleInWorkspace(userId, communityId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const task = await getTaskByIdService(communityId, projectId, taskId);

    return res.status(200).json({
      message: "Task fetched successfully",
      task,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error instanceof NotFoundException) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof UnauthorizedException) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTaskController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const taskId = taskIdSchema.parse(req.params.taskId);
    const communityId = communityIdSchema.parse(req.params.communityId);

    const { role } = await getMemberRoleInWorkspace(userId, communityId);
    roleGuard(role, [Permissions.DELETE_TASK]);

    await deleteTaskService(communityId, taskId);

    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error instanceof NotFoundException) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof UnauthorizedException) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const assignTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const taskId = taskIdSchema.parse(req.params.taskId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const communityId = communityIdSchema.parse(req.params.communityId);
    const { userId: assigneeId } = z.object({ userId: z.string().min(1) }).parse(req.body);

    const { role } = await getMemberRoleInWorkspace(userId, communityId);
    roleGuard(role, [Permissions.EDIT_TASK]);

    const { updatedTask } = await updateTaskService(
      communityId,
      projectId,
      taskId,
      { assignedTo: assigneeId }
    );

    return res.status(200).json({
      message: "Task assigned successfully",
      task: updatedTask,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error instanceof NotFoundException) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof UnauthorizedException) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const unassignTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const taskId = taskIdSchema.parse(req.params.taskId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const communityId = communityIdSchema.parse(req.params.communityId);

    const { role } = await getMemberRoleInWorkspace(userId, communityId);
    roleGuard(role, [Permissions.EDIT_TASK]);

    const { updatedTask } = await updateTaskService(
      communityId,
      projectId,
      taskId,
      { assignedTo: null }
    );

    return res.status(200).json({
      message: "Task unassigned successfully",
      task: updatedTask,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error instanceof NotFoundException) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof UnauthorizedException) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const taskId = taskIdSchema.parse(req.params.taskId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const communityId = communityIdSchema.parse(req.params.communityId);
    const { status } = z.object({ status: z.nativeEnum(TaskStatus) }).parse(req.body);

    const { role } = await getMemberRoleInWorkspace(userId, communityId);
    roleGuard(role, [Permissions.EDIT_TASK]);

    const { updatedTask } = await updateTaskService(
      communityId,
      projectId,
      taskId,
      { status }
    );

    return res.status(200).json({
      message: "Task status updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error instanceof NotFoundException) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof UnauthorizedException) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};
