import express from 'express';
import { z } from 'zod';
import { CommunityRole } from '@prisma/client';
import { ProjectController } from '../controllers/project.controller';
import { protectRoute } from '../../auth_app/middleware/auth.middleware';
import { validateRequest } from '../../auth_app/middleware/validation.middleware';
import { authorizeRole } from '../middleware/authorization.middleware';

const router = express.Router();
const projectController = new ProjectController();

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  emoji: z.string().optional(),
});

const updateProjectSchema = createProjectSchema;

// Project CRUD routes
router.post(
  '/:communityId/project',
  protectRoute,
  authorizeRole([], [CommunityRole.OWNER, CommunityRole.ADMIN, CommunityRole.MANAGER]),
  validateRequest(createProjectSchema),
  projectController.createProject.bind(projectController)
);

router.get(
  '/:communityId/project',
  protectRoute,
  projectController.getProjectsInCommunity.bind(projectController)
);

router.get(
  '/:communityId/project/:projectId',
  protectRoute,
  projectController.getProjectByIdAndCommunityId.bind(projectController)
);

router.get(
  '/:communityId/project/:projectId/analytics',
  protectRoute,
  // authorizeRole([UserRole.ADMIN], [CommunityRole.OWNER, CommunityRole.ADMIN]),
  projectController.getProjectAnalytics.bind(projectController)
);

router.get(
  '/:communityId/project/:projectId/members',
  protectRoute,
  projectController.getProjectMembers.bind(projectController)
);

// Project member management
router.post(
  '/:communityId/project/:projectId/join',
  protectRoute,
  projectController.joinProject.bind(projectController)
);

router.post(
  '/:communityId/project/:projectId/leave',
  protectRoute,
  projectController.leaveProject.bind(projectController)
);

// Project management
router.patch(
  '/:communityId/project/:projectId',
  protectRoute,
  // authorizeRole([UserRole.ADMIN], [CommunityRole.OWNER, CommunityRole.ADMIN]),
  validateRequest(updateProjectSchema),
  projectController.updateProject.bind(projectController)
);

router.delete(
  '/:communityId/project/:projectId',
  protectRoute,
  // authorizeRole([UserRole.ADMIN], [CommunityRole.OWNER]),
  projectController.deleteProject.bind(projectController)
);

export default router;
