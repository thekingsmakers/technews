import React from 'react';
import { Link } from 'react-router-dom';

export default function Header({ onToggleTheme, theme }) {
  return (
    <header className="header">
      <Link to="/" className="logo">
        Tech<span>Pulse</span>
      </Link>
      <nav className="nav">
        <Link to="/">Home</Link>
        <a href="#ai">AI</a>
        <a href="#cloud">Cloud</a>
        <a href="#security">Security</a>
        <a href="#devtools">Dev Tools</a>
      </nav>
      <button className="theme-toggle" onClick={onToggleTheme}>
        {theme === 'dark' ? '🌙' : '☀️'}
      </button>
    </header>
  );
}
