import React from 'react';
import { Link } from 'react-router-dom';

export default function Header({ onToggleTheme, theme }) {
  return (
    <header className="header">
      <Link to="/" className="logo">
        thekingsmaker <span>Tech News</span>
      </Link>
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/category/AI">AI</Link>
        <Link to="/category/Cloud">Cloud</Link>
        <Link to="/category/Security">Security</Link>
        <Link to="/archive">Archive</Link>
      </nav>
      <button className="theme-toggle" onClick={onToggleTheme}>
        {theme === 'dark' ? '🌙' : '☀️'}
      </button>
    </header>
  );
}
