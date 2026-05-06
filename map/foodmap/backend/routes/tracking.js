const express = require('express');
const router = express.Router();
const db = require('../db/pool');
const { authenticateToken } = require('./auth');

// GET /api/tracking/:orderId - Get current tracking snapshot
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT 
        o.id, o.status, o.estimated_delivery_time,
        r.name as restaurant_name, r.lat as restaurant_lat, r.lng as restaurant_lng,
        o.delivery_lat, o.delivery_lng,
        ag.id as agent_id, ag.name as agent_name, ag.phone as agent_phone,
        ag.vehicle_type, ag.current_lat as lat, ag.current_lng as lng,
        (SELECT heading FROM delivery_tracking 
         WHERE order_id = o.id ORDER BY recorded_at DESC LIMIT 1) as heading,
        (SELECT speed FROM delivery_tracking 
         WHERE order_id = o.id ORDER BY recorded_at DESC LIMIT 1) as speed
       FROM orders o
       JOIN restaurants r ON r.id = o.restaurant_id
       LEFT JOIN delivery_agents ag ON ag.id = o.agent_id
       WHERE o.id = $1 AND o.user_id = $2`,
      [req.params.orderId, req.userId]
    );
    
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching tracking:', err);
    res.status(500).json({ error: 'Failed to fetch tracking data' });
  }
});

// GET /api/tracking/:orderId/trail - Get delivery trail (polyline)
router.get('/:orderId/trail', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT lat, lng, speed, heading, recorded_at
       FROM delivery_tracking
       WHERE order_id = $1
       ORDER BY recorded_at ASC`,
      [req.params.orderId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching trail:', err);
    res.status(500).json({ error: 'Failed to fetch trail data' });
  }
});

// GET /api/tracking/:orderId/eta - Get estimated time of arrival
router.get('/:orderId/eta', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT estimated_delivery_time, status
       FROM orders WHERE id = $1 AND user_id = $2`,
      [req.params.orderId, req.userId]
    );
    
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    
    const order = rows[0];
    
    // Calculate ETA based on remaining distance and average speed
    const { rows: trackingRows } = await db.query(
      `SELECT lat, lng, speed, recorded_at
       FROM delivery_tracking
       WHERE order_id = $1
       ORDER BY recorded_at DESC
       LIMIT 5`,
      [req.params.orderId]
    );
    
    if (trackingRows.length === 0) {
      return res.json({ 
        estimated_minutes: order.estimated_delivery_time,
        status: order.status,
        calculated: false
      });
    }
    
    const latest = trackingRows[0];
    const avgSpeed = trackingRows.reduce((sum, t) => sum + (t.speed || 20), 0) / trackingRows.length;
    
    // Get distance to destination (simplified - actual implementation would use proper routing)
    const { rows: distRows } = await db.query(
      `SELECT ST_Distance(
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        ST_SetSRID(ST_MakePoint(delivery_lng, delivery_lat), 4326)::geography
      ) / 1000 as distance_km
      FROM orders WHERE id = $3`,
      [latest.lng, latest.lat, req.params.orderId]
    );
    
    const distanceKm = distRows[0]?.distance_km || 0;
    const etaMinutes = Math.ceil((distanceKm / (avgSpeed || 20)) * 60);
    
    res.json({
      estimated_minutes: etaMinutes,
      status: order.status,
      distance_km: parseFloat(distanceKm.toFixed(2)),
      avg_speed_kmh: parseFloat(avgSpeed.toFixed(1)),
      calculated: true
    });
  } catch (err) {
    console.error('Error calculating ETA:', err);
    res.status(500).json({ error: 'Failed to calculate ETA' });
  }
});

module.exports = router;
