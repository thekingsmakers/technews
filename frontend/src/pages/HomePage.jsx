import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import NewsCard from '../components/NewsCard';

export default function HomePage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const searchParams = new URLSearchParams(location.search);
        const query = searchParams.get('q');
        const url = query
          ? `/api/news?q=${encodeURIComponent(query)}`
          : '/api/news';

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        // API returns { items: [...], ... } or just [...] depending on endpoint, 
        // but /api/news returns { items: ... }
        const items = Array.isArray(data) ? data : (data.items || []);
        setNews(items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [location.search]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-xl mb-4">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const featuredNews = news[0];
  const recentNews = news.slice(1);

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Section */}
      {!location.search && featuredNews && (
        <section className="relative rounded-3xl overflow-hidden shadow-2xl group">
          <div className="absolute inset-0 bg-gradient-to-t from-secondary-900 via-secondary-900/60 to-transparent z-10" />

          {featuredNews.imageUrl ? (
            <img
              src={featuredNews.imageUrl}
              alt={featuredNews.title}
              className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-[500px] bg-gradient-to-br from-primary-900 to-secondary-900" />
          )}

          <div className="absolute bottom-0 left-0 right-0 z-20 p-8 md:p-12">
            <div className="max-w-4xl">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary-600 text-white text-sm font-semibold mb-4 shadow-lg">
                Featured Story
              </span>
              <Link to={`/article/${featuredNews.slug}`} className="block group-hover:text-primary-300 transition-colors">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
                  {featuredNews.title}
                </h1>
              </Link>
              <p className="text-lg md:text-xl text-secondary-200 mb-8 line-clamp-2 max-w-2xl">
                {featuredNews.summary}
              </p>
              <Link
                to={`/article/${featuredNews.slug}`}
                className="inline-flex items-center px-6 py-3 bg-white text-secondary-900 rounded-xl font-bold hover:bg-primary-50 transition-colors shadow-lg"
              >
                Read Full Story
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Latest News Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-display font-bold text-secondary-900 dark:text-white">
            {location.search ? 'Search Results' : 'Latest News'}
          </h2>
          {!location.search && (
            <Link to="/archive" className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300">
              View Archive →
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(location.search ? news : recentNews).map((article) => (
            <NewsCard key={article.id || article.slug} article={article} />
          ))}
        </div>

        {news.length === 0 && (
          <div className="text-center py-12 text-secondary-500 dark:text-secondary-400">
            No articles found.
          </div>
        )}
      </section>
    </div>
  );
}
