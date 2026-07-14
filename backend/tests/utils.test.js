const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { generateAccessToken, verifyAccessToken, generateAuthTokens } = require('../utils/tokenUtils');

describe('ApiError', () => {
  test('badRequest() sets statusCode 400', () => {
    const err = ApiError.badRequest('Invalid input');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Invalid input');
    expect(err.isOperational).toBe(true);
  });

  test('notFound() sets statusCode 404', () => {
    const err = ApiError.notFound();
    expect(err.statusCode).toBe(404);
  });

  test('unauthorized() sets statusCode 401', () => {
    const err = ApiError.unauthorized();
    expect(err.statusCode).toBe(401);
  });
});

describe('ApiResponse', () => {
  test('marks success=true for statusCode < 400', () => {
    const res = new ApiResponse(200, { foo: 'bar' }, 'OK');
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ foo: 'bar' });
  });

  test('marks success=false for statusCode >= 400', () => {
    const res = new ApiResponse(400, null, 'Bad');
    expect(res.success).toBe(false);
  });
});

describe('tokenUtils', () => {
  test('generateAccessToken produces a verifiable JWT', () => {
    const token = generateAccessToken({ id: 1, role: 'farmer' });
    const decoded = verifyAccessToken(token);
    expect(decoded.id).toBe(1);
    expect(decoded.role).toBe('farmer');
  });

  test('generateAuthTokens returns both access and refresh tokens', () => {
    const tokens = generateAuthTokens({ id: 5, uuid: 'abc', role: 'admin', email: 'a@b.com' });
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
    const decoded = verifyAccessToken(tokens.accessToken);
    expect(decoded.id).toBe(5);
    expect(decoded.role).toBe('admin');
  });
});
