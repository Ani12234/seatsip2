import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { authenticate } from '../common/auth';

const router = Router();

// GET /cafes - list cafes with filters
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { city, mood, search, sort = 'rating', limit = '20', offset = '0' } = req.query as any;

  let query = `SELECT * FROM cafes WHERE is_active = 1`;
  const params: any[] = [];

  if (city) { query += ` AND city LIKE ?`; params.push(`%${city}%`); }
  if (mood) { query += ` AND moods LIKE ?`; params.push(`%${mood}%`); }
  if (search) { query += ` AND (name LIKE ? OR description LIKE ? OR address LIKE ?)`; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

  const orderMap: Record<string, string> = { rating: 'rating DESC', name: 'name ASC', price: 'price_level ASC' };
  query += ` ORDER BY ${orderMap[sort] || 'rating DESC'} LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  const cafes = db.prepare(query).all(...params);
  const total = db.prepare(`SELECT COUNT(*) as count FROM cafes WHERE is_active = 1`).get() as any;

  return res.json({ success: true, data: cafes, meta: { total: total.count, limit: parseInt(limit), offset: parseInt(offset) } });
});

// GET /cafes/:id
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const cafe = db.prepare('SELECT * FROM cafes WHERE (id = ? OR slug = ?) AND is_active = 1').get(req.params.id, req.params.id) as any;
  if (!cafe) return res.status(404).json({ success: false, message: 'Cafe not found' });

  const tables = db.prepare('SELECT * FROM tables WHERE cafe_id = ?').all(cafe.id);
  const categories = db.prepare('SELECT * FROM menu_categories WHERE cafe_id = ? AND is_active = 1 ORDER BY sort_order').all(cafe.id);

  return res.json({ success: true, data: { ...cafe, tables, categories } });
});

// GET /cafes/:id/menu
router.get('/:id/menu', (req: Request, res: Response) => {
  const db = getDb();
  const cafe = db.prepare('SELECT id FROM cafes WHERE (id = ? OR slug = ?) AND is_active = 1').get(req.params.id, req.params.id) as any;
  if (!cafe) return res.status(404).json({ success: false, message: 'Cafe not found' });

  const categories = db.prepare('SELECT * FROM menu_categories WHERE cafe_id = ? AND is_active = 1 ORDER BY sort_order').all(cafe.id) as any[];
  const items = db.prepare('SELECT * FROM menu_items WHERE cafe_id = ? AND is_available = 1 ORDER BY is_popular DESC, name').all(cafe.id) as any[];

  const menu = categories.map(cat => ({
    ...cat,
    items: items.filter(i => i.category_id === cat.id),
  }));

  return res.json({ success: true, data: menu });
});

// GET /cafes/:id/tables
router.get('/:id/tables', (req: Request, res: Response) => {
  const db = getDb();
  const { date, time, party_size } = req.query as any;

  const cafe = db.prepare('SELECT id FROM cafes WHERE (id = ? OR slug = ?)').get(req.params.id, req.params.id) as any;
  if (!cafe) return res.status(404).json({ success: false, message: 'Cafe not found' });

  let tables = db.prepare('SELECT * FROM tables WHERE cafe_id = ?').all(cafe.id) as any[];

  // Check which tables are booked for the given slot
  if (date && time) {
    const bookedTableIds = db.prepare(`
      SELECT table_id FROM reservations 
      WHERE cafe_id = ? AND date = ? AND time = ? AND status NOT IN ('CANCELLED', 'NO_SHOW')
      AND table_id IS NOT NULL
    `).all(cafe.id, date, time).map((r: any) => r.table_id);

    tables = tables.map(t => ({
      ...t,
      is_available: !bookedTableIds.includes(t.id) ? 1 : 0,
    }));
  }

  if (party_size) {
    tables = tables.filter(t => t.capacity >= parseInt(party_size));
  }

  const floors = [...new Set(tables.map(t => t.floor))];
  return res.json({ success: true, data: { floors, tables } });
});

// GET /cafes/:id/reviews
router.get('/:id/reviews', (req: Request, res: Response) => {
  const db = getDb();
  const { limit = '10', offset = '0' } = req.query as any;

  const cafe = db.prepare('SELECT id FROM cafes WHERE (id = ? OR slug = ?)').get(req.params.id, req.params.id) as any;
  if (!cafe) return res.status(404).json({ success: false, message: 'Cafe not found' });

  const reviews = db.prepare(`
    SELECT r.*, u.name as user_name, u.avatar as user_avatar
    FROM reviews r JOIN users u ON r.user_id = u.id
    WHERE r.cafe_id = ? ORDER BY r.created_at DESC LIMIT ? OFFSET ?
  `).all(cafe.id, parseInt(limit), parseInt(offset));

  return res.json({ success: true, data: reviews });
});

// POST /cafes/:id/reviews
router.post('/:id/reviews', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { rating, comment } = req.body;
  if (!rating) return res.status(400).json({ success: false, message: 'Rating required' });

  const db = getDb();
  const cafe = db.prepare('SELECT id FROM cafes WHERE id = ?').get(req.params.id) as any;
  if (!cafe) return res.status(404).json({ success: false, message: 'Cafe not found' });

  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();
  db.prepare('INSERT INTO reviews (id, user_id, cafe_id, rating, comment) VALUES (?, ?, ?, ?, ?)').run(
    id, user.userId, cafe.id, rating, comment || null
  );

  // Update cafe rating
  const avg = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE cafe_id = ?').get(cafe.id) as any;
  db.prepare('UPDATE cafes SET rating = ?, review_count = ? WHERE id = ?').run(
    Math.round(avg.avg * 10) / 10, avg.count, cafe.id
  );

  return res.status(201).json({ success: true, data: { id } });
});

export default router;
