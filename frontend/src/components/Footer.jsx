import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-secondary-950 border-t border-secondary-200 dark:border-secondary-800 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="font-display font-bold text-lg text-secondary-900 dark:text-white">
              TheKingsmaker
            </span>
            <span className="ml-2 text-sm text-secondary-500 dark:text-secondary-400">
              Tech News
            </span>
          </div>

          <div className="flex space-x-6 text-sm text-secondary-500 dark:text-secondary-400">
            <a href="/rss.xml" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              RSS Feed
            </a>
            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-secondary-100 dark:border-secondary-900 text-center text-sm text-secondary-400 dark:text-secondary-600">
          &copy; {currentYear} TheKingsmaker. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
