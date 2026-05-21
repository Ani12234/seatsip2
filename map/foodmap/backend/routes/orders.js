const express = require('express');
const router = express.Router();
const db = require('../db/pool');
const { authenticateToken } = require('./auth');

// GET /api/orders - Get user's orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT o.*, r.name as restaurant_name, r.image_url as restaurant_image,
              ag.name as agent_name, ag.phone as agent_phone
       FROM orders o
       JOIN restaurants r ON r.id = o.restaurant_id
       LEFT JOIN delivery_agents ag ON ag.id = o.agent_id
       WHERE o.user_id = $1
       ORDER BY o.placed_at DESC`,
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - Get single order with items
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { rows: orderRows } = await db.query(
      `SELECT o.*, r.name as restaurant_name, r.lat as restaurant_lat, r.lng as restaurant_lng,
              r.phone as restaurant_phone, r.address as restaurant_address,
              da.address_line1, da.address_line2, da.city, da.pincode,
              da.lat as delivery_lat, da.lng as delivery_lng,
              ag.name as agent_name, ag.phone as agent_phone, ag.vehicle_type
       FROM orders o
       JOIN restaurants r ON r.id = o.restaurant_id
       JOIN delivery_addresses da ON da.id = o.delivery_address_id
       LEFT JOIN delivery_agents ag ON ag.id = o.agent_id
       WHERE o.id = $1 AND o.user_id = $2`,
      [req.params.id, req.userId]
    );
    
    if (orderRows.length === 0) return res.status(404).json({ error: 'Order not found' });
    
    const { rows: itemRows } = await db.query(
      `SELECT oi.*, mi.name as item_name, mi.description, mi.image_url
       FROM order_items oi
       JOIN menu_items mi ON mi.id = oi.menu_item_id
       WHERE oi.order_id = $1`,
      [req.params.id]
    );
    
    res.json({ ...orderRows[0], items: itemRows });
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST /api/orders - Place new order
router.post('/', authenticateToken, async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      restaurant_id,
      delivery_address_id,
      items,
      payment_method,
      special_instructions,
      delivery_fee = 40,
      tax = 0,
      discount = 0
    } = req.body;
    
    if (!restaurant_id || !delivery_address_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'Restaurant, delivery address and items are required' });
    }
    
    // Get delivery address coordinates
    const { rows: addrRows } = await client.query(
      'SELECT lat, lng FROM delivery_addresses WHERE id = $1 AND user_id = $2',
      [delivery_address_id, req.userId]
    );
    
    if (addrRows.length === 0) {
      return res.status(404).json({ error: 'Delivery address not found' });
    }
    
    const { lat: delivery_lat, lng: delivery_lng } = addrRows[0];
    
    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.unit_price * item.quantity;
    }
    
    const total_amount = subtotal + delivery_fee + tax - discount;
    
    // Create order
    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (
        user_id, restaurant_id, delivery_address_id, delivery_lat, delivery_lng,
        subtotal, delivery_fee, tax, discount, total_amount,
        payment_method, special_instructions, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending')
      RETURNING *`,
      [
        req.userId, restaurant_id, delivery_address_id, delivery_lat, delivery_lng,
        subtotal, delivery_fee, tax, discount, total_amount,
        payment_method, special_instructions
      ]
    );
    
    const order = orderRows[0];
    
    // Create order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, customization)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.menu_item_id, item.quantity, item.unit_price, item.unit_price * item.quantity, item.customization]
      );
    }
    
    await client.query('COMMIT');
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(`order:${order.id}`).emit('order:created', { orderId: order.id });
    
    res.status(201).json(order);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    client.release();
  }
});

// POST /api/orders/:id/cancel - Cancel order
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const { rows } = await db.query(
      `UPDATE orders 
       SET status = 'cancelled', cancellation_reason = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3 AND status IN ('pending', 'confirmed')
       RETURNING *`,
      [reason, req.params.id, req.userId]
    );
    
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }
    
    // Emit cancellation event
    const io = req.app.get('io');
    io.to(`order:${req.params.id}`).emit('order:cancelled', { orderId: req.params.id });
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

module.exports = router;
