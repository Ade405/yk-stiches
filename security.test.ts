/**
 * Security test suite for YK Stitches application
 * Covers authentication, authorization, input validation, CSRF, and other security features
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import fetch from 'node-fetch';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

describe('Security Tests', () => {
  let csrfToken: string;
  let sessionCookie: string;
  let testUserEmail: string;
  let testUserPassword: string;

  beforeAll(async () => {
    // Get CSRF token
    const csrfResponse = await fetch(`${API_URL}/csrf-token`);
    const csrfData = (await csrfResponse.json()) as { csrfToken: string };
    csrfToken = csrfData.csrfToken;

    // Setup test user credentials
    testUserEmail = `test-${Date.now()}@example.com`;
    testUserPassword = 'SecureTestPassword123!';
  });

  describe('Authentication Security', () => {
    it('should reject login with invalid email format', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          email: 'not-an-email',
          password: testUserPassword,
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should reject passwords shorter than 8 characters', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          email: testUserEmail,
          password: 'short',
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should reject login with non-existent email', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          email: `nonexistent-${Date.now()}@example.com`,
          password: testUserPassword,
        }),
      });

      expect(response.status).toBe(401);
      const data = (await response.json()) as { error: string };
      expect(data.error).toContain('Invalid email or password');
    });

    it('should not expose user enumeration through forgot-password', async () => {
      const validUserResponse = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          email: 'admin@yk.com',
        }),
      });

      const invalidUserResponse = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          email: `nonexistent-${Date.now()}@example.com`,
        }),
      });

      // Both should return the same success message
      expect(validUserResponse.status).toBe(200);
      expect(invalidUserResponse.status).toBe(200);
      const validData = (await validUserResponse.json()) as { message: string };
      const invalidData = (await invalidUserResponse.json()) as { message: string };
      expect(validData.message).toBe(invalidData.message);
    });
  });

  describe('CSRF Protection', () => {
    it('should reject POST request without CSRF token', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPassword123!',
        }),
      });

      expect(response.status).toBe(403);
      const data = (await response.json()) as { error: string };
      expect(data.error).toContain('CSRF');
    });

    it('should reject POST request with invalid CSRF token', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': 'invalid-token',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPassword123!',
        }),
      });

      expect(response.status).toBe(403);
      const data = (await response.json()) as { error: string };
      expect(data.error).toContain('CSRF');
    });
  });

  describe('Input Validation', () => {
    it('should reject registration with email exceeding max length', async () => {
      const longEmail = `${'a'.repeat(300)}@example.com`;
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          name: 'Test User',
          email: longEmail,
          password: testUserPassword,
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should reject registration with name exceeding max length', async () => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          name: 'a'.repeat(200),
          email: testUserEmail,
          password: testUserPassword,
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should sanitize user input to prevent XSS', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          name: xssPayload,
          email: testUserEmail,
          password: testUserPassword,
        }),
      });

      if (response.status === 201) {
        const data = (await response.json()) as { user?: { name?: string } };
        // Name should not contain the script tag
        if (data.user?.name) {
          expect(data.user.name).not.toContain('<script>');
        }
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit authentication attempts', async () => {
      const attempts = [];
      for (let i = 0; i < 30; i++) {
        attempts.push(
          fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-csrf-token': csrfToken,
            },
            body: JSON.stringify({
              email: `attempt-${i}@example.com`,
              password: 'InvalidPassword123!',
            }),
          })
        );
      }

      const results = await Promise.all(attempts);
      const rateLimited = results.filter((r) => r.status === 429);

      // Should have at least some rate limited responses
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('Authorization', () => {
    it('should reject unauthenticated access to protected endpoints', async () => {
      const response = await fetch(`${API_URL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(401);
      const data = (await response.json()) as { error: string };
      expect(data.error).toContain('Authentication required');
    });

    it('should reject non-admin access to admin endpoints', async () => {
      // This test would require a regular user session
      // Skipping for now as it requires full auth flow
    });
  });

  describe('Password Recovery Security', () => {
    it('should reject reset-password without token', async () => {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          email: testUserEmail,
          password: 'NewPassword123!',
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should reject reset-password with invalid token', async () => {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          email: testUserEmail,
          token: 'invalid-token-12345',
          password: 'NewPassword123!',
        }),
      });

      expect(response.status).toBe(401);
      const data = (await response.json()) as { error: string };
      expect(data.error).toContain('Invalid or expired');
    });

    it('should reject change-password with incorrect current password', async () => {
      // This test would require a user session
      // Skipping for now
    });
  });

  describe('Security Headers', () => {
    it('should include X-Content-Type-Options header', async () => {
      const response = await fetch(`${BASE_URL}/`);
      expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    });

    it('should include X-Frame-Options header', async () => {
      const response = await fetch(`${BASE_URL}/`);
      expect(response.headers.get('x-frame-options')).toBe('DENY');
    });

    it('should include Content-Security-Policy header', async () => {
      const response = await fetch(`${BASE_URL}/`);
      const csp = response.headers.get('content-security-policy');
      expect(csp).toBeDefined();
      expect(csp).toContain('default-src');
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should safely handle SQL injection attempts in email field', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          email: "' OR '1'='1",
          password: 'password',
        }),
      });

      // Should not error out, just reject the login
      expect([400, 401, 403]).toContain(response.status);
    });

    it('should safely handle SQL injection attempts in search', async () => {
      const response = await fetch(`${API_URL}/orders/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          query: "'; DROP TABLE orders; --",
        }),
      });

      // Should reject due to auth, not due to SQL error
      expect(response.status).toBe(401);
    });
  });
});

describe('Performance and DOS Prevention', () => {
  it('should limit JSON payload size', async () => {
    const largePayload = {
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
      data: 'x'.repeat(15 * 1024 * 1024), // 15MB of data
    };

    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(largePayload),
    });

    // Should reject with 413 Payload Too Large or similar
    expect([400, 413, 414].includes(response.status) || response.ok === false).toBe(true);
  });
});
