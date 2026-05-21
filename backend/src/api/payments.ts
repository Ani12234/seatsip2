import express, { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../db';
import { verifyWebhookSignature } from '../payments/razorpay';

const router = Router();

router.post('/razorpay/webhook', express.raw({ type: 'application/json', limit: '50kb' }), async (req, res) => {
  const signature = req.header('x-razorpay-signature');
  if (!signature || !verifyWebhookSignature(req.body as Buffer, signature)) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  const event = JSON.parse((req.body as Buffer).toString('utf8'));
  const payment = event.payload?.payment?.entity;
  const refund = event.payload?.refund?.entity;

  const rawEventId = event.id || `${event.event}:${event.created_at}`;

  try {
    await prisma.paymentEvent.create({
      data: {
        id: uuidv4(),
        user_id: null,
        order_id: null,
        event_type: event.event,
        payment_method: 'RAZORPAY',
        amount: (payment?.amount || refund?.amount || 0) / 100,
        razorpay_payment_id: payment?.id || refund?.payment_id || null,
        razorpay_refund_id: refund?.id || null,
        raw_event_id: rawEventId,
        status: payment?.status || refund?.status || 'RECEIVED',
      },
    });
  } catch (error: any) {
    if (error.code !== 'P2002') {
      throw error;
    }
  }

  return res.json({ success: true });
});

export default router;
