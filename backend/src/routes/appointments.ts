import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseQueries } from '../database';
import { CreateAppointmentRequest, ApiResponse } from '../types';
import { EmailService } from '../services/emailService';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();

// GET /api/appointments - Get all appointments - PROTECTED
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const appointments = await DatabaseQueries.getAppointments();
    
    const response: ApiResponse = {
      success: true,
      data: appointments,
      message: `Found ${appointments.length} appointments`
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointments',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/appointments/date/:date - Get appointments by date - PUBLIC (needed for calendar)
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    const appointments = await DatabaseQueries.getAppointmentsByDate(date);
    
    const response: ApiResponse = {
      success: true,
      data: appointments,
      message: `Found ${appointments.length} appointments for ${date}`
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching appointments by date:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointments',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/appointments - Create new appointment - PUBLIC (customer booking)
router.post('/', async (req, res) => {
  try {
    const appointmentData: CreateAppointmentRequest = req.body;
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Validate required fields
    if (!appointmentData.date || !appointmentData.timeStart || !appointmentData.timeEnd) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: date, timeStart, timeEnd'
      });
    }
    
    if (!appointmentData.user || !appointmentData.user.name || !appointmentData.user.surname || !appointmentData.user.email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required user fields: name, surname, email'
      });
    }
    
    // Check if IP is blocked
    const isBlocked = await DatabaseQueries.isBlocked(clientIp);
    if (isBlocked) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. IP address is blocked.'
      });
    }
    
    // Check or create user (email is treated as the unique identity)
    let user = await DatabaseQueries.getUserByEmail(appointmentData.user.email);
    const isNewUser = !user;
    if (!user) {
      const userId = await DatabaseQueries.createUser({
        ...appointmentData.user,
        ipAddress: clientIp
      });
      user = { uid: userId, ...appointmentData.user } as any;
    } else {
      // Existing user found by email: optionally update profile fields if new values were provided
      const updates: any = {};
      if (appointmentData.user.name && appointmentData.user.name !== user.name) updates.name = appointmentData.user.name;
      if (appointmentData.user.middle !== undefined && appointmentData.user.middle !== user.middle) updates.middle = appointmentData.user.middle;
      if (appointmentData.user.surname && appointmentData.user.surname !== user.surname) updates.surname = appointmentData.user.surname;
      if (appointmentData.user.phone && appointmentData.user.phone !== user.phone) updates.phone = appointmentData.user.phone;
      // We do not update email here because it's the key used to find the user
      if (Object.keys(updates).length > 0) {
        try { await DatabaseQueries.updateUser(user.uid as any, updates); } catch (_) { /* ignore best-effort */ }
      }
    }
    
    // Check if user (by email or userId) is blocked
    const userBlocked = await DatabaseQueries.isBlocked(clientIp, user.uid);
    if (userBlocked) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. User is blocked from booking.'
      });
    }
    
    // Check booking limits
    const settings = await DatabaseQueries.getSettings();
    
    // Check daily limit
    if (settings.maxApp > 0) {
      const dailyCount = await DatabaseQueries.countUserAppointmentsByDateRange(
        user.uid!,
        appointmentData.date,
        appointmentData.date
      );
      if (dailyCount >= settings.maxApp) {
        return res.status(400).json({
          success: false,
          error: `You have reached the daily booking limit of ${settings.maxApp} appointment(s)`
        });
      }
    }
    
    // Check weekly limit
    if (settings.maxAppWeek > 0) {
      // Get the Monday of the week for the appointment date
      const appointmentDate = new Date(appointmentData.date);
      const dayOfWeek = appointmentDate.getDay();
      const diff = appointmentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
      const mondayDate = new Date(appointmentDate.setDate(diff));
      const mondayString = mondayDate.toISOString().split('T')[0];
      
      // Get the Sunday of the same week
      const sundayDate = new Date(mondayDate);
      sundayDate.setDate(sundayDate.getDate() + 6);
      const sundayString = sundayDate.toISOString().split('T')[0];
      
      const weeklyCount = await DatabaseQueries.countUserAppointmentsByDateRange(
        user.uid!,
        mondayString,
        sundayString
      );
      if (weeklyCount >= settings.maxAppWeek) {
        return res.status(400).json({
          success: false,
          error: `You have reached the weekly booking limit of ${settings.maxAppWeek} appointment(s)`
        });
      }
    }
    
    // Create appointment
    const udi = uuidv4(); // Use udi as the cancellation token
    const appointmentId = await DatabaseQueries.createAppointment({
      udi,
      count: 1,
      date: appointmentData.date,
      timeStart: appointmentData.timeStart,
      timeEnd: appointmentData.timeEnd,
      repeat: appointmentData.repeat || 'none',
      confirmed: false,
      cancelled: false,
      status: 'pending',
      userId: user.uid,
      appTag: appointmentData.appTag
    });
    
    // Send emails
    const userName = `${appointmentData.user.name} ${appointmentData.user.surname}`;
    const timeSlot = `${appointmentData.timeStart} - ${appointmentData.timeEnd}`;
    
    if (isNewUser) {
      EmailService.sendUserWelcome(appointmentData.user.email, userName);
    }
    EmailService.sendUserScheduleCreated(appointmentData.user.email, userName, appointmentData.date, timeSlot, udi);
    
    // Notify admin (get first admin)
    const admins = await DatabaseQueries.getAdmins();
    if (admins.length > 0 && admins[0].email) {
      // Get appointment type name if appTag exists
      let appointmentName = null;
      if (appointmentData.appTag) {
  const appointmentTypes = await DatabaseQueries.getAppointmentTypes();
  const appType = appointmentTypes.find((t: any) => t.appTag === appointmentData.appTag);
        appointmentName = appType?.appName || null;
      }
      EmailService.sendAdminNewSchedule(admins[0].email, userName, appointmentData.date, timeSlot, appointmentId, appointmentName);
    }

    const response: ApiResponse = {
      success: true,
      data: {
        appointmentId,
        udi: appointmentId,
        message: 'Appointment created successfully'
      },
      message: 'Appointment booked successfully'
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create appointment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/appointments/admin-confirm/:id - PUBLIC (admin email confirmation link)
router.get('/admin-confirm/:id', async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    
    // Get appointment details
    const appointments = await DatabaseQueries.getAppointments();
  const appointment = appointments.find((a: any) => a.id === appointmentId);
    
    if (!appointment) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .message { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
            h1 { color: #ef4444; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="message">
            <h1>❌ Invalid Link</h1>
            <p>This appointment could not be found.</p>
          </div>
        </body>
        </html>
      `);
    }
    
    if (appointment.confirmed) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .message { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
            h1 { color: #f59e0b; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="message">
            <h1>⚠️ Already Confirmed</h1>
            <p>This appointment has already been confirmed.</p>
          </div>
        </body>
        </html>
      `);
    }
    
    if (appointment.cancelled) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .message { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
            h1 { color: #ef4444; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="message">
            <h1>❌ Already Cancelled</h1>
            <p>This appointment has been cancelled.</p>
          </div>
        </body>
        </html>
      `);
    }
    
    // Confirm the appointment
    await DatabaseQueries.updateAppointment(appointmentId, {
      confirmed: true,
      status: 'confirmed'
    });
    
    // Send confirmation email to customer
    if (appointment.email && appointment.name && appointment.surname) {
      const userName = `${appointment.name} ${appointment.surname}`;
      const timeSlot = `${appointment.timeStart} - ${appointment.timeEnd}`;
      EmailService.sendUserScheduleConfirmed(appointment.email, userName, appointment.date, timeSlot);
    }
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
          .message { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
          h1 { color: #10b981; margin-bottom: 20px; }
          p { color: #666; line-height: 1.6; }
          .details { background: #f9fafb; padding: 15px; margin: 20px 0; border-left: 4px solid #10b981; text-align: left; }
        </style>
      </head>
      <body>
        <div class="message">
          <h1>✓ Appointment Confirmed</h1>
          <p>The appointment has been successfully confirmed.</p>
          <div class="details">
            <strong>Customer:</strong> ${appointment.name} ${appointment.surname}<br>
            <strong>Date:</strong> ${appointment.date}<br>
            <strong>Time:</strong> ${appointment.timeStart} - ${appointment.timeEnd}
          </div>
          <p>A confirmation email has been sent to the customer.</p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
          .message { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
          h1 { color: #ef4444; margin-bottom: 20px; }
          p { color: #666; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="message">
          <h1>❌ Error</h1>
          <p>An error occurred while confirming the appointment.</p>
        </div>
      </body>
      </html>
    `);
  }
});

