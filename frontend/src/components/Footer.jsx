import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-meta">
        <p>
          © {currentYear} | Created and managed by{' '}
          <a href="https://thekingsmaker.org/" target="_blank" rel="noopener noreferrer">
            The Kingsmakers
          </a>
        </p>
      </div>
      <div className="footer-links">
        <a href="https://thekingsmaker.org/" target="_blank" rel="noopener noreferrer">
          thekingsmaker.org
        </a>
        {' | '}
        <a href="https://x.com/thekingsmakers" target="_blank" rel="noopener noreferrer">
          x.com/thekingsmakers
        </a>
        <Link to="/archive">Archive</Link>
        <a href="/rss.xml" target="_blank" rel="noreferrer">
          RSS Feed
        </a>
      </div>
    </footer>
  );
}
