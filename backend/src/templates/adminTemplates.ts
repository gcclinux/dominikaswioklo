const baseStyle = `
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .info { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #2563eb; }
    .button-container { display: flex; gap: 15px; justify-content: center; margin-top: 20px; }
    .btn { display: inline-block; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; text-align: center; }
    .btn-confirm { background: #10b981; color: white; }
    .btn-confirm:hover { background: #059669; }
    .btn-cancel { background: #ef4444; color: white; }
    .btn-cancel:hover { background: #dc2626; }
  </style>
`;

export const adminLoginTemplate = (adminName: string, loginTime: string) => `
<!DOCTYPE html>
<html>
<head>${baseStyle}</head>
<body>
  <div class="container">
    <div class="header"><h2>Admin Login Alert</h2></div>
    <div class="content">
      <p>Hello ${adminName},</p>
      <p>Your admin account was accessed.</p>
      <div class="info">
        <strong>Login Time:</strong> ${loginTime}
      </div>
      <p>If this wasn't you, please secure your account immediately.</p>
    </div>
    <div class="footer">Scheduler System - Admin Notification</div>
  </div>
</body>
</html>
`;

export const adminPasswordChangedTemplate = (adminName: string) => `
<!DOCTYPE html>
<html>
<head>${baseStyle}</head>
<body>
  <div class="container">
    <div class="header"><h2>Password Changed</h2></div>
    <div class="content">
      <p>Hello ${adminName},</p>
      <p>Your admin password has been successfully changed.</p>
      <p>If you did not make this change, please contact support immediately.</p>
    </div>
    <div class="footer">Scheduler System - Admin Notification</div>
  </div>
</body>
</html>
`;

export const adminNewScheduleTemplate = (userName: string, date: string, time: string, appointmentId: number, appointmentName?: string | null) => {
  const baseUrl = process.env.API_BASE_URL || process.env.BASE_URL || 'http://localhost:5000';
  const confirmUrl = `${baseUrl}/api/appointments/admin-confirm/${appointmentId}`;
  const cancelUrl = `${baseUrl}/api/appointments/admin-cancel/${appointmentId}`;
  const appName = appointmentName && appointmentName.trim() ? appointmentName : 'Default Appointment';
  
  return `
<!DOCTYPE html>
<html>
<head>${baseStyle}</head>
<body>
  <div class="container">
    <div class="header"><h2>New Appointment</h2></div>
    <div class="content">
      <p>A new appointment has been scheduled.</p>
      <div class="info">
        <strong>Appointment:</strong> ${appName}<br>
        <strong>User:</strong> ${userName}<br>
        <strong>Date:</strong> ${date}<br>
        <strong>Time:</strong> ${time}
      </div>
      <p style="margin-top: 20px;">Take action on this appointment:</p>
      <div class="button-container">
        <a href="${confirmUrl}" class="btn btn-confirm">✓ Confirm</a>
        <a href="${cancelUrl}" class="btn btn-cancel">✗ Cancel</a>
      </div>
      <p style="margin-top: 15px; font-size: 0.9em; color: #666;">
        <strong>Note:</strong> Clicking these links will immediately confirm or cancel the appointment and notify the customer.
      </p>
    </div>
    <div class="footer">Scheduler System - Admin Notification</div>
  </div>
</body>
</html>
`;
};

export const adminAppointmentCancelledTemplate = (userName: string, date: string, time: string) => `
<!DOCTYPE html>
<html>
<head>${baseStyle}</head>
<body>
  <div class="container">
    <div class="header"><h2>Appointment Cancelled</h2></div>
    <div class="content">
      <p>An appointment has been cancelled.</p>
      <div class="info">
        <strong>User:</strong> ${userName}<br>
        <strong>Date:</strong> ${date}<br>
        <strong>Time:</strong> ${time}
      </div>
    </div>
    <div class="footer">Scheduler System - Admin Notification</div>
  </div>
</body>
</html>
`;
