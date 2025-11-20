import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import NewsCard from '../components/NewsCard.jsx';
import { TrendingUp, Clock, Filter, Search } from 'lucide-react';

export default function HomePage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('q', searchQuery);

        const response = await fetch(`/api/news?${params.toString()}`);
        const data = await response.json();
        setNews(data.items || []);
      } catch (err) {
        console.error("Error fetching news:", err);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [searchQuery]);

  const featuredArticle = news[0];
  const regularArticles = news.slice(1);

  if (loading) {
    return (
      <div className="space-y-12">
        {/* Hero Skeleton */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-12 md:p-16 animate-pulse">
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-16 bg-white/20 rounded mb-6 w-3/4 mx-auto"></div>
            <div className="h-6 bg-white/20 rounded mb-8 w-1/2 mx-auto"></div>
            <div className="h-12 bg-white/20 rounded w-48 mx-auto"></div>
          </div>
        </div>

        {/* Articles Skeleton */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
              <div className="p-6">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
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
      className="space-y-12"
    >
      {/* Hero Section */}
      {featuredArticle && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-white"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="w-6 h-6" />
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    Featured Story
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  {featuredArticle.title}
                </h1>
                <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                  {featuredArticle.summary || 'Stay ahead with the latest technology insights and industry analysis.'}
                </p>
                <div className="flex items-center space-x-6 text-sm text-blue-100 mb-8">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(featuredArticle.publishedAt).toLocaleDateString()}</span>
                  </div>
                  {featuredArticle.author && (
                    <span>By {featuredArticle.author}</span>
                  )}
                </div>
                <a
                  href={`/article/${featuredArticle.slug}`}
                  className="inline-flex items-center space-x-3 bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <span>Read Full Story</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </motion.div>

              {featuredArticle.imageUrl && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="relative"
                >
                  <img
                    src={featuredArticle.imageUrl}
                    alt={featuredArticle.title}
                    className="w-full h-80 md:h-96 object-cover rounded-2xl shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>
      )}

      {/* Search Results Header */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center space-x-3">
            <Search className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                Search Results for "{searchQuery}"
              </h2>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Found {news.length} article{news.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* News Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
            <span>Latest News</span>
            <div className="w-12 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <Filter className="w-4 h-4" />
            <span>{news.length} articles</span>
          </div>
        </div>

        {news.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-2xl"
          >
            <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No articles found' : 'No articles available'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new content'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {regularArticles.map((article, index) => (
              <motion.div
                key={article.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                layout
              >
                <NewsCard article={article} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>

      {/* Newsletter Signup */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-xl p-8 md:p-12 text-center text-white"
      >
        <h3 className="text-3xl font-bold mb-4">Stay Updated</h3>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Get the latest tech news and insights delivered straight to your inbox.
        </p>
        <div className="max-w-md mx-auto flex space-x-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors">
            Subscribe
          </button>
        </div>
      </motion.section>
    </motion.div>
  );
}
