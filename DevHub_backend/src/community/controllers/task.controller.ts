
import { Response } from 'express';
import { AuthenticatedRequest } from '../../types/express';
import { z } from 'zod';
import { PrismaClient, TaskPriority, TaskStatus, Prisma } from '@prisma/client';
import { roleGuard , Permissions } from '../utils/communityManagement';

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

// Validation schemas
const taskIdSchema = z.string().min(1);
const communityIdSchema = z.string().min(1);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  assignedTo: z.string().uuid('Invalid user ID').optional().nullable(),
  dueDate: z.string().datetime('Invalid date format').optional(),
  projectId: z.string().uuid('Invalid project ID').optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();

type CreateTaskInput = z.infer<typeof createTaskSchema>;

interface TaskServiceInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedTo: string | null;
  projectId: string | null;
  dueDate?: Date;
}

export class TaskController {
  private prisma = new PrismaClient();

  // Helper function to convert input to service input
  private toTaskServiceInput = (input: CreateTaskInput): TaskServiceInput => ({
    title: input.title,
    description: input.description,
    priority: input.priority,
    status: input.status,
    assignedTo: input.assignedTo || null,
    projectId: input.projectId || null,
    dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
  });

  // Helper function to check community membership and role
  private getMemberRoleInWorkspace = async (userId: string, communityId: string) => {
    const member = await this.prisma.communityMember.findFirst({
      where: { communityId, userId },
    });
    if (!member) throw new NotFoundError('You are not a member of this community');
    return member;
  };

  assignTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ForbiddenError('Unauthorized');

