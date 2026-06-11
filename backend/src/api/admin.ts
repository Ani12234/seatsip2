import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { authenticate, requireAdmin } from '../common/auth';
import { AuthenticatedRequest } from '../types/authenticated-request';
import { audit } from '../security/http';

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// Allow ADMIN or CAFE_OWNER
function requireAdminOrOwner(req: AuthenticatedRequest, res: Response, next: Function) {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'CAFE_OWNER') {
    return res.status(403).json({ success: false, message: 'Admin or Cafe Owner access required' });
  }
  next();
}

// Helper: map snake_case DB cafe to camelCase for frontend
function mapCafe(cafe: any, extra: any = {}) {
  return {
    id: cafe.id,
    name: cafe.name,
    slug: cafe.slug,
    description: cafe.description,
    address: cafe.address,
    city: cafe.city,
    phone: cafe.phone,
    email: cafe.email,
    imageUrl: cafe.image_url,
    images: tryParse(cafe.images, []),
    rating: cafe.rating,
    reviewCount: cafe.review_count,
    priceLevel: cafe.price_level,
    isOpen: cafe.is_open === 1,
    isActive: cafe.is_active === 1,
    openTime: cafe.open_time,
    closeTime: cafe.close_time,
    wifi: cafe.wifi === 1,
    parking: cafe.parking === 1,
    petFriendly: cafe.pet_friendly === 1,
    latitude: cafe.latitude,
    longitude: cafe.longitude,
    moods: tryParse(cafe.moods, []),
    tags: tryParse(cafe.tags, []),
    prepTimeMinutes: cafe.prep_time_minutes,
    deliveryFee: cafe.delivery_fee,
    minOrder: cafe.min_order,
    upiId: cafe.upi_id,
    createdAt: cafe.created_at,
    updatedAt: cafe.updated_at,
    ...extra,
  };
}

function tryParse(val: any, fallback: any) {
  if (!val) return fallback;
  if (typeof val !== 'string') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────────────────────

router.get('/stats', requireAdminOrOwner, audit('ADMIN_STATS', 'admin'), async (req: AuthenticatedRequest, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ownerCafeWhere = req.user?.role === 'CAFE_OWNER' ? { email: req.user.email } : {};
  const ownerCafes = req.user?.role === 'CAFE_OWNER'
    ? await prisma.cafe.findMany({ where: ownerCafeWhere, select: { id: true } })
    : [];
  const ownerCafeIds = ownerCafes.map(c => c.id);
  const ownerScopedWhere = req.user?.role === 'CAFE_OWNER' ? { cafe_id: { in: ownerCafeIds } } : {};

  const [totalUsers, totalOrders, totalCafes, activeReservations, newUsers, todayOrdersAgg] = await Promise.all([
    prisma.user.count({ where: { is_active: 1 } }),
    prisma.order.count({ where: { status: { not: 'CANCELLED' }, ...ownerScopedWhere } }),
    prisma.cafe.count({ where: { is_active: 1, ...ownerCafeWhere } }),
    prisma.reservation.count({ where: { status: { in: ['PENDING', 'CONFIRMED'] }, ...ownerScopedWhere } }),
    prisma.user.count({ where: { created_at: { gte: today } } }),
    prisma.order.aggregate({
      where: { created_at: { gte: today }, payment_status: 'PAID', ...ownerScopedWhere },
      _sum: { total: true },
    }),
  ]);

  return res.json({
    success: true,
    data: {
      totalUsers,
      totalOrders,
      totalCafes,
      activeReservations,
      newUsers,
      todayRevenue: (todayOrdersAgg._sum.total || 0) * 100, // convert to paise for frontend display
    },
  });
});

// ─────────────────────────────────────────────────────────────
// REVENUE CHART
// ─────────────────────────────────────────────────────────────

router.get('/revenue', requireAdminOrOwner, async (req: AuthenticatedRequest, res: Response) => {
  const days = Math.min(parseInt(String(req.query.days || '7'), 10), 90);
  const result: { date: string; amount: number }[] = [];
  const ownerCafes = req.user?.role === 'CAFE_OWNER'
    ? await prisma.cafe.findMany({ where: { email: req.user.email }, select: { id: true } })
    : [];
  const ownerCafeIds = ownerCafes.map(c => c.id);
  const ownerScopedWhere = req.user?.role === 'CAFE_OWNER' ? { cafe_id: { in: ownerCafeIds } } : {};

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);

    const agg = await prisma.order.aggregate({
      where: { created_at: { gte: d, lte: end }, payment_status: 'PAID', ...ownerScopedWhere },
      _sum: { total: true },
    });

    result.push({
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      amount: agg._sum.total || 0,
    });
  }

  return res.json({ success: true, data: result });
});

