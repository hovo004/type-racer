# Swagger API Documentation Guide

## Overview

Swagger (OpenAPI) documentation has been set up for your API. This provides an interactive API documentation interface that frontend developers can use to test and understand all endpoints.

## Accessing Swagger UI

Once your server is running, access Swagger UI at:

```
http://localhost:3000/api-docs
```

## Features

1. **Interactive API Testing**: Test all endpoints directly from the browser
2. **Request/Response Examples**: See example request and response formats
3. **Authentication Support**: Test protected endpoints with JWT tokens
4. **Schema Definitions**: View all data models and validation rules

## How to Use

### 1. Start Your Server

```bash
npm run dev
# or
npm start
```

### 2. Open Swagger UI

Navigate to `http://localhost:3000/api-docs` in your browser.

### 3. Testing Endpoints

1. **Public Endpoints** (Register, Login, etc.):
   - Click on an endpoint
   - Click "Try it out"
   - Fill in the request body
   - Click "Execute"
   - View the response

2. **Protected Endpoints** (Logout):
   - First, login to get a JWT token
   - Click the "Authorize" button at the top
   - Enter your JWT token: `Bearer <your_token>`
   - Click "Authorize"
   - Now you can test protected endpoints

### 4. Sharing with Frontend Team

**Option 1: Share the URL**
- Give frontend developers the Swagger UI URL: `http://localhost:3000/api-docs`
- They can access it when the server is running

**Option 2: Export OpenAPI JSON**
- Access the OpenAPI JSON spec at: `http://localhost:3000/api-docs.json`
- Frontend can import this into tools like:
  - Postman
  - Insomnia
  - Swagger Editor
  - Code generators (OpenAPI Generator, Swagger Codegen)

**Option 3: Generate Client SDKs**
- Use the OpenAPI spec to generate client SDKs for:
  - TypeScript/JavaScript
  - Python
  - Java
  - etc.

## Example: Generating TypeScript Client

```bash
# Install openapi-generator
npm install -g @openapitools/openapi-generator-cli

# Generate TypeScript client
openapi-generator-cli generate \
  -i http://localhost:3000/api-docs.json \
  -g typescript-axios \
  -o ./frontend-client
```

## Available Endpoints in Swagger

All 8 endpoints are documented:

1. **POST /api/auth/register** - Register new user
2. **POST /api/auth/login** - Login user
3. **POST /api/auth/logout** - Logout user (requires auth)
4. **POST /api/auth/forgot-password** - Request password reset
5. **POST /api/auth/reset-password** - Reset password with token
6. **POST /api/auth/verify-email** - Verify email address
7. **POST /api/auth/resend-verification-email** - Resend verification email
8. **POST /api/auth/send-reset-password-email** - Alternative reset email endpoint

## Customization

To customize Swagger documentation, edit:
- `config/swagger.js` - Main Swagger configuration
- `routes/authRoutes.js` - Endpoint documentation (JSDoc comments)

## Production Considerations

For production:
1. Consider restricting Swagger UI access
2. Update server URL in `config/swagger.js`
3. Add authentication to Swagger UI if needed

Example: Restrict Swagger in production
```javascript
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
```

