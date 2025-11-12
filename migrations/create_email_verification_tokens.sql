-- Create email_verification_tokens table for email verification functionality
-- This table stores verification tokens that allow users to verify their email addresses

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    used BOOLEAN DEFAULT FALSE
);

-- Create index on token for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);

-- Create index on expires_at for cleanup of expired tokens
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);

-- Add email_verified column to users table if it doesn't exist
-- This column tracks whether a user's email has been verified
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Optional: Create a function to automatically clean up expired tokens
-- You can run this periodically or as a scheduled job
-- DELETE FROM email_verification_tokens WHERE expires_at < NOW() OR used = TRUE;

