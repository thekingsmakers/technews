import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    fetch(`/api/news/${slug}`)
      .then(res => res.json())
      .then(data => setArticle(data))
      .catch(err => console.error("Error fetching article:", err));
  }, [slug]);

  if (!article) return <div className="text-center py-12">Loading...</div>;

  return (
    <article className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{article.title}</h1>
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-6">
        <span>By {article.author || article.source}</span>
        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
      </div>
      {article.imageUrl && (
        <img src={article.imageUrl} alt={article.title} className="w-full h-auto rounded-lg mb-8" />
      )}
      <div 
        className="prose prose-lg max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
}
