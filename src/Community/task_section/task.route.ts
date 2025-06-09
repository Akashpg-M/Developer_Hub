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
  '/:communityId/:projectId',
  protectRoute,
  validateRequest(createTaskSchema),
  createTaskController
);

router.get(
  '/:communityId',
  protectRoute,
  getAllTasksController
);

router.get(
  '/:communityId/:projectId/:taskId',
  protectRoute,
  getTaskByIdController
);

router.put(
  '/:communityId/:projectId/:taskId',
  protectRoute,
  validateRequest(updateTaskSchema),
  updateTaskController
);

router.delete(
  '/:communityId/:projectId/:taskId',
  protectRoute,
  deleteTaskController
);

// Task assignment routes
router.post(
  '/:communityId/:projectId/:taskId/assign',
  protectRoute,
  validateRequest(assignTaskSchema),
  assignTask
);

router.delete(
  '/:communityId/:projectId/:taskId/unassign',
  protectRoute,
  unassignTask
);

// Task status management
router.patch(
  '/:communityId/:projectId/:taskId/status',
  protectRoute,
  validateRequest(updateStatusSchema),
  updateTaskStatus
);

export default router;
