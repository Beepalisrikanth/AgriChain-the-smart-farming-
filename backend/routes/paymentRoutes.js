const express = require('express');
const router = express.Router();
const { createCheckoutSession, stripeWebhook, generateInvoice } = require('../controllers/paymentController');

// ✅ This MUST be here
router.post('/webhook', express.raw({ type: 'json' }), stripeWebhook);

router.post('/create-checkout-session', createCheckoutSession);
router.get('/invoice/:id', generateInvoice);

module.exports = router;
