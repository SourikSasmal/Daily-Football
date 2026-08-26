import { useEffect, useState } from "react";

function Fixtures() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/fixtures")
      .then((response) => response.json())

      .then((data) => {
        setFixtures(data.fixtures);

        setLoading(false);
      })

      .catch((error) => {
        console.error("Error fetching fixtures:", error);

        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="fixtures">
        <div className="section-heading">
          <span>TODAY'S FIXTURES</span>
          <span>PAGE 04</span>
        </div>

        <p className="fixtures-loading">PRINTING TODAY'S FIXTURES...</p>
      </section>
    );
  }

  // Group fixtures by league
  const groupedFixtures = fixtures.reduce((groups, fixture) => {
    const league = fixture.league.name;

    if (!groups[league]) {
      groups[league] = [];
    }

    groups[league].push(fixture);

    return groups;
  }, {});

  return (
    <section className="fixtures">
      <div className="section-heading">
        <span>TODAY'S FIXTURES</span>
        <span>PAGE 04</span>
      </div>

      {Object.entries(groupedFixtures).map(([league, games]) => (
        <div className="fixture-league" key={league}>
          <div className="fixture-league-name">{league}</div>

          {games.map((game) => (
            <div className="fixture" key={game.id}>
              <span className="fixture-time">
                {new Date(game.date).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                  timeZone: "Asia/Kolkata",
                })}
              </span>

              <div className="fixture-teams">
                <span>{game.home.name}</span>

                <span>{game.away.name}</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

export default Fixtures;
