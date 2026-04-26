import { initDb, getDb } from './index';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  initDb();
  const db = getDb();

  console.log('🌱 Seeding database...');

  // Clear existing data
  db.exec(`
    DELETE FROM cart_items;
    DELETE FROM notifications;
    DELETE FROM wallet_transactions;
    DELETE FROM reviews;
    DELETE FROM reservations;
    DELETE FROM orders;
    DELETE FROM menu_items;
    DELETE FROM menu_categories;
    DELETE FROM tables;
    DELETE FROM cafes;
    DELETE FROM refresh_tokens;
    DELETE FROM users;
  `);

  // Create users
  const passwordHash = bcrypt.hashSync('password123', 10);
  const adminHash = bcrypt.hashSync('admin123', 10);

  const userId1 = uuidv4();
  const userId2 = uuidv4();
  const adminId = uuidv4();

  db.prepare(`INSERT INTO users (id, name, email, phone, password_hash, role, wallet_balance, loyalty_points) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    userId1, 'Arjun Sharma', 'arjun@example.com', '+91-9876543210', passwordHash, 'USER', 500, 120
  );
  db.prepare(`INSERT INTO users (id, name, email, phone, password_hash, role, wallet_balance, loyalty_points) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    userId2, 'Priya Nair', 'priya@example.com', '+91-9876543211', passwordHash, 'USER', 250, 85
  );
  db.prepare(`INSERT INTO users (id, name, email, phone, password_hash, role, wallet_balance, loyalty_points) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    adminId, 'Admin User', 'admin@seatsip.com', '+91-9000000000', adminHash, 'ADMIN', 0, 0
  );

  // Create cafes
  const cafes = [
    {
      id: uuidv4(), name: 'Third Wave Coffee', slug: 'third-wave-coffee-indiranagar',
      description: 'Specialty coffee roasters serving single-origin brews in a modern industrial space.',
      address: '942, 12th Main Rd, HAL 2nd Stage', city: 'Bengaluru',
      latitude: 12.9716, longitude: 77.6412,
      phone: '+91-80-1234567', image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
        'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=800',
      ]),
      rating: 4.6, review_count: 342, price_level: 3,
      moods: JSON.stringify(['work', 'date', 'chill']),
      tags: JSON.stringify(['specialty-coffee', 'wifi', 'power-outlets', 'quiet']),
      prep_time_minutes: 10, open_time: '07:30', close_time: '22:00',
    },
    {
      id: uuidv4(), name: 'Dyu Art Café', slug: 'dyu-art-cafe-koramangala',
      description: 'A bohemian art café with rotating art exhibitions, board games, and exceptional pour-overs.',
      address: '23, 1st Cross Rd, KHB Colony, 5th Block, Koramangala', city: 'Bengaluru',
      latitude: 12.9352, longitude: 77.6245,
      phone: '+91-80-2345678', image_url: 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=800',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=800',
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
        'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800',
      ]),
      rating: 4.8, review_count: 521, price_level: 2,
      moods: JSON.stringify(['art', 'creative', 'chill', 'date']),
      tags: JSON.stringify(['art', 'board-games', 'vegan-options', 'instagrammable']),
      prep_time_minutes: 12, open_time: '09:00', close_time: '23:00',
    },
    {
      id: uuidv4(), name: 'Matteo Coffee', slug: 'matteo-coffee-ulsoor',
      description: 'Italian-style espresso bar with handcrafted pastries and a sun-drenched courtyard.',
      address: 'Ulsoor Road, near Ulsoor Lake', city: 'Bengaluru',
      latitude: 12.9795, longitude: 77.6210,
      phone: '+91-80-3456789', image_url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800',
        'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800',
        'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=800',
      ]),
      rating: 4.5, review_count: 289, price_level: 3,
      moods: JSON.stringify(['breakfast', 'work', 'romantic']),
      tags: JSON.stringify(['italian', 'pastries', 'outdoor-seating', 'quiet']),
      prep_time_minutes: 8, open_time: '07:00', close_time: '21:30',
    },
    {
      id: uuidv4(), name: 'Hole in the Wall Café', slug: 'hole-in-the-wall-lavelle',
      description: 'Cozy neighbourhood spot with eclectic décor, comfort food, and killer cold brews.',
      address: '44, Lavelle Road, Ashok Nagar', city: 'Bengaluru',
      latitude: 12.9716, longitude: 77.5946,
      phone: '+91-80-4567890', image_url: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800',
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
        'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=800',
      ]),
      rating: 4.4, review_count: 178, price_level: 2,
      moods: JSON.stringify(['cozy', 'friends', 'chill']),
      tags: JSON.stringify(['comfort-food', 'cold-brew', 'cozy', 'casual']),
      prep_time_minutes: 15, open_time: '08:30', close_time: '22:30',
    },
    {
      id: uuidv4(), name: 'Kapi Kafe', slug: 'kapi-kafe-jayanagar',
      description: 'Traditional South Indian filter coffee house elevated with modern café culture.',
      address: '4th Block, Jayanagar', city: 'Bengaluru',
      latitude: 12.9250, longitude: 77.5938,
      phone: '+91-80-5678901', image_url: 'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=800',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=800',
        'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800',
        'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800',
      ]),
      rating: 4.7, review_count: 634, price_level: 1,
      moods: JSON.stringify(['authentic', 'quick', 'breakfast']),
      tags: JSON.stringify(['south-indian', 'filter-coffee', 'idli', 'affordable']),
      prep_time_minutes: 5, open_time: '06:30', close_time: '20:00',
    },
    {
      id: uuidv4(), name: 'Café Noir', slug: 'cafe-noir-mg-road',
      description: 'Sleek rooftop café with panoramic city views, craft cocktails, and a curated brunch menu.',
      address: '100 Feet Rd, Indiranagar, Stage 1', city: 'Bengaluru',
      latitude: 12.9784, longitude: 77.6408,
      phone: '+91-80-6789012', image_url: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=800',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=800',
        'https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=800',
        'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=800',
      ]),
      rating: 4.3, review_count: 412, price_level: 4,
      moods: JSON.stringify(['rooftop', 'date', 'celebration', 'instagram']),
      tags: JSON.stringify(['rooftop', 'cocktails', 'brunch', 'views', 'premium']),
      prep_time_minutes: 20, open_time: '11:00', close_time: '01:00',
    },
  ];

  const insertCafe = db.prepare(`
    INSERT INTO cafes (id, name, slug, description, address, city, latitude, longitude, phone, image_url, images, rating, review_count, price_level, moods, tags, prep_time_minutes, open_time, close_time, wifi, parking, pet_friendly)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0)
  `);

  for (const cafe of cafes) {
    insertCafe.run(
      cafe.id, cafe.name, cafe.slug, cafe.description, cafe.address, cafe.city,
      cafe.latitude, cafe.longitude, cafe.phone, cafe.image_url, cafe.images,
      cafe.rating, cafe.review_count, cafe.price_level, cafe.moods, cafe.tags,
      cafe.prep_time_minutes, cafe.open_time, cafe.close_time
    );

    // Create tables for each cafe
    const tableLayouts = [
      { num: 'T1', cap: 2, floor: 'Ground', x: 10, y: 10 },
      { num: 'T2', cap: 2, floor: 'Ground', x: 10, y: 30 },
      { num: 'T3', cap: 4, floor: 'Ground', x: 30, y: 10 },
      { num: 'T4', cap: 4, floor: 'Ground', x: 30, y: 30 },
      { num: 'T5', cap: 6, floor: 'Ground', x: 50, y: 20 },
      { num: 'T6', cap: 2, floor: 'First', x: 10, y: 10 },
      { num: 'T7', cap: 4, floor: 'First', x: 30, y: 10 },
      { num: 'T8', cap: 8, floor: 'First', x: 50, y: 10 },
    ];

    const insertTable = db.prepare(`INSERT INTO tables (id, cafe_id, table_number, capacity, floor, position_x, position_y) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    for (const t of tableLayouts) {
      insertTable.run(uuidv4(), cafe.id, t.num, t.cap, t.floor, t.x, t.y);
    }

    // Create menu categories
    const categories = [
      { name: 'Hot Beverages', order: 1 },
      { name: 'Cold Beverages', order: 2 },
      { name: 'Food', order: 3 },
      { name: 'Desserts', order: 4 },
    ];

    const catIds: Record<string, string> = {};
    const insertCat = db.prepare(`INSERT INTO menu_categories (id, cafe_id, name, sort_order) VALUES (?, ?, ?, ?)`);
    for (const cat of categories) {
      const catId = uuidv4();
      catIds[cat.name] = catId;
      insertCat.run(catId, cafe.id, cat.name, cat.order);
    }

    // Create menu items
    const items = [
      { name: 'Espresso', desc: 'Rich, concentrated single shot', price: 80, cat: 'Hot Beverages', veg: true, popular: true, cal: 5 },
      { name: 'Cappuccino', desc: 'Espresso with velvety steamed milk foam', price: 180, cat: 'Hot Beverages', veg: true, popular: true, cal: 120 },
      { name: 'Flat White', desc: 'Smooth microfoam over a double ristretto', price: 200, cat: 'Hot Beverages', veg: true, popular: false, cal: 130 },
      { name: 'Chai Latte', desc: 'Aromatic spiced tea with oat milk', price: 160, cat: 'Hot Beverages', veg: true, popular: false, cal: 180 },
      { name: 'Cold Brew', desc: '18-hour slow-steeped cold coffee', price: 220, cat: 'Cold Beverages', veg: true, popular: true, cal: 15 },
      { name: 'Iced Latte', desc: 'Double espresso over ice with milk', price: 210, cat: 'Cold Beverages', veg: true, popular: true, cal: 150 },
      { name: 'Mango Smoothie', desc: 'Fresh Alphonso mangoes blended with yogurt', price: 240, cat: 'Cold Beverages', veg: true, popular: false, cal: 280 },
      { name: 'Avocado Toast', desc: 'Multigrain toast with smashed avocado and cherry tomatoes', price: 280, cat: 'Food', veg: true, popular: true, cal: 320 },
      { name: 'Eggs Benedict', desc: 'Poached eggs on sourdough with hollandaise', price: 340, cat: 'Food', veg: false, popular: true, cal: 480 },
      { name: 'Chicken Sandwich', desc: 'Grilled chicken breast with pesto and rocket', price: 320, cat: 'Food', veg: false, popular: false, cal: 420 },
      { name: 'Granola Bowl', desc: 'House granola with Greek yogurt and seasonal fruits', price: 220, cat: 'Food', veg: true, popular: false, cal: 360 },
      { name: 'Chocolate Lava Cake', desc: 'Warm dark chocolate cake with vanilla gelato', price: 260, cat: 'Desserts', veg: true, popular: true, cal: 450 },
      { name: 'Tiramisu', desc: 'Classic Italian dessert with espresso-soaked ladyfingers', price: 240, cat: 'Desserts', veg: true, popular: false, cal: 380 },
      { name: 'Cheesecake', desc: 'New York-style baked cheesecake with berry compote', price: 220, cat: 'Desserts', veg: true, popular: false, cal: 410 },
    ];

    const insertItem = db.prepare(`
      INSERT INTO menu_items (id, cafe_id, category_id, name, description, price, is_veg, is_popular, prep_time_minutes, calories, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const foodImages: Record<string, string> = {
      'Espresso': 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400',
      'Cappuccino': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
      'Cold Brew': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
      'Iced Latte': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
      'Avocado Toast': 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400',
      'Eggs Benedict': 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400',
      'Chocolate Lava Cake': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    };

    for (const item of items) {
      insertItem.run(
        uuidv4(), cafe.id, catIds[item.cat],
        item.name, item.desc, item.price, item.veg ? 1 : 0, item.popular ? 1 : 0,
        10, item.cal, foodImages[item.name] || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'
      );
    }
  }

  // Add some reviews
  const cafeIds = cafes.map(c => c.id);
  const reviewTexts = [
    'Amazing coffee and great ambiance! Definitely coming back.',
    'The avocado toast is phenomenal. Staff were super friendly.',
    'Perfect work spot. Fast wifi and the cold brew kept me going all day.',
    'A bit pricey but worth every rupee. The lava cake is sinful!',
    'Best cappuccino in Bengaluru, no contest.',
  ];

  const insertReview = db.prepare(`INSERT INTO reviews (id, user_id, cafe_id, rating, comment) VALUES (?, ?, ?, ?, ?)`);
  for (let i = 0; i < 10; i++) {
    insertReview.run(
      uuidv4(),
      i % 2 === 0 ? userId1 : userId2,
      cafeIds[i % cafeIds.length],
      Math.floor(Math.random() * 2) + 4,
      reviewTexts[i % reviewTexts.length]
    );
  }

  console.log('✅ Database seeded successfully!');
  console.log(`   - 3 users (test: arjun@example.com / password123, admin: admin@seatsip.com / admin123)`);
  console.log(`   - ${cafes.length} cafes with full menus, tables, and reviews`);
}

seed().catch(console.error);
