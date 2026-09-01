import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: UserRecord;
    }
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.disable('x-powered-by');
app.set('trust proxy', 1);

const isProduction = process.env.NODE_ENV === 'production';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const SESSION_COOKIE = 'yk_session';
const CSRF_COOKIE = 'yk_csrf';
const adminPassword = process.env.ADMIN_PASSWORD || (isProduction ? '' : 'admin123');
const demoUserPassword = process.env.DEMO_USER_PASSWORD || (isProduction ? '' : 'demo1234');
const tailorPassword = process.env.TAILOR_PASSWORD || (isProduction ? '' : 'tailor123');

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 25 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please wait 15 minutes and try again.' },
});

const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down and try again.' },
});

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(256),
  role: z.enum(['user', 'tailor']).optional(),
});

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(256),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  address: z.string().trim().max(200).optional().or(z.literal('')),
  city: z.string().trim().max(80).optional().or(z.literal('')),
  country: z.string().trim().max(80).optional().or(z.literal('')),
});

const searchSchema = z.object({
  query: z.string().trim().min(1).max(100).optional(),
  orderNumber: z.string().trim().min(1).max(100).optional(),
});

if (isProduction && (!adminPassword || !demoUserPassword || !tailorPassword)) {
  throw new Error('ADMIN_PASSWORD, DEMO_USER_PASSWORD, and TAILOR_PASSWORD are required in production');
}

// Keep security policy strict for deployed assets while allowing Vite's dev client locally.
app.use((req, res, next) => {
  if (isProduction && req.headers['x-forwarded-proto'] === 'http') {
    return res.redirect(308, `https://${req.get('host')}${req.originalUrl}`);
  }

  const cspDirectives = isProduction
    ? [
        "default-src 'self'",
        "base-uri 'self'",
        "connect-src 'self' https://generativelanguage.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "img-src 'self' data: blob: https://images.unsplash.com",
        "object-src 'none'",
        "script-src 'self'",
        "style-src 'self' https://fonts.googleapis.com",
        "upgrade-insecure-requests",
      ]
    : [
        "default-src 'self'",
        "base-uri 'self'",
        "connect-src 'self' ws://localhost:* wss://localhost:* ws://127.0.0.1:* wss://127.0.0.1:* http://localhost:3000 https://generativelanguage.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "img-src 'self' data: blob: https://images.unsplash.com",
        "object-src 'none'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      ];
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
});

app.post(['/api/auth/login', '/api/auth/demo', '/api/auth/register'], authRateLimiter);
app.use('/api', apiRateLimiter);
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  const origin = req.get('Origin');
  const referer = req.get('Referer');
  const expectedOrigin = `${req.protocol}://${req.get('host')}`;
  const sameOrigin = !origin || origin === expectedOrigin || origin === 'http://localhost:3000' || origin === 'http://127.0.0.1:3000';
  const trustedReferer = !referer || referer.startsWith(expectedOrigin) || referer.startsWith('http://localhost:3000/') || referer.startsWith('http://127.0.0.1:3000/');
  const providedToken = typeof req.headers['x-csrf-token'] === 'string' ? req.headers['x-csrf-token'] : '';
  const cookieToken = parseCookies(req)[CSRF_COOKIE];

  if (!sameOrigin && !trustedReferer) {
    return res.status(403).json({ error: 'Cross-site request blocked' });
  }

  if (!providedToken || !cookieToken || providedToken !== cookieToken) {
    return res.status(403).json({ error: 'CSRF token missing or invalid' });
  }

  return next();
});

function sanitizeUserText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Initial seed products for atelier inventory
import { PRODUCTS_CATALOG } from './src/data/catalog.js';
import { MASTER_TAILORS } from './src/data/tailors.js';

let productsDatabase = [...PRODUCTS_CATALOG];

// User CRM & Directory Database
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'vip';
  avatar?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  joinedDate: string;
  totalSpent: number;
  ordersCount: number;
  measurementsCount: number;
  vipTier: 'Aristocrat' | 'Executive' | 'Patron' | 'Master' | 'Artisan Tailor';
  tailorNotes?: string;
  savedMeasurements?: Record<string, any>;
}

