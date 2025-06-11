import express, { Router } from "express";
import { body } from "express-validator";
import { 
  signUp, 
  login, 
  logout, 
  updateProfile, 
  checkAuth,
  refreshToken 
} from "../controllers/auth.controller";
import { protectRoute } from "../middleware/auth.middleware";

const router: Router = express.Router();

// Validation middleware
const signupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
];

// Validation middleware
const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = (require('express-validator').validationResult)(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      status: 'error',
      errors: errors.array().map((err: { param: string; msg: string }) => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  return next();
};

// Auth routes 
router.post("/signup", [...signupValidation, validateRequest], signUp);
router.post("/login", [...loginValidation, validateRequest], login);
router.post("/logout", protectRoute, logout);
router.post("/refresh-token", refreshToken); // New refresh token endpoint
router.post("/update-profile", [...updateProfileValidation, validateRequest, protectRoute], updateProfile);
router.get("/check-auth", protectRoute, checkAuth);

export default router; 