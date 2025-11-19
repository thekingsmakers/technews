import { Router } from 'express';
import {
  getAllNews,
  getNewsBySlug,
  createNews,
  getNewsMeta,
  getArchivedNews // Import the new function
} from '../newsStore.js';

const router = Router();

router.get('/', (req, res) => {
  const { category, tag, q } = req.query;
  const news = getAllNews({ category, tag, q });
  res.json(news);
});

router.get('/meta', (req, res) => {
  const meta = getNewsMeta();
  res.json(meta);
});

router.get('/archive', (req, res) => {
  const archivedNews = getArchivedNews();
  res.json(archivedNews);
});

router.get('/:slug', (req, res) => {
  const { slug } = req.params;
  const news = getNewsBySlug(slug);
  if (news) {
    res.json(news);
  } else {
    res.status(404).json({ message: 'News not found' });
  }
});

router.post('/', (req, res) => {
  const item = createNews(req.body);
  res.status(201).json(item);
});

export default router;
