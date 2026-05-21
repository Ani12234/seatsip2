import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticate, requireAdmin } from '../common/auth';
import { AuthenticatedRequest } from '../types/authenticated-request';
import { audit } from '../security/http';

const router = Router();

router.use(authenticate);
router.use((req: AuthenticatedRequest, res: Response, next) => {
  requireAdmin(req, res, next);
});

/** Lightweight admin surface so `requireAdmin` is exercised; expand with real ops tooling as needed. */
router.get('/stats', audit('ADMIN_STATS', 'admin'), async (_req: AuthenticatedRequest, res: Response) => {
  const [userCount, orderCount, cafeCount] = await Promise.all([
    prisma.user.count(),
    prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
    prisma.cafe.count({ where: { is_active: 1 } }),
  ]);
  return res.json({
    success: true,
    data: { userCount, orderCount, cafeCount },
  });
});

export default router;
