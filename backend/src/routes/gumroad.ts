import express from 'express';
import { DatabaseQueries } from '../database';
import { generateLicenseKey } from '../config/license';
import { EmailService } from '../services/emailService';
import bodyParser from 'body-parser';

const router = express.Router();

// Gumroad sends application/x-www-form-urlencoded by default
router.use(bodyParser.urlencoded({ extended: false }));

// Basic health endpoint
router.get('/', (req, res) => res.json({ success: true, message: 'Gumroad webhook endpoint' }));

// POST webhook
router.post('/webhook', async (req, res) => {
  try {
    // Gumroad posts many fields; sale_id and purchaser_email are typical
    const payload = req.body || {};
    const saleId = payload.sale_id || payload.id || payload.purchase_id || null;
    const buyerEmail = payload.purchaser_email || payload.email || payload['purchaser_email'] || payload['email'];
    const buyerName = payload.purchaser_name || payload['purchaser_name'] || payload.name || '';

    if (!saleId || !buyerEmail) {
      console.warn('Gumroad webhook missing saleId or email', payload);
      return res.status(400).send('Missing saleId or email');
    }

    // Idempotency: check if we've already processed this sale
    const existing = await DatabaseQueries.getLicenseBySaleId(saleId);
    if (existing) {
      console.log(`Webhook already processed for sale ${saleId}`);
      return res.status(200).send('OK');
    }

    // Generate license key
    const licenseKey = generateLicenseKey(buyerName || buyerEmail.split('@')[0], buyerEmail);

    // Save license to database
    await DatabaseQueries.createLicense({ saleId, name: buyerName || '', email: buyerEmail, licenseKey });

    // Send license email
    await EmailService.sendUserLicense(buyerEmail, buyerName || '', licenseKey);

    // Respond 200 to Gumroad
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling Gumroad webhook:', error);
    // Return 500 so Gumroad will retry
    res.status(500).send('Server error');
  }
});

export default router;
