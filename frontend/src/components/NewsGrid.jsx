import React from 'react';
import NewsCard from './NewsCard.jsx';

const NewsGrid = ({ news, items }) => {
  const articles = news || items || [];

  if (!articles.length) {
    return <div className="empty">No articles found.</div>;
  }

  return (
    <div className="news-grid">
      {articles.map((article) => (
        <NewsCard key={article.id || article.slug} article={article} />
      ))}
    </div>
  );
};

export default NewsGrid;