// ─────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────

router.get('/users', requireAdminOrOwner, audit('ADMIN_LIST_USERS', 'user'), async (_req: AuthenticatedRequest, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      is_active: true,
      wallet_balance: true,
      loyalty_points: true,
      loyalty_tier: true,
      created_at: true,
      auth_provider: true,
    },
    orderBy: { created_at: 'desc' },
    take: 500,
  });

  const mapped = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    isActive: u.is_active === 1,
    walletBalance: u.wallet_balance,
    loyaltyPoints: u.loyalty_points,
    loyaltyTier: u.loyalty_tier,
    authProvider: u.auth_provider,
    createdAt: u.created_at,
  }));

  return res.json({ success: true, data: mapped });
});

router.patch('/users/:id/status', requireAdmin, audit('ADMIN_UPDATE_USER_STATUS', 'user'), async (req: AuthenticatedRequest, res: Response) => {
  const { isActive } = req.body as { isActive: boolean };
  await prisma.user.update({
    where: { id: req.params.id },
    data: { is_active: isActive ? 1 : 0 },
  });
  return res.json({ success: true, message: `User ${isActive ? 'activated' : 'suspended'}` });
});

router.delete('/users/:id', requireAdmin, audit('ADMIN_DELETE_USER', 'user'), async (req: AuthenticatedRequest, res: Response) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  return res.json({ success: true, message: 'User deleted' });
});

// ─────────────────────────────────────────────────────────────
// CAFES (Admin CRUD)
// ─────────────────────────────────────────────────────────────

router.get('/cafes', requireAdminOrOwner, audit('ADMIN_LIST_CAFES', 'cafe'), async (req: AuthenticatedRequest, res: Response) => {
  const cafes = await prisma.cafe.findMany({
    where: req.user?.role === 'CAFE_OWNER'
      ? { email: req.user.email }
      : {},
    include: {
      _count: { select: { tables: true, menu_items: true, orders: true } },
    },
    orderBy: { created_at: 'desc' },
  });

  const mapped = cafes.map(c => ({
    ...mapCafe(c),
    _count: c._count,
  }));

  return res.json({ success: true, data: mapped });
});

router.post('/cafes', requireAdmin, audit('ADMIN_CREATE_CAFE', 'cafe'), async (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as any;
  const id = uuidv4();

  // Parse opening hours string like "09:00 - 22:00"
  let openTime = '09:00';
  let closeTime = '22:00';
  if (body.openingHours) {
    const parts = String(body.openingHours).split('-');
    if (parts.length === 2) {
      openTime = parts[0].trim();
      closeTime = parts[1].trim();
    }
  }

  // Parse tags/moods (comma-separated string or array)
  const parseList = (val: any) => {
    if (!val) return '[]';
    if (Array.isArray(val)) return JSON.stringify(val);
    return JSON.stringify(String(val).split(',').map((s: string) => s.trim()).filter(Boolean));
  };

  // Parse images (newline or comma-separated)
  const parseImages = (val: any) => {
    if (!val) return '[]';
    if (Array.isArray(val)) return JSON.stringify(val);
    const urls = String(val).split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean);
    return JSON.stringify(urls);
  };

  const slug = `${String(body.name || 'cafe').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${id.slice(0, 8)}`;

  await prisma.cafe.create({
    data: {
      id,
      name: body.name,
      slug,
      description: body.description || null,
      address: body.address,
      city: body.city || 'Mumbai',
      phone: body.phone || null,
      email: body.email || null,
      image_url: body.imageUrl || null,
      images: parseImages(body.images),
      latitude: body.lat ? parseFloat(String(body.lat)) : null,
      longitude: body.lng ? parseFloat(String(body.lng)) : null,
      price_level: parseInt(String(body.priceLevel || 2), 10),
      prep_time_minutes: parseInt(String(body.prepTimeMinutes || 15), 10),
      delivery_fee: parseFloat(String(body.deliveryFee || 0)),
      min_order: parseFloat(String(body.minOrder || 0)),
      upi_id: body.upiId || null,
      wifi: body.wifi ? 1 : 0,
      parking: body.parking ? 1 : 0,
      pet_friendly: body.petFriendly ? 1 : 0,
      is_open: body.isOpen !== false ? 1 : 0,
      is_active: 1,
      open_time: openTime,
      close_time: closeTime,
      tags: parseList(body.tags),
      moods: parseList(body.moods),
    },
  });

  return res.status(201).json({ success: true, data: { id } });
});

