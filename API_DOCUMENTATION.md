# API Documentation

Base URL: `http://localhost:3000/api/auth`

---

## 1. Register User

**Request Type:** `POST`

**Request URL:** `/api/auth/register`

**Requirements:**
- Headers: `Content-Type: application/json`
- Body:
  - `username` (string, required, min 3 chars, alphanumeric only, must be unique)
  - `email` (string, required, valid email format, must be unique)
  - `password` (string, required, min 8 chars, strong password)

**Response:** Returns user object and JWT token

---

## 2. Login User

**Request Type:** `POST`

**Request URL:** `/api/auth/login`

**Requirements:**
- Headers: `Content-Type: application/json`
- Body:
  - `username` (string, required, min 3 chars, can be username or email)
  - `password` (string, required, min 8 chars, strong password)

**Response:** Returns user object and JWT token

---

## 3. Logout User

**Request Type:** `POST`

**Request URL:** `/api/auth/logout`

**Requirements:**
- Headers: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <jwt_token>`
- Body: None

**Response:** Returns success message

---

## 4. Forgot Password

**Request Type:** `POST`

**Request URL:** `/api/auth/forgot-password`

**Requirements:**
- Headers: `Content-Type: application/json`
- Body:
  - `email` (string, required, valid email format)

**Response:** Returns success message (always same message for security)

---

## 5. Reset Password

**Request Type:** `POST`

**Request URL:** `/api/auth/reset-password`

**Requirements:**
- Headers: `Content-Type: application/json`
- Body:
  - `token` (string, required, exactly 64 hex characters)
  - `password` (string, required, min 8 chars, strong password)

**Response:** Returns success message

---

## 6. Verify Email

**Request Type:** `POST`

**Request URL:** `/api/auth/verify-email`

**Requirements:**
- Headers: `Content-Type: application/json`
- Body:
  - `token` (string, required, verification token)

**Response:** Returns success message

---

## 7. Resend Verification Email

**Request Type:** `POST`

**Request URL:** `/api/auth/resend-verification-email`

**Requirements:**
- Headers: `Content-Type: application/json`
- Body:
  - `email` (string, required, valid email format, must exist, must not be verified)

**Response:** Returns success message

---

## 8. Send Reset Password Email

**Request Type:** `POST`

**Request URL:** `/api/auth/send-reset-password-email`

**Requirements:**
- Headers: `Content-Type: application/json`
- Body:
  - `email` (string, required, valid email format)

**Response:** Returns success message (always same message for security)

---

## Notes

- **Strong Password:** Must contain uppercase, lowercase, numbers, and special characters
- **JWT Token:** Required for logout endpoint, expires after 1 day
- **Reset Token:** Expires after 1 hour
- **Verification Token:** Expires after 24 hours
