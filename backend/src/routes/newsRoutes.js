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
    // Check if it's a duplicate error
    if (error.message.includes('Duplicate article detected')) {
      res.status(409).json({ message: 'Duplicate article detected.', details: error.message });
    } else {
      res.status(400).json({ message: 'Error creating news item.', details: error.message });
    }
  }
});

// New endpoint to get archive configuration
router.get('/config/archive', (req, res) => {
  try {
    const { getArchiveConfig } = require('../newsStore.js');
    const config = getArchiveConfig();
    res.json(config);
  } catch (error) {
    console.error('Failed to get archive config:', error);
    res.status(500).json({ message: 'Error retrieving archive configuration.' });
  }
});

// New endpoint to update archive configuration
router.put('/config/archive', (req, res) => {
  try {
    const { setArchiveConfig } = require('../newsStore.js');
    setArchiveConfig(req.body);
    const updatedConfig = getArchiveConfig();
    res.json(updatedConfig);
  } catch (error) {
    console.error('Failed to update archive config:', error);
    res.status(500).json({ message: 'Error updating archive configuration.' });
  }
});

// New endpoint to get duplicates log
router.get('/duplicates', (req, res) => {
  try {
    const { readDuplicatesLog } = require('../newsStore.js');
    const limit = parseInt(req.query.limit) || 50;
    const duplicates = readDuplicatesLog().slice(0, limit);
    res.json(duplicates);
  } catch (error) {
    console.error('Failed to get duplicates log:', error);
    res.status(500).json({ message: 'Error retrieving duplicates log.' });
  }
});

// New endpoint to manually trigger archiving
router.post('/archive/trigger', (req, res) => {
  try {
    const { autoArchiveNews } = require('../newsStore.js');
    autoArchiveNews();
    res.json({ message: 'Auto-archiving process completed.' });
  } catch (error) {
    console.error('Failed to trigger archiving:', error);
    res.status(500).json({ message: 'Error triggering archiving process.' });
  }
});

export default router;
