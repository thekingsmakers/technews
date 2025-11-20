import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { categorizeArticle } from './categorizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, '..', 'data', 'news.json');
const ARCHIVE_PATH = path.join(__dirname, '..', 'data', 'news_archive.json');
const DUPLICATES_LOG_PATH = path.join(__dirname, '..', 'data', 'duplicates_log.json');
const ARCHIVE_CONFIG_PATH = path.join(__dirname, '..', 'data', 'archive_config.json');

function ensureDataFile(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf-8');
  }
}

function readNews(filePath = DATA_PATH) {
  try {
    ensureDataFile(filePath);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (error) {
    console.error(`Failed to read news from ${filePath}:`, error);
    return [];
  }
}

function writeNews(news, filePath = DATA_PATH) {
  ensureDataFile(filePath);
  fs.writeFileSync(filePath, JSON.stringify(news, null, 2), 'utf-8');
}

function readDuplicatesLog() {
  try {
    ensureDataFile(DUPLICATES_LOG_PATH);
    const raw = fs.readFileSync(DUPLICATES_LOG_PATH, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (error) {
    console.error('Failed to read duplicates log:', error);
    return [];
  }
}

function writeDuplicatesLog(log) {
  ensureDataFile(DUPLICATES_LOG_PATH);
  fs.writeFileSync(DUPLICATES_LOG_PATH, JSON.stringify(log, null, 2), 'utf-8');
}

function getArchiveConfig() {
  try {
    ensureDataFile(ARCHIVE_CONFIG_PATH);
    const raw = fs.readFileSync(ARCHIVE_CONFIG_PATH, 'utf-8');
    const config = JSON.parse(raw || '{}');
    return {
      archiveEnabled: config.archiveEnabled ?? true,
      duplicateDetectionEnabled: config.duplicateDetectionEnabled ?? true,
      maxActiveArticles: config.maxActiveArticles ?? 200,
      autoArchiveInterval: config.autoArchiveInterval ?? (24 * 60 * 60 * 1000), // 24 hours in milliseconds
      lastArchiveRun: config.lastArchiveRun ?? null,
      ...config
    };
  } catch (error) {
    console.error('Failed to read archive config:', error);
    return {
      archiveEnabled: true,
      duplicateDetectionEnabled: true,
      maxActiveArticles: 200,
      autoArchiveInterval: 24 * 60 * 60 * 1000, // 24 hours
      lastArchiveRun: null
    };
  }
}

function setArchiveConfig(updates) {
  const currentConfig = getArchiveConfig();
  const newConfig = { ...currentConfig, ...updates };
  ensureDataFile(ARCHIVE_CONFIG_PATH);
  fs.writeFileSync(ARCHIVE_CONFIG_PATH, JSON.stringify(newConfig, null, 2), 'utf-8');
}

const sanitizeString = (value = '') =>
  (value ?? '')
    .toString()
    .trim();

const sanitizeTags = (tags = []) =>
  (Array.isArray(tags) ? tags : [])
    .map((tag) => sanitizeString(tag))
    .filter(Boolean);

const slugify = (value) => {
  if (!value) return '';
  return sanitizeString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

function buildSlug({ slug, title }) {
  const base = slugify(slug || title);
  return base || crypto.randomUUID();
}

export function getArchivedNews() {
  return readNews(ARCHIVE_PATH);
}

export function autoArchiveNews() {
  const config = getArchiveConfig();
  if (!config.archiveEnabled) {
    console.log('Auto-archiving is disabled');
    return;
  }

  const now = Date.now();
  const timeSinceLastRun = config.lastArchiveRun ? now - new Date(config.lastArchiveRun).getTime() : Infinity;

  if (timeSinceLastRun < config.autoArchiveInterval) {
    console.log(`Auto-archiving not due yet. Next run in ${Math.ceil((config.autoArchiveInterval - timeSinceLastRun) / (60 * 60 * 1000))} hours`);
    return;
  }

  const news = readNews();
  if (news.length <= config.maxActiveArticles) {
    console.log(`No archiving needed. Current articles: ${news.length}, limit: ${config.maxActiveArticles}`);
    return;
  }

  console.log(`Starting auto-archiving process. Current articles: ${news.length}`);

  const sortedNews = news.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  const latestNews = sortedNews.slice(0, config.maxActiveArticles);
  const oldNews = sortedNews.slice(config.maxActiveArticles);

  const archive = readNews(ARCHIVE_PATH);
  const updatedArchive = [...archive, ...oldNews];

  writeNews(latestNews);
  writeNews(updatedArchive, ARCHIVE_PATH);
  setArchiveConfig({ lastArchiveRun: new Date().toISOString() });

  console.log(`Auto-archiving completed. Archived ${oldNews.length} articles. Active articles remaining: ${latestNews.length}`);
}

function detectAndLogDuplicate(payload, existingIndex) {
  const config = getArchiveConfig();
  if (!config.duplicateDetectionEnabled) {
    return null;
  }

  const duplicatesLog = readDuplicatesLog();
  const now = new Date().toISOString();

  let duplicateType = 'unknown';
  let confidence = 0;

  if (existingIndex >= 0) {
    duplicateType = 'title_match';
    confidence = 1.0;
  } else {
    // Check for content similarity (basic implementation)
    const news = readNews();
    const title = sanitizeString(payload.title).toLowerCase();
    const summary = sanitizeString(payload.summary || '').toLowerCase();

    for (const article of news) {
      const articleTitle = article.title.toLowerCase();
      const articleSummary = (article.summary || '').toLowerCase();

      // Title similarity
      if (title && articleTitle.includes(title) || title.includes(articleTitle)) {
        duplicateType = 'title_similarity';
        confidence = 0.8;
        break;
      }

      // Summary similarity
      if (summary && articleSummary && summary.length > 50 && articleSummary.length > 50) {
        const words1 = summary.split(' ').filter(w => w.length > 3);
        const words2 = articleSummary.split(' ').filter(w => w.length > 3);
        const commonWords = words1.filter(w => words2.includes(w)).length;
        const similarity = commonWords / Math.max(words1.length, words2.length);

        if (similarity > 0.6) {
          duplicateType = 'content_similarity';
          confidence = similarity;
          break;
        }
      }
    }
  }

  if (duplicateType !== 'unknown' && confidence > 0.5) {
    const duplicateEntry = {
      id: crypto.randomUUID(),
      timestamp: now,
      type: duplicateType,
      confidence,
      incomingArticle: {
        title: payload.title,
        summary: payload.summary,
        source: payload.source,
        publishedAt: payload.publishedAt
      },
      action: existingIndex >= 0 ? 'updated' : 'rejected',
      reason: existingIndex >= 0 ? 'Duplicate title found, article updated' : 'Potential duplicate detected'
    };

    duplicatesLog.unshift(duplicateEntry);

    // Keep only last 1000 entries
    if (duplicatesLog.length > 1000) {
      duplicatesLog.splice(1000);
    }

    writeDuplicatesLog(duplicatesLog);

    console.log(`Duplicate detected: ${duplicateType} (${Math.round(confidence * 100)}% confidence)`);
    return duplicateEntry;
  }

  return null;
}

export function getAllNews({ category, tag, q } = {}) {
  let items = readNews().sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
  );

  if (category) {
    items = items.filter(
      (n) => n.category && n.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (tag) {
    items = items.filter(
      (n) =>
        Array.isArray(n.tags) &&
        n.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
    );
  }

  if (q) {
    const term = q.toLowerCase();
    items = items.filter(
      (n) =>
        n.title.toLowerCase().includes(term) ||
        (n.summary && n.summary.toLowerCase().includes(term))
    );
  }

  return items;
}

export function getNewsBySlug(slug) {
  return readNews().find((n) => n.slug === slug);
}

export function getLatestNews(limit = 10) {
  const items = getAllNews();
  return items.slice(0, limit);
}

export function getNewsMeta() {
  const items = readNews();
  const categories = new Set();
  const tags = new Set();

  for (const item of items) {
    if (item.category) {
      categories.add(item.category);
    }
    if (Array.isArray(item.tags)) {
      for (const t of item.tags) {
        if (t && typeof t === 'string') {
          tags.add(t.trim());
        }
      }
    }
  }

  return {
    count: items.length,
    categories: Array.from(categories),
    tags: Array.from(tags)
  };
}

export function createNews(payload) {
  const news = readNews();
  const now = new Date().toISOString();
  const title = sanitizeString(payload.title);

  // First, try to find an existing article with the exact same title
  let existingIndex = news.findIndex((n) => n.title.toLowerCase() === title.toLowerCase());

  // If not found by title, try to find by slug (for legacy articles)
  if (existingIndex === -1) {
    const slug = buildSlug({ title });
    existingIndex = news.findIndex((n) => n.slug === slug);
  }

  const slug = buildSlug(payload);
  const tags = sanitizeTags(payload.tags);
  const summary = sanitizeString(payload.summary || '');
  const content = sanitizeString(payload.content || '');
  let category = sanitizeString(payload.category || 'General');
  const source = sanitizeString(payload.source || '');
  const imageUrl = sanitizeString(payload.imageUrl || '');

  // Auto-categorize if needed
  if (!category || category === 'General' || category === '') {
    category = categorizeArticle(title, summary, content);
    console.log(`Auto-categorized "${title}" as: ${category}`);
  }

  const baseItem =
    existingIndex >= 0
      ? news[existingIndex]
      : {
        id: crypto.randomUUID(),
        createdAt: now
      };

  const item = {
    ...baseItem,
    title,
    slug,
    summary,
    content,
    source,
    category,
    tags,
    imageUrl: imageUrl || null,
    publishedAt: payload.publishedAt || baseItem.publishedAt || now,
    updatedAt: now,
    featured: true
  };

  // Detect and log potential duplicates
  const duplicateInfo = detectAndLogDuplicate(payload, existingIndex);

  // If no exact match found but duplicate detection suggests it's a duplicate, reject it
  if (existingIndex === -1 && duplicateInfo && duplicateInfo.confidence > 0.8) {
    throw new Error(`Duplicate article detected: ${duplicateInfo.reason}`);
  }

  if (existingIndex >= 0) {
    news[existingIndex] = item;
    console.log(`Updated existing article: ${title}`);
  } else {
    news.push(item);
    console.log(`Created new article: ${title}`);
  }

  writeNews(news);
  autoArchiveNews();
  return item;
}