router.patch('/cafes/:id', requireAdminOrOwner, audit('ADMIN_UPDATE_CAFE', 'cafe'), async (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as any;
  if (req.user?.role === 'CAFE_OWNER') {
    const cafe = await prisma.cafe.findUnique({ where: { id: req.params.id }, select: { email: true } });
    if (!cafe || cafe.email !== req.user.email) {
      return res.status(403).json({ success: false, message: 'You can only edit your own cafe' });
    }
  }

  const parseList = (val: any) => {
    if (val === undefined) return undefined;
    if (Array.isArray(val)) return JSON.stringify(val);
    return JSON.stringify(String(val).split(',').map((s: string) => s.trim()).filter(Boolean));
  };

  const parseImages = (val: any) => {
    if (val === undefined) return undefined;
    if (Array.isArray(val)) return JSON.stringify(val);
    const urls = String(val).split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean);
    return JSON.stringify(urls);
  };

  let openTime: string | undefined;
  let closeTime: string | undefined;
  if (body.openingHours) {
    const parts = String(body.openingHours).split('-');
    if (parts.length === 2) {
      openTime = parts[0].trim();
      closeTime = parts[1].trim();
    }
  }

  const updateData: any = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description;
  if (req.user?.role !== 'CAFE_OWNER' && body.address !== undefined) updateData.address = body.address;
  if (req.user?.role !== 'CAFE_OWNER' && body.city !== undefined) updateData.city = body.city;
  if (body.phone !== undefined) updateData.phone = body.phone;
  if (body.email !== undefined) updateData.email = body.email;
  if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl;
  if (body.images !== undefined) updateData.images = parseImages(body.images);
  if (req.user?.role !== 'CAFE_OWNER' && body.lat !== undefined) updateData.latitude = parseFloat(String(body.lat));
  if (req.user?.role !== 'CAFE_OWNER' && body.lng !== undefined) updateData.longitude = parseFloat(String(body.lng));
  if (req.user?.role !== 'CAFE_OWNER' && body.priceLevel !== undefined) updateData.price_level = parseInt(String(body.priceLevel), 10);
  if (body.prepTimeMinutes !== undefined) updateData.prep_time_minutes = parseInt(String(body.prepTimeMinutes), 10);
  if (req.user?.role !== 'CAFE_OWNER' && body.deliveryFee !== undefined) updateData.delivery_fee = parseFloat(String(body.deliveryFee));
  if (req.user?.role !== 'CAFE_OWNER' && body.minOrder !== undefined) updateData.min_order = parseFloat(String(body.minOrder));
  if (req.user?.role !== 'CAFE_OWNER' && body.upiId !== undefined) updateData.upi_id = body.upiId;
  if (body.wifi !== undefined) updateData.wifi = body.wifi ? 1 : 0;
  if (body.parking !== undefined) updateData.parking = body.parking ? 1 : 0;
  if (body.petFriendly !== undefined) updateData.pet_friendly = body.petFriendly ? 1 : 0;
  if (body.isOpen !== undefined) updateData.is_open = body.isOpen ? 1 : 0;
  if (body.isActive !== undefined) updateData.is_active = body.isActive ? 1 : 0;
  if (openTime) updateData.open_time = openTime;
  if (closeTime) updateData.close_time = closeTime;
  if (body.tags !== undefined) updateData.tags = parseList(body.tags);
  if (body.moods !== undefined) updateData.moods = parseList(body.moods);
  if (body.rating !== undefined) updateData.rating = parseFloat(String(body.rating));

  await prisma.cafe.update({ where: { id: req.params.id }, data: updateData });
  return res.json({ success: true, message: 'Cafe updated' });
});

