const request = require('supertest');
const app = require('../app');

describe('GET /api/health', () => {
  test('returns 200 and success:true', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('POST /api/auth/register - validation', () => {
  test('rejects missing required fields with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  test('rejects invalid email format', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Test Farmer', email: 'not-an-email', password: 'Password123', role: 'farmer',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'email')).toBe(true);
  });

  test('rejects short password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Test Farmer', email: 'test@example.com', password: '123', role: 'farmer',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'password')).toBe(true);
  });
});

describe('POST /api/auth/login - validation', () => {
  test('rejects missing credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
  });
});

describe('Protected routes without token', () => {
  test('GET /api/farms returns 401 without Authorization header', async () => {
    const res = await request(app).get('/api/farms');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/dashboard/overview returns 401 without Authorization header', async () => {
    const res = await request(app).get('/api/dashboard/overview');
    expect(res.statusCode).toBe(401);
  });
});

describe('404 handler', () => {
  test('unknown route returns 404 with route info', async () => {
    const res = await request(app).get('/api/this-route-does-not-exist');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
