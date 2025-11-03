# Email Setup

## Overview
The scheduler now sends automated emails for various events to both admins and users.

## Email Triggers

### Admin Emails
- **Admin Login**: Sent when admin logs in
- **New Schedule**: Sent when a new appointment is created
- **Password Changed**: Sent when admin password is changed
- **Appointment Cancelled**: Sent when an appointment is cancelled

### User Emails
- **Welcome Email**: Sent to first-time users
- **Schedule Created**: Sent when appointment is created
- **Schedule Confirmed**: Sent when admin confirms appointment
- **Schedule Cancelled**: Sent when appointment is cancelled

## Configuration

### 1. Gmail Setup (Recommended for Development)
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Create a new app password for "Mail"
3. Copy the 16-character password
4. Update `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=your-email@gmail.com
```

### 2. Other SMTP Providers

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

**AWS SES:**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

## Testing

Start the server and test email functionality:
```bash
npm run dev
```

Emails are sent asynchronously and won't block API responses. Check console for email status:
- ✉️  Email sent to... (success)
- ❌ Email failed to... (error)

## Customization

### Email Templates
Templates are in `src/templates/`:
- `adminTemplates.ts` - Admin email templates
- `userTemplates.ts` - User email templates

Edit HTML/CSS directly in these files to customize appearance.

### Email Service
Core logic in `src/services/emailService.ts`:
- Modify sender name
- Add CC/BCC recipients
- Add attachments
- Change email subjects

## Troubleshooting

**Emails not sending:**
1. Check SMTP credentials in `.env`
2. Verify SMTP_HOST and SMTP_PORT
3. For Gmail, ensure App Password is used (not regular password)
4. Check console for error messages

**Gmail "Less secure app" error:**
- Use App Passwords instead of regular password
- Enable 2FA on Google account first

**Port blocked:**
- Try port 465 with `SMTP_SECURE=true`
- Check firewall settings
