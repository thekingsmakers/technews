import { Router } from 'express';
import basicAuth from 'express-basic-auth';
import {
  getAllNews,
  getNewsBySlug,
  createNews,
  getLatestNews,
  getNewsMeta
} from '../newsStore.js';

const router = Router();

// --- Authentication Middleware ---
// This is only for the POST route to create/update news
const users = {};
if (process.env.API_USERNAME && process.env.API_PASSWORD) {
    users[process.env.API_USERNAME] = process.env.API_PASSWORD;
} else {
    console.warn("API username or password are not set. The POST /api/news endpoint is unprotected.");
}

const authMiddleware = basicAuth({
  users,
  challenge: true,
  unauthorizedResponse: { error: 'Unauthorized' }
});

// --- Public GET Routes ---
// These are open to the public and do not require a password

router.get('/', (req, res) => {
  const { category, tag, q } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.min(
    Math.max(parseInt(req.query.pageSize, 10) || 20, 1),
    100
  );

  const allItems = getAllNews({ category, tag, q });
  const total = allItems.length;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const start = (page - 1) * pageSize;
  const items = allItems.slice(start, start + pageSize);

  res.json({ items, page, pageSize, total, totalPages });
});

router.get('/latest', (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const items = getLatestNews(limit);
  res.json({ items });
});

router.get('/meta', (_req, res) => {
  const meta = getNewsMeta();
  res.json(meta);
});

router.get('/:slug', (req, res) => {
  const item = getNewsBySlug(req.params.slug);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ item });
});

// --- Protected POST Route ---
// This route requires a password to create or update news articles

router.post('/', authMiddleware, (req, res) => {
  try {
    const item = createNews(req.body);
    res.status(201).json({ item });
  } catch (error) {
    console.error("Failed to create news item:", error);
    res.status(500).json({ error: 'Internal server error while creating news item.' });
  }
});

export default router;
