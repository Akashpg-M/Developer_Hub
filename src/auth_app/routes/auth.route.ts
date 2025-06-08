import express, { Router } from "express";
import { body } from "express-validator";
import { signUp, login, logout, updateProfile, checkAuth } from "../controllers/auth.controller";
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

// Optionally, you can add a validateRequest middleware to handle validation errors
const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = (require('express-validator').validationResult)(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};

router.post("/signup", [...signupValidation, validateRequest], signUp);
router.post("/login", [...loginValidation, validateRequest], login);
router.post("/logout", protectRoute, logout);
router.post("/update-profile", protectRoute, updateProfile);
router.get("/check-auth", protectRoute, checkAuth);

export default router; 