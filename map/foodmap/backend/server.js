// ============================================
// FOODMAP - Node.js Backend
// ============================================
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

// ── Socket.IO for real-time tracking ──────────
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.set('io', io);

// ── Middleware ─────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ─────────────────────────────────────
app.use('/api/cities',        require('./routes/cities'));
app.use('/api/restaurants',   require('./routes/restaurants'));
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/orders',        require('./routes/orders'));
app.use('/api/tracking',      require('./routes/tracking'));
app.use('/api/agents',        require('./routes/agents'));

// ── Socket.IO rooms & events ───────────────────
// Room naming: "order:{orderId}"  "agent:{agentId}"
io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);

  // Customer joins order room to get live updates
  socket.on('track:order', ({ orderId }) => {
    socket.join(`order:${orderId}`);
    console.log(`[WS] ${socket.id} tracking order ${orderId}`);
  });

  // Delivery agent sends location pings
  socket.on('agent:location', async ({ agentId, orderId, lat, lng, heading, speed }) => {
    const db = require('./db/pool');
    try {
      // Persist ping
      await db.query(
        `INSERT INTO delivery_tracking (order_id, agent_id, lat, lng, heading, speed)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, agentId, lat, lng, heading, speed]
      );
      // Update agent's current position
      await db.query(
        `UPDATE delivery_agents SET current_lat=$1, current_lng=$2 WHERE id=$3`,
        [lat, lng, agentId]
      );
      // Broadcast to all customers watching this order
      io.to(`order:${orderId}`).emit('location:update', {
        agentId, lat, lng, heading, speed, timestamp: new Date()
      });
    } catch (err) {
      console.error('[WS] location update error:', err.message);
    }
  });

  // Agent / restaurant updates order status
  socket.on('order:status', async ({ orderId, status }) => {
    const db = require('./db/pool');
    try {
      const col = {
        confirmed:  'confirmed_at',
        preparing:  null,
        ready:      'prepared_at',
        picked_up:  'picked_up_at',
        delivered:  'delivered_at',
      }[status];

      const extra = col ? `, ${col} = NOW()` : '';
      await db.query(
        `UPDATE orders SET status=$1 ${extra} WHERE id=$2`,
        [status, orderId]
      );
      io.to(`order:${orderId}`).emit('status:update', { orderId, status, timestamp: new Date() });
    } catch (err) {
      console.error('[WS] status update error:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[WS] Disconnected: ${socket.id}`);
  });
});

// ── Health check ───────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`FoodMap API running on :${PORT}`));
