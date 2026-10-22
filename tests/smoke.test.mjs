import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

async function getFreePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : null;
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  assert.ok(port, 'An available local port should be assigned');
  return port;
}

test('development server starts and serves the storefront', async (t) => {
  const port = await getFreePort();
  const child = spawn(
    process.execPath,
    ['node_modules/tsx/dist/cli.mjs', 'server.ts'],
    {
      env: {
        ...process.env,
        PORT: String(port),
        NODE_ENV: 'development',
        ADMIN_PASSWORD: 'test-admin-password',
        DEMO_USER_PASSWORD: 'test-demo-password',
        TAILOR_PASSWORD: 'test-tailor-password',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk.toString(); });
  child.stderr.on('data', (chunk) => { output += chunk.toString(); });

  t.after(() => {
    if (child.exitCode === null && !child.killed) child.kill('SIGTERM');
  });

  const deadline = Date.now() + 20_000;
  let response;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      assert.fail(`Development server exited early. Output:\n${output}`);
    }
    try {
      response = await fetch(`http://127.0.0.1:${port}/`);
      if (response.ok) break;
    } catch {
      // The server may still be starting; retry until the deadline.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  assert.ok(response, `Server did not respond before timeout. Output:\n${output}`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /text\/html/i);
  const html = await response.text();
  assert.match(html, /<html|<!doctype html/i);
});
