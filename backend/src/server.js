import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import newsRoutes from './routes/newsRoutes.js';
import { getAllNews } from './newsStore.js';

const app = express();

// Get configuration from environment variables
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(express.json());

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:4444'];

// Enable CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin && NODE_ENV === 'development') return callback(null, true);
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    const msg = 'Not allowed by CORS';
    console.warn(`CORS blocked request from: ${origin}`);
    return callback(new Error(msg), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
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

app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'tech-news-backend',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// API Routes
app.use('/api/news', newsRoutes);

// Sitemap
app.get('/sitemap.xml', (_req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:4444';
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
  console.log(`→ CORS Allowed Origins: ${allowedOrigins.join(', ')}\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});
