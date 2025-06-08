import express from 'express';
import { z } from 'zod';
import { CommunityController } from '../community_app/community.controller';
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
router.get('/:id', communityController.getCommunity);
router.put('/:id', protectRoute, validateRequest(updateCommunitySchema), communityController.updateCommunity);

// Member management routes
router.post('/:id/join', protectRoute, communityController.joinCommunity);
router.delete('/:id/leave', protectRoute, communityController.leaveCommunity);
router.put('/:id/members/role', protectRoute, validateRequest(updateMemberRoleSchema), communityController.updateMemberRole);
router.get('/:id/members', communityController.getCommunityMembers);

// Invite management
router.post('/:id/invite', protectRoute, communityController.generateInviteLink);

export default router; 