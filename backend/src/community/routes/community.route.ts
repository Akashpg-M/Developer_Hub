import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CommunityRole } from '@prisma/client';
import { CommunityController } from '../controllers/community.controller';
import { protectRoute } from '../../auth_app/middleware/auth.middleware';
import { validateRequest } from '../../auth_app/middleware/validation.middleware';
// import { authorizeRole } from '../middleware/authorization.middleware';

// Create controller instance
const communityController = new CommunityController();

const router = express.Router();

// Type for authenticated request handlers
type AuthenticatedRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

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

// Helper to wrap controller methods with proper typing
function createHandler(
  handler: (req: Request, res: Response) => Promise<Response>
): AuthenticatedRequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}

// Community CRUD routes
router.get(
  '/',
  createHandler(communityController.getCommunities.bind(communityController))
);

router.get(
  '/user/communities',
  protectRoute,
  createHandler(communityController.getUserCommunities.bind(communityController))
);

router.get(
  '/user',
  protectRoute,
  createHandler(communityController.getUserCommunities.bind(communityController))
);

router.get(
  '/:communityId',
  createHandler(communityController.getCommunity.bind(communityController))
);

router.post(
  '/',
  protectRoute,
  validateRequest(createCommunitySchema),
  createHandler(communityController.createCommunity.bind(communityController))
);

router.patch(
  '/:communityId',
  protectRoute,
  // authorizeRole([UserRole.ADMIN], [CommunityRole.OWNER, CommunityRole.ADMIN]),
  validateRequest(updateCommunitySchema),
  createHandler(communityController.updateCommunity.bind(communityController))
);

router.delete(
  '/:communityId',
  protectRoute,
  // authorizeRole([UserRole.ADMIN], [CommunityRole.OWNER]),
  createHandler(communityController.deleteCommunity.bind(communityController))
);

// Member management routes
router.post(
  '/:communityId/join',
  protectRoute,
  createHandler(communityController.joinCommunity.bind(communityController))
);

router.post(
  '/:communityId/leave',
  protectRoute,
  createHandler(communityController.leaveCommunity.bind(communityController))
);

router.patch(
  '/:communityId/members/role',
  protectRoute,
  // authorizeRole([UserRole.ADMIN], [CommunityRole.OWNER, CommunityRole.ADMIN]),
  validateRequest(updateMemberRoleSchema),
  createHandler(communityController.updateMemberRole.bind(communityController))
);

router.get(
  '/:communityId/members',
  protectRoute,
  createHandler(communityController.getCommunityMembers.bind(communityController))
);

export default router;
