import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db';
import { authenticate } from '../common/auth';

const router = Router();
router.use(authenticate);

function generateConfirmationCode(): string {
  return 'SS' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// GET /reservations
router.get('/', (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = getDb();

  const reservations = db.prepare(`
    SELECT r.*, c.name as cafe_name, c.image_url as cafe_image, c.address as cafe_address,
           t.table_number, t.capacity as table_capacity, t.floor as table_floor
    FROM reservations r
    JOIN cafes c ON r.cafe_id = c.id
    LEFT JOIN tables t ON r.table_id = t.id
    WHERE r.user_id = ? ORDER BY r.date DESC, r.time DESC
  `).all(user.userId);

  return res.json({ success: true, data: reservations });
});

// GET /reservations/:id
router.get('/:id', (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = getDb();

  const res_ = db.prepare(`
    SELECT r.*, c.name as cafe_name, c.image_url as cafe_image, c.address as cafe_address, c.phone as cafe_phone,
           t.table_number, t.capacity as table_capacity, t.floor as table_floor
    FROM reservations r
    JOIN cafes c ON r.cafe_id = c.id
    LEFT JOIN tables t ON r.table_id = t.id
    WHERE r.id = ? AND r.user_id = ?
  `).get(req.params.id, user.userId) as any;

  if (!res_) return res.status(404).json({ success: false, message: 'Reservation not found' });
  res_.pre_order_items = JSON.parse(res_.pre_order_items || '[]');
  return res.json({ success: true, data: res_ });
});

// POST /reservations
router.post('/', (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { cafe_id, table_id, date, time, party_size, special_requests, pre_order_items = [] } = req.body;

    if (!cafe_id || !date || !time || !party_size) {
      return res.status(400).json({ success: false, message: 'cafe_id, date, time, party_size required' });
    }

    const db = getDb();
    const cafe = db.prepare('SELECT * FROM cafes WHERE id = ?').get(cafe_id) as any;
    if (!cafe) return res.status(404).json({ success: false, message: 'Cafe not found' });

    // Check table existence if provided
    if (table_id) {
      const table = db.prepare('SELECT * FROM tables WHERE id = ? AND cafe_id = ?').get(table_id, cafe_id);
      if (!table) return res.status(404).json({ success: false, message: 'Table not found in this cafe' });

      const conflict = db.prepare(`
        SELECT * FROM reservations 
        WHERE cafe_id = ? AND table_id = ? AND date = ? AND time = ? AND status NOT IN ('CANCELLED', 'NO_SHOW')
      `).get(cafe_id, table_id, date, time) as any;
      
      if (conflict) {
        // If it's the SAME user booking the SAME slot, just return the existing reservation
        // This handles double-clicks or re-tests gracefully
        if (conflict.user_id === user.userId) {
          const existingRes = db.prepare(`
            SELECT r.*, c.name as cafe_name, c.address as cafe_address
            FROM reservations r JOIN cafes c ON r.cafe_id = c.id WHERE r.id = ?
          `).get(conflict.id) as any;
          
          if (existingRes) {
            existingRes.pre_order_items = JSON.parse(existingRes.pre_order_items || '[]');
            return res.status(200).json({ success: true, data: existingRes, message: 'Using existing reservation' });
          }
        }
        return res.status(409).json({ success: false, message: 'Table already booked for this time slot' });
      }
    }

    // Calculate pre-order total
    let preOrderTotal = 0;
    const enrichedPreOrder: any[] = [];

    for (const item of pre_order_items) {
      const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(item.menu_item_id) as any;
      if (menuItem) {
        const lineTotal = menuItem.price * item.quantity;
        preOrderTotal += lineTotal;
        enrichedPreOrder.push({ ...menuItem, quantity: item.quantity, line_total: lineTotal });
      }
    }

    const id = uuidv4();
    const code = generateConfirmationCode();

    db.prepare(`
      INSERT INTO reservations (id, user_id, cafe_id, table_id, date, time, party_size, status, special_requests, pre_order_items, pre_order_total, confirmation_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, ?, ?, ?)
    `).run(id, user.userId, cafe_id, table_id || null, date, time, party_size, special_requests || null, JSON.stringify(enrichedPreOrder), preOrderTotal, code);

    // Notification
    db.prepare(`INSERT INTO notifications (id, user_id, title, body, type) VALUES (?, ?, ?, ?, 'RESERVATION')`).run(
      uuidv4(), user.userId,
      '✅ Table Reserved!',
      `Your table at ${cafe.name} on ${date} at ${time} is confirmed. Code: ${code}`
    );

    const reservation = db.prepare(`
      SELECT r.*, c.name as cafe_name, c.address as cafe_address
      FROM reservations r JOIN cafes c ON r.cafe_id = c.id WHERE r.id = ?
    `).get(id) as any;
    
    if (reservation) {
      reservation.pre_order_items = JSON.parse(reservation.pre_order_items || '[]');
    }

    return res.status(201).json({ success: true, data: reservation });
  } catch (error: any) {
    console.error('Reservation Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during reservation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PATCH /reservations/:id/cancel
router.patch('/:id/cancel', (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = getDb();

  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ? AND user_id = ?').get(req.params.id, user.userId) as any;
  if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
  if (['CANCELLED', 'COMPLETED'].includes(reservation.status)) {
    return res.status(400).json({ success: false, message: 'Reservation already cancelled/completed' });
  }

  db.prepare("UPDATE reservations SET status = 'CANCELLED', updated_at = datetime('now') WHERE id = ?").run(reservation.id);

  return res.json({ success: true, message: 'Reservation cancelled' });
});

export default router;