// GET /api/appointments/admin-cancel/:id - PUBLIC (admin email cancellation link)
router.get('/admin-cancel/:id', async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    
    // Get appointment details
    const appointments = await DatabaseQueries.getAppointments();
  const appointment = appointments.find((a: any) => a.id === appointmentId);
    
    if (!appointment) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .message { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
            h1 { color: #ef4444; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="message">
            <h1>❌ Invalid Link</h1>
            <p>This appointment could not be found.</p>
          </div>
        </body>
        </html>
      `);
    }
    
    if (appointment.cancelled) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .message { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
            h1 { color: #f59e0b; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="message">
            <h1>⚠️ Already Cancelled</h1>
            <p>This appointment has already been cancelled.</p>
          </div>
        </body>
        </html>
      `);
    }
    
    // Cancel the appointment
    await DatabaseQueries.updateAppointment(appointmentId, {
      cancelled: true,
      status: 'cancelled'
    });
    
    // Send cancellation email to customer
    if (appointment.email && appointment.name && appointment.surname) {
      const userName = `${appointment.name} ${appointment.surname}`;
      const timeSlot = `${appointment.timeStart} - ${appointment.timeEnd}`;
      EmailService.sendUserScheduleCancelled(appointment.email, userName, appointment.date, timeSlot);
    }
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
          .message { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
          h1 { color: #10b981; margin-bottom: 20px; }
          p { color: #666; line-height: 1.6; }
          .details { background: #f9fafb; padding: 15px; margin: 20px 0; border-left: 4px solid #ef4444; text-align: left; }
        </style>
      </head>
      <body>
        <div class="message">
          <h1>✓ Appointment Cancelled</h1>
          <p>The appointment has been successfully cancelled.</p>
          <div class="details">
            <strong>Customer:</strong> ${appointment.name} ${appointment.surname}<br>
            <strong>Date:</strong> ${appointment.date}<br>
            <strong>Time:</strong> ${appointment.timeStart} - ${appointment.timeEnd}
          </div>
          <p>A cancellation email has been sent to the customer.</p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
          .message { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
          h1 { color: #ef4444; margin-bottom: 20px; }
          p { color: #666; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="message">
          <h1>❌ Error</h1>
          <p>An error occurred while cancelling the appointment.</p>
        </div>
      </body>
      </html>
    `);
  }
});

// GET /api/appointments/cancel-by-token/:token - PUBLIC (email cancellation link)
router.get('/cancel-by-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find appointment by udi (which serves as the cancellation token)
    const appointment = await DatabaseQueries.getAppointmentByUdi(token);
    
    if (!appointment) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .message { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
            h1 { color: #ef4444; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="message">
            <h1>❌ Invalid Link</h1>
            <p>This cancellation link is invalid or has expired. The appointment may have already been cancelled or confirmed.</p>
          </div>
        </body>
        </html>
      `);
    }
    
    // Check if already cancelled
    if (appointment.cancelled) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .message { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
            h1 { color: #f59e0b; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="message">
            <h1>⚠️ Already Cancelled</h1>
            <p>This appointment has already been cancelled.</p>
          </div>
        </body>
        </html>
      `);
    }
    
    // Cancel the appointment
    await DatabaseQueries.updateAppointment(appointment.id!, {
      cancelled: true,
      status: 'cancelled'
    });
    
    // Send emails
    if (appointment.email && appointment.name && appointment.surname) {
      const userName = `${appointment.name} ${appointment.surname}`;
      const timeSlot = `${appointment.timeStart} - ${appointment.timeEnd}`;
      
      EmailService.sendUserScheduleCancelled(appointment.email, userName, appointment.date, timeSlot);
      
      // Notify admin
      const admins = await DatabaseQueries.getAdmins();
      if (admins.length > 0 && admins[0].email) {
        EmailService.sendAdminAppointmentCancelled(admins[0].email, userName, appointment.date, timeSlot);
      }
    }
    
    // Return success page
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
          .message { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
          h1 { color: #10b981; margin-bottom: 20px; }
          p { color: #666; line-height: 1.6; }
          .details { background: #f9fafb; padding: 15px; margin: 20px 0; border-left: 4px solid #10b981; text-align: left; }
        </style>
      </head>
      <body>
        <div class="message">
          <h1>✓ Appointment Cancelled</h1>
          <p>Your appointment has been successfully cancelled.</p>
          <div class="details">
            <strong>Date:</strong> ${appointment.date}<br>
            <strong>Time:</strong> ${appointment.timeStart} - ${appointment.timeEnd}
          </div>
          <p>A confirmation email has been sent to you and our team has been notified.</p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error cancelling appointment by token:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
          .message { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
          h1 { color: #ef4444; margin-bottom: 20px; }
          p { color: #666; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="message">
          <h1>❌ Error</h1>
          <p>An error occurred while processing your cancellation. Please contact support.</p>
        </div>
      </body>
      </html>
    `);
  }
});

// PUT /api/appointments/:id/confirm - Confirm appointment - PROTECTED
router.put('/:id/confirm', authenticateAdmin, async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    
    await DatabaseQueries.updateAppointment(appointmentId, {
      confirmed: true,
      status: 'confirmed'
    });
    
    // Get appointment details for email
    const appointments = await DatabaseQueries.getAppointments();
  const apt = appointments.find((a: any) => a.id === appointmentId);
    if (apt && apt.email && apt.name && apt.surname) {
      const userName = `${apt.name} ${apt.surname}`;
      const timeSlot = `${apt.timeStart} - ${apt.timeEnd}`;
      EmailService.sendUserScheduleConfirmed(apt.email, userName, apt.date, timeSlot);
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Appointment confirmed successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm appointment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/appointments/:id/cancel - Cancel appointment - PROTECTED
router.put('/:id/cancel', authenticateAdmin, async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    
    // Get appointment details before cancelling
    const appointments = await DatabaseQueries.getAppointments();
  const apt = appointments.find((a: any) => a.id === appointmentId);
    
    await DatabaseQueries.updateAppointment(appointmentId, {
      cancelled: true,
      status: 'cancelled'
    });
    
    // Send cancellation emails
    if (apt && apt.email && apt.name && apt.surname) {
      const userName = `${apt.name} ${apt.surname}`;
      const timeSlot = `${apt.timeStart} - ${apt.timeEnd}`;
      EmailService.sendUserScheduleCancelled(apt.email, userName, apt.date, timeSlot);
      
      // Notify admin
      const admins = await DatabaseQueries.getAdmins();
      if (admins.length > 0 && admins[0].email) {
        EmailService.sendAdminAppointmentCancelled(admins[0].email, userName, apt.date, timeSlot);
      }
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Appointment cancelled successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel appointment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/appointments/:id/block - Block appointment - PROTECTED
router.put('/:id/block', authenticateAdmin, async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);

    await DatabaseQueries.updateAppointment(appointmentId, {
      cancelled: true,
      status: 'blocked'
    });

    const response: ApiResponse = {
      success: true,
      message: 'Appointment marked as blocked and slot freed'
    };

    res.json(response);
  } catch (error) {
    console.error('Error blocking appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to block appointment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/appointments/block-user - Block a user - PROTECTED
router.post('/block-user', authenticateAdmin, async (req, res) => {
  try {
    const { userId, email, reason } = req.body || {};
    if (!userId && !email) {
      return res.status(400).json({ success: false, error: 'userId or email is required' });
    }

    // Resolve user by email if needed
    let uid = userId as number | undefined;
    if (!uid && email) {
      const u = await DatabaseQueries.getUserByEmail(email);
      uid = u?.uid;
    }
    if (!uid) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Add to blocked list
    const user = await DatabaseQueries.getUserById(uid);
    const userIp = user?.ipAddress || 'unknown';

    // Prevent blocking localhost/local IPs
    const localIps = ['127.0.0.1', '::1', 'localhost', '::ffff:127.0.0.1', 'unknown'];
    if (localIps.includes(userIp)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot block users with localhost or local IP addresses'
      });
    }

    await DatabaseQueries.addBlocked({
      userId: uid,
      ipAddress: userIp,
      email: user?.email,
      reason: reason || 'Blocked by admin (bulk)'
    });

    // Block all their appointments by userId
    let affected = 0;
    affected += await DatabaseQueries.blockAllAppointmentsForUser(uid);
    // Also block any appointments that match email -> user link (covers edge cases)
    if (email) {
      affected += await DatabaseQueries.blockAllAppointmentsByEmail(email);
    }

    const response: ApiResponse = {
      success: true,
      data: { affected },
      message: `Blocked user ${uid} and ${affected} appointment(s)`
    };
    res.json(response);
  } catch (error) {
    console.error('Error blocking user appointments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to block user and appointments',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;