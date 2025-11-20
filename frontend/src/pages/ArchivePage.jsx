import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, ArchiveIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';

export default function ArchivePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedArticles, setGroupedArticles] = useState({});
  const [expandedMonths, setExpandedMonths] = useState(new Set());

  useEffect(() => {
    const fetchArchive = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/news');
        // Note: Ideally we should have a dedicated archive endpoint or fetch all news
        // For now, we'll use the main news endpoint which returns all news
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
        <div className="glass rounded-2xl shadow-lg p-8 mb-8 animate-pulse">
          <div className="h-8 bg-secondary-200 dark:bg-secondary-700 rounded mb-4 w-1/3"></div>
          <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-1/4"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-6 bg-secondary-200 dark:bg-secondary-700 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2"></div>
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
      className="max-w-4xl mx-auto animate-fade-in"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-secondary-900 to-secondary-800 rounded-3xl shadow-xl p-8 md:p-12 mb-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <ArchiveIcon className="w-8 h-8 text-primary-300" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold">News Archive</h1>
          </div>
          <p className="text-secondary-200 text-lg max-w-2xl leading-relaxed">
            Browse through our complete collection of articles, organized by date.
            Discover the stories that shaped the tech landscape.
          </p>
          <div className="mt-8 flex items-center space-x-2 text-sm text-secondary-300 font-medium bg-white/5 inline-flex px-4 py-2 rounded-full">
            <CalendarIcon className="w-5 h-5" />
            <span>{articles.length} articles archived</span>
          </div>
        </div>
      </div>

      {/* Archive Content */}
      {Object.keys(groupedArticles).length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl shadow-lg">
          <ArchiveIcon className="w-16 h-16 mx-auto text-secondary-400 mb-4" />
          <h3 className="text-xl font-medium text-secondary-900 dark:text-white mb-2">No Archived Articles</h3>
          <p className="text-secondary-600 dark:text-secondary-400">
            Articles will appear here once they are published.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
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
                <div className="flex items-center space-x-4 mb-6 ml-4">
                  <h2 className="text-3xl font-display font-bold text-secondary-900 dark:text-white flex items-center">
                    {year}
                  </h2>
                  <span className="h-px flex-grow bg-secondary-200 dark:bg-secondary-800"></span>
                  <span className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                    {Object.values(groupedArticles[year]).flat().length} articles
                  </span>
                </div>

                {/* Month Groups */}
                <div className="space-y-4">
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
                        <div
                          key={`${year}-${month}`}
                          className="glass-card rounded-xl overflow-hidden transition-all duration-300"
                        >
                          {/* Month Header */}
                          <button
                            onClick={() => toggleMonth(year, month)}
                            className="w-full p-6 text-left hover:bg-secondary-50/50 dark:hover:bg-secondary-800/50 transition-colors flex items-center justify-between group"
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-500 dark:text-secondary-400'}`}>
                                <CalendarIcon className="w-6 h-6" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                  {month}
                                </h3>
                                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                                  {monthArticles.length} article{monthArticles.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronUpIcon className="w-5 h-5 text-secondary-400" />
                            ) : (
                              <ChevronDownIcon className="w-5 h-5 text-secondary-400" />
                            )}
                          </button>

                          {/* Articles List */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t border-secondary-100 dark:border-secondary-800"
                              >
                                <div className="divide-y divide-secondary-100 dark:divide-secondary-800">
                                  {monthArticles.map(article => (
                                    <motion.div
                                      key={article.slug}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      className="p-6 hover:bg-secondary-50/50 dark:hover:bg-secondary-800/50 transition-colors group"
                                    >
                                      <div className="flex flex-col md:flex-row gap-6">
                                        {article.imageUrl && (
                                          <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                              src={article.imageUrl}
                                              alt={article.title}
                                              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                            />
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-3 mb-2">
                                            <span className="text-sm text-secondary-500 dark:text-secondary-400 flex items-center">
                                              {new Date(article.publishedAt).toLocaleDateString()}
                                            </span>
                                            {article.category && (
                                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-800">
                                                {article.category}
                                              </span>
                                            )}
                                          </div>
                                          <Link
                                            to={`/article/${article.slug}`}
                                            className="block text-xl font-bold text-secondary-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 mb-3 transition-colors"
                                          >
                                            {article.title}
                                          </Link>
                                          {article.summary && (
                                            <p className="text-secondary-600 dark:text-secondary-300 text-sm line-clamp-2 leading-relaxed">
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
                          </AnimatePresence>
                        </div>
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
