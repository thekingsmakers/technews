import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CategoryFilter({ categories, active, setActive }) {
  const navigate = useNavigate();

  const handleSelect = (value) => {
    setActive(value);
    if (value) {
      navigate(`/category/${encodeURIComponent(value)}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="filter-group">
      <span className="filter-label">Category</span>
      <button
        className={!active ? 'pill active' : 'pill'}
        onClick={() => handleSelect('')}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c}
          className={active === c ? 'pill active' : 'pill'}
          onClick={() => handleSelect(c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
