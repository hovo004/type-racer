import express from 'express';
import dotenv from 'dotenv';
import { registerController, loginController, logoutController, forgotPasswordController, resetPasswordController, verifyEmailController, resendVerificationEmailController, sendResetPasswordEmailController } from '../controllers/authController.js';
import { usernameValidator, emailValidator, passwordValidator, forgotPasswordEmailValidator, resetPasswordValidator, emailVerificationTokenValidator, resendVerificationEmailValidator, sendResetPasswordEmailValidator, loginUsernameValidator } from '../validators/validators.js';
import { validateToken } from '../middlewares/authMiddlewares.js';
dotenv.config();

const router = express.Router();

router.post('/register', usernameValidator, emailValidator, passwordValidator, registerController);
router.post('/login', loginUsernameValidator, passwordValidator, loginController);
router.post('/logout', validateToken, logoutController);
router.post('/forgot-password', forgotPasswordEmailValidator, forgotPasswordController);
router.post('/reset-password', resetPasswordValidator, resetPasswordController);
router.post('/verify-email', emailVerificationTokenValidator, verifyEmailController);
router.post('/resend-verification-email', resendVerificationEmailValidator, resendVerificationEmailController);
router.post('/send-reset-password-email', sendResetPasswordEmailValidator, sendResetPasswordEmailController);

export default router;