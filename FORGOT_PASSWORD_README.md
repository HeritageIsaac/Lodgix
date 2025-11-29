# Forgot Password Feature

This feature allows users to reset their passwords securely through email verification. The system generates secure reset tokens, sends professional email templates, and provides a complete user experience from forgot password to successful reset.

## Setup Instructions

### 1. Database Setup

Run the migration to create the password reset table:

```bash
# Navigate to backend directory
cd backend

# Run the migration
mysql -u your_username -p your_database_name < migrations/create_password_resets_table.sql
```

Or manually execute:
```sql
CREATE TABLE IF NOT EXISTS password_resets (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
);
```

### 2. Environment Variables

Make sure your backend `.env` file includes:

```env
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
JWT_SECRET=your-secret-key
```

**Important**: Use an app password for Gmail, not your regular password.

### 3. Dependencies

The required dependencies should already be installed:
- `crypto` (Node.js built-in)
- `nodemailer` (already in package.json)
- `bcrypt` (already in package.json)

## How It Works

### 1. Forgot Password Flow

1. **User Request**: User enters email on `/forgot-password` page
2. **Token Generation**: System generates secure 64-character random token
3. **Database Storage**: Token stored with 1-hour expiry
4. **Email Sending**: Professional email sent with reset link
5. **User Clicks Link**: Redirected to `/reset-password?token=xyz` page

### 2. Password Reset Flow

1. **Token Validation**: System validates token and expiry
2. **Password Update**: New password hashed and stored
3. **Cleanup**: Reset token deleted for security
4. **Success**: User redirected to login with success message

## API Endpoints

### POST `/api/guest/forgot-password`
Send password reset email

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "If an account with that email exists, you will receive a password reset link shortly."
}
```

### POST `/api/guest/reset-password`
Reset password with token

**Request Body:**
```json
{
  "token": "reset-token-here",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

## Frontend Pages

### 1. Forgot Password Page (`/forgot-password`)
- Clean, professional design matching login page
- Email input with validation
- Loading states and error handling
- Success message with clear instructions
- Navigation back to login

### 2. Reset Password Page (`/reset-password`)
- Token extracted from URL parameters
- Password and confirm password fields
- Real-time validation
- Success message with auto-redirect to login
- Invalid token handling

## Security Features

### 1. Token Security
- **64-character random tokens** (cryptographically secure)
- **1-hour expiry** to prevent abuse
- **Single-use tokens** (deleted after successful reset)
- **Email-based validation** (no token in URL for expired tokens)

### 2. Email Security
- **No sensitive data** revealed in emails
- **Security warnings** if request wasn't made by user
- **Professional templates** with clear branding
- **Fallback text** for email clients that don't support HTML

### 3. Password Security
- **Minimum 6 characters** requirement
- **Bcrypt hashing** for secure storage
- **Password confirmation** to prevent typos
- **Immediate cleanup** of reset tokens after use

## Email Templates

### Forgot Password Email
- Professional Lodgix branding
- Security alert warning
- Clear call-to-action button
- Fallback URL for accessibility
- 1-hour expiry notice

## User Experience

### 1. Error Handling
- **Network errors** with retry options
- **Invalid tokens** with clear messaging
- **Email validation** with helpful feedback
- **Password mismatch** with immediate feedback

### 2. Loading States
- **Sending email** progress indication
- **Processing reset** with disabled form
- **Success messages** with auto-redirect

### 3. Navigation
- **Breadcrumb navigation** between pages
- **Consistent styling** with existing login/signup
- **Mobile responsive** design

## Testing the Feature

### 1. Test Forgot Password
1. Go to login page
2. Click "Forgot password?"
3. Enter valid email address
4. Check email for reset link
5. Verify email contains proper styling and link

### 2. Test Password Reset
1. Click reset link from email
2. Verify redirected to reset page with token
3. Enter new password and confirm
4. Verify success message and redirect to login
5. Test login with new password

### 3. Test Edge Cases
- Invalid/expired tokens
- Passwords that don't match
- Passwords too short
- Non-existent email addresses
- Network errors

## Files Created/Modified

### Backend Files
- `models/PasswordReset.js` (new)
- `migrations/create_password_resets_table.sql` (new)
- `controllers/guestController.js` (modified)
- `routes/PublicGuestRoute.js` (modified)
- `services/mailService.js` (modified)

### Frontend Files
- `src/forgotPassword.jsx` (new)
- `src/resetPassword.jsx` (new)
- `src/loginPage.jsx` (modified)
- `src/App.jsx` (modified)

## Troubleshooting

### Common Issues

**1. "Unknown Location" in Location Tracking**
- Install geoip-lite: `npm install geoip-lite`
- Run database migration for location columns
- Check backend logs for geolocation errors

**2. Emails not sending**
- Verify SMTP credentials in .env file
- Check spam folder
- Ensure app password is correct for Gmail
- Check backend logs for email errors

**3. Reset tokens not working**
- Verify database connection
- Check token expiry (1 hour)
- Ensure proper URL encoding in emails
- Check browser console for JavaScript errors

**4. Password reset fails**
- Verify bcrypt installation
- Check database permissions
- Ensure token exists and is valid
- Check backend logs for detailed errors

### Debug Mode

Enable detailed logging by checking:
- Browser console for frontend errors
- Backend console logs for API errors
- Database logs for query issues
- Email service logs for delivery problems

## Security Best Practices

1. **Token Management**: Tokens are single-use and expire quickly
2. **Email Security**: No sensitive data in email content
3. **Rate Limiting**: Consider implementing rate limiting for forgot password requests
4. **Audit Logging**: All password reset attempts are logged
5. **HTTPS**: Always use HTTPS in production

## Production Considerations

1. **Environment Variables**: Never commit email credentials to version control
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Email Deliverability**: Configure SPF, DKIM, and DMARC
4. **Token Cleanup**: Schedule cron job to clean expired tokens
5. **Monitoring**: Monitor password reset success/failure rates

## Future Enhancements

- **Two-factor authentication** for high-security accounts
- **Password strength indicator** in reset form
- **Reset link click tracking** for analytics
- **Multiple reset attempts** before account lockout
- **Admin password reset** functionality for support teams