router.delete('/cafes/:id', requireAdmin, audit('ADMIN_DELETE_CAFE', 'cafe'), async (req: AuthenticatedRequest, res: Response) => {
  await prisma.cafe.delete({ where: { id: req.params.id } });
  return res.json({ success: true, message: 'Cafe deleted' });
});

// ─────────────────────────────────────────────────────────────
// TABLES (Admin CRUD)
// ─────────────────────────────────────────────────────────────

router.get('/cafes/:cafeId/tables', requireAdminOrOwner, async (req: AuthenticatedRequest, res: Response) => {
  const tables = await prisma.table.findMany({
    where: { cafe_id: req.params.cafeId },
    orderBy: { table_number: 'asc' },
  });
  return res.json({ success: true, data: tables });
});

router.post('/cafes/:cafeId/tables', requireAdminOrOwner, async (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as any;
  const table = await prisma.table.create({
    data: {
      id: uuidv4(),
      cafe_id: req.params.cafeId,
      table_number: body.tableNumber || body.table_number,
      capacity: parseInt(String(body.capacity || 2), 10),
      floor: body.floor || 'Ground',
      position_x: parseFloat(String(body.position_x || body.positionX || 0)),
      position_y: parseFloat(String(body.position_y || body.positionY || 0)),
    },
  });
  return res.status(201).json({ success: true, data: table });
});

router.patch('/tables/:id', requireAdminOrOwner, async (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as any;
  const updateData: any = {};
  if (body.tableNumber !== undefined) updateData.table_number = body.tableNumber;
  if (body.capacity !== undefined) updateData.capacity = parseInt(String(body.capacity), 10);
  if (body.floor !== undefined) updateData.floor = body.floor;
  if (body.isAvailable !== undefined) updateData.is_available = body.isAvailable ? 1 : 0;

  await prisma.table.update({ where: { id: req.params.id }, data: updateData });
  return res.json({ success: true, message: 'Table updated' });
});

router.delete('/tables/:id', requireAdminOrOwner, async (req: AuthenticatedRequest, res: Response) => {
  await prisma.table.delete({ where: { id: req.params.id } });
  return res.json({ success: true, message: 'Table deleted' });
});

// ─────────────────────────────────────────────────────────────
// ORDERS (Admin view)
// ─────────────────────────────────────────────────────────────

router.get('/orders', requireAdminOrOwner, audit('ADMIN_LIST_ORDERS', 'order'), async (req: AuthenticatedRequest, res: Response) => {
  const limit = Math.min(parseInt(String(req.query.limit || '50'), 10), 200);
  const offset = parseInt(String(req.query.offset || '0'), 10);
  const statusFilter = req.query.status as string | undefined;

  const orders = await prisma.order.findMany({
    where: statusFilter ? { status: statusFilter } : {},
    include: {
      user: { select: { id: true, name: true, email: true } },
      cafe: { select: { id: true, name: true, address: true } },
    },
    orderBy: { created_at: 'desc' },
    take: limit,
    skip: offset,
  });

  const mapped = orders.map(o => ({
    id: o.id,
    orderNumber: o.id.slice(0, 8).toUpperCase(),
    status: o.status,
    type: o.order_type,
    subtotal: o.subtotal,
    tax: o.tax,
    deliveryFee: o.delivery_fee,
    discount: o.discount,
    total: o.total,
    paymentStatus: o.payment_status,
    paymentMethod: o.payment_method,
    items: tryParse(o.items, []),
    specialInstructions: o.special_instructions,
    created_at: o.created_at,
    updated_at: o.updated_at,
    user: o.user,
    cafe: o.cafe,
  }));

  return res.json({ success: true, data: mapped });
});

router.patch('/orders/:id', requireAdminOrOwner, audit('ADMIN_UPDATE_ORDER', 'order'), async (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body as { status: string };
  await prisma.order.update({ where: { id: req.params.id }, data: { status } });
  return res.json({ success: true, message: 'Order status updated' });
});

// ─────────────────────────────────────────────────────────────
// RESERVATIONS (Admin view)
// ─────────────────────────────────────────────────────────────

