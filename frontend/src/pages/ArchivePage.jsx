import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function ArchivePage() {
  const [archive, setArchive] = useState({});

  useEffect(() => {
    fetch('/api/news/archive')
      .then(res => res.json())
      .then(data => setArchive(data))
      .catch(err => console.error("Error fetching archive:", err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">News Archive</h1>
      {Object.entries(archive).map(([month, articles]) => (
        <div key={month} className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{month}</h2>
          <ul className="space-y-2">
            {articles.map(article => (
              <li key={article.slug}>
                <Link 
                  to={`/article/${article.slug}`}
                  className="text-lg text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {article.title}
                </Link>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
