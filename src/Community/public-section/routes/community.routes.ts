import { Router } from 'express';
import { CommunityController } from '../controllers/community.controller';
import { MailController } from '../controllers/mail.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();
const communityController = new CommunityController();
const mailController = new MailController();

// Community member routes
router.get('/members', authenticateJWT, communityController.listMembers);
router.get('/members/search', authenticateJWT, communityController.searchMembers);
router.get('/members/:userId/rank', authenticateJWT, communityController.getMemberRank);

// Mail routes
router.post('/mail', authenticateJWT, mailController.sendMail);
router.get('/mail/inbox', authenticateJWT, mailController.getInbox);
router.get('/mail/sent', authenticateJWT, mailController.getSent);
router.patch('/mail/:mailId/read', authenticateJWT, mailController.markAsRead);
router.delete('/mail/:mailId', authenticateJWT, mailController.deleteMail);

export const communityRouter = router; 