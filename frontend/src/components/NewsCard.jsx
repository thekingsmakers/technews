import React from 'react';
import { Link } from 'react-router-dom';

export default function NewsCard({ article }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {article.imageUrl && (
        <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover" />
      )}
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{article.title}</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">{article.description}</p>
        <div className="flex items-center justify-between">
          <Link 
            to={`/article/${article.slug}`}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Read More
          </Link>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(article.publishedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
