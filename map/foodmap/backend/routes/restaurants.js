const express = require('express');
const router = express.Router();
const db = require('../db/pool');
const demoData = require('../data/demoData');

const USE_DEMO_DATA = process.env.DEMO_MODE !== 'false';

// GET /api/restaurants - Geo-search restaurants by lat/lng + radius
router.get('/', async (req, res) => {
  if (USE_DEMO_DATA) return res.json(demoData.listRestaurants(req.query));

  try {
    const { lat, lng, radius = 5000, category, cuisine_type, city_id } = req.query;
    
    let query = `
      SELECT 
        r.id, r.name, r.description, r.cuisine_type, r.category,
        r.address, r.lat, r.lng, r.phone, r.rating, r.total_ratings,
        r.price_range, r.is_open, r.opening_time, r.closing_time,
        r.image_url, r.thumbnail_url, r.tags, r.is_active,
        ST_Distance(r.geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) / 1000 as distance_km
      FROM restaurants r
      WHERE r.is_active = true
    `;
    
    const params = [lng, lat];
    let paramIdx = 3;
    
    // Geo filter
    if (lat && lng) {
      query += ` AND ST_DWithin(r.geom::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $${paramIdx})`;
      params.push(parseInt(radius));
      paramIdx++;
    }
    
    // Category filter
    if (category && category !== 'all') {
      query += ` AND r.category = $${paramIdx}`;
      params.push(category);
      paramIdx++;
    }
    
    // Cuisine type filter
    if (cuisine_type) {
      query += ` AND r.cuisine_type = $${paramIdx}`;
      params.push(cuisine_type);
      paramIdx++;
    }
    
    // City filter
    if (city_id) {
      query += ` AND r.city_id = $${paramIdx}`;
      params.push(city_id);
      paramIdx++;
    }
    
    query += ' ORDER BY distance_km ASC LIMIT 50';
    
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching restaurants:', err);
    res.json(demoData.listRestaurants(req.query));
  }
});

// GET /api/restaurants/:id - Get single restaurant with menu
router.get('/:id', async (req, res) => {
  if (USE_DEMO_DATA) {
    const restaurant = demoData.getRestaurant(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    return res.json({ ...restaurant, menu: demoData.getMenu(req.params.id) });
  }

  try {
    const { rows: restRows } = await db.query(
      'SELECT * FROM restaurants WHERE id = $1 AND is_active = true',
      [req.params.id]
    );
    
    if (restRows.length === 0) return res.status(404).json({ error: 'Restaurant not found' });
    
    const { rows: menuRows } = await db.query(
      'SELECT * FROM menu_items WHERE restaurant_id = $1 AND is_available = true ORDER BY category, name',
      [req.params.id]
    );
    
    res.json({ ...restRows[0], menu: menuRows });
  } catch (err) {
    console.error('Error fetching restaurant:', err);
    const restaurant = demoData.getRestaurant(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json({ ...restaurant, menu: demoData.getMenu(req.params.id) });
  }
});

// GET /api/restaurants/:id/menu - Get menu items only
router.get('/:id/menu', async (req, res) => {
  if (USE_DEMO_DATA) {
    const menu = demoData.getMenu(req.params.id);
    if (menu.length === 0) return res.status(404).json({ error: 'Restaurant not found' });
    return res.json(menu);
  }

  try {
    const { rows } = await db.query(
      `SELECT * FROM menu_items 
       WHERE restaurant_id = $1 AND is_available = true 
       ORDER BY category, name`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching menu:', err);
    const menu = demoData.getMenu(req.params.id);
    if (menu.length === 0) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(menu);
  }
});

module.exports = router;
