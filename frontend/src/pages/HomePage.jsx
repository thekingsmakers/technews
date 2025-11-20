import React, { useEffect, useState } from 'react';
import NewsCard from '../components/NewsCard.jsx';

export default function HomePage() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => setNews(data))
      .catch(err => console.error("Error fetching news:", err));
  }, []);

  return (
    <div>
      <div className="bg-indigo-600 dark:bg-indigo-800 rounded-lg shadow-lg p-8 md:p-12 mb-12 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Welcome to KingsNews</h1>
        <p className="text-lg md:text-xl">Your trusted source for the latest news and analysis.</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {news.map(article => (
          <NewsCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  );
}
