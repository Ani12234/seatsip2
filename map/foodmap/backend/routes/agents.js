const express = require('express');
const router = express.Router();
const db = require('../db/pool');

// GET /api/agents/nearby - Find nearest available agents
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, limit = 5, city_id } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng are required' });
    }
    
    let query = `
      SELECT 
        id, name, phone, vehicle_type, rating, total_deliveries,
        current_lat, current_lng,
        ST_Distance(current_geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) / 1000 as distance_km
      FROM delivery_agents
      WHERE is_online = true AND is_available = true
    `;
    
    const params = [lng, lat];
    let paramIdx = 3;
    
    if (city_id) {
      query += ` AND city_id = $${paramIdx}`;
      params.push(city_id);
      paramIdx++;
    }
    
    query += ` ORDER BY distance_km ASC LIMIT $${paramIdx}`;
    params.push(parseInt(limit));
    
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error finding agents:', err);
    res.status(500).json({ error: 'Failed to find agents' });
  }
});

// GET /api/agents/:id - Get agent details
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, name, phone, vehicle_type, vehicle_number, 
              rating, total_deliveries, is_online, is_available,
              current_lat, current_lng, city_id
       FROM delivery_agents WHERE id = $1`,
      [req.params.id]
    );
    
    if (rows.length === 0) return res.status(404).json({ error: 'Agent not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching agent:', err);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

// POST /api/agents/:id/location - Update agent location (for agent app)
router.post('/:id/location', async (req, res) => {
  try {
    const { lat, lng, heading, speed } = req.body;
    
    const { rows } = await db.query(
      `UPDATE delivery_agents 
       SET current_lat = $1, current_lng = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, current_lat, current_lng`,
      [lat, lng, req.params.id]
    );
    
    if (rows.length === 0) return res.status(404).json({ error: 'Agent not found' });
    
    // Broadcast location update to any watching customers via Socket.IO
    const io = req.app.get('io');
    
    // Find active orders for this agent
    const { rows: orderRows } = await db.query(
      'SELECT id FROM orders WHERE agent_id = $1 AND status IN (\'picked_up\', \'on_the_way\')',
      [req.params.id]
    );
    
    for (const order of orderRows) {
      io.to(`order:${order.id}`).emit('location:update', {
        agentId: req.params.id,
        lat,
        lng,
        heading,
        speed,
        timestamp: new Date()
      });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating agent location:', err);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// POST /api/agents/:id/status - Update agent online/available status
router.post('/:id/status', async (req, res) => {
  try {
    const { is_online, is_available } = req.body;
    
    const updates = [];
    const params = [];
    let paramIdx = 1;
    
    if (is_online !== undefined) {
      updates.push(`is_online = $${paramIdx++}`);
      params.push(is_online);
    }
    
    if (is_available !== undefined) {
      updates.push(`is_available = $${paramIdx++}`);
      params.push(is_available);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No status fields provided' });
    }
    
    params.push(req.params.id);
    
    const { rows } = await db.query(
      `UPDATE delivery_agents 
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIdx}
       RETURNING id, is_online, is_available`,
      params
    );
    
    if (rows.length === 0) return res.status(404).json({ error: 'Agent not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating agent status:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
