// AI-Powered HTML Structure Analyzer for News Websites
// Uses Claude/GPT to automatically detect article selectors

const analyzeHtmlStructure = async (htmlContent, targetUrl) => {
  // Extract domain for site-specific patterns
  const domain = new URL(targetUrl).hostname.replace('www.', '');

  // Common news site patterns
  const knownPatterns = {
    'techcrunch.com': {
      articleList: 'article.post-block, .post-block',
      title: 'h2.post-block__title a, .post-block__title a',
      url: 'h2.post-block__title a, .post-block__title a',
      summary: '.post-block__content',
      date: '.river-byline__time',
      category: '.post-block__category'
    },
    'arstechnica.com': {
      articleList: 'article.tease, .tease',
      title: 'h2 a, .tease h2 a',
      url: 'h2 a, .tease h2 a',
      summary: '.tease p.excerpt',
      date: 'time',
      category: '.overlay'
    },
    'theverge.com': {
      articleList: 'article[data-analytics-link="article"], .c-entry-box',
      title: 'h2 a, .c-entry-box__title a',
      url: 'h2 a, .c-entry-box__title a',
      summary: '.c-entry-box__excerpt p',
      date: 'time',
      category: '.c-entry-box__category'
    },
    'wired.com': {
      articleList: 'li.card-component, .card-component',
      title: 'h2 a, .card-component__title a',
      url: 'h2 a, .card-component__title a',
      summary: '.card-component__description',
      date: '.card-component__byline time',
      category: '.card-component__category'
    }
  };

  // Return known pattern if available
  if (knownPatterns[domain]) {
    return { ...knownPatterns[domain], confidence: 1.0 };
  }

  // AI-powered analysis for unknown sites
  const aiAnalysis = await analyzeWithAI(htmlContent, targetUrl);

  return aiAnalysis;
};

const analyzeWithAI = async (htmlContent, targetUrl) => {
  // This would integrate with Claude/GPT API
  // For now, return adaptive fallback patterns

  // Analyze HTML structure
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // Look for common article patterns
  const patterns = [
    // Standard article elements
    {
      articleList: 'article, .article, .post, .entry, .news-item',
      title: 'h1, h2, h3, .title, .headline',
      url: 'a[href]',
      summary: 'p, .summary, .excerpt, .description',
      date: 'time, .date, .published, [datetime]',
      confidence: 0.7
    },
    // Card-based layouts
    {
      articleList: '.card, .item, .entry, .post-card, .news-card',
      title: '.card-title, .item-title, h2 a, h3 a',
      url: '.card-title a, .item-title a, h2 a, h3 a',
      summary: '.card-text, .item-summary, .card-description',
      date: '.card-date, .item-date, time',
      confidence: 0.6
    },
    // List-based layouts
    {
      articleList: 'li, .list-item, .feed-item',
      title: 'h2 a, h3 a, .title a',
      url: 'h2 a, h3 a, .title a',
      summary: 'p, .summary',
      date: '.date, time',
      confidence: 0.5
    }
  ];

  // Test patterns and return best match
  for (const pattern of patterns) {
    const articles = doc.querySelectorAll(pattern.articleList);
    if (articles.length > 0 && articles.length <= 50) { // Reasonable article count
      return { ...pattern };
    }
  }

  // Ultimate fallback
  return {
    articleList: 'article, .article, .post, .entry, .news-item, .card',
    title: 'h1, h2, h3, .title, .headline',
    url: 'a[href]',
    summary: 'p, .summary, .excerpt, .description',
    date: 'time, .date, .published, [datetime]',
    confidence: 0.3
  };
};

const detectContentSelectors = (htmlContent, articleUrl) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // Multiple strategies for content extraction
  const contentSelectors = [
    // Article content
    'article .content, article .entry-content, article .post-content, .article-content, .entry-content, .post-content',
    // Generic content
    '.content p, .entry p, .post p, main p',
    // Specific site patterns
    '.article-body p, .story-body p, .post-body p',
    // Fallback to any paragraphs
    'article p, main p, .main p'
  ];

  let bestSelector = '';
  let maxParagraphs = 0;

  for (const selector of contentSelectors) {
    const elements = doc.querySelectorAll(selector);
    const paragraphs = Array.from(elements).filter(el =>
      el.textContent.trim().length > 100 // Substantial content
    );

    if (paragraphs.length > maxParagraphs) {
      maxParagraphs = paragraphs.length;
      bestSelector = selector;
    }
  }

  return bestSelector || 'article p, main p, .content p';
};

module.exports = { analyzeHtmlStructure, detectContentSelectors };