import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.ADMIN_PASSWORD ||= 'test-admin-password';
process.env.DEMO_USER_PASSWORD ||= 'test-demo-password';
process.env.TAILOR_PASSWORD ||= 'test-tailor-password';

let app;
let server;
let baseUrl;
let sessionCookie = '';

function responseCookies(response) {
  const values = typeof response.headers.getSetCookie === 'function'
    ? response.headers.getSetCookie()
    : [response.headers.get('set-cookie')].filter(Boolean);
  return values.map((value) => value.split(';', 1)[0]);
}

function cookieValue(cookies, name) {
  const cookie = cookies.find((value) => value.startsWith(`${name}=`));
  return cookie ? cookie.slice(name.length + 1) : '';
}

async function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
}

async function loginDemo() {
  const response = await request('/api/auth/demo', { method: 'POST' });
  assert.equal(response.status, 200);
  const cookies = responseCookies(response);
  sessionCookie = cookieValue(cookies, 'yk_session');
  assert.ok(sessionCookie, 'Demo login should set a session cookie');
  return response.json();
}

before(async () => {
  ({ app } = await import('../server.ts'));
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (server?.listening) {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test('security headers are present on API responses', async () => {
  const response = await request('/api/csrf-token');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-security-policy') || '', /default-src 'self'/);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
});

test('public products endpoint returns a products array', async () => {
  const response = await request('/api/products');
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(Array.isArray(body.products));
});

test('session endpoint rejects unauthenticated requests', async () => {
  const response = await request('/api/auth/session');
  assert.equal(response.status, 401);
  assert.equal((await response.json()).user, null);
});

test('login validates payload shape before checking credentials', async () => {
  const response = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'not-an-email', password: '' }),
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /Invalid login payload/);
});

test('login rejects invalid credentials without creating a session', async () => {
  const response = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'nobody@example.invalid', password: 'wrong-password' }),
  });
  assert.equal(response.status, 401);
  assert.equal(response.headers.get('set-cookie') || '', '');
});

test('protected orders endpoint rejects unauthenticated requests', async () => {
  const response = await request('/api/orders');
  assert.equal(response.status, 401);
});

test('staff-only sales analytics reject unauthenticated requests', async () => {
  const response = await request('/api/analytics/sales');
  assert.equal(response.status, 401);
});

test('demo login creates a session usable by the session and orders endpoints', async () => {
  const login = await loginDemo();
  assert.ok(login.user);
  assert.ok(login.expiresAt);

  const session = await request('/api/auth/session', {
    headers: { cookie: `yk_session=${sessionCookie}` },
  });
  assert.equal(session.status, 200);
  assert.equal((await session.json()).user.id, login.user.id);

  const orders = await request('/api/orders', {
    headers: { cookie: `yk_session=${sessionCookie}` },
  });
  assert.equal(orders.status, 200);
  assert.ok(Array.isArray((await orders.json()).orders));
});

test('state-changing requests require a valid CSRF token', async () => {
  const tokenResponse = await request('/api/csrf-token');
  const tokenCookies = responseCookies(tokenResponse);
  const csrfToken = (await tokenResponse.json()).csrfToken;
  const csrfCookie = cookieValue(tokenCookies, 'yk_csrf');
  assert.ok(csrfToken);
  assert.ok(csrfCookie);

  const response = await request('/api/auth/logout', {
    method: 'POST',
    headers: {
      cookie: `yk_session=${sessionCookie}; yk_csrf=${csrfCookie}`,
      'x-csrf-token': 'incorrect-token',
    },
  });
  assert.equal(response.status, 403);
  assert.match((await response.json()).error, /CSRF token missing or invalid/);
});

test('logout clears the session and subsequent session lookup is unauthorized', async () => {
  if (!sessionCookie) await loginDemo();

  const tokenResponse = await request('/api/csrf-token');
  const tokenCookies = responseCookies(tokenResponse);
  const csrfToken = (await tokenResponse.json()).csrfToken;
  const csrfCookie = cookieValue(tokenCookies, 'yk_csrf');

  const logout = await request('/api/auth/logout', {
    method: 'POST',
    headers: {
      cookie: `yk_session=${sessionCookie}; yk_csrf=${csrfCookie}`,
      'x-csrf-token': csrfToken,
    },
  });
  assert.equal(logout.status, 204);

  const session = await request('/api/auth/session', {
    headers: { cookie: `yk_session=${sessionCookie}` },
  });
  assert.equal(session.status, 401);
  sessionCookie = '';
});
