const baseStyle = `
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .branding { text-align: center; padding: 10px; color: #999; font-size: 11px; border-top: 1px solid #e0e0e0; margin-top: 10px; }
    .branding a { color: #667eea; text-decoration: none; }
    .info { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #10b981; }
    .cancel-button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; font-weight: bold; }
    .cancel-button:hover { background: #dc2626; }
  </style>
`;

export const userWelcomeTemplate = (userName: string, emailFooter: string = 'Scheduler System', showBranding: boolean = true) => `
<!DOCTYPE html>
<html>
<head>${baseStyle}</head>
<body>
  <div class="container">
    <div class="header"><h2>Welcome!</h2></div>
    <div class="content">
      <p>Hello ${userName},</p>
      <p>Welcome to our scheduling system! We're excited to have you.</p>
      <p>You can now easily book and manage your appointments with us.</p>
    </div>
    <div class="footer">${emailFooter}</div>
    ${showBranding ? '<div class="branding">Powered by <a href="https://github.com/gcclinux/EasyScheduler" target="_blank">EasyScheduler</a></div>' : ''}
  </div>
</body>
</html>
`;

export const userScheduleCreatedTemplate = (userName: string, date: string, time: string, cancellationToken: string, emailFooter: string = 'Scheduler System', showBranding: boolean = true) => {
  const base = process.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const cancelUrl = `${base}/api/appointments/cancel-by-token/${cancellationToken}`;
  
  return `
<!DOCTYPE html>
<html>
<head>${baseStyle}</head>
<body>
  <div class="container">
    <div class="header"><h2>Appointment Created</h2></div>
    <div class="content">
      <p>Hello ${userName},</p>
      <p>Your appointment has been created successfully.</p>
      <div class="info">
        <strong>Date:</strong> ${date}<br>
        <strong>Time:</strong> ${time}
      </div>
      <p>Your appointment is pending confirmation. You'll receive another email once confirmed.</p>
      <p style="margin-top: 20px;">If you need to cancel this appointment, click the button below:</p>
      <div style="text-align: center;">
        <a href="${cancelUrl}" class="cancel-button">Cancel Appointment</a>
      </div>
      <p style="margin-top: 15px; font-size: 0.9em; color: #666;">
        <strong>Note:</strong> Clicking this link will immediately cancel your appointment and notify our team.
      </p>
    </div>
    <div class="footer">${emailFooter}</div>
    ${showBranding ? '<div class="branding">Powered by <a href="https://github.com/gcclinux/EasyScheduler" target="_blank">EasyScheduler</a></div>' : ''}
  </div>
</body>
</html>
`;
};

export const userScheduleConfirmedTemplate = (userName: string, date: string, time: string, emailFooter: string = 'Scheduler System', showBranding: boolean = true) => `
<!DOCTYPE html>
<html>
<head>${baseStyle}</head>
<body>
  <div class="container">
    <div class="header"><h2>Appointment Confirmed</h2></div>
    <div class="content">
      <p>Hello ${userName},</p>
      <p>Great news! Your appointment has been confirmed.</p>
      <div class="info">
        <strong>Date:</strong> ${date}<br>
        <strong>Time:</strong> ${time}
      </div>
      <p>We look forward to seeing you!</p>
    </div>
    <div class="footer">${emailFooter}</div>
    ${showBranding ? '<div class="branding">Powered by <a href="https://github.com/gcclinux/EasyScheduler" target="_blank">EasyScheduler</a></div>' : ''}
  </div>
</body>
</html>
`;

export const userScheduleCancelledTemplate = (userName: string, date: string, time: string, emailFooter: string = 'Scheduler System', showBranding: boolean = true) => `
<!DOCTYPE html>
<html>
<head>${baseStyle}</head>
<body>
  <div class="container">
    <div class="header"><h2>Appointment Cancelled</h2></div>
    <div class="content">
      <p>Hello ${userName},</p>
      <p>Your appointment has been cancelled.</p>
      <div class="info">
        <strong>Date:</strong> ${date}<br>
        <strong>Time:</strong> ${time}
      </div>
      <p>If you'd like to reschedule, please book a new appointment.</p>
    </div>
    <div class="footer">${emailFooter}</div>
    ${showBranding ? '<div class="branding">Powered by <a href="https://github.com/gcclinux/EasyScheduler" target="_blank">EasyScheduler</a></div>' : ''}
  </div>
</body>
</html>
`;
