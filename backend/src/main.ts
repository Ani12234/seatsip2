import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { initDb } from './db';
import authRouter from './api/auth';
import cafesRouter from './api/cafes';
import ordersRouter from './api/orders';
import reservationsRouter from './api/reservations';
import { cartRouter, usersRouter, notificationsRouter } from './api/misc';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize DB
initDb();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'SeatSip API v1' }));

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/cafes', cafesRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/reservations', reservationsRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/notifications', notificationsRouter);

// 404
app.use('*', (_, res) => res.status(404).json({ success: false, message: 'Endpoint not found' }));

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`
🚀 SeatSip API running on http://localhost:${PORT}
📦 Database: SQLite (better-sqlite3)
📋 Endpoints:
   POST /api/v1/auth/register
   POST /api/v1/auth/login
   GET  /api/v1/cafes
   GET  /api/v1/cafes/:id/menu
   POST /api/v1/reservations
   POST /api/v1/orders
   GET  /api/v1/cart
  `);
});

export default app;
