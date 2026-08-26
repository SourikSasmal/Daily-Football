import { useEffect, useState } from "react";

function MainStory() {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/news")
      .then((response) => response.json())

      .then((data) => {
        if (data.news && data.news.length > 0) {
          setStory(data.news[0]);
        }

        setLoading(false);
      })

      .catch((error) => {
        console.error("Error fetching main story:", error);

        setLoading(false);
      });
  }, []);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <section className="main-story">
        <div className="main-story-header">
          <span>TOP STORY</span>
          <span>PAGE 01</span>
        </div>

        <h2>GATHERING TODAY'S NEWS...</h2>
      </section>
    );
  }

  // ========================================
  // NO STORY
  // ========================================

  if (!story) {
    return (
      <section className="main-story">
        <div className="main-story-header">
          <span>TOP STORY</span>
          <span>PAGE 01</span>
        </div>

        <h2>NO NEWS AVAILABLE</h2>
      </section>
    );
  }

  // ========================================
  // MAIN STORY
  // ========================================

  return (
    <section className="main-story">
      <div className="main-story-header">
        <span>{story.sectionName || "FOOTBALL"}</span>

        <span>PAGE 01</span>
      </div>

      <div className="story-category">TOP STORY</div>

      <h2>{story.title}</h2>

      {story.image && (
        <div className="story-image">
          <img src={story.image} alt="" />
        </div>
      )}

      <div className="story-info">
        <p
          className="story-description"
          dangerouslySetInnerHTML={{
            __html: story.description,
          }}
        />

        <div className="story-meta">
          <span>THE GUARDIAN</span>

          <a href={story.url} target="_blank" rel="noopener noreferrer">
            READ STORY →
          </a>
        </div>
      </div>
    </section>
  );
}

export default MainStory;
