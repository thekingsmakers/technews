import { Router } from 'express';
import {
  getAllNews,
  getNewsBySlug,
  createNews,
  getNewsMeta,
  getArchivedNews
} from '../newsStore.js';
import { buildRssFeed } from '../rssFeed.js';

const router = Router();

// RSS Feed Route
router.get('/rss.xml', (req, res) => {
  try {
    const items = getAllNews();
    const siteUrl = `${req.protocol}://${req.get('host')}`;
    const feedUrl = `${siteUrl}/api/news/rss.xml`;

    const rssXml = buildRssFeed({
      items,
      siteUrl,
      feedUrl,
      title: 'TheKingsmaker Tech News',
      description: 'The latest in tech, AI, and development news.'
    });

    res.type('application/rss+xml');
    res.send(rssXml);
  } catch (error) {
    console.error('Failed to generate RSS feed:', error);
    res.status(500).send('Could not generate RSS feed');
  }
});

router.get('/', (req, res) => {
  // Extract filtering and pagination parameters from the query string
  const { category, tag, q, page = 1, pageSize = 12 } = req.query;

  try {
    // Get all news items that match the filters
    const allItems = getAllNews({ category, tag, q });

    // Apply pagination to the filtered list
    const pageNumber = parseInt(page, 10);
    const size = parseInt(pageSize, 10);
    const totalItems = allItems.length;
    const totalPages = Math.ceil(totalItems / size);
    const startIndex = (pageNumber - 1) * size;
    const paginatedItems = allItems.slice(startIndex, startIndex + size);

    // Return the paginated data in the expected format
    res.json({
      items: paginatedItems,
      totalPages,
      currentPage: pageNumber,
      totalItems,
    });
  } catch (error) {
    console.error('Failed to get news:', error);
    res.status(500).json({ message: 'Error retrieving news feed.' });
  }
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
  try {
    const item = createNews(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error('Failed to create news item:', error);
    res.status(400).json({ message: 'Error creating news item.', details: error.message });
  }
});

export default router;
