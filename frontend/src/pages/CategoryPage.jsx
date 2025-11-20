import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NewsCard from '../components/NewsCard.jsx';

export default function CategoryPage() {
  const { name } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Correct endpoint: /api/news?category=...
    fetch(`/api/news?category=${encodeURIComponent(name)}`)
      .then(res => res.json())
      .then(data => {
        // API returns { items: [...], ... }
        const items = Array.isArray(data) ? data : (data.items || []);
        setArticles(items);
      })
      .catch(err => console.error(`Error fetching category:${name}`, err))
      .finally(() => setLoading(false));
  }, [name]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center space-x-4 mb-8">
        <span className="px-4 py-2 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-bold text-xl capitalize">
          {name}
        </span>
        <h1 className="text-3xl font-display font-bold text-secondary-900 dark:text-white">
          Latest News
        </h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {articles.map(article => (
          <NewsCard key={article.slug} article={article} />
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12 text-secondary-500 dark:text-secondary-400">
          No articles found in this category.
        </div>
      )}
    </div>
  );
}
