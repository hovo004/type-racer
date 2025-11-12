# Database Migrations

## Token Blacklist Table

The `create_token_blacklist.sql` file creates a table to store blacklisted JWT tokens for server-side logout functionality.

### Setup Instructions

1. Connect to your PostgreSQL database
2. Run the migration file:
   ```bash
   psql -U your_username -d your_database -f migrations/create_token_blacklist.sql
   ```
   
   Or using psql directly:
   ```sql
   \i migrations/create_token_blacklist.sql
   ```

### Table Structure

The `token_blacklist` table contains:
- `id`: Primary key (auto-increment)
- `token`: The JWT token string (unique)
- `expires_at`: When the token expires (for cleanup purposes)
- `created_at`: When the token was blacklisted

### Cleanup

You can periodically clean up expired tokens by running:
```sql
DELETE FROM token_blacklist WHERE expires_at < NOW();
```

Consider setting up a cron job or scheduled task to run this cleanup periodically.

---

## Password Reset Tokens Table

The `create_password_reset_tokens.sql` file creates a table to store password reset tokens for forgot password functionality.

### Setup Instructions

1. Connect to your PostgreSQL database
2. Run the migration file:
   ```bash
   psql -U your_username -d your_database -f migrations/create_password_reset_tokens.sql
   ```
   
   Or using psql directly:
   ```sql
   \i migrations/create_password_reset_tokens.sql
   ```

### Table Structure

The `password_reset_tokens` table contains:
- `id`: Primary key (auto-increment)
- `user_id`: Foreign key reference to users table
- `token`: The reset token string (unique)
- `expires_at`: When the token expires (typically 1 hour)
- `created_at`: When the token was created
- `used`: Boolean flag indicating if the token has been used

### Cleanup

You can periodically clean up expired or used tokens by running:
```sql
DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR used = TRUE;
```

Consider setting up a cron job or scheduled task to run this cleanup periodically.

---

## Email Verification Tokens Table

The `create_email_verification_tokens.sql` file creates a table to store email verification tokens and adds an `email_verified` column to the users table.

### Setup Instructions

1. Connect to your PostgreSQL database
2. Run the migration file:
   ```bash
   psql -U your_username -d your_database -f migrations/create_email_verification_tokens.sql
   ```
   
   Or using psql directly:
   ```sql
   \i migrations/create_email_verification_tokens.sql
   ```

### Table Structure

The `email_verification_tokens` table contains:
- `id`: Primary key (auto-increment)
- `user_id`: Foreign key reference to users table
- `token`: The verification token string (unique)
- `expires_at`: When the token expires (typically 24 hours)
- `created_at`: When the token was created
- `used`: Boolean flag indicating if the token has been used

The migration also adds an `email_verified` column to the `users` table:
- `email_verified`: Boolean flag indicating if the user's email has been verified (default: FALSE)

### Cleanup

You can periodically clean up expired or used tokens by running:
```sql
DELETE FROM email_verification_tokens WHERE expires_at < NOW() OR used = TRUE;
```

Consider setting up a cron job or scheduled task to run this cleanup periodically.

