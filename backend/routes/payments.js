import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Mock Razorpay instance if keys are not present (for test mode)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret_456',
});

// POST /api/payments/create-order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    
    // Create order using Razorpay SDK
    // Amount is in paise (1 INR = 100 paise)
    const options = {
      amount: amount, 
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    };

    if (process.env.RAZORPAY_KEY_ID) {
      const order = await razorpay.orders.create(options);
      res.json({ success: true, order });
    } else {
      // Mock order for development
      res.json({
        success: true,
        order: {
          id: `order_mock_${Date.now()}`,
          amount: options.amount,
          currency: options.currency,
        }
      });
    }
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to create payment order" });
  }
});

// POST /api/payments/verify
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    let isValid = false;

    if (process.env.RAZORPAY_KEY_SECRET) {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
      
      isValid = expectedSignature === razorpay_signature;
    } else {
      // Mock validation success
      isValid = true;
    }

    if (isValid) {
      // Verification successful. In a real app, you would proceed to create the DB order here
      // or pass control back to the frontend to call /api/checkout
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Razorpay Verify Error:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
});

export default router;
