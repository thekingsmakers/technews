import { Router } from 'express';
import {
  getAllNews,
  getNewsBySlug,
  createNews,
  getLatestNews,
  getNewsMeta
} from '../newsStore.js';

const router = Router();

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

router.post('/', (req, res) => {
  const apiKey = req.header('x-api-key');
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  if (typeof title !== 'string' || title.length > 200) {
    return res
      .status(400)
      .json({ error: 'title must be a string up to 200 characters' });
  }

  if (typeof content !== 'string' || content.length > 20000) {
    return res
      .status(400)
      .json({ error: 'content must be a string up to 20000 characters' });
  }

  const item = createNews(req.body);
  res.status(201).json({ item });
});

export default router;
