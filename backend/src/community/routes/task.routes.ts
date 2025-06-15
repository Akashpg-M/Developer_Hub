import express from 'express';
import { z } from 'zod';
import { CommunityRole, UserRole, TaskStatus } from '@prisma/client';
import { TaskController } from '../controllers/task.controller';
import { protectRoute } from '../../auth_app/middleware/auth.middleware';
import { validateRequest } from '../../auth_app/middleware/validation.middleware';
import { authorizeRole } from '../middleware/authorization.middleware';

const router = express.Router();
const taskController = new TaskController();

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().optional(),
  projectId: z.string().optional(),
  assignedTo: z.string().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().optional(),
  projectId: z.string().optional(),
  assignedTo: z.string().optional().nullable(),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
});

const assignTaskSchema = z.object({
  userId: z.string().min(1),
});

// Task CRUD routes
router.post(
  '/:communityId/task',
  protectRoute,
  authorizeRole([], [CommunityRole.OWNER, CommunityRole.ADMIN, CommunityRole.MANAGER]),
  validateRequest(createTaskSchema),
  taskController.createTask.bind(taskController)
);

router.get(
  '/:communityId/task',
  protectRoute,
  taskController.getAllTasks.bind(taskController)
);

router.get(
  '/:communityId/task/:taskId',
  protectRoute,
  taskController.getTaskById.bind(taskController)
);

router.put(
  '/:communityId/task/:taskId',
  protectRoute,
  // authorizeRole([UserRole.ADMIN], [CommunityRole.OWNER, CommunityRole.ADMIN]),
  validateRequest(updateTaskSchema),
  taskController.updateTask.bind(taskController)
);

router.delete(
  '/:communityId/task/:taskId',
  protectRoute,
   taskController.deleteTask.bind(taskController)
);

// Task assignment routes
router.post(
  '/:communityId/task/:taskId/assign',
  protectRoute,
  authorizeRole([UserRole.ADMIN], [CommunityRole.OWNER, CommunityRole.ADMIN]),
  validateRequest(assignTaskSchema),
  taskController.assignTask.bind(taskController)
);

router.put(
  '/:communityId/task/:taskId/status',
  protectRoute,
  validateRequest(updateStatusSchema),
  taskController.updateTaskStatus.bind(taskController)
);

export default router;
