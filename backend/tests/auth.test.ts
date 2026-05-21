import request from 'supertest';
import { initDb, prisma } from '../src/db';
import { createApp } from '../src/app';

const app = createApp();

beforeAll(async () => {
  await initDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Auth API', () => {
  const email = `jest-${Date.now()}@example.com`;
  const password = 'CorrectHorseBatteryStaple99!';
  const name = 'Jest User';

  it('POST /api/v1/auth/register creates a user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ name, email, password });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.token).toBe(res.body.data.accessToken);
    expect(res.body.user._id).toBe(res.body.data.user.id);
  });

  it('POST /api/v1/auth/login returns tokens', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('GET /api/v1/auth/me returns profile with Bearer token', async () => {
    const login = await request(app).post('/api/v1/auth/login').send({ email, password });
    const token = login.body.data.accessToken;
    const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(email);
  });
});
