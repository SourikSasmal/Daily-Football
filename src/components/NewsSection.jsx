import { useEffect, useState } from "react";

function NewsSection() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/news`)
      .then((response) => response.json())

      .then((data) => {
        setNews(data.news);

        setLoading(false);
      })

      .catch((error) => {
        console.error("Error fetching news:", error);

        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="news-section">
        <div className="section-heading">
          <span>THE LATEST</span>
          <span>PAGE 02</span>
        </div>

        <p className="news-loading">GATHERING TODAY'S NEWS...</p>
      </section>
    );
  }

  return (
    <section className="news-section">
      <div className="section-heading">
        <span>THE LATEST</span>
        <span>PAGE 02</span>
      </div>

      {news.map((article, index) => (
        <article className="news-card" key={article.id}>
          <div className="news-number">
            {String(index + 1).padStart(2, "0")}
          </div>

          <div className="news-content">
            <div className="story-category">FOOTBALL</div>

            <h3>{article.title}</h3>

            <p
              dangerouslySetInnerHTML={{
                __html: article.description,
              }}
            />

            <div className="news-meta">
              <span>
                {new Date(article.publishedAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>

              <a href={article.url} target="_blank" rel="noopener noreferrer">
                READ STORY →
              </a>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export default NewsSection;