      const { taskId, communityId } = req.params;
      const { assignedTo } = req.body;
      communityIdSchema.parse(communityId);

      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
        include: { community: true },
      });
      if (!task) throw new NotFoundError('Task not found');
      if (task.communityId !== communityId) throw new ForbiddenError('Task does not belong to this community');

      const { role } = await this.getMemberRoleInWorkspace(userId, communityId);
      roleGuard(role, [Permissions.ASSIGN_TASK]);

      if (assignedTo) {
        const isAssignedUserMember = await this.prisma.communityMember.findFirst({
          where: { userId: assignedTo, communityId },
        });
        if (!isAssignedUserMember) throw new NotFoundError('Assigned user is not a member of this community');
      }

      const updatedTask = await this.prisma.task.update({
        where: { id: taskId },
        data: { assignedToId: assignedTo || null },
        include: {
          assignedTo: { select: { id: true, name: true, profilePicture: true } },
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Task assignment updated successfully',
        data: { task: updatedTask },
      });
    } catch (error) {
      throw error;
    }
  };

  createTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ForbiddenError('Unauthorized');

      const parsedBody = createTaskSchema.parse(req.body);
      const communityId = communityIdSchema.parse(req.params.communityId);

      const { role } = await this.getMemberRoleInWorkspace(userId, communityId);
      roleGuard(role, [Permissions.CREATE_TASK]);

      const taskData = this.toTaskServiceInput(parsedBody);
      const { title, description, priority, status, assignedTo, dueDate, projectId } = taskData;

      const community = await this.prisma.community.findUnique({ where: { id: communityId } });
      if (!community) throw new NotFoundError('Community not found');

      if (projectId) {
        const project = await this.prisma.project.findFirst({
          where: { id: projectId, communityId },
        });
        if (!project) throw new NotFoundError('Project not found or does not belong to this community');
      }

      if (assignedTo) {
        const isAssignedUserMember = await this.prisma.communityMember.findFirst({
          where: { userId: assignedTo, communityId },
        });
        if (!isAssignedUserMember) throw new NotFoundError('Assigned user is not a member of this community');
      }

      const task = await this.prisma.task.create({
        data: {
          title,
          description,
          priority: priority || TaskPriority.MEDIUM,
          status: status || TaskStatus.TODO,
          assignedToId: assignedTo,
          createdById: userId,
          communityId,
          projectId,
          dueDate,
        },
        include: {
          createdBy: { select: { id: true, name: true, profilePicture: true } },
          assignedTo: { select: { id: true, name: true, profilePicture: true } },
          project: projectId ? { select: { id: true, name: true, emoji: true } } : undefined,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: { task },
      });
    } catch (error) {
      throw error;
    }
  };

  updateTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ForbiddenError('Unauthorized');

      const rawBody = updateTaskSchema.parse(req.body);
      const taskId = taskIdSchema.parse(req.params.taskId);
      const communityId = communityIdSchema.parse(req.params.communityId);

      const { role } = await this.getMemberRoleInWorkspace(userId, communityId);
      roleGuard(role, [Permissions.EDIT_TASK]);

      const task = await this.prisma.task.findFirst({
        where: { id: taskId, communityId },
      });
      if (!task) throw new NotFoundError('Task not found or does not belong to this community');

      if (rawBody.projectId) {
        const project = await this.prisma.project.findFirst({
          where: { id: rawBody.projectId, communityId },
        });
        if (!project) throw new NotFoundError('Project not found or does not belong to this community');
      }

      if (rawBody.assignedTo) {
        const isAssignedUserMember = await this.prisma.communityMember.findFirst({
          where: { userId: rawBody.assignedTo, communityId },
        });
        if (!isAssignedUserMember) throw new NotFoundError('Assigned user is not a member of this community');
      }

      const updatedTask = await this.prisma.task.update({
        where: { id: taskId },
        data: {
          title: rawBody.title,
          description: rawBody.description,
          priority: rawBody.priority,
          status: rawBody.status,
          assignedToId: rawBody.assignedTo,
          dueDate: rawBody.dueDate ? new Date(rawBody.dueDate) : undefined,
          projectId: rawBody.projectId,
        },
        include: {
          createdBy: { select: { id: true, name: true, profilePicture: true } },
          assignedTo: { select: { id: true, name: true, profilePicture: true } },
          project: rawBody.projectId ? { select: { id: true, name: true, emoji: true } } : undefined,
        },
      });

      return res.status(200).json({
        message: 'Task updated successfully',
        task: updatedTask,
      });
    } catch (error) {
      throw error;
    }
  };

  getAllTasks = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ForbiddenError('Unauthorized');

      const communityId = communityIdSchema.parse(req.params.communityId);
      await this.getMemberRoleInWorkspace(userId, communityId);

      const filters = {
        projectId: req.query.projectId as string | undefined,
        status: req.query.status ? (req.query.status as string).split(',') as TaskStatus[] : undefined,
        priority: req.query.priority ? (req.query.priority as string).split(',') as TaskPriority[] : undefined,
        assignedTo: req.query.assignedTo ? (req.query.assignedTo as string).split(',') : undefined,
        keyword: req.query.keyword as string | undefined,
        dueDate: req.query.dueDate ? new Date(req.query.dueDate as string) : undefined,
      };

      const pagination = {
        pageSize: Number(req.query.pageSize) || 10,
        pageNumber: Number(req.query.pageNumber) || 1,
      };

      const where: Prisma.TaskWhereInput = {
        communityId,
        ...(filters.projectId && { projectId: filters.projectId }),
        ...(filters.status && { status: { in: filters.status } }),
        ...(filters.priority && { priority: { in: filters.priority } }),
        ...(filters.assignedTo && { assignedToId: { in: filters.assignedTo } }),
        ...(filters.keyword && {
          OR: [
            { title: { contains: filters.keyword, mode: 'insensitive' } },
            { description: { contains: filters.keyword, mode: 'insensitive' } },
          ],
        }),
        ...(filters.dueDate && {
          dueDate: {
            gte: new Date(filters.dueDate.setHours(0, 0, 0, 0)),
            lt: new Date(filters.dueDate.setHours(23, 59, 59, 999)),
          },
        }),
      };

      const [total, tasks] = await Promise.all([
        this.prisma.task.count({ where }),
        this.prisma.task.findMany({
          where,
          skip: (pagination.pageNumber - 1) * pagination.pageSize,
          take: pagination.pageSize,
          include: {
            createdBy: { select: { id: true, name: true, profilePicture: true } },
            assignedTo: { select: { id: true, name: true, profilePicture: true } },
            project: { select: { id: true, name: true, emoji: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      return res.json({
        tasks,
        total,
        pageNumber: pagination.pageNumber,
        totalPages: Math.ceil(total / pagination.pageSize),
      });
    } catch (error) {
      throw error;
    }
  };

  getTaskById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ForbiddenError('Unauthorized');

      const taskId = taskIdSchema.parse(req.params.taskId);
      const communityId = communityIdSchema.parse(req.params.communityId);

      await this.getMemberRoleInWorkspace(userId, communityId);

      const task = await this.prisma.task.findFirst({
        where: { id: taskId, communityId },
        include: {
          createdBy: { select: { id: true, name: true, profilePicture: true } },
          assignedTo: { select: { id: true, name: true, profilePicture: true } },
          project: { select: { id: true, name: true, emoji: true } },
        },
      });

      if (!task) throw new NotFoundError('Task not found');

      return res.json(task);
    } catch (error) {
      throw error;
    }
  };

  deleteTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ForbiddenError('Unauthorized');

      const taskId = taskIdSchema.parse(req.params.taskId);
      const communityId = communityIdSchema.parse(req.params.communityId);

      const { role } = await this.getMemberRoleInWorkspace(userId, communityId);
      roleGuard(role, [Permissions.DELETE_TASK]);

      const task = await this.prisma.task.findFirst({
        where: { id: taskId, communityId },
      });
      if (!task) throw new NotFoundError('Task not found');

      if (task.createdById !== userId && role !== 'ADMIN' && role !== 'OWNER') {
        throw new ForbiddenError('Only the task creator or admin can delete this task');
      }

      await this.prisma.task.delete({
        where: { id: taskId },
      });

      return res.status(204).send();
    } catch (error) {
      throw error;
    }
  };

  updateTaskStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ForbiddenError('Unauthorized');

      const { taskId, communityId } = req.params;
      const { status } = req.body;

      if (!Object.values(TaskStatus).includes(status)) {
        throw new Error('Invalid status value');
      }

      const { role } = await this.getMemberRoleInWorkspace(userId, communityId);
      roleGuard(role, [Permissions.EDIT_TASK]);

      const updatedTask = await this.prisma.task.update({
        where: {
          id: taskId,
          project: { communityId },
        },
        data: { status },
      });

      return res.json(updatedTask);
    } catch (error) {
      throw error;
    }
  };
}

export default new TaskController();