import express from 'express';
import { z } from 'zod';
import { protectRoute } from '../../auth_app/middleware/auth.middleware';
import { validateRequest } from '../../auth_app/middleware/validation.middleware';
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

const router = express.Router();

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  emoji: z.string().optional(),
});

const updateProjectSchema = createProjectSchema;

// Project CRUD routes
router.post('/:communityId', protectRoute, validateRequest(createProjectSchema), createProject);
router.get('/:communityId', protectRoute, getProjectsInCommunity);
router.get('/:communityId/:projectId', protectRoute, getProjectByIdAndCommunityId);
router.get('/:communityId/:projectId/analytics', protectRoute, getProjectAnalytics);
router.get('/:communityId/:projectId/members', protectRoute, getProjectMembers);

// Project member management
router.post('/:communityId/:projectId/join', protectRoute, joinProject);
router.delete('/:communityId/:projectId/leave', protectRoute, leaveProject);

// Project management
router.put('/:communityId/:projectId', protectRoute, validateRequest(updateProjectSchema), updateProject);
router.delete('/:communityId/:projectId', protectRoute, deleteProject);

export default router;
