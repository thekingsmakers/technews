import React from 'react';
import NewsCard from './NewsCard.jsx';

export default function NewsGrid({ items }) {
  if (!items.length) {
    return <div className="empty">No news articles found. Try another search.</div>;
  }

  return (
    <div className="news-grid">
      {items.map((item) => (
        <NewsCard key={item.id} article={item} />
      ))}
    </div>
  );
}
