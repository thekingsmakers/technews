import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewsCard({ article, layout = 'standard' }) {
  const navigate = useNavigate();
  const date = new Date(article.publishedAt);
  const formatted = date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const category = article.category || 'General';
  const layoutClass = `news-card ${article.featured ? 'featured' : ''} news-card-${layout}`;

  const goToArticle = () => navigate(`/article/${article.slug}`);
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goToArticle();
    }
  };
  const goToCategory = (event, value) => {
    event.stopPropagation();
    navigate(`/category/${encodeURIComponent(value)}`);
  };

  return (
    <article
      className={layoutClass}
      role="button"
      onClick={goToArticle}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`Read article ${article.title}`}
    >
      {article.imageUrl && (
        <div className="news-card-image">
          <img src={article.imageUrl} alt={article.title} loading="lazy" />
        </div>
      )}
      <div className="news-card-body">
        <div className="news-card-meta">
          <button
            type="button"
            className="category-link"
            onClick={(event) => goToCategory(event, category)}
          >
            {category}
          </button>
          <span className="date">{formatted}</span>
        </div>
        <h2>{article.title}</h2>
        <p className="summary">{article.summary}</p>
        <div className="tags">
          {(article.tags || []).map((tag) => (
            <button
              type="button"
              key={tag}
              className="tag"
              onClick={(event) => goToCategory(event, tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
        <div className="source">Source: {article.source}</div>
      </div>
    </article>
  );
}
