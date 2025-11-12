import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

export const registerController = async (req, res) => {
    try {
        // Check for validation errors from express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        // Verify JWT_SECRET is set
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'Server configuration error' });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, hashedPassword]);

        // Generate JWT token
        const token = jwt.sign({ 
            id: newUser.rows[0].id },
             process.env.JWT_SECRET,
              { expiresIn: '1d' }
            );

        res.status(201).json({ message: 'User created successfully', user: newUser.rows[0], token });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle database constraint violations (unique username/email)
        if (error.code === '23505') { // PostgreSQL unique violation
            const detail = error.detail || '';
            if (detail.includes('username')) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            if (detail.includes('email')) {
                return res.status(400).json({ message: 'Email already exists' });
            }
            return res.status(400).json({ message: 'User already exists' });
        }
        
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const loginController = async (req, res) => {
        try {
            // Check for validation errors from express-validator
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { username, password } = req.body;

            // Find user by username or email
            const userResult = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $1', [username]);
            if (userResult.rows.length === 0) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const user = userResult.rows[0];

            // Compare passwords
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Verify JWT_SECRET is set
            if (!process.env.JWT_SECRET) {
                return res.status(500).json({ message: 'Server configuration error' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.status(200).json({ message: 'Login successful', user, token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
}

/**
 * Logout controller
 * Handles server-side logout by blacklisting the JWT token
 * Token is validated by validateToken middleware before reaching this controller
 * Token is added to token_blacklist table
 * Once blacklisted, the token cannot be used for authentication
 * 
 * @param {Object} req - Express request object (req.user and req.token set by validateToken middleware)
 * @param {Object} res - Express response object
 */
export const logoutController = async (req, res) => {
    try {
        // Token is already validated by validateToken middleware
        // req.user contains decoded token info, req.token contains the token string
        const token = req.token;
        const decoded = req.user;

        // Check if token is already blacklisted
        const existingBlacklist = await pool.query(
            'SELECT * FROM token_blacklist WHERE token = $1',
            [token]
        );

        if (existingBlacklist.rows.length > 0) {
            return res.status(200).json({ message: 'Token already blacklisted' });
        }

        // Add token to blacklist with expiration time
        // Store the token and its expiration time (from decoded token)
        const expiresAt = decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to 24 hours if no exp
        
        await pool.query(
            'INSERT INTO token_blacklist (token, expires_at, created_at) VALUES ($1, $2, NOW())',
            [token, expiresAt]
        );

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Forgot password controller
 * Handles password reset requests by generating a reset token
 * Token is stored in password_reset_tokens table with expiration
 * Email is sent to user with reset link (if email service is configured)
 * 
 * @param {Object} req - Express request object (email validated by forgotPasswordEmailValidator)
 * @param {Object} res - Express response object
 */
export const forgotPasswordController = async (req, res) => {
    try {
        // Check for validation errors from express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        // Find user by email (for security, don't reveal if email exists)
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        // If user exists, generate and store reset token
        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];

            // Generate secure random reset token
            const resetToken = crypto.randomBytes(32).toString('hex');

            // Set expiration time (1 hour from now)
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            // Delete any existing reset tokens for this user
            await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);

            // Store reset token in database
            await pool.query(
                'INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at) VALUES ($1, $2, $3, NOW())',
                [user.id, resetToken, expiresAt]
            );

            // Generate reset link
            const resetLink = `${process.env.FRONTEND_URL || `http://localhost:${process.env.PORT}`}/reset-password?token=${resetToken}`;

            // TODO: Send email with reset link
            // For now, log it (in production, use email service like nodemailer, sendgrid, etc.)
            console.log(`Password reset link for ${email}: ${resetLink}`);
        }

        // Always return the same message (for security, don't reveal if email exists)
        res.status(200).json({ 
            message: 'If an account with that email exists, a password reset link has been sent.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Reset password controller
 * Handles password reset using the reset token from forgot password
 * Validates token, checks expiration, and updates user password
 * 
 * @param {Object} req - Express request object (token and password validated by resetPasswordValidator)
 * @param {Object} res - Express response object
 */
export const resetPasswordController = async (req, res) => {
    try {
        // Check for validation errors from express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { token, password } = req.body;

        // Find reset token in database
        const tokenResult = await pool.query(
            'SELECT * FROM password_reset_tokens WHERE token = $1 AND used = FALSE',
            [token]
        );

        if (tokenResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const resetToken = tokenResult.rows[0];

        // Check if token has expired
        if (new Date(resetToken.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Reset token has expired' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password
        await pool.query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hashedPassword, resetToken.user_id]
        );

        // Mark token as used
        await pool.query(
            'UPDATE password_reset_tokens SET used = TRUE WHERE token = $1',
            [token]
        );

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Verify email controller
 * Handles email verification using verification token
 * Marks user's email as verified
 * 
 * @param {Object} req - Express request object (token validated by emailVerificationTokenValidator)
 * @param {Object} res - Express response object
 */
export const verifyEmailController = async (req, res) => {
    try {
        // Check for validation errors from express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { token } = req.body;

        // Find verification token in database
        const tokenResult = await pool.query(
            'SELECT * FROM email_verification_tokens WHERE token = $1 AND used = FALSE',
            [token]
        );

        if (tokenResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        const verificationToken = tokenResult.rows[0];

        // Check if token has expired
        if (new Date(verificationToken.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Verification token has expired' });
        }

        // Mark email as verified (assuming email_verified column exists)
        await pool.query(
            'UPDATE users SET email_verified = TRUE WHERE id = $1',
            [verificationToken.user_id]
        );

        // Mark token as used
        await pool.query(
            'UPDATE email_verification_tokens SET used = TRUE WHERE token = $1',
            [token]
        );

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Resend verification email controller
 * Resends email verification token to user
 * Generates new verification token and sends email
 * 
 * @param {Object} req - Express request object (email validated by resendVerificationEmailValidator)
 * @param {Object} res - Express response object
 */
export const resendVerificationEmailController = async (req, res) => {
    try {
        // Check for validation errors from express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        // Find user by email (already validated to exist and not verified by validator)
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        // Generate secure random verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Set expiration time (24 hours from now)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Delete any existing verification tokens for this user
        await pool.query('DELETE FROM email_verification_tokens WHERE user_id = $1', [user.id]);

        // Store verification token in database
        await pool.query(
            'INSERT INTO email_verification_tokens (user_id, token, expires_at, created_at) VALUES ($1, $2, $3, NOW())',
            [user.id, verificationToken, expiresAt]
        );

        // Generate verification link
        const verificationLink = `${process.env.FRONTEND_URL || `http://localhost:${process.env.PORT}`}/verify-email?token=${verificationToken}`;

        // TODO: Send email with verification link
        // For now, log it (in production, use email service like nodemailer, sendgrid, etc.)
        console.log(`Email verification link for ${email}: ${verificationLink}`);

        res.status(200).json({ 
            message: 'Verification email has been sent.'
        });
    } catch (error) {
        console.error('Resend verification email error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * Send reset password email controller
 * Same functionality as forgot password controller
 * Alternative endpoint for sending password reset emails
 * 
 * @param {Object} req - Express request object (email validated by sendResetPasswordEmailValidator)
 * @param {Object} res - Express response object
 */
export const sendResetPasswordEmailController = async (req, res) => {
    try {
        // Check for validation errors from express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        // Find user by email (for security, don't reveal if email exists)
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        // If user exists, generate and store reset token
        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];

            // Generate secure random reset token
            const resetToken = crypto.randomBytes(32).toString('hex');

            // Set expiration time (1 hour from now)
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            // Delete any existing reset tokens for this user
            await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);

            // Store reset token in database
            await pool.query(
                'INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at) VALUES ($1, $2, $3, NOW())',
                [user.id, resetToken, expiresAt]
            );

            // Generate reset link
            const resetLink = `${process.env.FRONTEND_URL || `http://localhost:${process.env.PORT}`}/reset-password?token=${resetToken}`;

            // TODO: Send email with reset link
            // For now, log it (in production, use email service like nodemailer, sendgrid, etc.)
            console.log(`Password reset link for ${email}: ${resetLink}`);
        }

        // Always return the same message (for security, don't reveal if email exists)
        res.status(200).json({ 
            message: 'If an account with that email exists, a password reset link has been sent.'
        });
    } catch (error) {
        console.error('Send reset password email error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}