# API Routes Documentation

Base URL: `http://localhost:5000`

## Table of Contents

### Health & Status
- [GET /api/health](#get-apihealth) - Health check
- [GET /api/status](#get-apistatus) - Detailed status

### Appointments
- [GET /api/appointments](#get-apiappointments) - Get all appointments
- [GET /api/appointments/date/:date](#get-apiappointmentsdatedate) - Get appointments by date
- [POST /api/appointments](#post-apiappointments) - Create appointment
- [PUT /api/appointments/:id/confirm](#put-apiappointmentsidconfirm) - Confirm appointment
- [PUT /api/appointments/:id/cancel](#put-apiappointmentsidcancel) - Cancel appointment
- [PUT /api/appointments/:id/block](#put-apiappointmentsidblock) - Block appointment
- [GET /api/appointments/cancel-by-token/:token](#get-apiappointmentscancel-by-tokentoken) - Cancel via email link
- [POST /api/appointments/block-user](#post-apiappointmentsblock-user) - Block user and appointments

### Users
- [GET /api/users](#get-apiusers) - Get all users
- [GET /api/users/email/:email](#get-apiusersemailemail) - Get user by email
- [POST /api/users](#post-apiusers) - Create user
- [DELETE /api/users/:id](#delete-apiusersid) - Delete user

### Settings
- [GET /api/settings](#get-apisettings) - Get settings
- [PUT /api/settings](#put-apisettings) - Update settings

### Admin
- [GET /api/admins](#get-apiadmins) - Get all admins
- [GET /api/admins/check](#get-apiadminscheck) - Check if admin exists
- [GET /api/admins/:aid](#get-apiadminsaid) - Get admin by ID
- [POST /api/admins](#post-apiadmins) - Create admin
- [POST /api/admins/login](#post-apiadminslogin) - Admin login
- [PUT /api/admins/:aid](#put-apiadminsaid) - Update admin
- [PUT /api/admins/:aid/password](#put-apiadminsaidpassword) - Change admin password
- [DELETE /api/admins/:aid](#delete-apiadminsaid) - Delete admin

### Blocked
- [GET /api/blocked](#get-apiblocked) - Get all blocked entries
- [POST /api/blocked](#post-apiblocked) - Block user/IP/email
- [DELETE /api/blocked/:id](#delete-apiblockedid) - Remove blocked entry

### Email Settings
- [GET /api/email-settings](#get-apiemail-settings) - Get email settings
- [PUT /api/email-settings](#put-apiemail-settings) - Update email settings

### License
- [GET /api/license](#get-apilicense) - Get license info
- [POST /api/license/activate](#post-apilicenseactivate) - Activate premium license
- [POST /api/license/generate](#post-apilicensegenerate) - Generate license key

### Additional Resources
- [Error Responses](#error-responses)
- [Rate Limiting](#rate-limiting)
- [Notes](#notes)
- [Example Commands](#example-commands-powershell)

---

All endpoints return JSON responses with the following structure:
```json
{
  "success": true|false,
  "data": {},
  "message": "string",
  "error": "string" // only present on errors
}
```

---

## Health & Status Endpoints

### GET `/api/health`
Health check endpoint to verify API is running.

**Response:**
```json
{
  "success": true,
  "message": "Appointment Scheduler API Server is running!",
  "timestamp": "2025-10-15T10:00:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

### GET `/api/status`
Detailed status including database connection and settings.

**Response:**
```json
{
  "success": true,
  "service": "Appointment Scheduler API",
  "status": "active",
  "timestamp": "2025-10-15T10:00:00.000Z",
  "database": "SQLite3",
  "settings": {
    "maxAppointmentsPerDay": 10,
    "maxAppointmentsPerWeek": 50
  },
  "endpoints": {
    "appointments": "/api/appointments",
    "users": "/api/users",
    "settings": "/api/settings"
  }
}
```

---

## Appointments

### GET `/api/appointments`
Get all appointments with user information.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "udi": "uuid-string",
      "count": 1,
      "date": "2025-10-15",
      "timeStart": "09:00",
      "timeEnd": "10:00",
      "repeat": "none",
      "confirmed": false,
      "cancelled": false,
      "status": "pending",
      "userId": 1,
      "name": "John",
      "surname": "Doe",
      "email": "john@example.com",
      "createdAt": "2025-10-15 10:00:00",
      "updatedAt": "2025-10-15 10:00:00"
    }
  ],
  "message": "Found 1 appointments"
}
```

### GET `/api/appointments/date/:date`
Get appointments for a specific date.

**Parameters:**
- `date` (URL param): Date in YYYY-MM-DD format

**Example:** `/api/appointments/date/2025-10-15`

**Response:**
```json
{
  "success": true,
  "data": [...],
  "message": "Found 3 appointments for 2025-10-15"
}
```

**Validation:**
- Date must be in YYYY-MM-DD format
- Returns 400 if format is invalid

### POST `/api/appointments`
Create a new appointment.

**Request Body:**
```json
{
  "date": "2025-10-15",
  "timeStart": "09:00",
  "timeEnd": "10:00",
  "repeat": "none",
  "user": {
    "name": "John",
    "middle": "M",
    "surname": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

**Required Fields:**
- `date`, `timeStart`, `timeEnd`
- `user.name`, `user.surname`, `user.email`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "appointmentId": 1,
    "udi": 1,
    "message": "Appointment created successfully"
  },
  "message": "Appointment booked successfully"
}
```

**Validation:**
- IP blocking check performed
- User created if doesn't exist
- Returns 400 if required fields missing
- Returns 403 if IP is blocked

### PUT `/api/appointments/:id/confirm`
Confirm an appointment by ID.

**Parameters:**
- `id` (URL param): Appointment ID

**Response:**
```json
{
  "success": true,
  "message": "Appointment confirmed successfully"
}
```

### PUT `/api/appointments/:id/cancel`
Cancel an appointment by ID.

**Parameters:**
- `id` (URL param): Appointment ID

**Response:**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```

### PUT `/api/appointments/:id/block`
Block an appointment by ID (frees the slot but marks status as 'blocked').

**Parameters:**
- `id` (URL param): Appointment ID

**Response:**
```json
{
  "success": true,
  "message": "Appointment marked as blocked and slot freed"
}
```

### GET `/api/appointments/cancel-by-token/:token`
Public route to cancel appointment via email link. Returns HTML page.

**Parameters:**
- `token` (URL param): Cancellation token (udi)

**Response:**
HTML page with cancellation confirmation or error message.

### POST `/api/appointments/block-user`
Block a user and all their appointments.

**Request Body:**
```json
{
  "userId": 1,
  "email": "user@example.com",
  "reason": "Spam or abuse"
}
```

**Required Fields:**
- Either `userId` or `email` must be provided

**Response:**
```json
{
  "success": true,
  "data": {
    "affected": 3
  },
  "message": "Blocked user 1 and 3 appointment(s)"
}
```

---

## Users

### GET `/api/users`
Get all users (excludes sensitive information like IP addresses).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "uid": 1,
      "name": "John",
      "middle": "M",
      "surname": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "createdAt": "2025-10-15 10:00:00"
    }
  ],
  "message": "Found 1 users"
}
```

### GET `/api/users/email/:email`
Get a specific user by email address.

**Parameters:**
- `email` (URL param): User email address

**Example:** `/api/users/email/john@example.com`

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": 1,
    "name": "John",
    "middle": "M",
    "surname": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "createdAt": "2025-10-15 10:00:00"
  },
  "message": "User found"
}
```

**Validation:**
- Email must contain '@' symbol
- Returns 400 if invalid format
- Returns 404 if user not found

### POST `/api/users`
Create a new user.

**Request Body:**
```json
{
  "name": "John",
  "middle": "M",
  "surname": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

**Required Fields:**
- `name`, `surname`, `email`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "message": "User created successfully"
  },
  "message": "User registered successfully"
}
```

**Validation:**
- IP blocking check performed
- Returns 400 if required fields missing
- Returns 403 if IP is blocked
- Returns 409 if user with email already exists

### DELETE `/api/users/:id`
Delete a user by ID.

**Parameters:**
- `id` (URL param): User ID

**Response:**
```json
{
  "success": true
}
```

**Validation:**
- Returns 400 if id is invalid

---

## Settings

### GET `/api/settings`
Get current application settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "sid": 1,
    "maxApp": 10,
    "maxAppWeek": 50,
    "startHour": 9,
    "endHour": 17,
    "displayAvailability": 4,
    "availabilityLocked": 0,
    "availabilityLockedUntil": null,
    "headerMessage": "Select Your Appointment Time",
    "updatedAt": "2025-10-15 10:00:00"
  },
  "message": "Settings retrieved successfully"
}
```

### PUT `/api/settings`
Update application settings (partial updates supported).

**Request Body (all fields optional):**
```json
{
  "maxApp": 10,
  "maxAppWeek": 50,
  "startHour": 9,
  "endHour": 17,
  "displayAvailability": 4,
  "availabilityLocked": 0,
  "availabilityLockedUntil": "2025-12-31",
  "headerMessage": "Select Your Appointment Time"
}
```

**Valid Fields:**
- `maxApp` (integer ≥ 0): Maximum appointments per day
- `maxAppWeek` (integer ≥ 0): Maximum appointments per week
- `startHour` (integer 0-23): Business hours start
- `endHour` (integer 0-23): Business hours end
- `displayAvailability` (integer 1-52): Weeks ahead to show availability
- `availabilityLocked` (0 or 1): Global availability lock
- `availabilityLockedUntil` (string or null): Date string (YYYY-MM-DD) or null
- `headerMessage` (string ≤ 200 chars): Calendar header message
- `pastAppointmentsDays` (7, 14, 30, or 90): Days to show past appointments
- `futureAppointmentsDays` (7, 14, 30, or 90): Days to show future appointments
- `includeWeekend` (0 or 1): Include weekends in booking
- `allow30Min` (0 or 1): Allow 30-minute appointments

**Response:
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

**Validation Rules:**
- All numeric fields must be non-negative integers
- `startHour` and `endHour` must be between 0-23
- `startHour` must be less than `endHour`
- `displayAvailability` must be between 1-52
- `headerMessage` max length 200 characters
- `availabilityLockedUntil` must be valid date string or null
- Returns 400 if validation fails

---

## Admin

### GET `/api/admins`
Get all admin users (passwords excluded).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "aid": 1,
      "aName": "Ricardo",
      "aSurname": "Wagemaker",
      "login": "ricardo",
      "createdAt": "2025-10-15 10:00:00",
      "updatedAt": "2025-10-15 10:00:00"
    }
  ],
  "message": "Found 1 admins"
}
```

### GET `/api/admins/:aid`
Get a specific admin by ID (password excluded).

**Parameters:**
- `aid` (URL param): Admin ID

**Example:** `/api/admins/1`

**Response:**
```json
{
  "success": true,
  "data": {
    "aid": 1,
    "aName": "Ricardo",
    "aSurname": "Wagemaker",
    "login": "ricardo",
    "createdAt": "2025-10-15 10:00:00",
    "updatedAt": "2025-10-15 10:00:00"
  }
}
```

**Validation:**
- Returns 400 if aid is not a valid integer
- Returns 404 if admin not found

### POST `/api/admins`
Create a new admin user.

**Request Body:**
```json
{
  "aName": "Ricardo",
  "aSurname": "Wagemaker",
  "login": "ricardo",
  "password": "SecurePassword123"
}
```

**Required Fields:**
- `aName`, `aSurname`, `login`, `password`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "aid": 1
  },
  "message": "Admin created"
}
```

**Validation:**
- Password is bcrypt-hashed before storage (never stored in plaintext)
- Returns 400 if required fields missing
- Returns 409 if login already in use

### PUT `/api/admins/:aid`
Update an existing admin (partial updates supported).

**Parameters:**
- `aid` (URL param): Admin ID

**Request Body (all fields optional):**
```json
{
  "aName": "Ricardo",
  "aSurname": "Wagemaker",
  "login": "ricardo",
  "password": "NewPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin updated"
}
```

**Validation:**
- Password is bcrypt-hashed if provided
- Login uniqueness checked if updating login
- Returns 400 if aid is invalid or no valid fields provided
- Returns 409 if new login already in use

### DELETE `/api/admins/:aid`
Delete an admin by ID.

**Parameters:**
- `aid` (URL param): Admin ID

**Response:**
```json
{
  "success": true,
  "message": "Admin deleted"
}
```

**Validation:**
- Returns 400 if aid is not a valid integer

### GET `/api/admins/check`
Check if any admin exists (public endpoint).

**Response:**
```json
{
  "success": true,
  "data": {
    "hasAdmins": true,
    "count": 1
  }
}
```

### POST `/api/admins/login`
Admin login endpoint.

**Request Body:**
```json
{
  "login": "ricardo",
  "password": "SecurePassword123"
}
```

**Required Fields:**
- `login`, `password`

**Response:**
```json
{
  "success": true,
  "data": {
    "aid": 1,
    "aName": "Ricardo",
    "aSurname": "Wagemaker",
    "email": "admin@example.com",
    "login": "ricardo",
    "passwordLastChanged": "2025-10-15 10:00:00",
    "createdAt": "2025-10-15 10:00:00",
    "updatedAt": "2025-10-15 10:00:00"
  },
  "message": "Login successful"
}
```

**Validation:**
- Returns 400 if required fields missing
- Returns 401 if credentials invalid
- Sends login notification email to admin

### PUT `/api/admins/:aid/password`
Change admin password.

**Parameters:**
- `aid` (URL param): Admin ID

**Request Body:**
```json
{
  "password": "NewPassword123"
}
```

**Required Fields:**
- `password` (minimum 6 characters)

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Validation:**
- Returns 400 if password missing or too short
- Returns 404 if admin not found
- Sends password changed email to admin

---

## Blocked

### GET `/api/blocked`
Get all blocked entries.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "bid": 1,
      "userId": 5,
      "ipAddress": "192.168.1.100",
      "email": "blocked@example.com",
      "reason": "Spam",
      "createdAt": "2025-10-15 10:00:00"
    }
  ]
}
```

### POST `/api/blocked`
Block a user/IP/email.

**Request Body:**
```json
{
  "userId": 5,
  "ipAddress": "192.168.1.100",
  "email": "blocked@example.com",
  "reason": "Spam or abuse"
}
```

**Required Fields:**
- At least one of: `userId`, `ipAddress`, or `email`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "bid": 1
  },
  "message": "Blocked entry created"
}
```

**Validation:**
- Returns 400 if no identifier provided
- Resolves IP from user record if needed

### DELETE `/api/blocked/:id`
Remove a blocked entry.

**Parameters:**
- `id` (URL param): Blocked entry ID

**Response:**
```json
{
  "success": true
}
```

**Validation:**
- Returns 400 if id is invalid

---

## Email Settings

### GET `/api/email-settings`
Get email configuration (password masked).

**Response:**
```json
{
  "success": true,
  "data": {
    "smtpHost": "smtp.gmail.com",
    "smtpPort": 587,
    "smtpSecure": 0,
    "smtpUser": "user@gmail.com",
    "smtpFrom": "noreply@example.com",
    "emailFooter": "Best regards, Team",
    "smtpPass": "********",
    "updatedAt": "2025-10-15 10:00:00"
  }
}
```

### PUT `/api/email-settings`
Update email settings (premium feature).

**Request Body (all fields optional):**
```json
{
  "smtpHost": "smtp.gmail.com",
  "smtpPort": 587,
  "smtpSecure": 1,
  "smtpUser": "user@gmail.com",
  "smtpFrom": "noreply@example.com",
  "emailFooter": "Best regards, Team",
  "smtpPass": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email settings updated successfully"
}
```

**Validation:**
- Returns 403 if not premium license
- Password only updated if not masked (********)

---

## License

### GET `/api/license`
Get license information.

**Response:**
```json
{
  "success": true,
  "data": {
    "isPremium": false,
    "isValid": false,
    "name": null,
    "email": null
  }
}
```

### POST `/api/license/activate`
Activate premium license.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "licenseKey": "XXXX-XXXX-XXXX-XXXX"
}
```

**Required Fields:**
- `name`, `email`, `licenseKey`

**Response:**
```json
{
  "success": true,
  "message": "Premium license activated! Please restart the server for changes to take effect.",
  "data": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Validation:**
- Returns 400 if required fields missing or license key invalid

### POST `/api/license/generate`
Generate license key (internal use).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Required Fields:**
- `name`, `email`

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "licenseKey": "XXXX-XXXX-XXXX-XXXX"
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
Invalid request format or validation failure.
```json
{
  "success": false,
  "error": "Missing required fields: name, surname, email"
}
```

### 403 Forbidden
Access denied (typically IP blocking).
```json
{
  "success": false,
  "error": "Access denied. IP address is blocked."
}
```

### 404 Not Found
Resource not found or invalid endpoint.
```json
{
  "success": false,
  "error": "Route not found",
  "message": "The requested endpoint /api/invalid does not exist"
}
```

### 409 Conflict
Resource already exists (duplicate).
```json
{
  "success": false,
  "error": "User with this email already exists"
}
```

### 500 Internal Server Error
Server-side error.
```json
{
  "success": false,
  "error": "Failed to create appointment",
  "message": "Database error details"
}
```

---

## Rate Limiting

- General API requests: Rate limited
- Appointments endpoint: Additional rate limiting
- Users endpoint: Additional rate limiting

---

## Notes

- **IP Tracking**: All POST requests track client IP addresses
- **IP Blocking**: Blocked IPs cannot create users or appointments
- **Password Security**: Admin passwords are bcrypt-hashed (never returned in responses)
- **User Privacy**: User IP addresses excluded from GET responses
- **Timestamps**: All entities have `createdAt` and `updatedAt` timestamps
- **UUIDs**: Appointments use UUID for unique identification (`udi` field)

---

## Example Commands (PowerShell)

### Get all appointments
```powershell
curl.exe "http://localhost:5000/api/appointments" -s | ConvertFrom-Json
```

### Create an appointment
```powershell
$body = @{
  date = "2025-10-20"
  timeStart = "10:00"
  timeEnd = "11:00"
  user = @{
    name = "John"
    surname = "Doe"
    email = "john@example.com"
  }
} | ConvertTo-Json

curl.exe "http://localhost:5000/api/appointments" -Method POST -ContentType "application/json" -Body $body | ConvertFrom-Json
```

### Update settings
```powershell
$settings = @{
  startHour = 8
  endHour = 18
  headerMessage = "Book Your Time"
} | ConvertTo-Json

curl.exe "http://localhost:5000/api/settings" -Method PUT -ContentType "application/json" -Body $settings | ConvertFrom-Json
```

### Get current settings
```powershell
curl.exe "http://localhost:5000/api/settings" -s | ConvertFrom-Json
```

### List all admins
```powershell
curl.exe "http://localhost:5000/api/admins" -s | ConvertFrom-Json
```

---

**Last Updated:** October 15, 2025  
**API Version:** 1.0.0
