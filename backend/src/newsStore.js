import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, '..', 'data', 'news.json');
const ARCHIVE_PATH = path.join(__dirname, '..', 'data', 'news_archive.json');

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

function archiveOldNews() {
  const news = readNews();
  if (news.length > 200) {
    const sortedNews = news.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    const latestNews = sortedNews.slice(0, 200);
    const oldNews = sortedNews.slice(200);
    const archive = readNews(ARCHIVE_PATH);
    const updatedArchive = [...archive, ...oldNews];
    writeNews(latestNews);
    writeNews(updatedArchive, ARCHIVE_PATH);
  }
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
  const slug = buildSlug(payload);
  const tags = sanitizeTags(payload.tags);
  const summary = sanitizeString(payload.summary || '');
  const content = sanitizeString(payload.content || '');
  const category = sanitizeString(payload.category || 'General');
  const source = sanitizeString(payload.source || '');
  const imageUrl = sanitizeString(payload.imageUrl || '');
  const existingIndex = news.findIndex((n) => n.slug === slug);

  const baseItem =
    existingIndex >= 0
      ? news[existingIndex]
      : {
          id: crypto.randomUUID(),
          createdAt: now
        };

  const item = {
    ...baseItem,
    title: sanitizeString(payload.title),
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

  if (existingIndex >= 0) {
    news[existingIndex] = item;
  } else {
    news.push(item);
  }

  writeNews(news);
  archiveOldNews(); // Call the archiving function after creating news
  return item;
}
