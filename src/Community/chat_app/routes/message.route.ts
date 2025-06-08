import express, { Router } from "express";
import { protectRoute } from "../../../auth_app/middleware/auth.middleware";
import { getUser, getPrivateMessages, sendPrivateMessage, getGroupMessages, sendGroupMessage } from "../controllers/message.controller";
import { Request } from "express";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    name: string;
    email: string;
    provider: string;
    isEmailVerified: boolean;
    role: string;
  };
}

const router: Router = express.Router();

router.get("/users", protectRoute, (req, res) => getUser(req as AuthenticatedRequest, res));
router.get("/messages/:id", protectRoute, (req, res) => getPrivateMessages(req as AuthenticatedRequest, res));
router.post("/messages/:id", protectRoute, (req, res) => sendPrivateMessage(req as AuthenticatedRequest, res));

// Group chat routes
router.get("/communities/:communityId/messages", protectRoute, (req, res) => getGroupMessages(req as AuthenticatedRequest, res));
router.post("/communities/:communityId/messages", protectRoute, (req, res) => sendGroupMessage(req as AuthenticatedRequest, res));

export default router; 