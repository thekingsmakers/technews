import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-meta">
        <p>
          © {currentYear} TheKingsmaker Tech News · Tunneled by Cloudflare · Automated by n8n.
        </p>
      </div>
      <div className="footer-links">
        <Link to="/archive">Archive</Link>
        <a href="/rss.xml" target="_blank" rel="noreferrer">
          RSS Feed
        </a>
        <a href="https://api.thekingsmaker.org/api" target="_blank" rel="noreferrer">
          API Explorer
        </a>
      </div>
    </footer>
  );
}
