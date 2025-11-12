import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

/**
 * Token validation middleware (without blacklist check)
 * Validates token format and verifies it's valid
 * Used for logout where we need to validate token but allow already-blacklisted tokens
 * Adds user info to req.user and token to req.token if token is valid
 */
export const validateToken = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify JWT_SECRET is set
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not set in environment variables');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        // Verify token (but don't check blacklist)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user info and token to request object
        req.user = decoded;
        req.token = token;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        console.error('Token validation error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Authentication middleware
 * Verifies JWT token and checks if it's blacklisted
 * Adds user info to req.user if token is valid
 */
export const authenticateToken = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify JWT_SECRET is set
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not set in environment variables');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        // Check if token is blacklisted
        const blacklisted = await pool.query(
            'SELECT * FROM token_blacklist WHERE token = $1',
            [token]
        );

        if (blacklisted.rows.length > 0) {
            return res.status(401).json({ message: 'Token has been revoked' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user info to request object
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        console.error('Authentication error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};