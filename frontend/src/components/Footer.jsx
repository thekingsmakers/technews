import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-md mt-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-700 dark:text-gray-300">
          <div className="footer-meta mb-2 md:mb-0">
            <p>
              © {currentYear} | Created and managed by{' '}
              <a href="https://thekingsmaker.org/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                The Kingsmakers
              </a>
            </p>
          </div>
          <div className="footer-links flex flex-wrap justify-center">
            <a href="https://thekingsmaker.org/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 mx-2">thekingsmaker.org</a>
            <span className="mx-2">|</span>
            <a href="https://x.com/thekingsmakers" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 mx-2">x.com/thekingsmakers</a>
            <span className="mx-2">|</span>
            <Link to="/archive" className="hover:text-indigo-600 dark:hover:text-indigo-400 mx-2">Archive</Link>
            <span className="mx-2">|</span>
            <a href="/rss.xml" target="_blank" rel="noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 mx-2">RSS Feed</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
