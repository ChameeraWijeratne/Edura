import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import nodemailer from 'nodemailer';
import {
  SUBJECT_CATEGORIES,
  withNormalizedSubject,
} from './lib/subjectCategories.js';
import { compareCoursesEnglishMediumFirst } from './lib/englishMediumSort.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

// ---------------------------------------------------------------------------
// Security: HTTP security headers via Helmet
// ---------------------------------------------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // keep SPA assets compatible
  }),
);

// ---------------------------------------------------------------------------
// Security: CORS — allow only explicitly listed origins.
// Set ALLOWED_ORIGINS in .env as comma-separated list, e.g.:
//   ALLOWED_ORIGINS=https://edura.example.com,https://www.edura.example.com
// Defaults to localhost dev origins so `npm run dev` works out of the box.
// ---------------------------------------------------------------------------
const rawOrigins = process.env.ALLOWED_ORIGINS || '';
const allowedOrigins = rawOrigins
  ? rawOrigins
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)
  : ['http://localhost:8080', 'http://127.0.0.1:8080'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS: origin '${origin}' not allowed`), false);
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: false,
  }),
);

// ---------------------------------------------------------------------------
// Security: Request body size limit (prevents large-payload DoS)
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '16kb' }));

// ---------------------------------------------------------------------------
// Security: Global rate limiter — 200 req / 15 min per IP
// ---------------------------------------------------------------------------
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// ---------------------------------------------------------------------------
// Security: Strict rate limiter for the contact form — 5 req / 15 min per IP
// ---------------------------------------------------------------------------
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many contact submissions. Please wait a few minutes.',
  },
});

// ---------------------------------------------------------------------------
// Data paths
// ---------------------------------------------------------------------------
const coursesPath = join(__dirname, 'data', 'courses.json');
const sriLankaCoursesPath = join(__dirname, 'data', 'sri-lanka-courses.json');
const internshipsPath = join(__dirname, 'data', 'internships.json');
const contactPath = join(__dirname, 'data', 'contact-messages.json');

const SRI_LANKA_CATEGORIES = [
  'After O/L',
  'After A/L',
  'Diploma',
  'Degree',
  'Masters',
  'PhD',
  'Certificate',
  'Professional',
  'Other',
];
const clientDist = join(__dirname, '..', 'client', 'dist');
const clientIndex = join(clientDist, 'index.html');

// ---------------------------------------------------------------------------
// Data loaders
// ---------------------------------------------------------------------------
function loadCourses() {
  const raw = readFileSync(coursesPath, 'utf-8');
  return JSON.parse(raw);
}

function loadSriLankaCourses() {
  if (!existsSync(sriLankaCoursesPath)) return [];
  try {
    const raw = readFileSync(sriLankaCoursesPath, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function loadInternships() {
  if (!existsSync(internshipsPath)) return [];
  try {
    const raw = readFileSync(internshipsPath, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** LinkedIn-sourced rows first, then others; within each group by date then title. */
function compareInternshipsForListing(a, b) {
  const linkedInFirst = (i) =>
    /linkedin/i.test(String(i.sourceType || '')) ? 0 : 1;
  const la = linkedInFirst(a);
  const lb = linkedInFirst(b);
  if (la !== lb) return la - lb;
  const da = String(a.postedAt || '');
  const db = String(b.postedAt || '');
  if (da && db) {
    const byDate = db.localeCompare(da);
    if (byDate !== 0) return byDate;
  }
  return String(a.title || '').localeCompare(String(b.title || ''));
}

// Keep contact log bounded to 10 000 entries to prevent disk exhaustion.
const MAX_CONTACT_ENTRIES = 10_000;

function appendContactMessage(entry) {
  let list = [];
  if (existsSync(contactPath)) {
    try {
      list = JSON.parse(readFileSync(contactPath, 'utf-8'));
      if (!Array.isArray(list)) list = [];
    } catch {
      list = [];
    }
  }
  if (list.length >= MAX_CONTACT_ENTRIES) {
    list = list.slice(-MAX_CONTACT_ENTRIES + 1);
  }
  list.push({
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    ...entry,
  });
  writeFileSync(contactPath, JSON.stringify(list, null, 2), 'utf-8');
}

async function trySendContactEmail({ name, email, message }) {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    CONTACT_TO_EMAIL,
    CONTACT_FROM_EMAIL,
  } = process.env;
  if (!SMTP_HOST || !CONTACT_TO_EMAIL) return false;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: SMTP_SECURE === 'true',
    auth:
      SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });

  await transporter.sendMail({
    from: CONTACT_FROM_EMAIL || SMTP_USER || 'noreply@edura.local',
    to: CONTACT_TO_EMAIL,
    replyTo: email,
    subject: `Edura contact: ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });
  return true;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/subjects', (_req, res) => {
  try {
    res.json(SUBJECT_CATEGORIES);
  } catch {
    res.status(500).json({ error: 'Failed to load subjects' });
  }
});

