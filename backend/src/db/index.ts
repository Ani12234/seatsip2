import Database from 'better-sqlite3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const DB_PATH = process.env.DB_PATH || './seatsip.db';

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(path.resolve(DB_PATH));
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDb(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER',
      avatar TEXT,
      wallet_balance REAL NOT NULL DEFAULT 0,
      loyalty_points INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cafes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      phone TEXT,
      email TEXT,
      image_url TEXT,
      images TEXT DEFAULT '[]',
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      price_level INTEGER DEFAULT 2,
      is_open INTEGER DEFAULT 1,
      open_time TEXT DEFAULT '08:00',
      close_time TEXT DEFAULT '22:00',
      wifi INTEGER DEFAULT 1,
      parking INTEGER DEFAULT 0,
      pet_friendly INTEGER DEFAULT 0,
      moods TEXT DEFAULT '[]',
      tags TEXT DEFAULT '[]',
      prep_time_minutes INTEGER DEFAULT 15,
      delivery_fee REAL DEFAULT 0,
      min_order REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      cafe_id TEXT NOT NULL,
      table_number TEXT NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 2,
      floor TEXT DEFAULT 'Ground',
      position_x REAL DEFAULT 0,
      position_y REAL DEFAULT 0,
      is_available INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS menu_categories (
      id TEXT PRIMARY KEY,
      cafe_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      cafe_id TEXT NOT NULL,
      category_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      is_available INTEGER DEFAULT 1,
      is_veg INTEGER DEFAULT 0,
      is_popular INTEGER DEFAULT 0,
      prep_time_minutes INTEGER DEFAULT 10,
      calories INTEGER,
      allergens TEXT DEFAULT '[]',
      customizations TEXT DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      cafe_id TEXT NOT NULL,
      reservation_id TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      order_type TEXT NOT NULL DEFAULT 'DINE_IN',
      items TEXT NOT NULL DEFAULT '[]',
      subtotal REAL NOT NULL DEFAULT 0,
      tax REAL NOT NULL DEFAULT 0,
      delivery_fee REAL NOT NULL DEFAULT 0,
      discount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      payment_status TEXT DEFAULT 'PENDING',
      payment_method TEXT,
      special_instructions TEXT,
      estimated_ready_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (cafe_id) REFERENCES cafes(id)
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      cafe_id TEXT NOT NULL,
      table_id TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      duration_minutes INTEGER DEFAULT 90,
      party_size INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      special_requests TEXT,
      pre_order_items TEXT DEFAULT '[]',
      pre_order_total REAL DEFAULT 0,
      confirmation_code TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (cafe_id) REFERENCES cafes(id),
      FOREIGN KEY (table_id) REFERENCES tables(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      cafe_id TEXT NOT NULL,
      order_id TEXT,
      rating INTEGER NOT NULL,
      comment TEXT,
      images TEXT DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (cafe_id) REFERENCES cafes(id)
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      cafe_id TEXT NOT NULL,
      menu_item_id TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      customizations TEXT DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (cafe_id) REFERENCES cafes(id),
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
    );

    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      reference_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      type TEXT DEFAULT 'GENERAL',
      data TEXT DEFAULT '{}',
      is_read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_cafes_city ON cafes(city);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_cafe ON orders(cafe_id);
    CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
    CREATE INDEX IF NOT EXISTS idx_reservations_cafe ON reservations(cafe_id);
    CREATE INDEX IF NOT EXISTS idx_menu_items_cafe ON menu_items(cafe_id);
    CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
  `);

  console.log('✅ Database initialized');
}

export default getDb;
