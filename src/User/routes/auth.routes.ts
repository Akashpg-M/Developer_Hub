import { Router } from 'express';
import { register, login, logout } from '../controllers/auth.controller';
import { registerValidation, loginValidation } from '../middleware/validation.middleware';
import { authenticateRefreshToken } from '../middleware/auth.middleware';

const router = Router();

// Register route
router.post('/register', registerValidation, register);

// Login route
router.post('/login', loginValidation, login);

// Logout route
router.post('/logout', logout);

// Refresh token route
router.post('/refresh-token', authenticateRefreshToken);

export default router; 