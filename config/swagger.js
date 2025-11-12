import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Type Racer API',
      version: '1.0.0',
      description: 'Authentication API documentation for Type Racer application',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: {
              type: 'string',
              minLength: 3,
              description: 'Username (alphanumeric only, must be unique)',
              example: 'john_doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address (must be unique)',
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'Password (must be strong: uppercase, lowercase, numbers, special characters)',
              example: 'Password123!',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              minLength: 3,
              description: 'Username or email',
              example: 'john_doe',
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'Password',
              example: 'Password123!',
            },
          },
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address',
              example: 'john@example.com',
            },
          },
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['token', 'password'],
          properties: {
            token: {
              type: 'string',
              minLength: 64,
              maxLength: 64,
              description: 'Reset token (64 hex characters)',
              example: 'abc123...',
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'New password (must be strong)',
              example: 'NewPassword123!',
            },
          },
        },
        VerifyEmailRequest: {
          type: 'object',
          required: ['token'],
          properties: {
            token: {
              type: 'string',
              description: 'Email verification token',
              example: 'verification_token_here',
            },
          },
        },
        ResendVerificationEmailRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address (must exist and not be verified)',
              example: 'john@example.com',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Operation successful',
            },
          },
        },
        RegisterResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'User created successfully',
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                username: { type: 'string', example: 'john_doe' },
                email: { type: 'string', example: 'john@example.com' },
              },
            },
            token: {
              type: 'string',
              example: 'jwt_token_here',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Login successful',
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                username: { type: 'string', example: 'john_doe' },
                email: { type: 'string', example: 'john@example.com' },
              },
            },
            token: {
              type: 'string',
              example: 'jwt_token_here',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  msg: { type: 'string', example: 'Validation error message' },
                  param: { type: 'string', example: 'username' },
                  location: { type: 'string', example: 'body' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [join(__dirname, '../routes/**/*.js')], // Path to the API files
};

export const swaggerSpec = swaggerJsdoc(options);

