import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import NewsGrid from '../components/NewsGrid';
import { API_URL } from '../config';

const ArchivePage = () => {
  const [archivedNews, setArchivedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArchivedNews = async () => {
      try {
        const response = await fetch(`${API_URL}/news/archive`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // Correctly extract the 'items' array from the response
        setArchivedNews(data.items || []); 
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArchivedNews();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Archived News</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && <NewsGrid news={archivedNews} />}
      </div>
    </Layout>
  );
};

export default ArchivePage;
