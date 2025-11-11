import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import dotenv from 'dotenv';
import { registerController, loginController, logoutController, forgotPasswordController, resetPasswordController, verifyEmailController, resendVerificationEmailController, sendResetPasswordEmailController } from '../controllers/authController.js';
import { usernameValidator, emailValidator, passwordValidator } from '../validators/validators.js';
dotenv.config();

const router = express.Router();

//api/auth -->
router.post('/register', usernameValidator, emailValidator, passwordValidator, registerController);
router.post('/login', loginController);
router.post('/logout', logoutController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);
router.post('/verify-email', verifyEmailController);
router.post('/resend-verification-email', resendVerificationEmailController);
router.post('/send-reset-password-email', sendResetPasswordEmailController);

export default router;