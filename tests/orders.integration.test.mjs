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
let csrfCookie = '';
let csrfToken = '';
let demoEmail = '';\nlet demoRole = '';

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
  sessionCookie = cookieValue(responseCookies(response), 'yk_session');
  assert.ok(sessionCookie, 'Demo login should set a session cookie');
  return response.json();
}

async function refreshCsrf() {
  const response = await request('/api/csrf-token');
  assert.equal(response.status, 200);
  const cookies = responseCookies(response);
  csrfCookie = cookieValue(cookies, 'yk_csrf');
  csrfToken = (await response.json()).csrfToken;
  assert.ok(csrfCookie, 'CSRF endpoint should set a CSRF cookie');
  assert.ok(csrfToken, 'CSRF endpoint should return a CSRF token');
}

function authenticatedHeaders() {
  return {
    cookie: `yk_session=${sessionCookie}; yk_csrf=${csrfCookie}`,
    'x-csrf-token': csrfToken,
  };
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
  await loginDemo();
  await refreshCsrf();
});

after(async () => {
  if (server?.listening) {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test('creating an order returns a complete order record', async () => {
  const response = await request('/api/orders', {
    method: 'POST',
    headers: authenticatedHeaders(),
    body: JSON.stringify({
      items: [{ id: 'integration-item', title: 'Test kaftan', quantity: 1, price: 125 }],
      orderType: 'ready-to-wear',
      totalAmount: 125,
      currency: 'NGN',
      deliveryAddress: 'Test address, Lagos',
      deliveryCity: 'Lagos',
      specialInstructions: 'Integration test order',
    }),
  });

  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.ok(body.order.id);
  assert.match(body.order.orderNumber, /^YKS-2026-\d{4}$/);
  assert.equal(body.order.totalAmount, 125);
  assert.equal(body.order.customerEmail, body.order.customerEmail.toLowerCase());
  assert.equal(body.order.items[0].title, 'Test kaftan');
  assert.equal(body.order.currentStageIndex, 0);
  assert.equal(body.order.milestones.length, 5);
  assert.equal(body.order.milestones[0].completed, true);
  assert.equal(body.order.milestones[1].active, true);
});

test('customers can only see their own orders', async () => {
  const response = await request('/api/orders', {
    headers: { cookie: `yk_session=${sessionCookie}` },
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(Array.isArray(body.orders));
  if (demoRole !== 'admin') {\n    assert.ok(body.orders.every((order) => order.customerEmail.toLowerCase() === demoEmail));\n  }
});

test('customer sessions cannot advance workshop milestones', async () => {
  const response = await request('/api/orders/ord_yk_9824/advance', {
    method: 'POST',
    headers: authenticatedHeaders(),
    body: JSON.stringify({}),
  });
  assert.equal(response.status, 403);
});

test('order creation rejects a missing CSRF token', async () => {
  const response = await request('/api/orders', {
    method: 'POST',
    headers: { cookie: `yk_session=${sessionCookie}` },
    body: JSON.stringify({ items: [], totalAmount: 1 }),
  });
  assert.equal(response.status, 403);
  assert.match((await response.json()).error, /CSRF token missing or invalid/);
});
