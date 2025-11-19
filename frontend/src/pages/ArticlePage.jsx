import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import NewsCard from '../components/NewsCard.jsx';
import { API_BASE_URL } from '../config.js';

const API_BASE = API_BASE_URL;
const getSiteOrigin = () =>
  (typeof window !== 'undefined' && window.location?.origin) || 'https://thekingsmaker.org';

export default function ArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/news/${slug}`, {
          signal: controller.signal
        });
        if (res.status === 404) {
          setError('Article not found');
          setArticle(null);
          return;
        }
        const data = await res.json();
        setArticle(data.item);
        setError(null);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to load article', err);
          setError('Failed to load article');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    if (article) {
      document.title = `${article.title} – TheKingsmaker Tech News`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute('content', article.summary || article.title);
      }
    }
  }, [article]);

  useEffect(() => {
    if (!article || !(article.tags && article.tags.length)) {
      setRelated([]);
      return;
    }
    const controller = new AbortController();
    const fetchRelated = async () => {
      try {
        const params = new URLSearchParams();
        params.append('tag', article.tags[0]);
        params.append('pageSize', '4');
        const res = await fetch(`${API_BASE}/api/news?${params.toString()}`, {
          signal: controller.signal
        });
        const data = await res.json();
        const items = (data.items || []).filter((item) => item.slug !== article.slug);
        setRelated(items);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to load related articles', err);
        }
      }
    };
    fetchRelated();
    return () => controller.abort();
  }, [article]);

  const resetCopied = () => setCopied(false);
  useEffect(() => {
    resetCopied();
  }, [slug]);

  if (loading) {
    return <div className="loading">Loading article...</div>;
  }

  if (error || !article) {
    return (
      <div className="empty">
        <p>{error || 'Article not found'}</p>
        <button className="pill" onClick={() => navigate('/')}>
          Go back home
        </button>
      </div>
    );
  }

  const date = new Date(article.publishedAt);
  const formatted = date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const readingTime = Math.max(
    1,
    Math.round((article.content || '').split(/\s+/).filter(Boolean).length / 220)
  );
  const siteOrigin = getSiteOrigin();
  const shareUrl = `${siteOrigin}/article/${article.slug}`;
  const categoryLink = `/category/${encodeURIComponent(article.category || 'General')}`;
  const rssUrl = `${siteOrigin}/rss.xml`;

  const copyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard unavailable', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url: shareUrl });
        return;
      } catch (err) {
        console.warn('Share failed, falling back to copy', err);
      }
    }
    copyLink();
  };

  return (
    <article className="article-page">
      <div className="article-layout">
        <div className="article-body">
          <header className="article-header">
            <div className="article-meta">
              <Link className="category-link" to={categoryLink}>
                {article.category}
              </Link>
              <span className="date">{formatted}</span>
            </div>
            <h1>{article.title}</h1>
            {article.summary && <p className="article-summary">{article.summary}</p>}
            <div className="tags">
              {(article.tags || []).map((tag) => (
                <span key={tag} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="source">Source: {article.source}</div>
          </header>

          {article.imageUrl && (
            <div className="article-hero-image">
              <img src={article.imageUrl} alt={article.title} />
            </div>
          )}

          <section className="article-content">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </section>

          {related.length > 0 && (
            <section className="related-section">
              <h2 className="section-heading">Related reads</h2>
              <div className="news-grid">
                {related.map((item, idx) => (
                  <NewsCard
                    key={item.id || item.slug}
                    article={item}
                    layout={idx === 0 ? 'highlight' : 'standard'}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="article-sidebar">
          <div className="article-meta-panel">
            <div>
              <span>Published</span>
              <p>{formatted}</p>
            </div>
            <div>
              <span>Reading time</span>
              <p>{readingTime} min</p>
            </div>
            <div>
              <span>Category</span>
              <Link to={categoryLink}>{article.category || 'General'}</Link>
            </div>
          </div>
          <div className="article-actions">
            <button type="button" onClick={handleShare}>
              Share article
            </button>
            <button type="button" onClick={copyLink}>
              {copied ? 'Link copied!' : 'Copy link'}
            </button>
            <a href={rssUrl} target="_blank" rel="noreferrer">
              Subscribe via RSS
            </a>
            <Link to="/archive">Explore archive</Link>
          </div>
        </aside>
      </div>
    </article>
  );
}
