import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import os from 'os';
import newsRoutes from './routes/newsRoutes.js';
import { getAllNews } from './newsStore.js';
import { buildRssFeed } from './rssFeed.js';

const app = express();

// Get configuration from environment variables
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || '';

// Middleware
app.use(express.json());
app.set('trust proxy', 1); // respect Cloudflare / proxy IPs

// Enable CORS for all origins
app.use(cors());

// Request logging middleware
app.use((req, _res, next) => {
  req.realIp =
    req.headers['cf-connecting-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.ip;
  next();
});

app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ip: ${req.realIp}`
  );
  next();
});

// API Routes
app.get('/', (_req, res) => {
  res.json({
    service: 'tech-news-backend',
    status: 'ok',
    message: 'Use /api for API metadata or /api/health to check health status.'
  });
});

app.get('/api', (_req, res) => {
  res.json({
    name: 'Tech News API',
    version: '1.0.0',
    environment: NODE_ENV,
    endpoints: [
      'GET /api',
      'GET /api/health',
      'GET /api/news',
      'GET /api/news/latest',
      'GET /api/news/meta',
      'GET /api/news/:slug',
      'POST /api/news'
    ]
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'tech-news-backend',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    ip: req.realIp
  });
});

app.get('/api/request-info', (req, res) => {
  res.json({
    ip: req.realIp,
    forwardedFor: req.headers['x-forwarded-for'] || null,
    cfConnectingIp: req.headers['cf-connecting-ip'] || null,
    userAgent: req.headers['user-agent'] || null
  });
});

// API Routes - now public by default
app.use('/api/news', newsRoutes);

// Sitemap
app.get('/sitemap.xml', (_req, res) => {
  try {
    const baseUrl =
      FRONTEND_BASE_URL ||
      (NODE_ENV === 'development' ? `http://localhost:6080` : '');
    const items = getAllNews();

    const urls = [
      `<url><loc>${baseUrl}/</loc><changefreq>hourly</changefreq></url>`,
      ...items.map(
        (item) =>
          `<url><loc>${baseUrl}/article/${item.slug}</loc><changefreq>daily</changefreq></url>`
      )
    ].join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

app.get(['/rss.xml', '/feed.xml', '/api/rss'], (_req, res) => {
  try {
    const siteUrl =
      FRONTEND_BASE_URL ||
      (NODE_ENV === 'development' ? `http://localhost:6080` : '');
    const items = getAllNews();
    const rss = buildRssFeed({
      items,
      siteUrl,
      feedUrl: `${process.env.API_BASE_URL || siteUrl}/rss.xml`,
      title: 'TheKingsmaker Tech News RSS',
      description:
        'Daily tech briefings across AI, cloud, security, devices, and developer tooling.'
    });
    res.header('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(rss);
  } catch (error) {
    console.error('Error generating RSS:', error);
    res.status(500).send('Error generating RSS feed');
  }
});

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ 
    status: 'error',
    message: 'Not Found',
    timestamp: new Date().toISOString()
  });
});

// Error Handler
app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    ...(NODE_ENV === 'development' && { error: err.message, stack: err.stack })
  });
});

// Start the server
const server = app.listen(PORT, HOST, () => {
  const { address, port } = server.address();
  console.log(`\n🚀 Tech News API Server running in ${NODE_ENV} mode`);
  console.log(`→ Local:   http://localhost:${port}`);
  console.log(`→ Network: http://${address === '::' ? 'localhost' : address}:${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});
