import React, { useEffect, useState } from 'react';
import NewsGrid from '../components/NewsGrid.jsx';
import CategoryFilter from '../components/CategoryFilter.jsx';
import TagFilter from '../components/TagFilter.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

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
    document.title = 'TechPulse – Global Tech News & AI, Cloud, Security';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'TechPulse delivers real-time news on AI, cloud, security, devices, and developer tools – automated by n8n, curated for humans.'
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

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>Global Tech News</h1>
          <p>
            Real-time updates on AI, cloud, security, devices, and developer tools.
            Powered by automation, curated for humans.
          </p>
          <input
            className="search-input"
            placeholder="Search breaking tech stories..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
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

      {featured.length > 0 && (
        <section className="featured-section" aria-label="Featured headlines">
          <h2 className="section-heading">Featured</h2>
          <NewsGrid items={featured} />
        </section>
      )}

      <section className="content-section" aria-label="All news">
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
