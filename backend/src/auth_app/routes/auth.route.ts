import express, { RequestHandler } from "express";
import { signUp, login, logout, checkAuth } from "../controllers/auth.controller";
import { protectRoute } from "../middleware/auth.middleware";

const router = express.Router();

// Type assertion for the protected route handler

router.post("/signup", signUp as RequestHandler);
router.post("/login", login as RequestHandler);
router.post("/logout", logout as RequestHandler);
router.get("/check-auth", protectRoute, checkAuth as RequestHandler);

export default router;