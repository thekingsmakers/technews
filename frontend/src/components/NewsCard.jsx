import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon } from '@heroicons/react/outline';

export default function NewsCard({ article }) {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full group">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-secondary-800 dark:to-secondary-900 flex items-center justify-center">
            <span className="text-4xl">📰</span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-secondary-900/90 text-primary-600 dark:text-primary-400 backdrop-blur-sm shadow-sm">
            {article.category || 'Tech'}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center text-xs text-secondary-500 dark:text-secondary-400 mb-3 space-x-4">
          <div className="flex items-center">
            <CalendarIcon className="w-4 h-4 mr-1" />
            {formatDate(article.publishedAt)}
          </div>
          {article.source && (
            <span className="font-medium text-primary-600 dark:text-primary-400">
              {article.source}
            </span>
          )}
        </div>

        <Link to={`/article/${article.slug}`} className="block group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          <h3 className="text-xl font-display font-bold text-secondary-900 dark:text-white mb-3 line-clamp-2 leading-tight">
            {article.title}
          </h3>
        </Link>

        <p className="text-secondary-600 dark:text-secondary-300 text-sm mb-4 line-clamp-3 flex-grow leading-relaxed">
          {article.summary}
        </p>

        <div className="mt-auto pt-4 border-t border-secondary-100 dark:border-secondary-800 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {article.tags && article.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="text-xs text-secondary-500 dark:text-secondary-400 bg-secondary-100 dark:bg-secondary-800 px-2 py-1 rounded-md">
                #{tag}
              </span>
            ))}
          </div>

          <Link
            to={`/article/${article.slug}`}
            className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center transition-colors"
          >
            Read More
            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
