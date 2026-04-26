import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db';
import { authenticate } from '../common/auth';

const router = Router();

router.use(authenticate);

// GET /orders
router.get('/', (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = getDb();
  const { limit = '20', offset = '0' } = req.query as any;

  const orders = db.prepare(`
    SELECT o.*, c.name as cafe_name, c.image_url as cafe_image
    FROM orders o JOIN cafes c ON o.cafe_id = c.id
    WHERE o.user_id = ? ORDER BY o.created_at DESC LIMIT ? OFFSET ?
  `).all(user.userId, parseInt(limit), parseInt(offset));

  return res.json({ success: true, data: orders });
});

// GET /orders/:id
router.get('/:id', (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = getDb();
  const order = db.prepare(`
    SELECT o.*, c.name as cafe_name, c.image_url as cafe_image, c.address as cafe_address, c.phone as cafe_phone
    FROM orders o JOIN cafes c ON o.cafe_id = c.id
    WHERE o.id = ? AND o.user_id = ?
  `).get(req.params.id, user.userId) as any;

  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  order.items = JSON.parse(order.items || '[]');
  return res.json({ success: true, data: order });
});

// POST /orders
router.post('/', (req: Request, res: Response) => {
  const user = (req as any).user;
  const { cafe_id, items, order_type = 'DINE_IN', special_instructions, payment_method = 'WALLET', reservation_id } = req.body;

  if (!cafe_id || !items?.length) {
    return res.status(400).json({ success: false, message: 'cafe_id and items are required' });
  }

  const db = getDb();
  const cafe = db.prepare('SELECT * FROM cafes WHERE id = ?').get(cafe_id) as any;
  if (!cafe) return res.status(404).json({ success: false, message: 'Cafe not found' });

  // Validate items and calculate total
  let subtotal = 0;
  const orderItems: any[] = [];

  for (const item of items) {
    const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ? AND cafe_id = ?').get(item.menu_item_id, cafe_id) as any;
    if (!menuItem) return res.status(400).json({ success: false, message: `Menu item not found: ${item.menu_item_id}` });
    const lineTotal = menuItem.price * item.quantity;
    subtotal += lineTotal;
    orderItems.push({ ...menuItem, quantity: item.quantity, line_total: lineTotal });
  }

  const tax = subtotal * 0.05; // 5% GST
  const delivery_fee = order_type === 'DELIVERY' ? cafe.delivery_fee : 0;
  const total = subtotal + tax + delivery_fee;

  // Check wallet balance if paying by wallet
  if (payment_method === 'WALLET') {
    const dbUser = db.prepare('SELECT wallet_balance FROM users WHERE id = ?').get(user.userId) as any;
    if (dbUser.wallet_balance < total) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }
    db.prepare('UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?').run(total, user.userId);
  }

  const orderId = uuidv4();
  const estimatedMinutes = cafe.prep_time_minutes || 15;
  const estimatedAt = new Date(Date.now() + estimatedMinutes * 60000).toISOString();

  db.prepare(`
    INSERT INTO orders (id, user_id, cafe_id, reservation_id, status, order_type, items, subtotal, tax, delivery_fee, total, payment_status, payment_method, special_instructions, estimated_ready_at)
    VALUES (?, ?, ?, ?, 'CONFIRMED', ?, ?, ?, ?, ?, ?, 'PAID', ?, ?, ?)
  `).run(orderId, user.userId, cafe_id, reservation_id || null, order_type, JSON.stringify(orderItems), subtotal, tax, delivery_fee, total, payment_method, special_instructions || null, estimatedAt);

  // Add loyalty points (1 point per ₹10)
  const pointsEarned = Math.floor(total / 10);
  db.prepare('UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?').run(pointsEarned, user.userId);

  // Clear cart
  db.prepare('DELETE FROM cart_items WHERE user_id = ? AND cafe_id = ?').run(user.userId, cafe_id);

  // Create notification
  db.prepare(`INSERT INTO notifications (id, user_id, title, body, type) VALUES (?, ?, ?, ?, 'ORDER')`).run(
    uuidv4(), user.userId,
    '🎉 Order Confirmed!',
    `Your order at ${cafe.name} is confirmed. Ready in ~${estimatedMinutes} mins. You earned ${pointsEarned} points!`
  );

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
  order.items = JSON.parse(order.items);

  return res.status(201).json({ success: true, data: order });
});

// PATCH /orders/:id/cancel
router.patch('/:id/cancel', (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = getDb();

  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, user.userId) as any;
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
  }

  db.prepare("UPDATE orders SET status = 'CANCELLED', updated_at = datetime('now') WHERE id = ?").run(order.id);

  // Refund if wallet payment
  if (order.payment_method === 'WALLET') {
    db.prepare('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?').run(order.total, user.userId);
  }

  return res.json({ success: true, message: 'Order cancelled and refunded' });
});

export default router;
