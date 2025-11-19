const escape = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export function buildRssFeed({ items = [], siteUrl, feedUrl, title, description }) {
  const fallbackSite = siteUrl || 'http://localhost:6080';
  const fallbackFeed = feedUrl || `${fallbackSite.replace(/\/$/, '')}/rss.xml`;
  const feedTitle = title || 'TheKingsmaker Tech News';
  const feedDescription =
    description ||
    'Automation-ready coverage across AI, cloud, security, devices, and developer experience.';

  const now = new Date().toUTCString();

  const entries = items
    .slice(0, 100)
    .map((item) => {
      const link = `${fallbackSite.replace(/\/$/, '')}/article/${item.slug}`;
      const categories = [item.category, ...(item.tags || [])]
        .filter(Boolean)
        .map((cat) => `<category>${escape(cat)}</category>`)
        .join('');
      const imageTag = item.imageUrl ? `
  <enclosure url="${escape(item.imageUrl)}" type="image/jpeg" />` : '';
      const mediaContent = item.imageUrl ? `
  <media:content url="${escape(item.imageUrl)}" medium="image" type="image/jpeg" />` : '';

      return `<item>
  <title>${escape(item.title)}</title>
  <link>${escape(link)}</link>
  <guid isPermaLink="true">${escape(link)}</guid>
  <description>${escape(item.summary || item.content || '')}</description>
  <pubDate>${new Date(item.publishedAt || item.createdAt || now).toUTCString()}</pubDate>
  ${categories}${imageTag}${mediaContent}
</item>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escape(feedTitle)}</title>
    <link>${escape(fallbackSite)}</link>
    <description>${escape(feedDescription)}</description>
    <lastBuildDate>${now}</lastBuildDate>
    <ttl>15</ttl>
    <language>en</language>
    <atom:link href="${escape(fallbackFeed)}" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom" />
    ${entries}
  </channel>
</rss>`;
}