router.get('/reservations', requireAdminOrOwner, audit('ADMIN_LIST_RESERVATIONS', 'reservation'), async (req: AuthenticatedRequest, res: Response) => {
  const limit = Math.min(parseInt(String(req.query.limit || '50'), 10), 200);
  const statusFilter = req.query.status as string | undefined;

  const reservations = await prisma.reservation.findMany({
    where: statusFilter ? { status: statusFilter } : {},
    include: {
      user: { select: { id: true, name: true, email: true } },
      cafe: { select: { id: true, name: true, address: true } },
      table: { select: { id: true, table_number: true, capacity: true } },
    },
    orderBy: { created_at: 'desc' },
    take: limit,
  });

  const mapped = reservations.map(r => ({
    id: r.id,
    confirmationCode: r.confirmation_code,
    date: r.date,
    time: r.time,
    partySize: r.party_size,
    durationMinutes: r.duration_minutes,
    status: r.status,
    specialRequests: r.special_requests,
    createdAt: r.created_at,
    user: r.user,
    cafe: r.cafe,
    table: r.table,
  }));

  return res.json({ success: true, data: mapped });
});

router.patch('/reservations/:id', requireAdminOrOwner, audit('ADMIN_UPDATE_RESERVATION', 'reservation'), async (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body as { status: string };
  await prisma.reservation.update({ where: { id: req.params.id }, data: { status } });
  return res.json({ success: true, message: 'Reservation updated' });
});

// ─────────────────────────────────────────────────────────────
// CAFE OWNERS
// ─────────────────────────────────────────────────────────────

router.get('/cafe-owners', requireAdmin, audit('ADMIN_LIST_CAFE_OWNERS', 'user'), async (_req: AuthenticatedRequest, res: Response) => {
  const owners = await prisma.user.findMany({
    where: { role: 'CAFE_OWNER' },
    select: {
      id: true, name: true, email: true, phone: true,
      is_active: true, auth_provider: true, created_at: true,
    },
    orderBy: { created_at: 'desc' },
  });

  const cafeCounts = await Promise.all(
    owners.map(o => prisma.cafe.count({ where: { email: o.email } }))
  );

  const statusFor = (owner: { is_active: number; auth_provider: string }) => {
    if (owner.auth_provider === 'owner_rejected') return 'REJECTED';
    if (owner.is_active === 1) return 'APPROVED';
    return 'PENDING_APPROVAL';
  };

  return res.json({
    success: true,
    data: owners.map((o, index) => ({
      ...o,
      isActive: o.is_active === 1,
      verificationStatus: statusFor(o),
      _count: { ownedCafes: cafeCounts[index] },
    })),
  });
});

router.post('/cafe-owners', requireAdmin, audit('ADMIN_CREATE_CAFE_OWNER', 'user'), async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password, phone } = req.body as { name: string; email: string; password: string; phone?: string };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password || uuidv4(), 12);
  const id = uuidv4();

  await prisma.user.create({
    data: { id, name, email, phone: phone || null, password_hash: passwordHash, role: 'CAFE_OWNER' },
  });

  return res.status(201).json({ success: true, data: { id } });
});

router.patch('/cafe-owners/:id', requireAdmin, audit('ADMIN_UPDATE_CAFE_OWNER', 'user'), async (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as any;
  const updateData: any = {};
  if (body.name) updateData.name = body.name;
  if (body.phone !== undefined) updateData.phone = body.phone;
  if (body.isActive !== undefined) updateData.is_active = body.isActive ? 1 : 0;

  await prisma.user.update({ where: { id: req.params.id }, data: updateData });
  return res.json({ success: true, message: 'Cafe owner updated' });
});

router.post('/cafe-owners/:id/approve', requireAdmin, audit('ADMIN_APPROVE_CAFE_OWNER', 'user'), async (req: AuthenticatedRequest, res: Response) => {
  const owner = await prisma.user.update({
    where: { id: req.params.id },
    data: { role: 'CAFE_OWNER', is_active: 1, auth_provider: 'password' },
    select: { email: true },
  });

  await prisma.cafe.updateMany({
    where: { email: owner.email },
    data: { is_active: 1 },
  });

  return res.json({ success: true, status: 'APPROVED', message: 'Cafe owner approved' });
});

router.post('/cafe-owners/:id/reject', requireAdmin, audit('ADMIN_REJECT_CAFE_OWNER', 'user'), async (req: AuthenticatedRequest, res: Response) => {
  const owner = await prisma.user.update({
    where: { id: req.params.id },
    data: { role: 'CAFE_OWNER', is_active: 0, auth_provider: 'owner_rejected' },
    select: { email: true },
  });

  await prisma.cafe.updateMany({
    where: { email: owner.email },
    data: { is_active: 0 },
  });

  return res.json({ success: true, status: 'REJECTED', message: 'Cafe owner rejected' });
});

