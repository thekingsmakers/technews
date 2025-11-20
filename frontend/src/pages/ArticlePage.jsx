import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { CalendarIcon, UserIcon, TagIcon, ArrowLeftIcon } from '@heroicons/react/outline';

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/news/${slug}`);
        if (!response.ok) {
          throw new Error('Article not found');
        }
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="text-red-500 text-xl mb-4">Error: {error || 'Article not found'}</div>
        <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto animate-fade-in pb-12">
      <Link
        to="/"
        className="inline-flex items-center text-secondary-500 hover:text-primary-600 mb-8 transition-colors group"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to News
      </Link>

      <header className="mb-12 text-center">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
            {article.category || 'Tech'}
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-display font-bold text-secondary-900 dark:text-white mb-6 leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-6 text-secondary-500 dark:text-secondary-400 text-sm">
          <div className="flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            {new Date(article.publishedAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          {article.source && (
            <div className="flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              {article.source}
            </div>
          )}
        </div>
      </header>

      {article.imageUrl && (
        <div className="rounded-3xl overflow-hidden shadow-2xl mb-12">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-auto object-cover max-h-[600px]"
          />
        </div>
      )}

      <div className="prose prose-lg dark:prose-invert prose-primary mx-auto">
        <ReactMarkdown>{article.content || article.summary}</ReactMarkdown>
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="mt-12 pt-8 border-t border-secondary-200 dark:border-secondary-800">
          <div className="flex flex-wrap gap-3">
            {article.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300"
              >
                <TagIcon className="w-4 h-4 mr-2" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
