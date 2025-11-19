import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NewsGrid from '../components/NewsGrid.jsx';
import CategoryFilter from '../components/CategoryFilter.jsx';
import TagFilter from '../components/TagFilter.jsx';
import { API_BASE_URL } from '../config.js';

const API_BASE = API_BASE_URL;

export default function HomePage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const fetchNews = async (reset = false) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (tag) params.append('tag', tag);
        if (search) params.append('q', search);
        params.append('page', String(reset ? 1 : page));
        params.append('pageSize', String(pageSize));

        const res = await fetch(`${API_BASE}/api/news?${params.toString()}`, {
          signal: controller.signal
        });
        const data = await res.json();
        const items = data.items || [];
        if (reset || page === 1) {
          setNews(items);
        } else {
          setNews((prev) => [...prev, ...items]);
        }
        const totalPages = data.totalPages || 1;
        const currentPage = data.page || 1;
        setHasMore(currentPage < totalPages);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to load news', err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchNews(page === 1);
    return () => controller.abort();
  }, [category, tag, search, page, pageSize]);

  useEffect(() => {
    document.title = 'TheKingsmaker Tech News – AI, Cloud, Security & Automation';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'TheKingsmaker Tech News blends Cloudflare-tunneled delivery with n8n automation to stream elite briefings on AI, cloud, cybersecurity, devices, and dev tools.'
      );
    }
  }, []);

  const categories = [...new Set(news.map((n) => n.category).filter(Boolean))];
  const tags = [
    ...new Set(
      news
        .flatMap((n) => n.tags || [])
        .map((t) => t.trim())
        .filter(Boolean)
    )
  ];

  const featured = news.filter((n) => n.featured);
  const regular = news.filter((n) => !n.featured);

  const handleFilterChange = (type, value) => {
    if (type === 'category') {
      setCategory(value);
    } else if (type === 'tag') {
      setTag(value);
    }
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleLoadMore = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const scrollToLatest = () => {
    const el = document.getElementById('latest-feed');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const stats = [
    { label: 'Stories tracked', value: news.length.toString().padStart(2, '0') },
    { label: 'Live categories', value: categories.length.toString().padStart(2, '0') },
    { label: 'Active tags', value: tags.length.toString().padStart(2, '0') }
  ];
  const categorySpotlight = categories.slice(0, 4);
  const categoryClusters = categorySpotlight.map((name) => ({
    name,
    items: news.filter((item) => item.category === name).slice(0, 2)
  }));

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-copy">
            <p className="eyebrow">Cloudflare tunneled · Automation ready</p>
            <h1>
              Royal briefings for
              <br />
              modern builders.
            </h1>
            <p className="lead">
              Every signal that matters across AI, cloud, security, devices, and dev tools—sourced
              by automation, curated by humans, delivered with regal polish.
            </p>
            <div className="hero-actions">
              <button
                type="button"
                className="primary-btn"
                onClick={() => handleFilterChange('category', 'AI')}
              >
                Explore AI Pulse
              </button>
              <button type="button" className="secondary-btn" onClick={scrollToLatest}>
                Jump to latest feed
              </button>
              <Link className="ghost-btn" to="/archive">
                Browse archive →
              </Link>
            </div>
            <div className="hero-stats">
              {stats.map((stat) => (
                <article key={stat.label} className="stat-card">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </article>
              ))}
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-glow" />
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="hero-widget">
              <p>Automation stack</p>
              <ul>
                <li>n8n <span>ingest</span></li>
                <li>Cloudflare <span>edge</span></li>
                <li>Express <span>API</span></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="hero-search">
          <input
            className="search-input"
            placeholder="Search breaking tech stories..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <div className="search-hint">
            <span className="pill soft">Trending</span>
            <span>AI safety · Sovereign cloud · Post-quantum security</span>
          </div>
        </div>
      </section>

      <section className="filters">
        <CategoryFilter
          categories={categories}
          active={category}
          setActive={(value) => handleFilterChange('category', value)}
        />
        <TagFilter
          tags={tags}
          active={tag}
          setActive={(value) => handleFilterChange('tag', value)}
        />
      </section>

      {categoryClusters.length > 0 && (
        <section className="category-showcase" aria-label="Category spotlights">
          {categoryClusters.map(({ name, items }) => (
            <article key={name} className="category-card">
              <p className="category-overline">Category</p>
              <h3>{name}</h3>
              <p>Deep coverage powered by automation, tailored to communities that run on {name}.</p>
              <ul className="category-card-list">
                {items.length ? (
                  items.map((item) => (
                    <li key={item.id || item.slug}>
                      <Link to={`/article/${item.slug}`}>{item.title}</Link>
                      <time dateTime={item.publishedAt}>
                        {new Date(item.publishedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </time>
                    </li>
                  ))
                ) : (
                  <li className="category-card-empty">Automation is fetching fresh stories…</li>
                )}
              </ul>
              <Link to={`/category/${encodeURIComponent(name)}`}>Open {name} page</Link>
            </article>
          ))}
          <article className="category-card archive-card">
            <p className="category-overline">Archive</p>
            <h3>Complete RSS + JS archive</h3>
            <p>Jump into the chronological timeline or subscribe to the live RSS feed.</p>
            <Link to="/archive">View archive</Link>
          </article>
        </section>
      )}

      {featured.length > 0 && (
        <section className="featured-section" aria-label="Featured headlines">
          <h2 className="section-heading">Featured</h2>
          <NewsGrid items={featured} />
        </section>
      )}

      <section className="content-section" id="latest-feed" aria-label="All news">
        {loading ? (
          <div className="loading">Loading latest headlines...</div>
        ) : (
          <NewsGrid items={regular.length ? regular : news} />
        )}
        {!loading && hasMore && (
          <div className="load-more">
            <button className="pill" onClick={handleLoadMore}>
              Load more
            </button>
          </div>
        )}
      </section>
    </>
  );
}
