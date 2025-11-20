import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NewsCard from '../components/NewsCard.jsx';

export default function CategoryPage() {
  const { name } = useParams();
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch(`/api/news/category/${name}`)
      .then(res => res.json())
      .then(data => setNews(data))
      .catch(err => console.error(`Error fetching news for category ${name}:`, err));
  }, [name]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Category: {name}</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {news.map(article => (
          <NewsCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  );
}
