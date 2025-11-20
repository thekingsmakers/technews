import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Archive as ArchiveIcon, ChevronDown, ChevronUp } from 'lucide-react';

export default function ArchivePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedArticles, setGroupedArticles] = useState({});
  const [expandedMonths, setExpandedMonths] = useState(new Set());

  useEffect(() => {
    const fetchArchive = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/news/archive');
        const data = await response.json();

        // Group articles by year and month
        const grouped = data.reduce((acc, article) => {
          const date = new Date(article.publishedAt);
          const year = date.getFullYear();
          const month = date.toLocaleString('default', { month: 'long' });

          if (!acc[year]) acc[year] = {};
          if (!acc[year][month]) acc[year][month] = [];
          acc[year][month].push(article);

          return acc;
        }, {});

        setGroupedArticles(grouped);

        // Auto-expand current month
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
        if (grouped[currentYear]?.[currentMonth]) {
          setExpandedMonths(new Set([`${currentYear}-${currentMonth}`]));
        }

        setArticles(data);
      } catch (err) {
        console.error('Error fetching archive:', err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArchive();
  }, []);

  const toggleMonth = (year, month) => {
    const key = `${year}-${month}`;
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedMonths(newExpanded);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-xl p-8 mb-8 text-white"
      >
        <div className="flex items-center space-x-3 mb-4">
          <ArchiveIcon className="w-8 h-8 text-blue-400" />
          <h1 className="text-4xl font-bold">News Archive</h1>
        </div>
        <p className="text-gray-300 text-lg">
          Browse through our complete collection of articles, organized by date.
          Discover the stories that shaped the tech landscape.
        </p>
        <div className="mt-6 flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{articles.length} articles archived</span>
          </div>
        </div>
      </motion.div>

      {/* Archive Content */}
      {Object.keys(groupedArticles).length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
        >
          <ArchiveIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Archived Articles</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Articles will appear here once they exceed the active article limit.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedArticles)
            .sort((a, b) => b - a) // Sort years descending
            .map(year => (
              <motion.div
                key={year}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Year Header */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <span>{year}</span>
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                      ({Object.values(groupedArticles[year]).flat().length} articles)
                    </span>
                  </h2>
                </div>

                {/* Month Groups */}
                <div className="space-y-3">
                  {Object.keys(groupedArticles[year])
                    .sort((a, b) => {
                      const months = ['January', 'February', 'March', 'April', 'May', 'June',
                                    'July', 'August', 'September', 'October', 'November', 'December'];
                      return months.indexOf(b) - months.indexOf(a);
                    })
                    .map(month => {
                      const monthArticles = groupedArticles[year][month];
                      const isExpanded = expandedMonths.has(`${year}-${month}`);

                      return (
                        <motion.div
                          key={`${year}-${month}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                        >
                          {/* Month Header */}
                          <button
                            onClick={() => toggleMonth(year, month)}
                            className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {month} {year}
                              </h3>
                              <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                {monthArticles.length} article{monthArticles.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </button>

                          {/* Articles List */}
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-t border-gray-200 dark:border-gray-700"
                            >
                              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {monthArticles.map(article => (
                                  <motion.div
                                    key={article.slug}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    <div className="flex items-start space-x-4">
                                      {article.imageUrl && (
                                        <img
                                          src={article.imageUrl}
                                          alt={article.title}
                                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                        />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <Link
                                          to={`/article/${article.slug}`}
                                          className="block text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 mb-2 line-clamp-2"
                                        >
                                          {article.title}
                                        </Link>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                                          {article.author && <span>By {article.author}</span>}
                                          {article.category && (
                                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                                              {article.category}
                                            </span>
                                          )}
                                        </div>
                                        {article.summary && (
                                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                                            {article.summary}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                </div>
              </motion.div>
            ))}
        </div>
      )}
    </motion.div>
  );
}
