#!/usr/bin/env node
/**
 * Advanced JavaScript News Scraper for Dynamic Content
 * Uses Puppeteer/Playwright for SPAs and JavaScript-rendered sites
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class DynamicNewsScraper {
    constructor(options = {}) {
        this.options = {
            headless: options.headless !== false,
            userAgent: options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1920, height: 1080 },
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ],
            ...options
        };

        this.browser = null;
    }

    async initialize() {
        if (this.browser) {
            return this.browser;
        }

        this.browser = await puppeteer.launch({
            headless: this.options.headless,
            args: this.options.args
        });

        return this.browser;
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    async createStealthyPage() {
        const page = await this.browser.newPage();

        // Set viewport
        await page.setViewport(this.options.viewport);

        // Set user agent
        await page.setUserAgent(this.options.userAgent);

        // Add anti-detection measures
        await page.evaluateOnNewDocument(() => {
            // Override webdriver property
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

            // Mock plugins and languages
            Object.defineProperty(navigator, 'plugins', {
                get: () => [
                    { name: 'Chrome PDF Plugin', description: 'Portable Document Format', filename: 'internal-pdf-viewer' },
                    { name: 'Chrome PDF Viewer', description: '', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' }
                ]
            });

            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en']
            });

            // Mock permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
        });

        // Add random delays and mouse movements
        page.on('response', () => {
            // Add random delay between requests
            const delay = Math.random() * 1000 + 500;
            return new Promise(resolve => setTimeout(resolve, delay));
        });

        return page;
    }

    async scrapeArticleList(targetUrl, maxArticles = 10) {
        const browser = await this.initialize();
        const page = await this.createStealthyPage();

        try {
            console.log(`Navigating to ${targetUrl}...`);
            await page.goto(targetUrl, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // Wait for dynamic content to load
            await page.waitForTimeout(3000);

            // Scroll to load more content if needed
            await this.scrollToLoadMore(page);

            // Extract article data
            const articles = await page.evaluate((maxArticles) => {
                const articleSelectors = [
                    'article.post-block, .post-block',
                    'article.tease, .tease',
                    'article[data-analytics-link="article"], .c-entry-box',
                    'li.card-component, .card-component',
                    'article, .article, .post, .entry',
                    '.card, .news-item, .story'
                ];

                let articles = [];

                for (const selector of articleSelectors) {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0 && elements.length <= maxArticles * 3) {
                        articles = Array.from(elements).slice(0, maxArticles).map(element => {
                            // Extract title
                            const titleElem = element.querySelector('h1, h2, h3, .title, .headline');
                            const title = titleElem ? titleElem.textContent.trim() : '';

                            // Extract URL
                            const urlElem = element.querySelector('a[href]');
                            const url = urlElem ? urlElem.href : '';

                            // Extract summary
                            const summaryElem = element.querySelector('p, .summary, .excerpt, .description');
                            const summary = summaryElem ? summaryElem.textContent.trim() : '';

                            // Extract date
                            const dateElem = element.querySelector('time, .date, .published, [datetime]');
                            const publishedAt = dateElem ? (dateElem.getAttribute('datetime') || dateElem.textContent.trim()) : null;

                            // Extract image
                            const imgElem = element.querySelector('img');
                            const imageUrl = imgElem ? (imgElem.src || imgElem.getAttribute('data-src')) : null;

                            // Extract category
                            const catElem = element.querySelector('.category, .tag, .topic');
                            const category = catElem ? catElem.textContent.trim() : 'General';

                            return {
                                title,
                                url,
                                summary,
                                publishedAt,
                                imageUrl,
                                category
                            };
                        }).filter(article => article.title && article.url);

                        if (articles.length > 0) {
                            console.log(`Found ${articles.length} articles using selector: ${selector}`);
                            break;
                        }
                    }
                }

                return articles;
            }, maxArticles);

            console.log(`Successfully scraped ${articles.length} articles from ${targetUrl}`);
            return articles;

        } catch (error) {
            console.error(`Error scraping article list from ${targetUrl}:`, error);
            return [];
        } finally {
            await page.close();
        }
    }

    async scrapeFullArticle(articleUrl) {
        const browser = await this.initialize();
        const page = await this.createStealthyPage();

        try {
            console.log(`Scraping full article: ${articleUrl}`);
            await page.goto(articleUrl, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // Wait for dynamic content
            await page.waitForTimeout(2000);

            // Extract full content
            const content = await page.evaluate(() => {
                // Remove unwanted elements
                const unwantedSelectors = [
                    'script', 'style', 'nav', 'header', 'footer', 'aside',
                    '.ad', '.advertisement', '.sidebar', '.social-share',
                    '.related-articles', '.comments', '.newsletter-signup'
                ];

                unwantedSelectors.forEach(selector => {
                    document.querySelectorAll(selector).forEach(el => el.remove());
                });

                // Try multiple content extraction strategies
                const contentSelectors = [
                    'article .content, article .entry-content, article .post-content',
                    '.article-content, .entry-content, .post-content',
                    'article p, .article-body p, .post-body p',
                    'main article p, main .content p',
                    '.content p, .entry p'
                ];

                let bestContent = '';
                let maxParagraphs = 0;

                for (const selector of contentSelectors) {
                    const elements = document.querySelectorAll(selector);
                    const paragraphs = Array.from(elements)
                        .map(el => el.textContent.trim())
                        .filter(text => text.length > 50);

                    if (paragraphs.length > maxParagraphs) {
                        maxParagraphs = paragraphs.length;
                        bestContent = paragraphs.join('\\n\\n');
                    }
                }

                // Fallback to article element
                if (!bestContent) {
                    const article = document.querySelector('article');
                    if (article) {
                        const paragraphs = Array.from(article.querySelectorAll('p'))
                            .map(p => p.textContent.trim())
                            .filter(text => text.length > 50);
                        bestContent = paragraphs.join('\\n\\n');
                    }
                }

                return bestContent;
            });

            // Clean content
            const cleanedContent = content
                .replace(/\\s+/g, ' ')
                .replace(/Read more.*?$/gm, '')
                .replace(/Share this.*?$/gm, '')
                .trim();

            console.log(`Extracted ${cleanedContent.length} characters of content`);
            return cleanedContent || "Content not available";

        } catch (error) {
            console.error(`Error scraping full article ${articleUrl}:`, error);
            return "Content not available";
        } finally {
            await page.close();
        }
    }

    async scrollToLoadMore(page, maxScrolls = 3) {
        // Scroll to trigger lazy loading
        for (let i = 0; i < maxScrolls; i++) {
            await page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });
            await page.waitForTimeout(1000);
        }
    }

    async batchScrapeArticles(targetUrl, maxArticles = 10) {
        console.log(`Starting batch scraping for ${targetUrl}`);

        try {
            // Step 1: Get article list
            const articles = await this.scrapeArticleList(targetUrl, maxArticles);

            if (!articles || articles.length === 0) {
                console.warn('No articles found');
                return [];
            }

            // Step 2: Scrape full content for each article
            for (let i = 0; i < articles.length; i++) {
                const article = articles[i];
                console.log(`Processing article ${i + 1}/${articles.length}: ${article.title.substring(0, 50)}...`);

                try {
                    article.content = await this.scrapeFullArticle(article.url);

                    // Generate slug
                    article.slug = article.title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');

                    // Add metadata
                    article.tags = ['news', article.category.toLowerCase().replace(/ /g, '-'), new URL(targetUrl).hostname];
                    article.source = new URL(targetUrl).hostname;

                } catch (error) {
                    console.error(`Failed to scrape article ${article.url}:`, error);
                    article.content = "Content not available";
                }
            }

            console.log(`Batch scraping completed. Processed ${articles.length} articles.`);
            return articles;

        } catch (error) {
            console.error(`Error in batch scraping for ${targetUrl}:`, error);
            return [];
        }
    }
}

// CLI usage
async function main() {
    const scraper = new DynamicNewsScraper();

    try {
        const targetUrl = process.argv[2] || 'https://techcrunch.com';
        const maxArticles = parseInt(process.argv[3]) || 5;

        console.log(`Scraping ${maxArticles} articles from ${targetUrl}`);

        const articles = await scraper.batchScrapeArticles(targetUrl, maxArticles);

        // Output as JSON
        console.log(JSON.stringify(articles, null, 2));

    } catch (error) {
        console.error('Scraping failed:', error);
        process.exit(1);
    } finally {
        await scraper.close();
    }
}

if (require.main === module) {
    main();
}

module.exports = DynamicNewsScraper;