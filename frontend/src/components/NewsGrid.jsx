import React from 'react';
import NewsCard from './NewsCard.jsx';

export default function NewsGrid({ items }) {
  if (!items.length) {
    return <div className="empty">No news articles found. Try another search.</div>;
  }

  return (
    <div className="news-grid">
      {items.map((item, index) => {
        const layout = index === 0 ? 'headline' : index < 3 ? 'highlight' : 'standard';
        return <NewsCard key={item.id || item.slug} article={item} layout={layout} />;
      })}
    </div>
  );
}
