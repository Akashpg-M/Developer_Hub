import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate';

const router = Router();
const authController = new AuthController();

// Validation middleware
const signupValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Routes
router.post(
  '/signup',
  signupValidation,
  validateRequest,
  authController.signup
);

router.post(
  '/login',
  loginValidation,
  validateRequest,
  authController.login
);

router.post('/refresh-token', authController.refreshToken);

router.post('/logout', authenticateJWT, authController.logout);

router.get('/me', authenticateJWT, authController.getCurrentUser);

export const authRouter = router; 