const initialUsers: UserRecord[] = [
  {
    id: 'usr_adeyinka_1',
    name: 'Adeyinka Adebowale',
    email: 'adeyinka@example.com',
    phone: '+234 803 456 7890',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    address: 'Plot 14, Victoria Island High Street, Suite 402',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    postalCode: '101241',
    joinedDate: '2025-11-12T10:00:00.000Z',
    totalSpent: 1240,
    ordersCount: 3,
    measurementsCount: 2,
    vipTier: 'Aristocrat',
    tailorNotes: 'Prefers extra 1.5 inch sleeve ease for ceremonial suit drape. Gold thread embroidery enthusiast.',
    savedMeasurements: {
      chest: '42 in',
      shoulders: '19.5 in',
      Length: '58 in',
      neck: '16.5 in',
      trouserLength: '41 in',
      waist: '34 in',
    },
  },
  {
    id: 'usr_chiamaka_2',
    name: 'Chiamaka Okafor',
    email: 'chiamaka@luxury.io',
    phone: '+234 809 111 2233',
    role: 'vip',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    address: 'Penthouse 4B, Eko Atlantic Ocean View Residences',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    postalCode: '101241',
    joinedDate: '2026-01-05T14:30:00.000Z',
    totalSpent: 1850,
    ordersCount: 4,
    measurementsCount: 1,
    vipTier: 'Master',
    tailorNotes: 'Gown length custom cut for 4-inch Christian Louboutin heels. Prefers pure Italian velvet.',
    savedMeasurements: {
      bust: '36 in',
      waist: '27 in',
      hips: '40 in',
      gownLength: '62 in',
      shoulderToWaist: '15.5 in',
    },
  },
  {
    id: 'usr_kofi_3',
    name: 'Kofi Mensah',
    email: 'kofi.mensah@accra-capital.com',
    phone: '+233 24 555 8901',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    address: 'No. 8 Airport Residential Area, Cantonments',
    city: 'Accra',
    state: 'Greater Accra',
    country: 'Ghana',
    postalCode: 'GA-112',
    joinedDate: '2026-02-18T09:15:00.000Z',
    totalSpent: 560,
    ordersCount: 1,
    measurementsCount: 1,
    vipTier: 'Executive',
    tailorNotes: 'Slim European fit for Senator Suits. Likes hidden plackets and mother-of-pearl buttons.',
    savedMeasurements: {
      chest: '40 in',
      shoulders: '18 in',
      sleeve: '34 in',
      waist: '32 in',
      inseam: '32 in',
    },
  },
  {
    id: 'usr_admin_master',
    name: 'Master Tailor Adeyinka (Admin)',
    email: 'admin@yk.com',
    phone: '+234 812 000 7801',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    address: 'YK Stitches Atelier Flagship, 14 Victoria Island',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    postalCode: '101241',
    joinedDate: '2024-01-01T00:00:00.000Z',
    totalSpent: 0,
    ordersCount: 0,
    measurementsCount: 0,
    vipTier: 'Master',
    tailorNotes: 'Lead master cutter & founder. Full administrative access to inventory, pricing, client CRM, and artisan workshop routing.',
  }
];

let usersDatabase: UserRecord[] = [...initialUsers];

type AuthenticatedUser = UserRecord;
interface SessionRecord {
  userId: string;
  expiresAt: number;
}

const sessions = new Map<string, SessionRecord>();
const passwordRecords = new Map<string, { salt: string; hash: string }>();
const legacyAdminPasswordRecords = ['admin', 'yk2026'].map((password) => hashPassword(password));
const legacyTailorPasswordRecords = ['tailor', 'admin123', 'yk2026'].map((password) => hashPassword(password));

function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
  return {
    salt,
    hash: crypto.scryptSync(password, salt, 64).toString('hex'),
  };
}

function setPassword(email: string, password: string) {
  passwordRecords.set(email.toLowerCase(), hashPassword(password));
}

function verifyPassword(email: string, password: string) {
  const record = passwordRecords.get(email.toLowerCase());
  if (!record || !password) return false;
  const matches = (candidateRecord: { salt: string; hash: string }) => {
    const candidate = crypto.scryptSync(password, candidateRecord.salt, 64);
    const expected = Buffer.from(candidateRecord.hash, 'hex');
    return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
  };
  return matches(record) ||
    ((email.toLowerCase() === 'admin@yk.com' || email.toLowerCase() === 'admin@ykstitches.com') &&
      legacyAdminPasswordRecords.some(matches));
}

// Demo accounts retain their original credentials, but are validated on the server.
setPassword('adeyinka@example.com', demoUserPassword);
setPassword('admin@yk.com', adminPassword);
setPassword('admin@ykstitches.com', adminPassword);

for (const tailor of MASTER_TAILORS) {
  const email = `${tailor.id.replace('tailor_', 'tailor.')}@yk.com`;
  const id = `usr_${tailor.id}`;
  if (!usersDatabase.some((user) => user.id === id)) {
    usersDatabase.push({
      id,
      name: tailor.name,
      email,
      phone: tailor.phone,
      role: 'admin',
      avatar: tailor.avatar,
      address: 'YK Stitches Atelier Cutting Workshop',
      city: 'Lagos',
      country: 'Nigeria',
      joinedDate: '2024-01-01T00:00:00.000Z',
      totalSpent: 0,
      ordersCount: 0,
      measurementsCount: tailor.completedGarments,
      vipTier: 'Artisan Tailor',
      tailorNotes: `${tailor.title} · Specialty: ${tailor.specialty}`,
    });
  }
  setPassword(email, tailorPassword);
}

function publicUser(user: UserRecord): UserRecord {
  return { ...user };
}

function parseCookies(req: express.Request): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};
  return header.split(';').reduce<Record<string, string>>((cookies, item) => {
    const separator = item.indexOf('=');
    if (separator === -1) return cookies;
    const key = item.slice(0, separator).trim();
    try {
      cookies[key] = decodeURIComponent(item.slice(separator + 1).trim());
    } catch {
      cookies[key] = '';
    }
    return cookies;
  }, {});
}

function getAuthenticatedUser(req: express.Request): AuthenticatedUser | null {
  const sessionId = parseCookies(req)[SESSION_COOKIE];
  if (!sessionId) return null;
  const session = sessions.get(sessionId);
  if (!session || session.expiresAt <= Date.now()) {
    if (session) sessions.delete(sessionId);
    return null;
  }
  const user = usersDatabase.find((candidate) => candidate.id === session.userId);
  if (!user) {
    sessions.delete(sessionId);
    return null;
  }
  return user;
}

