import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db';
import { generateTokens, authenticate } from '../common/auth';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    db.prepare(`INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, 'USER')`).run(
      userId, name, email, phone || null, passwordHash
    );

    const user = db.prepare('SELECT id, name, email, phone, role, wallet_balance, loyalty_points, avatar, created_at FROM users WHERE id = ?').get(userId) as any;
    const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role });

    // Store refresh token
    db.prepare(`INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, datetime('now', '+30 days'))`).run(
      uuidv4(), userId, tokens.refreshToken
    );

    return res.status(201).json({ success: true, data: { user, ...tokens } });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(email) as any;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role });

    db.prepare(`INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, datetime('now', '+30 days'))`).run(
      uuidv4(), user.id, tokens.refreshToken
    );

    const { password_hash, ...safeUser } = user;
    return res.json({ success: true, data: { user: safeUser, ...tokens } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
});

router.post('/refresh', (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });

  const db = getDb();
  const stored = db.prepare('SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > datetime("now")').get(refreshToken) as any;
  if (!stored) return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });

  const user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(stored.user_id) as any;
  if (!user) return res.status(401).json({ success: false, message: 'User not found' });

  const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role });
  db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
  db.prepare(`INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, datetime('now', '+30 days'))`).run(
    uuidv4(), user.id, tokens.refreshToken
  );

  return res.json({ success: true, data: tokens });
});

router.post('/logout', authenticate, (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    getDb().prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
  }
  return res.json({ success: true, message: 'Logged out' });
});

router.get('/me', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = getDb();
  const dbUser = db.prepare('SELECT id, name, email, phone, role, wallet_balance, loyalty_points, avatar, created_at FROM users WHERE id = ?').get(user.userId) as any;
  if (!dbUser) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, data: dbUser });
});

export default router;
