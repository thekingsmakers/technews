import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, User, Tag, Share2, Bookmark, Facebook, Twitter, Linkedin } from 'lucide-react';

export default function ArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/news/${slug}`);
        if (!response.ok) {
          throw new Error(`Error fetching article: ${response.statusText}`);
        }
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  useEffect(() => {
    const updateReadingProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(scrollPercent, 100));
    };

    window.addEventListener('scroll', updateReadingProgress);
    return () => window.removeEventListener('scroll', updateReadingProgress);
  }, []);

  const shareUrl = window.location.href;
  const shareTitle = article?.title || '';

  const handleShare = (platform) => {
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    };
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-8">
          <div className="h-1 bg-blue-600 rounded-full animate-pulse" style={{ width: '30%' }}></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-8 w-1/2"></div>
          <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center py-16"
      >
        <div className="text-red-500 mb-6">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Article Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Go Back</span>
        </button>
      </motion.div>
    );
  }

  if (!article) return null;

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
        <motion.div
          className="h-1 bg-gradient-to-r from-blue-600 to-purple-600"
          style={{ width: `${readingProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to News</span>
      </motion.button>

      {/* Article Header */}
      <motion.header
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        {article.category && (
          <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium mb-4">
            {article.category}
          </span>
        )}

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          {article.title}
        </h1>

        <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{new Date(article.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
          {article.author && (
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <span>5 min read</span>
          </div>
        </div>

        {/* Social Share & Actions */}
        <div className="flex items-center justify-between py-4 border-t border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Share:</span>
            <button
              onClick={() => handleShare('facebook')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-full transition-colors ${
              isBookmarked
                ? 'text-yellow-500 hover:text-yellow-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </motion.header>

      {/* Featured Image */}
      {article.imageUrl && (
        <motion.figure
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full rounded-2xl shadow-lg"
          />
          {article.imageCaption && (
            <figcaption className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
              {article.imageCaption}
            </figcaption>
          )}
        </motion.figure>
      )}

      {/* Article Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="prose dark:prose-dark prose-lg max-w-none text-gray-800 dark:text-gray-200 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Article Tags */}
      {article.tags && article.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Tag className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Tags:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Related Articles Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Articles</h3>
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>Related articles will be displayed here based on tags and categories.</p>
        </div>
      </motion.section>
    </motion.article>
  );
}
