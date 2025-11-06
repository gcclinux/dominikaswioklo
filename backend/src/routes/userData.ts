import express from 'express';
import { DatabaseQueries } from '../database';
import { ApiResponse } from '../types';

const router = express.Router();

// GET /api/user-data/:token - View user data by token - PUBLIC
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await DatabaseQueries.getUserByToken(token);
    
    if (!user) {
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
            <p>This data management link is invalid or has expired.</p>
          </div>
        </body>
        </html>
      `);
    }
    
    // Get user's appointments
    const appointments = await DatabaseQueries.getAppointments();
    const userAppointments = appointments.filter((a: any) => a.userId === user.uid);
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; padding: 20px; }
          .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px; width: 100%; }
          h1 { color: #333; margin-bottom: 10px; }
          .subtitle { color: #666; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #555; font-size: 1.2rem; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
          .data-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
          .data-label { font-weight: 600; color: #555; }
          .data-value { color: #333; }
          .appointment { background: #f9fafb; padding: 15px; margin-bottom: 10px; border-radius: 6px; border-left: 4px solid #3b82f6; }
          .delete-section { background: #fef2f2; padding: 20px; border-radius: 6px; border: 1px solid #fecaca; }
          .delete-button { background: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: 600; width: 100%; }
          .delete-button:hover { background: #dc2626; }
          .warning { color: #991b1b; margin-bottom: 15px; font-weight: 600; }
          .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; }
          .modal-content { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); max-width: 400px; width: 90%; text-align: center; }
          .modal h3 { color: #ef4444; margin-bottom: 15px; font-size: 1.3rem; }
          .modal p { color: #666; margin-bottom: 25px; line-height: 1.5; }
          .modal-buttons { display: flex; gap: 10px; }
          .modal-button { flex: 1; padding: 12px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
          .confirm-btn { background: #ef4444; color: white; }
          .confirm-btn:hover { background: #dc2626; }
          .cancel-btn { background: #f3f4f6; color: #374151; }
          .cancel-btn:hover { background: #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Your Data</h1>
          <p class="subtitle">Manage your personal information and appointments</p>
          
          <div class="section">
            <h2>Personal Information</h2>
            <div class="data-row">
              <span class="data-label">Name:</span>
              <span class="data-value">${user.name} ${user.surname}</span>
            </div>
            <div class="data-row">
              <span class="data-label">Email:</span>
              <span class="data-value">${user.email}</span>
            </div>
            ${user.phone ? `
            <div class="data-row">
              <span class="data-label">Phone:</span>
              <span class="data-value">${user.phone}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="section">
            <h2>Your Appointments (${userAppointments.length})</h2>
            ${userAppointments.length > 0 ? userAppointments.map((apt: any) => `
              <div class="appointment">
                <strong>Date:</strong> ${apt.date}<br>
                <strong>Time:</strong> ${apt.timeStart} - ${apt.timeEnd}<br>
                <strong>Status:</strong> ${apt.status}
              </div>
            `).join('') : '<p style="color: #666;">No appointments found.</p>'}
          </div>
          
          <div class="delete-section">
            <p class="warning">⚠️ Delete All Your Data</p>
            <p style="color: #666; margin-bottom: 15px;">This will permanently delete your personal information and all appointments. This action cannot be undone.</p>
            <button type="button" class="delete-button" onclick="showModal()">Delete All My Data</button>
            
            <div id="confirmModal" class="modal">
              <div class="modal-content">
                <h3>⚠️ Confirm Deletion</h3>
                <p>Are you absolutely sure you want to delete all your data? This action cannot be undone and will permanently remove:</p>
                <ul style="text-align: left; color: #666; margin-bottom: 20px;">
                  <li>Your personal information</li>
                  <li>All appointment history</li>
                  <li>Newsletter subscription</li>
                </ul>
                <div class="modal-buttons">
                  <button class="modal-button cancel-btn" onclick="hideModal()">Cancel</button>
                  <button class="modal-button confirm-btn" onclick="deleteData()">Yes, Delete Everything</button>
                </div>
              </div>
            </div>
            
            <form id="deleteForm" method="POST" action="/api/user-data/${token}" style="display: none;">
            </form>
            
            <script>
              function showModal() {
                document.getElementById('confirmModal').style.display = 'block';
              }
              
              function hideModal() {
                document.getElementById('confirmModal').style.display = 'none';
              }
              
              function deleteData() {
                document.getElementById('deleteForm').submit();
              }
              
              // Close modal when clicking outside
              window.onclick = function(event) {
                const modal = document.getElementById('confirmModal');
                if (event.target === modal) {
                  hideModal();
                }
              }
            </script>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error fetching user data:', error);
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
          <p>An error occurred while loading your data.</p>
        </div>
      </body>
      </html>
    `);
  }
});

// POST /api/user-data/:token - Delete user data by token - PUBLIC
router.post('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await DatabaseQueries.getUserByToken(token);
    
    if (!user) {
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
            <p>This data management link is invalid or has expired.</p>
          </div>
        </body>
        </html>
      `);
    }
    
    // Delete user data (appointments and user record)
    await DatabaseQueries.deleteUserData(user.uid!);
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
          .message { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
          h1 { color: #10b981; margin-bottom: 20px; }
          p { color: #666; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="message">
          <h1>✓ Data Deleted</h1>
          <p>Your personal information and all appointments have been permanently deleted from our system.</p>
          <p style="margin-top: 20px; font-size: 0.9rem;">Thank you for using our service.</p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error deleting user data:', error);
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
          <p>An error occurred while deleting your data. Please try again or contact support.</p>
        </div>
      </body>
      </html>
    `);
  }
});

export default router;
