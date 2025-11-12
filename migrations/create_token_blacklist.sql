-- Create token_blacklist table for server-side logout functionality
-- This table stores blacklisted JWT tokens that have been logged out

CREATE TABLE IF NOT EXISTS token_blacklist (
    id SERIAL PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on token for faster lookups
CREATE INDEX IF NOT EXISTS idx_token_blacklist_token ON token_blacklist(token);

-- Create index on expires_at for cleanup of expired tokens
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at ON token_blacklist(expires_at);

-- Optional: Create a function to automatically clean up expired tokens
-- You can run this periodically or as a scheduled job
-- DELETE FROM token_blacklist WHERE expires_at < NOW();

