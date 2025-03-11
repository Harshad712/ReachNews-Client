import { useEffect, useState } from "react";
import { fetchNewsData } from "../utils/api";

const NewsList = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getNews = async () => {
      const data = await fetchNewsData();
      setNewsData(data);
      setLoading(false);
    };

    getNews();
  }, []);

  if (loading) return <p>Loading news...</p>;

  return (
    <div className="news-container">
      {newsData.map((news) => (
        <div key={news.id} className="news-card">
          <h2>{news.news_title}</h2>
          <p><strong>Author:</strong> {news.news_author}</p>
          <p><strong>Summary:</strong> {news.news_summary}</p>
          <p><strong>Sentiment:</strong> {news.sentiment}</p>
          <a href={news.news_url} target="_blank" rel="noopener noreferrer">
            Read more
          </a>
        </div>
      ))}
    </div>
  );
};

export default NewsList;
