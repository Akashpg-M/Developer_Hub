import express from 'express';
import { z } from 'zod';
import { CommunityController } from '../communityManagement_section/community.controller';
import { protectRoute } from '../../auth_app/middleware/auth.middleware';
import { validateRequest } from '../../auth_app/middleware/validation.middleware';
import { CommunityRole } from '@prisma/client';

const router = express.Router();
const communityController = new CommunityController();

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

// Community routes
router.post('/', protectRoute, validateRequest(createCommunitySchema), communityController.createCommunity);
router.get('/', communityController.getCommunities);
router.get('/user', protectRoute, communityController.getUserCommunities);
router.get('/:communityId', communityController.getCommunity);
router.put('/:communityId', protectRoute, validateRequest(updateCommunitySchema), communityController.updateCommunity);

// Member management routes
router.post('/:communityId/join', protectRoute, communityController.joinCommunity);
router.delete('/:communityId/leave', protectRoute, communityController.leaveCommunity);
router.put('/:communityId/members/role', protectRoute, validateRequest(updateMemberRoleSchema), communityController.updateMemberRole);
router.get('/:communityId/members', communityController.getCommunityMembers);
router.delete('/:communityId', protectRoute, communityController.deleteCommunity);

// Invite management
router.post('/:communityId/invite', protectRoute, communityController.generateInviteLink);



//project routes

import {
  createProject,
  getProjectsInCommunity,
  getProjectByIdAndCommunityId,
  getProjectAnalytics,
  joinProject,
  leaveProject,
  getProjectMembers,
  updateProject,
  deleteProject
} from '../projects_section/project.controller';


// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  emoji: z.string().optional(),
});

const updateProjectSchema = createProjectSchema;

// Project CRUD routes
router.post('/:communityId/project', protectRoute, validateRequest(createProjectSchema), createProject);
router.get('/:communityId/project', protectRoute, getProjectsInCommunity);
router.get('/:communityId/project/:projectId', protectRoute, getProjectByIdAndCommunityId);
router.get('/:communityId/project/:projectId/analytics', protectRoute, getProjectAnalytics);
router.get('/:communityId/project/:projectId/members', protectRoute, getProjectMembers);

// Project member management
router.post('/:communityId/project/:projectId/join', protectRoute, joinProject);
router.delete('/:communityId/project/:projectId/leave', protectRoute, leaveProject);

// Project management
router.put('/:communityId/project/:projectId', protectRoute, validateRequest(updateProjectSchema), updateProject);
router.delete('/:communityId/project/:projectId', protectRoute, deleteProject);




import {
  createTaskController,
  deleteTaskController,
  getAllTasksController,
  getTaskByIdController,
  updateTaskController,
  assignTask,
  unassignTask,
  updateTaskStatus
} from '../task_section/task.controller';
import { TaskStatus, TaskPriority } from '@prisma/client';


const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  assignedTo: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
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