function setSessionCookie(req: express.Request, res: express.Response, sessionId: string) {
  const secure = isProduction || req.secure;
  const attributes = [
    `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}`,
    'Path=/',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (secure) attributes.push('Secure');
  res.setHeader('Set-Cookie', attributes.join('; '));
}

function clearSessionCookie(req: express.Request, res: express.Response) {
  const secure = isProduction || req.secure;
  const attributes = [`${SESSION_COOKIE}=`, 'Path=/', 'Max-Age=0', 'HttpOnly', 'SameSite=Lax'];
  if (secure) attributes.push('Secure');
  res.setHeader('Set-Cookie', attributes.join('; '));
}

function setCsrfCookie(req: express.Request, res: express.Response, csrfToken: string) {
  const secure = isProduction || req.secure;
  const attributes = [
    `${CSRF_COOKIE}=${encodeURIComponent(csrfToken)}`,
    'Path=/',
    'Max-Age=3600',
    'SameSite=Lax',
  ];
  if (secure) attributes.push('Secure');
  res.setHeader('Set-Cookie', attributes.join('; '));
}

function verifyAgainstRecords(password: string, records: { salt: string; hash: string }[]) {
  return records.some((record) => {
    const candidate = crypto.scryptSync(password, record.salt, 64);
    const expected = Buffer.from(record.hash, 'hex');
    return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
  });
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  req.authenticatedUser = user;
  next();
}

function requireStaff(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.authenticatedUser || req.authenticatedUser.role !== 'admin') {
    return res.status(403).json({ error: 'Atelier staff access required' });
  }
  next();
}

function createSession(req: express.Request, res: express.Response, user: UserRecord) {
  const sessionId = crypto.randomBytes(32).toString('base64url');
  const expiresAt = Date.now() + SESSION_TTL_MS;
  sessions.set(sessionId, { userId: user.id, expiresAt });
  setSessionCookie(req, res, sessionId);
  return { user: publicUser(user), expiresAt: new Date(expiresAt).toISOString() };
}

app.get('/api/csrf-token', (req, res) => {
  const csrfToken = crypto.randomBytes(32).toString('hex');
  setCsrfCookie(req, res, csrfToken);
  return res.json({ csrfToken });
});

// Session authentication endpoints. Passwords and session identifiers never leave the server.
app.post('/api/auth/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid login payload' });
  }

  const email = sanitizeUserText(parsed.data.email, 254).toLowerCase();
  const password = parsed.data.password;
  const requestedRole = parsed.data.role === 'tailor' ? 'tailor' : 'user';
  const user = usersDatabase.find((candidate) => candidate.email.toLowerCase() === email) ||
    ((email === 'admin@ykstitches.com') ? usersDatabase.find((candidate) => candidate.id === 'usr_admin_master') : undefined);
  const validPassword = verifyPassword(email, password) ||
    (requestedRole === 'tailor' && verifyAgainstRecords(password, legacyTailorPasswordRecords));

  if (!user || !validPassword || (requestedRole === 'tailor' && user.vipTier !== 'Artisan Tailor')) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  return res.json(createSession(req, res, user));
});

app.post('/api/auth/demo', (req, res) => {
  if (isProduction) return res.status(404).json({ error: 'Demo account is unavailable' });
  const demoUser = usersDatabase.find((user) => user.id === 'usr_adeyinka_1');
  if (!demoUser) return res.status(503).json({ error: 'Demo account is unavailable' });
  return res.json(createSession(req, res, demoUser));
});

app.post('/api/auth/register', (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Name, valid email, and an 8-character password are required' });
  }

  const name = sanitizeUserText(parsed.data.name, 120);
  const email = sanitizeUserText(parsed.data.email, 254).toLowerCase();
  const password = parsed.data.password;
  if (!name || !email || !email.includes('@') || password.length < 8) {
    return res.status(400).json({ error: 'Name, valid email, and an 8-character password are required' });
  }
  if (usersDatabase.some((user) => user.email.toLowerCase() === email)) {
    return res.status(409).json({ error: 'An account with that email already exists' });
  }

  const newUser: UserRecord = {
    id: `usr_${crypto.randomBytes(10).toString('hex')}`,
    name,
    email,
    phone: sanitizeUserText(parsed.data.phone, 40) || '+234 800 000 0000',
    role: 'user',
    address: sanitizeUserText(parsed.data.address, 200) || 'Victoria Island High Street',
    city: sanitizeUserText(parsed.data.city, 80) || 'Lagos',
    country: sanitizeUserText(parsed.data.country, 80) || 'Nigeria',
    joinedDate: new Date().toISOString(),
    totalSpent: 0,
    ordersCount: 0,
    measurementsCount: 0,
    vipTier: 'Patron',
  };
  usersDatabase.push(newUser);
  setPassword(email, password);

  return res.status(201).json(createSession(req, res, newUser));
});

app.get('/api/auth/session', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ user: null });
  const session = sessions.get(parseCookies(req)[SESSION_COOKIE]);
  return res.json({ user: publicUser(user), expiresAt: new Date(session?.expiresAt || Date.now()).toISOString() });
});

