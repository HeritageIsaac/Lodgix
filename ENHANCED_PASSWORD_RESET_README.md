# Enhanced Password Reset with OTP Verification

This feature provides a secure two-step password reset process using OTP (One-Time Password) verification. Users must verify their identity with a 6-digit code sent to their email before they can set a new password.

## New Security Features

### Two-Step Verification Process
1. **Email Verification**: User enters email and receives OTP
2. **OTP Verification**: User enters 6-digit code to verify identity
3. **Password Reset**: Only after successful OTP verification can user set new password

### Enhanced Security
- **Single-use OTP codes** with 15-minute expiry
- **Secure token management** for session verification
- **Email-based verification** prevents unauthorized access
- **Professional OTP email templates** with security warnings

## Updated Setup Instructions

### 1. Database Setup

Run both migrations to create the required tables:

```bash
# Navigate to backend directory
cd backend

# Create password reset tokens table
mysql -u your_username -p your_database_name < migrations/create_password_resets_table.sql

# Create password reset OTPs table
mysql -u your_username -p your_database_name < migrations/create_password_reset_otps_table.sql
```

### 2. Database Tables

#### password_resets table (for initial reset link)
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

#### password_reset_otps table (for OTP verification)
```sql
CREATE TABLE IF NOT EXISTS password_reset_otps (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_otp (otp),
    INDEX idx_expires_at (expires_at)
);
```

## Updated API Endpoints

### POST `/api/guest/send-password-reset-otp`
Send OTP for password reset verification

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
  "message": "Verification code sent to your email. Please check your inbox."
}
```

### POST `/api/guest/verify-password-reset-otp`
Verify OTP and get temporary token

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Verification successful. You can now set your new password.",
  "tempToken": "temporary-session-token",
  "tempTokenExpiry": "2024-01-01T12:00:00.000Z"
}
```

### POST `/api/guest/reset-password-with-otp`
Reset password using verified OTP token

**Request Body:**
```json
{
  "tempToken": "temporary-session-token",
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

## Updated User Flow

### 1. Forgot Password Request
1. User clicks "Forgot password?" on login page
2. User enters email address
3. System sends OTP to email (15-minute expiry)
4. User enters 6-digit OTP code
5. System verifies OTP and issues temporary token
6. User enters new password and confirms it
7. System updates password and redirects to login

### 2. Security Benefits
- **Two-factor verification** prevents unauthorized access
- **Email-based verification** ensures user control
- **Single-use codes** prevent replay attacks
- **Time-limited tokens** reduce attack window
- **Clear user feedback** at each step

## Updated Frontend Pages

### Enhanced Reset Password Page

**Step 1: Email Entry**
- Clean email input field
- Validation and error handling
- Loading state during OTP sending
- Success message with next steps

**Step 2: OTP Verification**
- 6-digit code input with formatting
- Real-time validation feedback
- Back button to return to email step
- Success message before proceeding

**Step 3: Password Reset**
- New password and confirmation fields
- Password strength validation
- Loading state during update
- Success message with auto-redirect

## Email Templates

### Password Reset OTP Email
- **Security-focused design** with warning messages
- **Large, clear OTP display** for easy reading
- **15-minute expiry notice** for urgency
- **Professional Lodgix branding** consistency
- **Mobile-responsive layout** for all devices

## Testing the Enhanced Feature

### 1. Test Complete Flow
1. Go to login page → "Forgot password?"
2. Enter valid email address
3. Check email for 6-digit OTP code
4. Enter OTP code on reset page
5. Set new password and confirm
6. Verify login with new password works

### 2. Test Edge Cases
- **Invalid OTP codes** (wrong numbers, expired)
- **Resend OTP** functionality
- **Password mismatch** validation
- **Network errors** and retry logic
- **Email delivery issues**

### 3. Security Testing
- **OTP expiry** (codes should stop working after 15 minutes)
- **Single-use codes** (used codes should be invalid)
- **Email verification** (only valid email owners can reset)
- **Token security** (temporary tokens should be secure)

## Files Updated/Modified

### Backend Files
- `models/PasswordResetOTP.js` (new)
- `migrations/create_password_reset_otps_table.sql` (new)
- `controllers/guestController.js` (enhanced with OTP functions)
- `routes/PublicGuestRoute.js` (added OTP endpoints)
- `services/mailService.js` (added OTP email template)

### Frontend Files
- `src/resetPassword.jsx` (completely rewritten for two-step flow)
- `src/forgotPassword.jsx` (unchanged - still works for initial request)
- `src/loginPage.jsx` (unchanged - forgot password link still works)
- `src/App.jsx` (routes already configured)

## Migration Guide

### From Old System to New System

**Old System (Token-based):**
- User clicks reset link from email
- Goes directly to password entry
- Uses long-lived reset tokens

**New System (OTP-based):**
- User enters email for OTP
- Receives 6-digit code via email
- Verifies OTP before password entry
- Uses short-lived temporary tokens

### Backward Compatibility
- Old reset links will show deprecation message
- Users redirected to new forgot password flow
- No data loss or user disruption
- Gradual migration supported

## Production Considerations

### 1. Rate Limiting
- Implement rate limiting on OTP requests
- Prevent spam and abuse
- Consider account lockout after failed attempts

### 2. Email Deliverability
- Monitor email delivery rates
- Handle bounced emails gracefully
- Provide alternative verification methods if needed

### 3. Token Management
- Use Redis or similar for temporary token storage
- Implement proper cleanup of expired tokens
- Monitor token usage and security metrics

### 4. User Experience
- Clear progress indicators for multi-step flow
- Helpful error messages and guidance
- Mobile-optimized OTP entry
- Accessibility considerations for all users

## Security Best Practices

1. **OTP Security**: 6-digit codes with 15-minute expiry
2. **Email Validation**: Verify email ownership before sending OTP
3. **Token Management**: Secure temporary tokens for session verification
4. **Rate Limiting**: Prevent abuse through request throttling
5. **Audit Logging**: Track all password reset attempts and outcomes
6. **User Feedback**: Clear messaging without revealing sensitive information

This enhanced password reset system provides bank-level security for user account recovery while maintaining a smooth, intuitive user experience.
