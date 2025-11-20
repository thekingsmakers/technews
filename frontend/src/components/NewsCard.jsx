import React from 'react';
import { Link } from 'react-router-dom';

export default function NewsCard({ article }) {
  if (!article) return null;

  const { title, description, url, source, imageUrl, publishedAt, category, slug } = article;

  // Fallback image if imageUrl is not provided
  const displayImage = imageUrl || `https://source.unsplash.com/random/400x200?sig=${Math.random()}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link to={`/article/${slug}`}>
        <img className="w-full h-48 object-cover" src={displayImage} alt={title} />
      </Link>
      <div className="p-6">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Link to={`/category/${category}`} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            {category}
          </Link>
          <span>{new Date(publishedAt).toLocaleDateString()}</span>
        </div>
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
          <Link to={`/article/${slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
            {title}
          </Link>
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {description}
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Source: {source}
        </div>
      </div>
    </div>
  );
}
