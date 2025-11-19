import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function ArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      document.title = `${article.title} – TechPulse`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute('content', article.summary || article.title);
      }
    }
  }, [article]);

  if (loading) {
    return <div className="loading">Loading article...</div>;
  }

  if (error) {
    return (
      <div className="empty">
        <p>{error}</p>
        <button className="pill" onClick={() => navigate('/')}>Go back home</button>
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

  return (
    <article className="article-page">
      <header className="article-header">
        <div className="article-meta">
          <span className="category">{article.category}</span>
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
    </article>
  );
}
