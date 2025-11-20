import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, User, ArrowRight } from 'lucide-react';

export default function NewsCard({ article, featured = false }) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const hoverVariants = {
    scale: 1.02,
    transition: { duration: 0.2 }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={hoverVariants}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 ${featured ? 'md:col-span-2' : ''}`}
    >
      {article.imageUrl && (
        <div className="relative overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className={`w-full object-cover transition-transform duration-300 hover:scale-105 ${featured ? 'h-64 md:h-80' : 'h-48'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {article.category && (
            <span className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {article.category}
            </span>
          )}
        </div>
      )}

      <div className={`p-6 ${featured ? 'md:p-8' : ''}`}>
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          </div>
          {article.author && (
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
          )}
        </div>

        <h2 className={`font-bold text-gray-900 dark:text-white mb-3 leading-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${featured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
          <Link to={`/article/${article.slug}`}>
            {article.title}
          </Link>
        </h2>

        {article.summary && (
          <p className={`text-gray-700 dark:text-gray-300 mb-4 leading-relaxed ${featured ? 'text-base md:text-lg' : 'text-sm md:text-base'}`}>
            {article.summary.length > 150 ? `${article.summary.substring(0, 150)}...` : article.summary}
          </p>
        )}

        <div className="flex items-center justify-between">
          <Link
            to={`/article/${article.slug}`}
            className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors group"
          >
            <span>Read More</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
