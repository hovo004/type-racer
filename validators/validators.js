import { body } from 'express-validator';

export const usernameValidator = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
        .isAlphanumeric().withMessage('Username must contain only letters and numbers')
        .custom((value) => {
            return User.findOne({ username: value }).then((user) => {
                if (user) {
                    return Promise.reject('Username already exists');
                }
            });
        })
];

export const emailValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email address')
        .custom((value) => {
            return User.findOne({ email: value }).then((user) => {
                if (user) {
                    return Promise.reject('Email already exists');
                }
            });
        })
];

export const passwordValidator = [
    body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .isStrongPassword().withMessage('Password must be strong')
];