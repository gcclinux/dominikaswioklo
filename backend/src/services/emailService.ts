import nodemailer from 'nodemailer';
import { DatabaseQueries } from '../database';
import { adminLoginTemplate, adminPasswordChangedTemplate, adminNewScheduleTemplate, adminAppointmentCancelledTemplate } from '../templates/adminTemplates';
import { userWelcomeTemplate, userScheduleCreatedTemplate, userScheduleConfirmedTemplate, userScheduleCancelledTemplate } from '../templates/userTemplates';

const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const settings = await DatabaseQueries.getEmailSettings();
    
    if (!settings.smtpUser || !settings.smtpPass) {
      console.warn(`⚠️  Email not configured. Skipping email to ${to}`);
      return;
    }
    
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure === 1,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass
      }
    });
    
    await transporter.sendMail({
      from: settings.smtpFrom || settings.smtpUser,
      to,
      subject,
      html
    });
    console.log(`✉️  Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error);
  }
};

export const EmailService = {
  // Admin emails
  sendAdminLogin: (email: string, adminName: string, loginTime: string) => 
    sendEmail(email, 'Admin Login Notification', adminLoginTemplate(adminName, loginTime)),

  sendAdminPasswordChanged: (email: string, adminName: string) => 
    sendEmail(email, 'Password Changed Successfully', adminPasswordChangedTemplate(adminName)),

  sendAdminNewSchedule: (email: string, userName: string, date: string, time: string, appointmentId: number, appointmentName?: string | null) => 
    sendEmail(email, 'New Appointment Scheduled', adminNewScheduleTemplate(userName, date, time, appointmentId, appointmentName)),

  sendAdminAppointmentCancelled: (email: string, userName: string, date: string, time: string) => 
    sendEmail(email, 'Appointment Cancelled', adminAppointmentCancelledTemplate(userName, date, time)),

  // User emails
  sendUserWelcome: async (email: string, userName: string) => {
    const settings = await DatabaseQueries.getEmailSettings();
    return sendEmail(email, 'Welcome to Our Scheduler', userWelcomeTemplate(userName, settings.emailFooter));
  },

  sendUserScheduleCreated: async (email: string, userName: string, date: string, time: string, cancellationToken: string) => {
    const settings = await DatabaseQueries.getEmailSettings();
    return sendEmail(email, 'Appointment Created', userScheduleCreatedTemplate(userName, date, time, cancellationToken, settings.emailFooter));
  },

  sendUserScheduleConfirmed: async (email: string, userName: string, date: string, time: string) => {
    const settings = await DatabaseQueries.getEmailSettings();
    return sendEmail(email, 'Appointment Confirmed', userScheduleConfirmedTemplate(userName, date, time, settings.emailFooter));
  },

  sendUserScheduleCancelled: async (email: string, userName: string, date: string, time: string) => {
    const settings = await DatabaseQueries.getEmailSettings();
    return sendEmail(email, 'Appointment Cancelled', userScheduleCancelledTemplate(userName, date, time, settings.emailFooter));
  }
  ,
  // Send license email to user after purchase
  sendUserLicense: async (email: string, userName: string, licenseKey: string) => {
    try {
      const settings = await DatabaseQueries.getEmailSettings();
      const emailFooter = settings.emailFooter || 'Scheduler System';
      const html = `<!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .license { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #10b981; font-family: monospace; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h2>Your EasyScheduler License</h2></div>
          <div class="content">
            <p>Hello ${userName || 'Customer'},</p>
            <p>Thanks for your purchase. Below is your license key for EasyScheduler Premium features.</p>
            <div class="license"><strong>${licenseKey}</strong></div>
            <p>To activate, copy the license and paste it into the admin panel (Settings → License) along with your name and email.</p>
          </div>
          <div class="footer">${emailFooter}</div>
        </div>
      </body>
      </html>`;

      return sendEmail(email, 'Your EasyScheduler License', html);
    } catch (error) {
      console.error('Error sending license email:', error);
    }
  }
};
