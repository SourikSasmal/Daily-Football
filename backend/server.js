const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

// ========================================
// SIMPLE SERVER CACHE
// ========================================

const cache = {
  news: {
    data: null,
    timestamp: 0,
  },

  fixtures: {
    data: null,
    timestamp: 0,
  },
};

// How long cached data stays valid
const CACHE_TIME = {
  news: 10 * 60 * 1000, // 10 minutes

  fixtures: 10 * 60 * 1000, // 10 minutes
};

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.options("*", cors());

app.use(express.json());

// ========================================
// IMPORTANT LEAGUES
// ========================================

const IMPORTANT_LEAGUES = {
  39: "PREMIER LEAGUE",
  140: "LA LIGA",
  135: "SERIE A",
  78: "BUNDESLIGA",
  61: "LIGUE 1",
  2: "CHAMPIONS LEAGUE",
  3: "EUROPA LEAGUE",
  848: "CONFERENCE LEAGUE",
};

// ========================================
// GET TODAY'S DATE IN INDIA
// ========================================

function getIndianDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// ========================================
// FIXTURES
// ========================================

app.get("/api/fixtures", async (req, res) => {
  try {
    const today = getIndianDate();

    console.log("Fetching fixtures for:", today);

    const response = await axios.get(
      "https://v3.football.api-sports.io/fixtures",
      {
        params: {
          date: today,
        },

        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY,
        },
      },
    );

    const allFixtures = response.data.response;

    // Keep only important leagues
    const filteredFixtures = allFixtures.filter((match) => {
      return IMPORTANT_LEAGUES[match.league.id];
    });

    // Clean the API response
    const cleanFixtures = filteredFixtures.map((match) => {
      return {
        id: match.fixture.id,

        league: {
          id: match.league.id,
          name: IMPORTANT_LEAGUES[match.league.id],
        },

        date: match.fixture.date,

        status: match.fixture.status.short,

        home: {
          name: match.teams.home.name,
          logo: match.teams.home.logo,
        },

        away: {
          name: match.teams.away.name,
          logo: match.teams.away.logo,
        },
      };
    });

    const fixtureData = {
      date: today,

      total: cleanFixtures.length,

      fixtures: cleanFixtures,
    };

    cache.fixtures.data = fixtureData;

    cache.fixtures.timestamp = Date.now();

    res.json(fixtureData);
  } catch (error) {
    console.error("FIXTURE ERROR:", error.response?.data || error.message);

    res.status(500).json({
      error: "Failed to fetch football fixtures",
    });
  }
});

// ========================================
// FOOTBALL NEWS
// ========================================

app.get("/api/news", async (req, res) => {
  // ========================================
  // CHECK CACHE
  // ========================================

  const now = Date.now();

  if (cache.news.data && now - cache.news.timestamp < CACHE_TIME.news) {
    console.log("Using cached news");

    return res.json(cache.news.data);
  }
  try {
    console.log("Fetching latest football news...");

    const response = await axios.get(
      "https://content.guardianapis.com/search",
      {
        params: {
          // Only football articles
          section: "football",

          // Newest articles first
          "order-by": "newest",

          // We only need a few articles
          "page-size": 20,

          // Extra information we need
          "show-fields": "headline,trailText,thumbnail",
        },

        headers: {
          // Guardian API key
          "api-key": process.env.GUARDIAN_API_KEY,
        },
      },
    );

    const articles = response.data.response.results;

    // ========================================
    // DAILY EDITOR
    // ========================================

    // Words/topics that usually indicate an important story
    const importantWords = [
      "transfer",
      "signed",
      "sign",
      "deal",
      "agreed",
      "injury",
      "injured",
      "sacked",
      "appointed",
      "manager",
      "coach",
      "final",
      "winner",
      "win",
      "defeat",
      "draw",
      "premier league",
      "champions league",
      "arsenal",
      "liverpool",
      "manchester city",
      "manchester united",
      "chelsea",
      "tottenham",
      "real madrid",
      "barcelona",
      "bayern",
      "psg",
    ];

    // Score each article
    function scoreArticle(article) {
      const title = article.webTitle.toLowerCase();

      let score = 0;

      importantWords.forEach((word) => {
        if (title.includes(word)) {
          score += 2;
        }
      });

      // Give newer articles a small advantage
      const age = Date.now() - new Date(article.webPublicationDate).getTime();

      const hoursOld = age / (1000 * 60 * 60);

      if (hoursOld < 6) {
        score += 3;
      } else if (hoursOld < 12) {
        score += 2;
      } else if (hoursOld < 24) {
        score += 1;
      }

      return score;
    }

    // ========================================
    // REMOVE VERY SIMILAR STORIES
    // ========================================

    function simplifyTitle(title) {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\b(the|a|an|and|to|of|in|on|with|after|as|it|at)\b/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    const uniqueArticles = [];

    const seenWords = [];

    for (const article of articles) {
      const simplified = simplifyTitle(article.webTitle);

      const words = simplified.split(" ");

      // Check whether this article shares
      // many important words with an existing story

      let duplicate = false;

      for (const existingWords of seenWords) {
        const overlap = words.filter((word) =>
          existingWords.includes(word),
        ).length;

        const similarity =
          overlap / Math.max(words.length, existingWords.length);

        if (similarity > 0.55) {
          duplicate = true;

          break;
        }
      }

      if (!duplicate) {
        uniqueArticles.push(article);

        seenWords.push(words);
      }
    }

    // ========================================
    // RANK THE STORIES
    // ========================================

    const rankedArticles = uniqueArticles
      .map((article) => {
        return {
          article,

          score: scoreArticle(article),
        };
      })

      .sort((a, b) => b.score - a.score);

    // ========================================
    // KEEP ONLY THE BEST 6
    // ========================================

    const cleanNews = rankedArticles.slice(0, 6).map(({ article }) => {
      return {
        id: article.id,

        title: article.webTitle,

        description: article.fields?.trailText || "",

        image: article.fields?.thumbnail || null,

        url: article.webUrl,

        publishedAt: article.webPublicationDate,
      };
    });

    const newsData = {
      total: cleanNews.length,

      news: cleanNews,
    };

    cache.news.data = newsData;

    cache.news.timestamp = Date.now();

    res.json(newsData);
  } catch (error) {
    console.error("NEWS ERROR:", error.response?.data || error.message);

    res.status(500).json({
      error: "Failed to fetch football news",
    });
  }
});

// ========================================
// FORCE NEWSPAPER UPDATE
// ========================================

app.get("/api/refresh", (req, res) => {
  cache.news.data = null;
  cache.news.timestamp = 0;

  cache.fixtures.data = null;
  cache.fixtures.timestamp = 0;

  console.log("Newspaper cache cleared.");

  res.json({
    success: true,
    message: "Newspaper cache cleared",
  });
});
// ========================================
// START SERVER
// ========================================
app.listen(5000, () => {
  console.log("Football Daily backend running on port 5000");
});
