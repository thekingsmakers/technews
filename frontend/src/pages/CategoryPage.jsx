import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import NewsCard from '../components/NewsCard.jsx';
import { API_BASE_URL } from '../config.js';

const API_BASE = API_BASE_URL;

const CATEGORY_DESCRIPTIONS = {
  AI: 'Tracking the frontier of artificial intelligence, multimodal models, and responsible adoption.',
  Cloud: 'Infrastructure, platforms, and sovereign-cloud decisions powering modern builders.',
  Security: 'Threat intelligence, zero-day tracking, and resilience strategies for defenders.',
  Automation: 'Workflow orchestration, n8n pipelines, and DevOps rituals that keep teams shipping.',
  Devices: 'Hardware, silicon, and next-gen devices from fabs to field deployment.'
};

const getSiteOrigin = () =>
  (typeof window !== 'undefined' && window.location?.origin) || 'https://thekingsmaker.org';

export default function CategoryPage() {
  const { name } = useParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchNews = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('category', name);
        params.append('page', '1');
        params.append('pageSize', '60');

        const res = await fetch(`${API_BASE}/api/news?${params.toString()}`, {
          signal: controller.signal
        });
        const data = await res.json();
        setNews(data.items || []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to load category news', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    return () => controller.abort();
  }, [name]);

  useEffect(() => {
    document.title = `${name} – TheKingsmaker Tech News`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        `TheKingsmaker Tech News · ${name} highlights spanning AI, cloud, security, automation, and dev tools.`
      );
    }
  }, [name]);

  const [highlight, stream, quickReads] = useMemo(() => {
    if (!news.length) return [null, [], []];
    return [news[0], news.slice(1, 7), news.slice(7)];
  }, [news]);

  const description =
    CATEGORY_DESCRIPTIONS[name] ||
    'Fresh intelligence curated by automation and human editors for builders who live in this discipline.';
  const rssUrl = `${getSiteOrigin()}/rss.xml`;

  return (
    <section className="category-page">
      <div className="category-hero">
        <div>
          <p className="eyebrow">Category briefing</p>
          <h1>{name}</h1>
          <p>{description}</p>
        </div>
        <div className="category-hero-actions">
          <a className="primary-btn" href={rssUrl} target="_blank" rel="noreferrer">
            Subscribe RSS
          </a>
          <Link className="secondary-btn" to="/archive">
            Browse archive
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading category…</div>
      ) : !news.length ? (
        <div className="empty">No stories published yet for {name}. Check back soon.</div>
      ) : (
        <>
          {highlight && (
            <div className="category-highlight">
              <NewsCard article={highlight} layout="headline" />
            </div>
          )}

          <div className="category-secondary">
            <div className="category-stream">
              {stream.map((item, index) => (
                <NewsCard
                  key={item.id || item.slug}
                  article={item}
                  layout={index < 2 ? 'highlight' : 'standard'}
                />
              ))}
            </div>
            <aside className="category-list">
              <h3>Quick reads</h3>
              <ul>
                {quickReads.map((item) => (
                  <li key={item.id || item.slug}>
                    <Link to={`/article/${item.slug}`}>{item.title}</Link>
                    <time dateTime={item.publishedAt}>
                      {new Date(item.publishedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </time>
                  </li>
                ))}
              </ul>
              <a className="rss-link" href={rssUrl} target="_blank" rel="noreferrer">
                Follow all {name} stories via RSS →
              </a>
            </aside>
          </div>
        </>
      )}
    </section>
  );
}
