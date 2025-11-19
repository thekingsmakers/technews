import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NewsGrid from '../components/NewsGrid.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function CategoryPage() {
  const { name } = useParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchNews = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('category', name);
        params.append('page', '1');
        params.append('pageSize', '50');

        const res = await fetch(`${API_BASE}/api/news?${params.toString()}`, {
          signal: controller.signal
        });
        const data = await res.json();
        setNews(data.items || []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to load category news', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    return () => controller.abort();
  }, [name]);

  useEffect(() => {
    document.title = `${name} – TechPulse`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        `Latest articles in ${name} from TechPulse: AI, cloud, security, dev tools and more.`
      );
    }
  }, [name]);

  return (
    <section className="content-section">
      <h1 className="section-heading">Category: {name}</h1>
      {loading ? (
        <div className="loading">Loading category...</div>
      ) : (
        <NewsGrid items={news} />
      )}
    </section>
  );
}
