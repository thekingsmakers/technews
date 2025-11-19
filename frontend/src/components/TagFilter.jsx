import React from 'react';

export default function TagFilter({ tags, active, setActive }) {
  return (
    <div className="filter-group">
      <span className="filter-label">Tags</span>
      <button
        className={!active ? 'pill active' : 'pill'}
        onClick={() => setActive('')}
      >
        All
      </button>
      {tags.map((t) => (
        <button
          key={t}
          className={active === t ? 'pill active' : 'pill'}
          onClick={() => setActive(t)}
        >
          #{t}
        </button>
      ))}
    </div>
  );
}
