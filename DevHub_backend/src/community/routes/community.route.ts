// import express from 'express';
// import { z } from 'zod';
// import { CommunityRole } from '@prisma/client';
// import { CommunityController } from '../controllers/community.controller';
// import { protectRoute } from '../../auth_app/middleware/auth.middleware';
// import { validateRequest } from '../../auth_app/middleware/validation.middleware';
// import { asyncHandler } from '../../utils/asyncHandler';

// const communityController = new CommunityController();

// const router = express.Router();

// // Request body schemas
// const createCommunityBody = z.object({
//   name: z.string().min(3).max(50),
//   description: z.string().min(10).max(500),
//   isPrivate: z.boolean().optional(),
// });

// const updateCommunityBody = z.object({
//   name: z.string().min(3).max(50).optional(),
//   description: z.string().min(10).max(500).optional(),
//   isPrivate: z.boolean().optional(),
// });

// const updateMemberRoleBody = z.object({
//   role: z.nativeEnum(CommunityRole),
// });

// // URL parameter schemas
// const communityIdParam = z.object({
//   communityId: z.string(),
// });

// const communityAndUserIdParam = z.object({
//   communityId: z.string(),
//   userId: z.string(),
// });

// // Community CRUD routes
// router.get(
//   '/',
//   asyncHandler(communityController.getCommunities.bind(communityController))
// );

// router.get(
//   '/user/communities',
//   protectRoute,
//   asyncHandler(communityController.getUserCommunities.bind(communityController))
// );

// router.get(
//   '/:communityId',
//   protectRoute,
//   validateRequest({
//     params: communityIdParam
//   }),
//   asyncHandler(communityController.getCommunity.bind(communityController))
// );

// router.post(
//   '/',
//   protectRoute,
//   validateRequest({
//     body: createCommunityBody
//   }),
//   asyncHandler(communityController.createCommunity.bind(communityController))
// );

// router.patch(
//   '/:communityId',
//   protectRoute,
//   validateRequest({
//     params: communityIdParam,
//     body: updateCommunityBody
//   }),
//   asyncHandler(communityController.updateCommunity.bind(communityController))
// );

// router.delete(
//   '/:communityId',
//   protectRoute,
//   validateRequest({
//     params: communityIdParam
//   }),
//   asyncHandler(communityController.deleteCommunity.bind(communityController))
// );

// // Member management routes
// router.post(
//   '/:communityId/join',
//   protectRoute,
//   validateRequest({
//     params: communityIdParam
//   }),
//   asyncHandler(communityController.joinCommunity.bind(communityController))
// );

// router.post(
//   '/:communityId/leave',
//   protectRoute,
//   validateRequest({
//     params: communityIdParam
//   }),
//   asyncHandler(communityController.leaveCommunity.bind(communityController))
// );

// router.put(
//   '/:communityId/members/:userId/role',
//   protectRoute,
//   validateRequest({
//     params: communityAndUserIdParam,
//     body: updateMemberRoleBody,
//   }),
//   asyncHandler(communityController.updateMemberRole.bind(communityController))
// );

// router.get(
//   '/:communityId/members',
//   protectRoute,
//   validateRequest({
//     params: communityIdParam
//   }),
//   asyncHandler(communityController.getCommunityMembers.bind(communityController))
// );

// // Join community via invite link
// router.post(
//   '/:communityId/join',
//   protectRoute,
//   validateRequest({
//     params: communityIdParam
//   }),
//   asyncHandler(communityController.joinCommunity.bind(communityController))
// );

// // Leave community
// router.post(
//   '/:communityId/leave',
//   protectRoute,
//   validateRequest({
//     params: communityIdParam
//   }),
//   asyncHandler(communityController.leaveCommunity.bind(communityController))
// );

// export default router;

import express, { RequestHandler } from 'express';
import { z } from 'zod';
import { CommunityRole } from '@prisma/client';
import { createCommunity, getCommunities, getUserCommunities, getCommunity, updateCommunity, deleteCommunity, joinCommunity, leaveCommunity, updateMemberRole, getCommunityMembers } from '../controllers/community.controller';
import { protectRoute } from '../../auth_app/middleware/auth.middleware';
import { validateRequest } from '../../auth_app/middleware/validation.middleware';

const router = express.Router();

// Request body schemas
const createCommunityBody = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must be at most 50 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be at most 500 characters'),
  isPrivate: z.boolean().optional(),
});

const updateCommunityBody = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must be at most 50 characters').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be at most 500 characters').optional(),
  isPrivate: z.boolean().optional(),
});

const updateMemberRoleBody = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.nativeEnum(CommunityRole, { errorMap: () => ({ message: 'Invalid role' }) }),
});

// URL parameter schemas
const communityIdParam = z.object({
  communityId: z.string().min(1, 'Community ID is required'),
});

const communityAndUserIdParam = z.object({
  communityId: z.string().min(1, 'Community ID is required'),
  userId: z.string().uuid('Invalid user ID'),
});

// Community CRUD routes
router.get(
  '/',
  getCommunities as RequestHandler
);

router.get(
  '/user/communities',
  protectRoute,
  getUserCommunities as RequestHandler
);

router.get(
  '/:communityId',
  protectRoute,
  validateRequest({
    params: communityIdParam,
  }),
  getCommunity as unknown as RequestHandler
);

router.post(
  '/',
  protectRoute,
  validateRequest({
    body: createCommunityBody,
  }),
  createCommunity as RequestHandler
);

router.patch(
  '/:communityId',
  protectRoute,
  validateRequest({
    params: communityIdParam,
    body: updateCommunityBody,
  }),
  updateCommunity as RequestHandler
);

router.delete(
  '/:communityId',
  protectRoute,
  validateRequest({
    params: communityIdParam,
  }),
  deleteCommunity as RequestHandler
);

// Member management routes
router.post(
  '/:communityId/join',
  protectRoute,
  validateRequest({
    params: communityIdParam,
  }),
  joinCommunity as RequestHandler
);

router.post(
  '/:communityId/leave',
  protectRoute,
  validateRequest({
    params: communityIdParam,
  }),
  leaveCommunity as RequestHandler
);

router.put(
  '/:communityId/members/:userId/role',
  protectRoute,
  validateRequest({
    params: communityAndUserIdParam,
    body: updateMemberRoleBody,
  }),
  updateMemberRole as RequestHandler
);

router.get(
  '/:communityId/members',
  protectRoute,
  validateRequest({
    params: communityIdParam,
  }),
  getCommunityMembers as unknown as RequestHandler
);

export default router;