function NewsCard({ category, title, description, number }) {
  return (
    <article className="news-card">

      <div className="news-number">
        {number}
      </div>

      <div className="news-content">

        <div className="story-category">
          {category}
        </div>

        <h3>{title}</h3>

        <p>{description}</p>

        <div className="news-read">
          READ STORY →
        </div>

      </div>

    </article>
  );
}

export default NewsCard;