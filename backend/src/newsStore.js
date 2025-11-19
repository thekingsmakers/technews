import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, '..', 'data', 'news.json');

function readNews() {
  if (!fs.existsSync(DATA_PATH)) return [];
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw || '[]');
}

function writeNews(news) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(news, null, 2), 'utf-8');
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
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const slug =
    payload.slug ||
    payload.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const item = {
    id,
    title: payload.title,
    slug,
    summary: payload.summary || '',
    content: payload.content || '',
    source: payload.source || 'n8n',
    category: payload.category || 'General',
    tags: payload.tags || [],
    imageUrl: payload.imageUrl || null,
    publishedAt: payload.publishedAt || now,
    updatedAt: now,
    featured: Boolean(payload.featured)
  };

  news.push(item);
  writeNews(news);
  return item;
}