router.delete('/cafe-owners/:id', requireAdmin, audit('ADMIN_DELETE_CAFE_OWNER', 'user'), async (req: AuthenticatedRequest, res: Response) => {
  // Downgrade to USER instead of deleting to preserve referential integrity
  await prisma.user.update({ where: { id: req.params.id }, data: { role: 'USER', is_active: 0 } });
  return res.json({ success: true, message: 'Cafe owner access revoked' });
});

// ─────────────────────────────────────────────────────────────
// MENU ITEMS (Admin CRUD)
// ─────────────────────────────────────────────────────────────

router.get('/menu/items', requireAdminOrOwner, async (req: AuthenticatedRequest, res: Response) => {
  const { cafeId, cafe_id, categoryId } = req.query as Record<string, string>;
  const where: any = {};
  if (cafeId || cafe_id) where.cafe_id = cafeId || cafe_id;
  if (categoryId) where.category_id = categoryId;

  const items = await prisma.menuItem.findMany({
    where,
    include: { category: { select: { name: true } }, cafe: { select: { name: true } } },
    orderBy: { created_at: 'desc' },
    take: 500,
  });

  return res.json({
    success: true,
    data: items.map(i => ({
      id: i.id,
      name: i.name,
      description: i.description,
      price: i.price,
      imageUrl: i.image_url,
      isAvailable: i.is_available === 1,
      isVeg: i.is_veg === 1,
      isPopular: i.is_popular === 1,
      stockQuantity: i.stock_quantity,
      prepTimeMinutes: i.prep_time_minutes,
      calories: i.calories,
      allergens: tryParse(i.allergens, []),
      cafeId: i.cafe_id,
      cafeName: i.cafe?.name,
      categoryId: i.category_id,
      categoryName: i.category?.name,
    })),
  });
});

router.post('/menu/items', requireAdminOrOwner, async (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as any;
  const item = await prisma.menuItem.create({
    data: {
      id: uuidv4(),
      cafe_id: body.cafeId || body.cafe_id,
      category_id: body.categoryId || body.category_id || null,
      name: body.name,
      description: body.description || null,
      price: parseFloat(String(body.price || 0)),
      image_url: body.imageUrl || null,
      is_available: body.isAvailable !== false ? 1 : 0,
      is_veg: body.isVeg ? 1 : 0,
      is_popular: body.isPopular ? 1 : 0,
      stock_quantity: parseInt(String(body.stockQuantity || 999), 10),
      prep_time_minutes: parseInt(String(body.prepTimeMinutes || 10), 10),
      calories: body.calories ? parseInt(String(body.calories), 10) : null,
    },
  });
  return res.status(201).json({ success: true, data: { id: item.id } });
});

router.patch('/menu/items/:id', requireAdminOrOwner, async (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as any;
  const updateData: any = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.price !== undefined) updateData.price = parseFloat(String(body.price));
  if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl;
  if (body.isAvailable !== undefined) updateData.is_available = body.isAvailable ? 1 : 0;
  if (body.isVeg !== undefined) updateData.is_veg = body.isVeg ? 1 : 0;
  if (body.isPopular !== undefined) updateData.is_popular = body.isPopular ? 1 : 0;
  if (body.stockQuantity !== undefined) updateData.stock_quantity = parseInt(String(body.stockQuantity), 10);
  if (body.prepTimeMinutes !== undefined) updateData.prep_time_minutes = parseInt(String(body.prepTimeMinutes), 10);
  if (body.calories !== undefined) updateData.calories = body.calories ? parseInt(String(body.calories), 10) : null;
  if (body.categoryId !== undefined) updateData.category_id = body.categoryId || null;

  await prisma.menuItem.update({ where: { id: req.params.id }, data: updateData });
  return res.json({ success: true, message: 'Menu item updated' });
});

router.delete('/menu/items/:id', requireAdminOrOwner, async (req: AuthenticatedRequest, res: Response) => {
  await prisma.menuItem.delete({ where: { id: req.params.id } });
  return res.json({ success: true, message: 'Menu item deleted' });
});