app.get('/api/universities', (_req, res) => {
  try {
    const courses = loadCourses();
    const universities = [...new Set(courses.map((c) => c.university))].sort(
      (a, b) => a.localeCompare(b),
    );
    res.json(universities);
  } catch {
    res.status(500).json({ error: 'Failed to load universities' });
  }
});

app.get('/api/internships', (req, res) => {
  try {
    let list = loadInternships();
    const { q, source, page: pageRaw, limit: limitRaw } = req.query;

    if (
      source &&
      String(source).trim() &&
      String(source).toLowerCase() !== 'all'
    ) {
      const want = String(source).trim().toLowerCase();
      list = list.filter(
        (i) => String(i.sourceType || '').toLowerCase() === want,
      );
    }

    if (q && String(q).trim()) {
      const needle = String(q).trim().toLowerCase();
      list = list.filter((i) => {
        const blob = [
          i.title,
          i.organization,
          i.location,
          i.description,
          i.sourceType,
          i.sourceNote,
          i.workMode,
          i.postingUrl,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return blob.includes(needle);
      });
    }

    list.sort(compareInternshipsForListing);

    const total = list.length;
    const pageNum = Math.max(1, parseInt(String(pageRaw || '1'), 10) || 1);
    const limitParsed = parseInt(String(limitRaw || '10'), 10);
    const limit = Math.min(
      50,
      Math.max(1, Number.isFinite(limitParsed) ? limitParsed : 10),
    );
    const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
    const page = Math.min(pageNum, totalPages);
    const offset = (page - 1) * limit;
    const items = list.slice(offset, offset + limit);

    res.json({ items, total, page, limit, totalPages });
  } catch {
    res.status(500).json({ error: 'Failed to load internships' });
  }
});

app.get('/api/internships/sources', (_req, res) => {
  try {
    const types = [
      ...new Set(
        loadInternships()
          .map((i) => i.sourceType)
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b));
    res.json(types);
  } catch {
    res.status(500).json({ error: 'Failed to load internship sources' });
  }
});

app.get('/api/courses', (req, res) => {
  try {
    let courses = loadCourses().map(withNormalizedSubject);
    const { subject, university, q } = req.query;

    if (subject && subject !== 'all') {
      const want = String(subject).toLowerCase();
      courses = courses.filter((c) => c.subject.toLowerCase() === want);
    }
    if (university && university !== 'all') {
      courses = courses.filter(
        (c) => c.university.toLowerCase() === String(university).toLowerCase(),
      );
    }
    if (q && String(q).trim()) {
      const needle = String(q).trim().toLowerCase();
      courses = courses.filter(
        (c) =>
          c.title.toLowerCase().includes(needle) ||
          c.description.toLowerCase().includes(needle) ||
          c.university.toLowerCase().includes(needle) ||
          c.subject.toLowerCase().includes(needle),
      );
    }

    courses.sort(compareCoursesEnglishMediumFirst);
    res.json(courses);
  } catch {
    res.status(500).json({ error: 'Failed to load courses' });
  }
});

app.get('/api/sri-lanka/categories', (_req, res) => {
  res.json(SRI_LANKA_CATEGORIES);
});

app.get('/api/sri-lanka/subjects', (_req, res) => {
  try {
    res.json(SUBJECT_CATEGORIES);
  } catch {
    res.status(500).json({ error: 'Failed to load subjects' });
  }
});

app.get('/api/sri-lanka/universities', (_req, res) => {
  try {
    const courses = loadSriLankaCourses();
    const universities = [...new Set(courses.map((c) => c.university))].sort(
      (a, b) => a.localeCompare(b),
    );
    res.json(universities);
  } catch {
    res.status(500).json({ error: 'Failed to load universities' });
  }
});

app.get('/api/sri-lanka/courses', (req, res) => {
  try {
    let courses = loadSriLankaCourses().map(withNormalizedSubject);
    const { subject, university, category, pricing, q } = req.query;

    if (subject && subject !== 'all') {
      const want = String(subject).toLowerCase();
      courses = courses.filter((c) => c.subject.toLowerCase() === want);
    }
    if (university && university !== 'all') {
      courses = courses.filter(
        (c) => c.university.toLowerCase() === String(university).toLowerCase(),
      );
    }
    if (category && category !== 'all') {
      courses = courses.filter(
        (c) =>
          String(c.category || '').toLowerCase() ===
          String(category).toLowerCase(),
      );
    }
    if (pricing === 'free') {
      courses = courses.filter((c) => c.pricing === 'free');
    } else if (pricing === 'paid') {
      courses = courses.filter((c) => c.pricing === 'paid');
    }

    if (q && String(q).trim()) {
      const needle = String(q).trim().toLowerCase();
      courses = courses.filter(
        (c) =>
          c.title.toLowerCase().includes(needle) ||
          c.description.toLowerCase().includes(needle) ||
          c.university.toLowerCase().includes(needle) ||
          c.subject.toLowerCase().includes(needle) ||
          String(c.category || '')
            .toLowerCase()
            .includes(needle),
      );
    }

    courses.sort(compareCoursesEnglishMediumFirst);
    res.json(courses);
  } catch {
    res.status(500).json({ error: 'Failed to load Sri Lanka courses' });
  }
});

app.post('/api/contact', contactLimiter, async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim();
  const message = String(req.body?.message || '').trim();

  if (!name || name.length > 120) {
    return res
      .status(400)
      .json({ error: 'Please enter your name (max 120 characters).' });
  }
  if (
    !email ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return res
      .status(400)
      .json({ error: 'Please enter a valid email address.' });
  }
  if (!message || message.length < 10) {
    return res
      .status(400)
      .json({ error: 'Please enter a message (at least 10 characters).' });
  }
  if (message.length > 8000) {
    return res
      .status(400)
      .json({ error: 'Message is too long (max 8000 characters).' });
  }

  try {
    appendContactMessage({ name, email, message });
  } catch {
    return res.status(500).json({ error: 'Could not save your message.' });
  }

  let emailed = false;
  try {
    emailed = await trySendContactEmail({ name, email, message });
  } catch (e) {
    console.error('Contact email failed:', e.message);
  }

  res.json({
    ok: true,
    emailed,
    message: emailed
      ? 'Thank you. Your message was sent.'
      : 'Thank you. We received your message and will review it soon.',
  });
});

// ---------------------------------------------------------------------------
// SPA static files (production)
// ---------------------------------------------------------------------------
if (existsSync(clientIndex)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(clientIndex);
  });
}

// ---------------------------------------------------------------------------
// Global error handler — never leak stack traces to the client
// ---------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({ error: err.message });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
const server = app.listen(PORT, () => {
  console.log(
    `Edura API listening on port ${PORT} (try http://127.0.0.1:${PORT}/api/health)`,
  );
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `Port ${PORT} is already in use. Stop the other process, or run with a different PORT.`,
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});
