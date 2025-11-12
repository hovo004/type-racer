import { body } from 'express-validator';
import { pool } from '../db.js';

/**
 * Username validation middleware
 * Validates username field with the following rules:
 * - Must not be empty
 * - Must be at least 3 characters long
 * - Must contain only alphanumeric characters (letters and numbers)
 * - Must be unique (not already in database)
 */
export const usernameValidator = [
    body('username')
        .trim() // Remove whitespace from beginning and end
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
        .isAlphanumeric().withMessage('Username must contain only letters and numbers')
        .custom(async (value) => {
            try {
                // Check if username already exists in database
                const result = await pool.query('SELECT * FROM users WHERE username = $1', [value]);
                if (result.rows.length > 0) {
                    throw new Error('Username already exists');
                }
                return true;
            } catch (error) {
                // If it's a validation error (username exists), re-throw it
                if (error.message === 'Username already exists') {
                    throw error;
                }
                // For database connection errors, throw a generic error
                throw new Error('Database error occurred while checking username availability');
            }
        })
];

/**
 * Email validation middleware
 * Validates email field with the following rules:
 * - Must not be empty
 * - Must be a valid email format
 * - Must be unique (not already in database)
 */
export const emailValidator = [
    body('email')
        .trim() // Remove whitespace from beginning and end
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email address')
        .custom(async (value) => {
            try {
                // Check if email already exists in database
                const result = await pool.query('SELECT * FROM users WHERE email = $1', [value]);
                if (result.rows.length > 0) {
                    throw new Error('Email already exists');
                }
                return true;
            } catch (error) {
                // If it's a validation error (email exists), re-throw it
                if (error.message === 'Email already exists') {
                    throw error;
                }
                // For database connection errors, throw a generic error
                throw new Error('Database error occurred while checking email availability');
            }
        })
];

/**
 * Password validation middleware
 * Validates password field with the following rules:
 * - Must not be empty
 * - Must be at least 8 characters long
 * - Must be a strong password (contains uppercase, lowercase, numbers, and special characters)
 */
export const passwordValidator = [
    body('password')
        .trim() // Remove whitespace from beginning and end
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .isStrongPassword().withMessage('Password must be strong')
];

/**
 * Username validator for login
 * Validates username format only (doesn't check uniqueness)
 * Used for login where username should exist
 */
export const loginUsernameValidator = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
];

/**
 * Email validator for forgot password
 * Validates email format only (for security, don't reveal if email exists)
 * Used for password reset requests
 */
export const forgotPasswordEmailValidator = [
    body('email')
        .trim() // Remove whitespace from beginning and end
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email address')
];

/**
 * Reset password validator
 * Validates token and new password for password reset
 */
export const resetPasswordValidator = [
    body('token')
        .trim()
        .notEmpty().withMessage('Reset token is required')
        .isLength({ min: 64, max: 64 }).withMessage('Invalid reset token format'),
    body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .isStrongPassword().withMessage('Password must be strong')
];

/**
 * Email verification token validator
 * Validates email verification token
 */
export const emailVerificationTokenValidator = [
    body('token')
        .trim()
        .notEmpty().withMessage('Verification token is required')
];

/**
 * Resend verification email validator
 * Validates email format and checks if email exists and is not verified
 */
export const resendVerificationEmailValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email address')
        .custom(async (value) => {
            try {
                // Check if email exists in database
                const result = await pool.query('SELECT * FROM users WHERE email = $1', [value]);
                if (result.rows.length === 0) {
                    throw new Error('Email not found');
                }
                // Check if email is already verified (if email_verified column exists)
                // Handle gracefully if column doesn't exist yet
                if (result.rows[0].email_verified === true) {
                    throw new Error('Email is already verified');
                }
                return true;
            } catch (error) {
                if (error.message === 'Email not found' || error.message === 'Email is already verified') {
                    throw error;
                }
                throw new Error('Database error occurred while checking email');
            }
        })
];

/**
 * Send reset password email validator
 * Same as forgot password - validates email format only
 */
export const sendResetPasswordEmailValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email address')
];