// Also expose public route alias for menu items (web api uses /menu/items)
router.get('/menu/categories', requireAdminOrOwner, async (req: AuthenticatedRequest, res: Response) => {
  const { cafeId, cafe_id } = req.query as Record<string, string>;
  const where: any = {};
  if (cafeId || cafe_id) where.cafe_id = cafeId || cafe_id;

  const categories = await prisma.menuCategory.findMany({ where, orderBy: { sort_order: 'asc' } });
  return res.json({ success: true, data: categories });
});

// ─────────────────────────────────────────────────────────────
// BANNERS
// ─────────────────────────────────────────────────────────────

function mapBanner(b: any) {
  return {
    id: b.id,
    sliderType: b.slider_type,
    tag: b.tag,
    tagIcon: b.tag_icon,
    tagColor: b.tag_color,
    tagBg: b.tag_bg,
    title: b.title,
    titleAccent: b.title_accent,
    subtitle: b.subtitle,
    subtitleColor: b.subtitle_color,
    ctaText: b.cta_text,
    ctaBg: b.cta_bg,
    ctaTextColor: b.cta_text_color,
    bgColor: b.bg_color,
    overlayColor: b.overlay_color,
    stripeColor: b.stripe_color,
    emoji: b.emoji,
    emojiLabel: b.emoji_label,
    emojiLabelColor: b.emoji_label_color,
    badge: b.badge,
    bgImage: b.bg_image,
    cafeId: b.cafe_id,
    isActive: b.is_active === 1,
    sortOrder: b.sort_order,
    createdAt: b.created_at,
  };
}

router.get('/banners', requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  const banners = await (prisma as any).banner.findMany({ orderBy: { sort_order: 'asc' } });
  return res.json({ success: true, data: banners.map(mapBanner) });
});

router.post('/banners', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as any;
  const banner = await (prisma as any).banner.create({
    data: {
      id: uuidv4(),
      slider_type: body.sliderType || 'PROMO',
      tag: body.tag || '',
      tag_icon: body.tagIcon || '⚡',
      tag_color: body.tagColor || '#FFFFFF',
      tag_bg: body.tagBg || 'rgba(255,107,0,0.2)',
      title: body.title || '',
      title_accent: body.titleAccent || '',
      subtitle: body.subtitle || '',
      subtitle_color: body.subtitleColor || '#FFBB88',
      cta_text: body.ctaText || 'Explore now',
      cta_bg: body.ctaBg || '#FFFFFF',
      cta_text_color: body.ctaTextColor || '#000000',
      bg_color: body.bgColor || '#3D2010',
      overlay_color: body.overlayColor || 'rgba(30,14,4,0.5)',
      stripe_color: body.stripeColor || 'rgba(255,107,0,0.1)',
      emoji: body.emoji || '☕',
      emoji_label: body.emojiLabel || 'FRESH BREW',
      emoji_label_color: body.emojiLabelColor || '#FFFFFF',
      badge: body.badge || '',
      bg_image: body.bgImage || '',
      cafe_id: body.cafeId || null,
      is_active: body.isActive !== false ? 1 : 0,
      sort_order: parseInt(String(body.sortOrder || 0), 10),
    },
  });
  return res.status(201).json({ success: true, data: mapBanner(banner) });
});

router.patch('/banners/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as any;
  const updateData: any = {};
  if (body.sliderType !== undefined) updateData.slider_type = body.sliderType;
  if (body.tag !== undefined) updateData.tag = body.tag;
  if (body.tagIcon !== undefined) updateData.tag_icon = body.tagIcon;
  if (body.tagColor !== undefined) updateData.tag_color = body.tagColor;
  if (body.tagBg !== undefined) updateData.tag_bg = body.tagBg;
  if (body.title !== undefined) updateData.title = body.title;
  if (body.titleAccent !== undefined) updateData.title_accent = body.titleAccent;
  if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
  if (body.subtitleColor !== undefined) updateData.subtitle_color = body.subtitleColor;
  if (body.ctaText !== undefined) updateData.cta_text = body.ctaText;
  if (body.ctaBg !== undefined) updateData.cta_bg = body.ctaBg;
  if (body.ctaTextColor !== undefined) updateData.cta_text_color = body.ctaTextColor;
  if (body.bgColor !== undefined) updateData.bg_color = body.bgColor;
  if (body.overlayColor !== undefined) updateData.overlay_color = body.overlayColor;
  if (body.stripeColor !== undefined) updateData.stripe_color = body.stripeColor;
  if (body.emoji !== undefined) updateData.emoji = body.emoji;
  if (body.emojiLabel !== undefined) updateData.emoji_label = body.emojiLabel;
  if (body.emojiLabelColor !== undefined) updateData.emoji_label_color = body.emojiLabelColor;
  if (body.badge !== undefined) updateData.badge = body.badge;
  if (body.bgImage !== undefined) updateData.bg_image = body.bgImage;
  if (body.cafeId !== undefined) updateData.cafe_id = body.cafeId || null;
  if (body.isActive !== undefined) updateData.is_active = body.isActive ? 1 : 0;
  if (body.sortOrder !== undefined) updateData.sort_order = parseInt(String(body.sortOrder), 10);

  const banner = await (prisma as any).banner.update({
    where: { id: req.params.id },
    data: updateData,
  });
  return res.json({ success: true, data: mapBanner(banner) });
});

