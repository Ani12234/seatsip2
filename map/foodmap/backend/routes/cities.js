const express = require('express');
const router = express.Router();
const db = require('../db/pool');
const demoData = require('../data/demoData');

const USE_DEMO_DATA = process.env.DEMO_MODE !== 'false';

// GET /api/cities - List all cities
router.get('/', async (req, res) => {
  if (USE_DEMO_DATA) return res.json(demoData.cities);

  try {
    const { rows } = await db.query(
      'SELECT id, name, state, lat, lng, zoom_level FROM cities ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching cities:', err);
    res.json(demoData.cities);
  }
});

// GET /api/cities/:id - Get single city
router.get('/:id', async (req, res) => {
  if (USE_DEMO_DATA) {
    const city = demoData.cities.find((item) => item.id === req.params.id);
    if (!city) return res.status(404).json({ error: 'City not found' });
    return res.json(city);
  }

  try {
    const { rows } = await db.query(
      'SELECT id, name, state, lat, lng, zoom_level FROM cities WHERE id = $1',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'City not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching city:', err);
    const city = demoData.cities.find((item) => item.id === req.params.id);
    if (!city) return res.status(404).json({ error: 'City not found' });
    res.json(city);
  }
});

module.exports = router;
