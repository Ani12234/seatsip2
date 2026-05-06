import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db';
import { authenticate } from '../common/auth';

// ===== CART =====
export const cartRouter = Router();
cartRouter.use(authenticate);

cartRouter.get('/', (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = getDb();

  const items = db.prepare(`
    SELECT ci.*, mi.name, mi.price, mi.image_url, mi.is_veg, mi.description,
           c.name as cafe_name, c.id as cafe_id
    FROM cart_items ci
    JOIN menu_items mi ON ci.menu_item_id = mi.id
    JOIN cafes c ON ci.cafe_id = c.id
    WHERE ci.user_id = ?
  `).all(user.userId) as any[];

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return res.json({ success: true, data: { items, subtotal, tax, total } });
});

cartRouter.post('/add', (req: Request, res: Response) => {
  const user = (req as any).user;
  const { cafe_id, menu_item_id, quantity = 1 } = req.body;
  if (!cafe_id || !menu_item_id) return res.status(400).json({ success: false, message: 'cafe_id and menu_item_id required' });

  try {
    const db = getDb();

    // Clear cart if different cafe
    const existing = db.prepare('SELECT cafe_id FROM cart_items WHERE user_id = ? LIMIT 1').get(user.userId) as any;
    if (existing && existing.cafe_id !== cafe_id) {
      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(user.userId);
    }

    const existingItem = db.prepare('SELECT * FROM cart_items WHERE user_id = ? AND menu_item_id = ?').get(user.userId, menu_item_id) as any;
    if (existingItem) {
      db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?').run(quantity, existingItem.id);
    } else {
      db.prepare('INSERT INTO cart_items (id, user_id, cafe_id, menu_item_id, quantity) VALUES (?, ?, ?, ?, ?)').run(
        uuidv4(), user.userId, cafe_id, menu_item_id, quantity
      );
    }

    return res.json({ success: true, message: 'Added to cart' });
  } catch (err: any) {
    console.error('Error adding to cart:', err);
    return res.status(500).json({ success: false, message: err.message || 'Error adding to cart' });
  }
});

cartRouter.patch('/:id', (req: Request, res: Response) => {
  const user = (req as any).user;
  const { quantity } = req.body;
  const db = getDb();

  if (quantity <= 0) {
    db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(req.params.id, user.userId);
  } else {
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?').run(quantity, req.params.id, user.userId);
  }

  return res.json({ success: true });
});

cartRouter.delete('/clear', (req: Request, res: Response) => {
  const user = (req as any).user;
  getDb().prepare('DELETE FROM cart_items WHERE user_id = ?').run(user.userId);
  return res.json({ success: true });
});

// ===== USERS =====
export const usersRouter = Router();
usersRouter.use(authenticate);

usersRouter.get('/profile', (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = getDb();
  const dbUser = db.prepare('SELECT id, name, email, phone, role, wallet_balance, loyalty_points, avatar, created_at FROM users WHERE id = ?').get(user.userId) as any;
  return res.json({ success: true, data: dbUser });
});

usersRouter.patch('/profile', (req: Request, res: Response) => {
  const user = (req as any).user;
  const { name, phone, avatar } = req.body;
  const db = getDb();
  db.prepare("UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), avatar = COALESCE(?, avatar), updated_at = datetime('now') WHERE id = ?").run(name, phone, avatar, user.userId);
  const updated = db.prepare('SELECT id, name, email, phone, role, wallet_balance, loyalty_points, avatar FROM users WHERE id = ?').get(user.userId);
  return res.json({ success: true, data: updated });
});

usersRouter.post('/wallet/topup', (req: Request, res: Response) => {
  const user = (req as any).user;
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Valid amount required' });

  const db = getDb();
  db.prepare('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?').run(amount, user.userId);
  db.prepare('INSERT INTO wallet_transactions (id, user_id, type, amount, description) VALUES (?, ?, ?, ?, ?)').run(
    uuidv4(), user.userId, 'TOPUP', amount, 'Wallet top-up'
  );

  const updated = db.prepare('SELECT wallet_balance FROM users WHERE id = ?').get(user.userId) as any;
  return res.json({ success: true, data: { wallet_balance: updated.wallet_balance } });
});

usersRouter.get('/wallet/transactions', (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = getDb();
  const transactions = db.prepare('SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(user.userId);
  return res.json({ success: true, data: transactions });
});

// ===== NOTIFICATIONS =====
export const notificationsRouter = Router();
notificationsRouter.use(authenticate);

notificationsRouter.get('/', (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = getDb();
  const notifs = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(user.userId);
  const unread = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(user.userId) as any;
  return res.json({ success: true, data: notifs, unread: unread.count });
});

notificationsRouter.patch('/read-all', (req: Request, res: Response) => {
  const user = (req as any).user;
  getDb().prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(user.userId);
  return res.json({ success: true });
});
