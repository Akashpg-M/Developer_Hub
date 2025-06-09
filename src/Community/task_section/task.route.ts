import express from 'express';
import { z } from 'zod';
import { protectRoute } from '../../auth_app/middleware/auth.middleware';
import { validateRequest } from '../../auth_app/middleware/validate.middleware';
import {
  createTaskController,
  deleteTaskController,
  getAllTasksController,
  getTaskByIdController,
  updateTaskController,
  assignTask,
  unassignTask,
  updateTaskStatus
} from './task.controller';
import { TaskStatus, TaskPriority } from '@prisma/client';

const router = express.Router();

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  assignedTo: z.string().optional().nullable(),
  dueDate: z.date().optional(),
  projectId: z.string().optional(), // Optional project reference
});

const updateTaskSchema = createTaskSchema.partial();

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
  validateRequest(createTaskSchema),
  createTaskController
);

router.get(
  '/:communityId/task',
  protectRoute,
  getAllTasksController
);

router.get(
  '/:communityId/task/:taskId',
  protectRoute,
  getTaskByIdController
);

router.put(
  '/:communityId/task/:taskId',
  protectRoute,
  validateRequest(updateTaskSchema),
  updateTaskController
);

router.delete(
  '/:communityId/task/:taskId',
  protectRoute,
  deleteTaskController
);

// Task assignment routes
router.post(
  '/:communityId/task/:taskId/assign',
  protectRoute,
  validateRequest(assignTaskSchema),
  assignTask
);

router.delete(
  '/:communityId/task/:taskId/unassign',
  protectRoute,
  unassignTask
);

// Task status management
router.patch(
  '/:communityId/task/:taskId/status',
  protectRoute,
  validateRequest(updateStatusSchema),
  updateTaskStatus
);

export default router;
