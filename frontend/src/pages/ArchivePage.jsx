import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function ArchivePage() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch('/api/news/archive')
      .then(res => res.json())
      .then(data => setArticles(data))
      .catch(err => console.error('Error fetching archive:', err));
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">News Archive</h1>
      <div className="space-y-4">
        {articles.map(article => (
          <div key={article.slug} className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <Link 
              to={`/article/${article.slug}`}
              className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {article.title}
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {new Date(article.publishedAt).toLocaleDateString()} - {article.author}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
