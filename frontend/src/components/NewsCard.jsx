import React from 'react';
import { Link } from 'react-router-dom';

export default function NewsCard({ article }) {
  const date = new Date(article.publishedAt);
  const formatted = date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <article className={`news-card ${article.featured ? 'featured' : ''}`}>
      <Link to={`/article/${article.slug}`} className="news-card-link">
        {article.imageUrl && (
          <div className="news-card-image">
            <img src={article.imageUrl} alt={article.title} />
          </div>
        )}
        <div className="news-card-body">
        <div className="news-card-meta">
          <span className="category">{article.category}</span>
          <span className="date">{formatted}</span>
        </div>
        <h2>{article.title}</h2>
        <p className="summary">{article.summary}</p>
        <div className="tags">
          {(article.tags || []).map((tag) => (
            <span key={tag} className="tag">
              #{tag}
            </span>
          ))}
        </div>
          <div className="source">Source: {article.source}</div>
        </div>
      </Link>
    </article>
  );
}
