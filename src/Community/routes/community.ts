import { Router } from 'express';
import { CommunityController } from '../controllers/CommunityController';
import { authenticate } from '../middleware/auth';

const router = Router();
const communityController = new CommunityController();

// Create a new community
router.post('/', authenticate, communityController.create);

// Get community details
router.get('/:id', authenticate, communityController.getDetails);

// Update community
router.put('/:id', authenticate, communityController.update);

// Request to join community
router.post('/:id/join', authenticate, communityController.requestJoin);

// Process join request (admin only)
router.post('/:id/join-requests/:userId', authenticate, communityController.processJoinRequest);

// Create sub-community
router.post('/:parentId/sub-communities', authenticate, communityController.createSubCommunity);

// Get community statistics
router.get('/:id/statistics', authenticate, communityController.getStatistics);

export default router; 