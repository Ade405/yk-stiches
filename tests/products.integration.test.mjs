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

function responseCookies(response) {
  const values =
    typeof response.headers.getSetCookie === 'function'
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

async function loginAdmin() {
  const response = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@yk.com',
      password: process.env.ADMIN_PASSWORD,
      role: 'user',
    }),
  });
  assert.equal(
    response.status,
    200,
    'Admin login should succeed in test environment',
  );
  sessionCookie = cookieValue(responseCookies(response), 'yk_session');
  assert.ok(sessionCookie, 'Admin login should set a session cookie');
}

async function refreshCsrf() {
  const response = await request('/api/csrf-token');
  assert.equal(response.status, 200);
  csrfCookie = cookieValue(responseCookies(response), 'yk_csrf');
  csrfToken = (await response.json()).csrfToken;
  assert.ok(csrfCookie);
  assert.ok(csrfToken);
}

function adminHeaders() {
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
  await loginAdmin();
  await refreshCsrf();
});

after(async () => {
  if (server?.listening) {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

test('health endpoint reports the service is available', async () => {
  const response = await request('/healthz');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('product creation, update, and deletion are restricted to staff', async () => {
  const unauthorized = await request('/api/products', {
    method: 'POST',
    body: JSON.stringify({ name: 'Unauthorized product', price: 10 }),
  });
  assert.equal(unauthorized.status, 401);

  const create = await request('/api/products', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({
      id: 'integration-product-crud',
      name: 'Integration Test Tunic',
      title: 'Integration Test Tunic',
      category: 'Test',
      price: 125,
      description: 'Temporary product created by integration tests',
    }),
  });
  assert.equal(create.status, 201);
  const created = (await create.json()).product;
  assert.equal(created.id, 'integration-product-crud');
  assert.equal(created.price, 125);

  const update = await request('/api/products/integration-product-crud', {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({
      price: 150,
      description: 'Updated integration test product',
    }),
  });
  assert.equal(update.status, 200);
  const updated = (await update.json()).product;
  assert.equal(updated.price, 150);
  assert.equal(updated.description, 'Updated integration test product');

  const remove = await request('/api/products/integration-product-crud', {
    method: 'DELETE',
    headers: adminHeaders(),
  });
  assert.equal(remove.status, 200);
  assert.equal((await remove.json()).product.id, 'integration-product-crud');

  const missing = await request('/api/products/integration-product-crud', {
    method: 'DELETE',
    headers: adminHeaders(),
  });
  assert.equal(missing.status, 404);
});
