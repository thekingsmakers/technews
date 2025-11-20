import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/news/article/${slug}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Error fetching article: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => setArticle(data))
      .catch(err => {
        console.error(err);
        setError(err.message);
      });
  }, [slug]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-8 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!article) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-8 text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        &larr; Back to News
      </button>
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">{article.title}</h1>
      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-8">
        <span>Published on {new Date(article.publishedAt).toLocaleDateString()}</span>
        <span className="mx-2">|</span>
        <span>By {article.author}</span>
      </div>
      {article.imageUrl && (
        <img src={article.imageUrl} alt={article.title} className="w-full rounded-lg shadow-lg mb-8" />
      )}
      <div 
        className="prose dark:prose-dark max-w-none text-lg text-gray-800 dark:text-gray-200"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </div>
  );
}