app.post('/api/auth/logout', (req, res) => {
  const sessionId = parseCookies(req)[SESSION_COOKIE];
  if (sessionId) sessions.delete(sessionId);
  clearSessionCookie(req, res);
  return res.status(204).send();
});
interface OrderMilestone {
  id: string;
  stage: string;
  label: string;
  description: string;
  completed: boolean;
  active: boolean;
  timestamp: string;
  tailorNotes?: string;
  photoUrl?: string;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: any[];
  orderType: 'bespoke' | 'ready-to-wear' | 'custom-fabric';
  totalAmount: number;
  currency: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  paymentGateway: string;
  transactionRef: string;
  deliveryAddress: string;
  deliveryCity: string;
  expressDelivery: boolean;
  createdAt: string;
  estimatedDeliveryDate: string;
  assignedTailor: {
    name: string;
    role: string;
    avatar: string;
    phone: string;
  };
  currentStageIndex: number;
  milestones: OrderMilestone[];
  measurementsSummary?: Record<string, string | number>;
  specialInstructions?: string;
}

// Seed initial authentic orders for tracking demonstration
const initialOrders: OrderRecord[] = [
  {
    id: 'ord_yk_9824',
    orderNumber: 'YKS-2026-9824',
    customerName: 'Adeyinka Adebowale',
    customerPhone: '+234 803 456 7890',
    customerEmail: 'adeyinka@example.com',
    items: [
      {
        id: 'item_1',
        title: 'Imperial Royal Suit 3-Piece Suite',
        fabric: 'Heavy Swiss Voile & Gold Thread Embroidery',
        color: 'Emerald & Gold Brocade',
        quantity: 1,
        price: 380,
        isCustom: true,
        fit: 'Bespoke Executive Cut',
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
      },
    ],
    orderType: 'bespoke',
    totalAmount: 380,
    currency: 'USD',
    paymentStatus: 'paid',
    paymentGateway: 'MTN MoMo',
    transactionRef: 'MOMO-TX-98472910',
    deliveryAddress: 'Plot 14, Victoria Island High Street',
    deliveryCity: 'Lagos',
    expressDelivery: true,
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    estimatedDeliveryDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    assignedTailor: {
      name: 'Master Tailor Yinka',
      role: 'Head of Bespoke Traditional Atelier',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      phone: '+234 812 000 7801',
    },
    currentStageIndex: 2,
    measurementsSummary: {
      'Chest Width': '42 in',
      'Shoulder Span': '19.5 in',
      'Suit Length': '58 in',
      'Sleeve Span': '34 in',
      'Neck Size': '16.5 in',
      'Trouser Inseam': '32.5 in',
    },
    specialInstructions: 'High-density chain stitch gold embroidery around collar & chest plaque. Double-pleat trousers.',
    milestones: [
      {
        id: 'm1',
        stage: 'order_confirmed',
        label: 'Order Confirmed & Material Sourced',
        description: 'Verified measurements & pulled Swiss Voile fabric from luxury vault.',
        completed: true,
        active: false,
        timestamp: 'Aug 30, 2026 · 09:30 AM',
        tailorNotes: 'Premium 100% Cotton Swiss Voile verified for density & luster.',
      },
      {
        id: 'm2',
        stage: 'pattern_drafting',
        label: 'Hand Pattern Drafting & Precision Cutting',
        description: 'Master pattern drafter traced bespoke blueprint and cut foundational panels.',
        completed: true,
        active: false,
        timestamp: 'Aug 30, 2026 · 03:45 PM',
        tailorNotes: 'Allowance checked for comfortable executive posture.',
      },
      {
        id: 'm3',
        stage: 'embroidery_stitching',
        label: 'Gold Needle Embroidery & Master Stitching',
        description: 'Currently on the master artisan bench receiving intricate chest plaque embroidery.',
        completed: false,
        active: true,
        timestamp: 'In Progress · ETA 6 hrs',
        tailorNotes: 'Artisan Ibrahim is executing 45,000 stitch gold filigree detailing.',
        photoUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'm4',
        stage: 'fitting_pressing',
        label: 'Quality Inspection & Steam Pressing',
        description: 'Double-seam stress test, hand-finishing hems, and steam shaping.',
        completed: false,
        active: false,
        timestamp: 'Pending stage 3 completion',
      },
      {
        id: 'm5',
        stage: 'packaging_dispatch',
        label: 'Atelier Luxury Garment Bagging & Dispatch',
        description: 'Placed in breathable canvas suit bag with custom wooden hanger.',
        completed: false,
        active: false,
        timestamp: 'Scheduled for Tomorrow',
      },
    ],
  },
  {
    id: 'ord_yk_5512',
    orderNumber: 'YKS-2026-5512',
    customerName: 'Chiamaka Okafor',
    customerPhone: '+234 809 111 2233',
    customerEmail: 'chiamaka@luxury.io',
    items: [
      {
        id: 'item_2',
        title: 'Bespoke Velvet Corset Evening Gown',
        fabric: 'Midnight Italian Velvet with Raw Silk Accents',
        color: 'Obsidian Velvet',
        quantity: 1,
        price: 460,
        isCustom: true,
        fit: 'Sculpted Hourglass',
        image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
      },
    ],
    orderType: 'bespoke',
    totalAmount: 460,
    currency: 'USD',
    paymentStatus: 'paid',
    paymentGateway: 'Visa / Mastercard',
    transactionRef: 'CARD-AUTH-882019',
    deliveryAddress: 'Penthouse 4B, Eko Atlantic Residences',
    deliveryCity: 'Lagos',
    expressDelivery: true,
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    estimatedDeliveryDate: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    assignedTailor: {
      name: 'Senior Couturier Amina',
      role: 'Lead Haute Couture Specialist',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      phone: '+234 818 555 4321',
    },
    currentStageIndex: 3,
    milestones: [
      {
        id: 'm1',
        stage: 'order_confirmed',
        label: 'Order Confirmed & Material Sourced',
        description: 'Velvet lot verified for pile direction and drape.',
        completed: true,
        active: false,
        timestamp: 'Aug 28, 2026 · 11:00 AM',
      },
      {
        id: 'm2',
        stage: 'pattern_drafting',
        label: 'Hand Pattern Drafting & Corset Boning Cut',
        description: 'Flexible spiral steel boning shaped to exact customer contour.',
        completed: true,
        active: false,
        timestamp: 'Aug 29, 2026 · 02:15 PM',
      },
      {
        id: 'm3',
        stage: 'embroidery_stitching',
        label: 'Internal Boning Channeling & Lining Insertion',
        description: 'Silk lining stitched with hidden seam construction.',
        completed: true,
        active: false,
        timestamp: 'Aug 30, 2026 · 06:00 PM',
      },
      {
        id: 'm4',
        stage: 'fitting_pressing',
        label: 'Hand Finishing & Couture Pressing',
        description: 'Velvet steamed on mannequin form without pile crushing.',
        completed: false,
        active: true,
        timestamp: 'In Progress · Final QA Review',
      },
      {
        id: 'm5',
        stage: 'packaging_dispatch',
        label: 'Atelier Luxury Garment Bagging & Dispatch',
        description: 'Assigned to premium white-glove courier.',
        completed: false,
        active: false,
        timestamp: 'Ready by 4:00 PM',
      },
    ],
  },
];

