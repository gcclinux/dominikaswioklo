# Contact Form Backend

## Setup

1. **Configure Gmail App Password:**
   - Go to Google Account → Security → 2-Step Verification
   - Scroll to "App passwords"
   - Generate a new app password for "Mail"
   - Copy the 16-character password

2. **Update `.env` file:**
   ```
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   EMAIL_TO=target_address@gmail.com
   ```

3. **Start the server:**
   ```bash
   cd backend
   npm start
   ```

Server runs on `http://localhost:3001`