router.delete('/banners/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  await (prisma as any).banner.delete({ where: { id: req.params.id } });
  return res.json({ success: true, message: 'Banner deleted' });
});

// ─────────────────────────────────────────────────────────────
// REWARDS (Admin CRUD)
// ─────────────────────────────────────────────────────────────

router.get('/rewards', requireAdminOrOwner, async (_req: AuthenticatedRequest, res: Response) => {
  const rewards = await prisma.reward.findMany({ orderBy: { created_at: 'desc' } });
  const mapped = rewards.map(r => ({
    ...r,
    approvalStatus: r.stock === -2 ? 'REJECTED' : r.is_active === 1 ? 'ACTIVE' : 'PENDING_APPROVAL',
  }));
  return res.json({ success: true, data: mapped });
});

router.post('/rewards', requireAdminOrOwner, async (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as any;
  const reward = await prisma.reward.create({
    data: {
      id: uuidv4(),
      name: body.name,
      icon: body.icon || '🎁',
      category: body.category || 'Food & Drink',
      description: body.description || null,
      points_cost: parseInt(String(body.pointsCost || body.points_cost || 100), 10),
      tier_required: body.tierRequired || body.tier_required || 'SILVER',
      stock: parseInt(String(body.stock || -1), 10),
      is_active: req.user?.role === 'CAFE_OWNER' ? 0 : body.isActive !== false ? 1 : 0,
    },
  });
  return res.status(201).json({
    success: true,
    status: req.user?.role === 'CAFE_OWNER' ? 'PENDING_APPROVAL' : 'ACTIVE',
    data: { id: reward.id },
  });
});

router.patch('/rewards/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as any;
  const updateData: any = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.icon !== undefined) updateData.icon = body.icon;
  if (body.category !== undefined) updateData.category = body.category;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.pointsCost !== undefined) updateData.points_cost = parseInt(String(body.pointsCost), 10);
  if (body.tierRequired !== undefined) updateData.tier_required = body.tierRequired;
  if (body.stock !== undefined) updateData.stock = parseInt(String(body.stock), 10);
  if (body.isActive !== undefined) updateData.is_active = body.isActive ? 1 : 0;

  await prisma.reward.update({ where: { id: req.params.id }, data: updateData });
  return res.json({ success: true, message: 'Reward updated' });
});

router.post('/rewards/:id/approve', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  await prisma.reward.update({
    where: { id: req.params.id },
    data: { is_active: 1, stock: -1 },
  });
  return res.json({ success: true, status: 'ACTIVE', message: 'Reward approved' });
});

router.post('/rewards/:id/reject', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  await prisma.reward.update({
    where: { id: req.params.id },
    data: { is_active: 0, stock: -2 },
  });
  return res.json({ success: true, status: 'REJECTED', message: 'Reward rejected' });
});

router.delete('/rewards/:id', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  await prisma.reward.update({ where: { id: req.params.id }, data: { is_active: 0 } });
  return res.json({ success: true, message: 'Reward deactivated' });
});

router.get('/rewards/redemptions', requireAdminOrOwner, async (_req: AuthenticatedRequest, res: Response) => {
  const redemptions = await prisma.redeemedReward.findMany({
    include: {
      user: { select: { name: true, email: true } },
      reward: { select: { name: true, icon: true } },
    },
    orderBy: { created_at: 'desc' },
    take: 100,
  });
  return res.json({ success: true, data: redemptions });
});

export default router;