let ordersDatabase: OrderRecord[] = [...initialOrders];

// API: Tailor Chat Endpoint (Gemini Powered with Fallback)
app.post('/api/tailor-chat', async (req, res) => {
  try {
    const message = sanitizeUserText(req.body.message, 2000);
    const tailorName = sanitizeUserText(req.body.tailorName, 100);
    const chatHistory = Array.isArray(req.body.chatHistory)
      ? req.body.chatHistory.slice(-20).flatMap((entry: unknown) => {
          if (typeof entry !== 'object' || entry === null) return [];
          const item = entry as Record<string, unknown>;
          const text = sanitizeUserText(item.text, 2000);
          return text ? [{ sender: item.sender === 'user' ? 'user' : 'tailor', text }] : [];
        })
      : [];

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are ${tailorName || 'Master Tailor Adeyinka'}, the renowned Head Artisan and Style Consultant at "YK Stitches Company" (a high-end bespoke atelier celebrated for modern African luxury tailoring, suits, senator cuts, Italian wool suits, kaftans, and bespoke bridal/evening wear).

Your Personality:
- Deeply knowledgeable, warm, courteous, impeccably stylish, and attentive to fine garment craftsmanship.
- You understand fabric weights (e.g. 120s Super Italian Wool, Swiss Voile, Heavy Irish Linen, Guinea Brocade, Raw Silk), fit silhouettes, measurement advice, color coordination for skin tones and events (weddings, corporate galas, coronations, casual elegance), and maintenance.
- Keep replies conversational, concise, elegant, and genuinely helpful (2-4 paragraphs or formatted bullet tips).
- If the user asks about measurements, give step-by-step guidance on how to measure (e.g., chest, collar, sleeve, trouser length).
- If the user asks for design customization ideas, recommend collar types (Mandarin, Cuban, Shawl lapel), cuff styles, embroidery motifs, or fabric pairings.
- If asked about an existing order or tracking, reassure them that our artisans inspect every single stitch with master precision.`;

    if (ai) {
      try {
        const contents = chatHistory.length > 0
          ? [
              ...chatHistory.map((m: any) => ({
                role: m.sender === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }],
              })),
              { role: 'user', parts: [{ text: message }] },
            ]
          : message;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents,
          config: {
            systemInstruction,
          },
        });

        const reply = response.text || "I'd be delighted to assist you with tailoring your bespoke piece at YK Stitches Atelier.";
        return res.json({
          reply,
          tailor: tailorName || 'Master Tailor Adeyinka',
          source: 'gemini-3.7-flash',
        });
      } catch (genAiError: any) {
        console.warn('Gemini API call failed, falling back to expert tailor rules:', genAiError?.message);
      }
    }

    // High quality intelligent fallback response
    let fallbackReply = `Greetings from the YK Stitches Atelier! `;
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('measure') || lowerMsg.includes('size') || lowerMsg.includes('fit')) {
      fallbackReply += `For your bespoke measurements, here are the three crucial dimensions we prioritize for a razor-sharp silhouette:
1. **Chest / Bust:** Wrap the tape snug but relaxed across the fullest part of your chest under your armpits.
2. **Shoulder Span:** Measure horizontally from the edge of your left shoulder bone across to the right bone.
3. **Collar & Suit / Shirt Length:** Measure around the base of your neck, and from neck base down to your preferred hem.
Feel free to save these directly in our Custom Tailoring Studio!`;
    } else if (lowerMsg.includes('fabric') || lowerMsg.includes('material') || lowerMsg.includes('silk') || lowerMsg.includes('linen') || lowerMsg.includes('wool') || lowerMsg.includes('brocade')) {
      fallbackReply += `We curate only world-class textiles. For warm climate ceremonies, our Pure Swiss Voile and 100% Heavy Irish Linen provide unmatched breathability with crisp structure. For galas and formal suits, our Super 150s Italian Wool and Obsidian Velvet drape with regal prestige.`;
    } else if (lowerMsg.includes('wedding') || lowerMsg.includes('party') || lowerMsg.includes('event') || lowerMsg.includes('style')) {
      fallbackReply += `For momentous celebrations, our **Imperial 3-Piece Royal Suit** in Emerald or Champagne Brocade paired with gold chain-stitch embroidery is the pinnacle of luxury. Alternatively, a sharp **Mandarin Collar Senator Cut** in Italian Cashmere Blend delivers timeless dignity.`;
    } else if (lowerMsg.includes('track') || lowerMsg.includes('order') || lowerMsg.includes('delivery')) {
      fallbackReply += `You can monitor every phase of your garment on our live Real-Time Tracking Dashboard—from pattern drafting and embroidery to final steam pressing and dispatch. We document each milestone with artisan notes!`;
    } else {
      fallbackReply += `It is my pleasure to advise you on your bespoke garment. Whether you require tailored embroidery placement, fabric consultations, or styling guidance for an upcoming milestone, I am here at your service. How would you like to refine your look today?`;
    }

    return res.json({
      reply: fallbackReply,
      tailor: tailorName || 'Master Tailor Adeyinka',
      source: 'expert-atelier-rules',
    });
  } catch (error: any) {
    console.error('Tailor chat handler error:', error);
    res.status(500).json({ error: 'Failed to process tailor consultation' });
  }
});

// API: Get All Orders or Search by Order Number / Customer
app.get('/api/orders', requireAuth, (req, res) => {
  const orders = req.authenticatedUser?.role === 'admin'
    ? ordersDatabase
    : ordersDatabase.filter((order) => order.customerEmail.toLowerCase() === req.authenticatedUser?.email.toLowerCase());
  res.json({ orders });
});

app.post('/api/orders/search', requireAuth, (req, res) => {
  const parsed = searchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const query = sanitizeUserText(parsed.data.query || parsed.data.orderNumber || '', 100).toLowerCase();
  if (!query) return res.status(400).json({ error: 'Search query is required' });

  const found = ordersDatabase.find(
    (o) => o.orderNumber.toLowerCase() === query || o.id.toLowerCase() === query
  );
  if (found && (req.authenticatedUser?.role === 'admin' ||
    found.customerEmail.toLowerCase() === req.authenticatedUser?.email.toLowerCase())) {
    return res.json({ order: found });
  }
  return res.status(404).json({ error: 'Order not found' });
});

// API: Create a New Order (after payment confirmation or bespoke order placement)
app.post('/api/orders', requireAuth, (req, res) => {
  try {
    const orderData = req.body;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `YKS-2026-${randomNum}`;
    const id = `ord_yk_${randomNum}`;

    const newOrder: OrderRecord = {
      id,
      orderNumber,
      customerName: req.authenticatedUser?.name || orderData.customerName || 'VIP Patron',
      customerPhone: req.authenticatedUser?.phone || orderData.customerPhone || '+234 800 000 0000',
      customerEmail: req.authenticatedUser?.email || orderData.customerEmail || 'client@ykstitches.com',
      items: orderData.items || [],
      orderType: orderData.orderType || 'bespoke',
      totalAmount: orderData.totalAmount || 250,
      currency: orderData.currency || 'USD',
      paymentStatus: orderData.paymentStatus || 'paid',
      paymentGateway: orderData.paymentGateway || 'MTN MoMo',
      transactionRef: orderData.transactionRef || `TX-${Date.now()}`,
      deliveryAddress: orderData.deliveryAddress || 'Atelier Collection',
      deliveryCity: orderData.deliveryCity || 'Lagos',
      expressDelivery: Boolean(orderData.expressDelivery),
      createdAt: new Date().toISOString(),
      estimatedDeliveryDate: new Date(Date.now() + (orderData.expressDelivery ? 48 : 96) * 3600 * 1000).toISOString(),
      assignedTailor: orderData.assignedTailor || {
        name: 'Master Tailor Adeyinka',
        role: 'Founder & Principal Master Cutter',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        phone: '+234 812 345 6789',
      },
      currentStageIndex: 0,
      measurementsSummary: orderData.measurementsSummary || {},
      specialInstructions: orderData.specialInstructions || '',
      milestones: [
        {
          id: 'm1',
          stage: 'order_confirmed',
          label: 'Order Confirmed & Material Sourced',
          description: 'Payment verified and luxury fabric allocation confirmed from atelier vault.',
          completed: true,
          active: false,
          timestamp: 'Just now',
          tailorNotes: 'Order received into workshop queue. Specs dispatched to cutting table.',
        },
        {
          id: 'm2',
          stage: 'pattern_drafting',
          label: 'Hand Pattern Drafting & Precision Cutting',
          description: 'Master pattern drafter translates custom measurements into garment blueprint.',
          completed: false,
          active: true,
          timestamp: 'Next in queue (approx. 4 hrs)',
        },
        {
          id: 'm3',
          stage: 'embroidery_stitching',
          label: 'Artisanal Embroidery & Master Stitching',
          description: 'Single-needle structural tailoring, interlining basting, and monogramming.',
          completed: false,
          active: false,
          timestamp: 'Scheduled day 2',
        },
        {
          id: 'm4',
          stage: 'fitting_pressing',
          label: 'Quality Inspection & Steam Pressing',
          description: 'Double seam integrity check and high-pressure steam form sculpting.',
          completed: false,
          active: false,
          timestamp: 'Scheduled day 3',
        },
        {
          id: 'm5',
          stage: 'packaging_dispatch',
          label: 'Atelier Luxury Garment Bagging & Express Delivery',
          description: 'Packaged in YK Stitches dust-proof garment carrier with cedar hanger.',
          completed: false,
          active: false,
          timestamp: 'Scheduled day 4',
        },
      ],
    };

    ordersDatabase.unshift(newOrder);
    res.status(201).json({ success: true, order: newOrder });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// API: Progress / Advance an Order's Stage (for live workshop progression)
const advanceOrderHandler = (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const order = ordersDatabase.find((o) => o.id === id || o.orderNumber === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (order.currentStageIndex < order.milestones.length - 1) {
    order.milestones[order.currentStageIndex].completed = true;
    order.milestones[order.currentStageIndex].active = false;
    order.currentStageIndex += 1;
    order.milestones[order.currentStageIndex].active = true;
    order.milestones[order.currentStageIndex].timestamp = 'Updated Just Now';
  } else {
    order.milestones[order.currentStageIndex].completed = true;
    order.milestones[order.currentStageIndex].active = false;
  }

  res.json({ success: true, order });
};

app.post('/api/orders/:id/advance', requireAuth, requireStaff, advanceOrderHandler);
app.post('/api/orders/:id/progress', requireAuth, requireStaff, advanceOrderHandler);

// API: Update an Order (Admin / Atelier adjustments)
app.put('/api/orders/:id', requireAuth, requireStaff, (req, res) => {
  const { id } = req.params;
  const index = ordersDatabase.findIndex((o) => o.id === id || o.orderNumber === id);
  if (index === -1) return res.status(404).json({ error: 'Order not found' });

  ordersDatabase[index] = {
    ...ordersDatabase[index],
    ...req.body,
    id: ordersDatabase[index].id,
  };

  res.json({ success: true, order: ordersDatabase[index] });
});

// API: Image Upload for Admin Product Catalog (Base64 data / files)
app.post('/api/upload-image', requireAuth, requireStaff, (req, res) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }
    // Return the data URL directly so it can be stored and previewed seamlessly across all sessions
    res.json({ success: true, imageUrl: imageBase64, filename: filename || 'product-image.jpg' });
  } catch (err: any) {
    console.error('Image upload error:', err);
    res.status(500).json({ error: 'Failed to process product image upload' });
  }
});

// API: Products CRUD for Admin & Catalog
app.get('/api/products', (req, res) => {
  res.json({ products: productsDatabase });
});

app.post('/api/products', requireAuth, requireStaff, (req, res) => {
  try {
    const productData = req.body;
    const newProduct = {
      ...productData,
      id: productData.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      rating: productData.rating || 5.0,
      reviewCount: productData.reviewCount || 1,
      inStock: productData.inStock ?? true,
    };
    productsDatabase.unshift(newProduct);
    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', requireAuth, requireStaff, (req, res) => {
  const { id } = req.params;
  const index = productsDatabase.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  productsDatabase[index] = { ...productsDatabase[index], ...req.body };
  res.json({ success: true, product: productsDatabase[index] });
});

app.delete('/api/products/:id', requireAuth, requireStaff, (req, res) => {
  const { id } = req.params;
  const index = productsDatabase.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const deleted = productsDatabase.splice(index, 1)[0];
  res.json({ success: true, product: deleted });
});

// API: Users CRM & Directory
app.get('/api/users', requireAuth, requireStaff, (req, res) => {
  res.json({ users: usersDatabase });
});

app.post('/api/users', requireAuth, requireStaff, (req, res) => {
  try {
    const userData = req.body;
    const existing = usersDatabase.find(
      (u) => u.email.toLowerCase() === (userData.email || '').toLowerCase()
    );
    if (existing) {
      // Update existing
      Object.assign(existing, userData);
      return res.json({ success: true, user: existing });
    }
    const newUser: UserRecord = {
      id: userData.id || `usr_${Date.now()}`,
      name: userData.name || 'VIP Client',
      email: userData.email || `client_${Date.now()}@ykstitches.com`,
      phone: userData.phone || '+234 800 000 0000',
      role: userData.role || 'user',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      address: userData.address || 'Victoria Island',
      city: userData.city || 'Lagos',
      state: userData.state || 'Lagos State',
      country: userData.country || 'Nigeria',
      postalCode: userData.postalCode || '101241',
      joinedDate: new Date().toISOString(),
      totalSpent: userData.totalSpent || 0,
      ordersCount: userData.ordersCount || 0,
      measurementsCount: userData.measurementsCount || 0,
      vipTier: userData.vipTier || 'Patron',
      tailorNotes: userData.tailorNotes || 'New client account.',
      savedMeasurements: userData.savedMeasurements || {},
    };
    usersDatabase.push(newUser);
    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create or update user' });
  }
});

app.put('/api/users/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const user = usersDatabase.find((u) => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (req.authenticatedUser?.role !== 'admin' && req.authenticatedUser?.id !== id) {
    return res.status(403).json({ error: 'You may only update your own profile' });
  }
  const profileFields = ['name', 'phone', 'address', 'city', 'state', 'country', 'postalCode', 'savedMeasurements', 'wishlist'];
  for (const field of profileFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      (user as unknown as Record<string, unknown>)[field] = req.body[field];
    }
  }
  res.json({ success: true, user });
});

// API: Update order (for Admin modifying address, status, milestones, tailor notes, tracking)
app.put('/api/orders/:id', requireAuth, requireStaff, (req, res) => {
  const { id } = req.params;
  const order = ordersDatabase.find((o) => o.id === id || o.orderNumber === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  Object.assign(order, req.body);
  res.json({ success: true, order });
});

app.delete('/api/orders/:id', requireAuth, requireStaff, (req, res) => {
  const { id } = req.params;
  const index = ordersDatabase.findIndex((o) => o.id === id || o.orderNumber === id);
  if (index === -1) return res.status(404).json({ error: 'Order not found' });
  const deleted = ordersDatabase.splice(index, 1)[0];
  res.json({ success: true, order: deleted });
});

// API: Sales Analytics Summary for Admin Dashboard
app.get('/api/analytics/sales', requireAuth, requireStaff, (req, res) => {
  const totalRevenueUSD = ordersDatabase.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.totalAmount : 0), 0);
  const totalOrders = ordersDatabase.length;
  const paidOrders = ordersDatabase.filter((o) => o.paymentStatus === 'paid').length;
  const averageOrderValue = paidOrders > 0 ? Math.round(totalRevenueUSD / paidOrders) : 0;
  
  const gatewayBreakdown: Record<string, number> = {};
  ordersDatabase.forEach((o) => {
    gatewayBreakdown[o.paymentGateway] = (gatewayBreakdown[o.paymentGateway] || 0) + 1;
  });

  const recentTransactions = ordersDatabase.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    deliveryAddress: o.deliveryAddress,
    deliveryCity: o.deliveryCity,
    totalAmount: o.totalAmount,
    currency: o.currency,
    paymentStatus: o.paymentStatus,
    paymentGateway: o.paymentGateway,
    createdAt: o.createdAt,
    itemCount: o.items.length,
    orderType: o.orderType,
  }));

  res.json({
    totalRevenueUSD,
    totalOrders,
    paidOrders,
    averageOrderValue,
    gatewayBreakdown,
    recentTransactions,
  });
});
app.post('/api/payments/process', requireAuth, async (req, res) => {
  try {
    const {
      gateway, // 'momo', 'mpesa', 'airtel', 'card', 'ussd', 'applepay'
      amount,
      currency,
      phoneNumber,
      cardDetails,
      customerName,
      customerEmail,
    } = req.body;

    // Simulate realistic asynchronous network gateway authentication & tokenization
    const delay = 1200 + Math.floor(Math.random() * 800);
    await new Promise((resolve) => setTimeout(resolve, delay));

    const timestamp = Date.now();
    let refPrefix = 'YKS-PAY';

    switch (gateway) {
      case 'momo':
        refPrefix = 'MTN-MOMO';
        break;
      case 'mpesa':
        refPrefix = 'MPESA-STK';
        break;
      case 'airtel':
        refPrefix = 'AIRTEL-MONEY';
        break;
      case 'card':
        refPrefix = 'VISA-MC-SECURE';
        break;
      case 'ussd':
        refPrefix = 'USSD-BANK-AUTH';
        break;
      case 'applepay':
        refPrefix = 'APAY-TOKEN';
        break;
      default:
        refPrefix = 'GATEWAY';
    }

    const transactionRef = `${refPrefix}-${timestamp.toString().slice(-8)}`;
    const authorizationCode = `AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    res.json({
      success: true,
      status: 'successful',
      transactionRef,
      authorizationCode,
      gateway,
      amount,
      currency: currency || 'USD',
      customerName,
      paidAt: new Date().toISOString(),
      message: `Payment of ${currency || 'USD'} ${amount} verified via ${gateway.toUpperCase()} secure channel.`,
      receiptUrl: `/receipts/${transactionRef}`,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Payment processing error' });
  }
});

// Vite middleware & static serving
async function start() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (isProduction) {
    const keyPath = process.env.TLS_KEY_PATH;
    const certPath = process.env.TLS_CERT_PATH;
    if (!keyPath || !certPath) {
      throw new Error('TLS_KEY_PATH and TLS_CERT_PATH are required in production');
    }
    https.createServer(
      { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) },
      app,
    ).listen(PORT, '0.0.0.0', () => {
      console.log(`YK Stitches Atelier Server running at https://0.0.0.0:${PORT}`);
    });
  } else {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`YK Stitches Atelier Server running at http://0.0.0.0:${PORT}`);
    });
  }
}

start();
