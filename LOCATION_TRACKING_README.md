# Location Tracking Feature

This feature tracks and displays the actual location of users when they log in, replacing the hardcoded "Mumbai, Maharashtra" with real geolocation data based on their IP address.

## Setup Instructions

### 1. Database Migration

Run the migration SQL to add location tracking columns to the guests table:

```bash
# Navigate to backend directory
cd backend

# Run the migration file against your database
mysql -u your_username -p your_database_name < migrations/add_location_tracking.sql
```

Or manually execute:
```sql
ALTER TABLE guests
ADD COLUMN last_login_ip VARCHAR(45) AFTER profile_picture,
ADD COLUMN last_login_location VARCHAR(255) AFTER last_login_ip;
```

### 2. Install Dependencies

Install the geoip-lite package for IP geolocation:

```bash
cd backend
npm install geoip-lite
```

### 3. Restart Backend Server

After installing the package, restart your backend server:

```bash
npm run dev
```

## Features

### Backend Changes

1. **New Utility Module** (`backend/utils/geolocation.js`):
   - `getClientIP(req)`: Extracts client IP from request headers
   - `getLocationFromIP(ip)`: Converts IP to location string (City, Region, Country)
   - Handles localhost/development IPs gracefully
   - Falls back to safe defaults if geoip-lite is not installed

2. **Updated Guest Controller** (`backend/controllers/guestController.js`):
   - Captures user IP and location on login
   - Stores data in `last_login_ip` and `last_login_location` columns
   - Non-blocking: login succeeds even if location update fails

3. **Updated Profile Controller** (`backend/controllers/profileController.js`):
   - Returns `lastLoginLocation` and `lastLoginIP` in profile API response

### Frontend Changes

1. **Updated Profile Component** (`hotel_management/src/profile.jsx`):
   - Added `lastLoginLocation` to user profile state
   - Security section now displays actual location from API
   - Shows "Unknown Location" as fallback

## How It Works

1. When a user logs in, the backend:
   - Extracts the IP address from the request
   - Uses geoip-lite to lookup the location
   - Updates the guest record with IP and location
   - Returns login success

2. When viewing profile:
   - Frontend fetches profile data from API
   - API includes `lastLoginLocation` field
   - Security section displays the location

## Location Display Examples

- **Real IP**: "New York, NY, US"
- **Local Network**: "Local Network"
- **Unknown**: "Unknown Location"
- **Fallback**: "Location unavailable"

## Privacy Notes

- Only the most recent login location is stored
- Location is based on IP geolocation (approximate)
- No GPS or precise location tracking is performed
- Users can see their own login location in the security section

## Troubleshooting

**If location shows "Location unavailable":**
1. Ensure geoip-lite is installed: `npm list geoip-lite`
2. Check backend logs for errors
3. Verify database columns exist

**If location shows "Unknown Location":**
- The IP may not be in the geoip database
- IP might be from a private network or VPN

**For local development:**
- Localhost IPs will show "Local Network"
- Test with a real IP by deploying or using ngrok

## Files Modified

- `backend/migrations/add_location_tracking.sql` (new)
- `backend/utils/geolocation.js` (new)
- `backend/controllers/guestController.js` (modified)
- `backend/controllers/profileController.js` (modified)
- `hotel_management/src/profile.jsx` (modified)

## Future Enhancements

- Track login history with multiple locations
- Show login attempts from unusual locations
- Email notifications for logins from new locations
- Device fingerprinting for better security
