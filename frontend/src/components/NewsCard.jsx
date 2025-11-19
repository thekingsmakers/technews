import { Link } from 'react-router-dom';

const NewsCard = ({ article }) => {
  if (!article) {
    return null;
  }

  const { title, summary, slug, category, tags, source, publishedAt, imageUrl } = article;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <Link to={`/article/${slug}`}>
        {imageUrl && <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />}
      </Link>
      <div className="p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-indigo-600">{category}</span>
          {source && <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">{source}</span>}
        </div>
        <h2 className="text-2xl font-bold mb-2 h-24 overflow-hidden">
          <Link to={`/article/${slug}`}>{title}</Link>
        </h2>
        <p className="text-gray-700 mb-4 h-28 overflow-hidden">{summary}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags && tags.map(tag => (
            <span key={tag} className="bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        <div className="text-sm text-gray-500">
          <span>{new Date(publishedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
