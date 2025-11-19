import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config.js';

const API_BASE = API_BASE_URL;

const formatMonth = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, { month: 'long', year: 'numeric' });
};

export default function ArchivePage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/news?page=1&pageSize=200`, {
          signal: controller.signal
        });
        const data = await res.json();
        setNews(data.items || []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to load archive', error);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    document.title = 'Archive – TheKingsmaker Tech News';
  }, []);

  const grouped = useMemo(() => {
    return news.reduce((acc, item) => {
      const bucket = formatMonth(item.publishedAt || item.createdAt);
      if (!acc[bucket]) acc[bucket] = [];
      acc[bucket].push(item);
      return acc;
    }, {});
  }, [news]);

  const months = Object.keys(grouped);
  const feedUrl = `${API_BASE}/rss.xml`;

  return (
    <section className="archive-page">
      <header className="archive-header">
        <div>
          <p className="eyebrow">Knowledge archive</p>
          <h1>Every royal briefing, indexed.</h1>
          <p>
            Browse the complete stream of automation-ingested stories. Subscribe via RSS or deep
            dive into categories that matter.
          </p>
        </div>
        <div className="archive-actions">
          <a className="primary-btn" href={feedUrl} target="_blank" rel="noreferrer">
            Subscribe via RSS
          </a>
          <Link className="secondary-btn" to="/">
            Back to live feed
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="loading">Building royal archive…</div>
      ) : (
        <div className="timeline">
          {months.map((month) => (
            <article key={month} className="timeline-month">
              <div className="timeline-month-header">
                <h2>{month}</h2>
                <span>{grouped[month].length} stories</span>
              </div>
              <ul>
                {grouped[month].map((item) => (
                  <li key={item.id || item.slug}>
                    <div>
                      <time dateTime={item.publishedAt}>
                        {new Date(item.publishedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </time>
                      <Link to={`/article/${item.slug}`}>{item.title}</Link>
                    </div>
                    <Link
                      className="timeline-category"
                      to={`/category/${encodeURIComponent(item.category || 'General')}`}
                    >
                      {item.category || 'General'}
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

