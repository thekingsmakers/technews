import React from 'react';

export default function CategoryFilter({ categories, active, setActive }) {
  return (
    <div className="filter-group">
      <span className="filter-label">Category</span>
      <button
        className={!active ? 'pill active' : 'pill'}
        onClick={() => setActive('')}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c}
          className={active === c ? 'pill active' : 'pill'}
          onClick={() => setActive(c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
