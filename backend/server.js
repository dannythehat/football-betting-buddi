import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import { computePL } from "./pl.js";

const HOST = "127.0.0.1";
const PORT = 8081;

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT_DIR   = path.resolve(__dirname, "..");
const DATA_DIR   = path.join(ROOT_DIR, "data");
const PUBLIC_DIR = path.join(__dirname, "public");

const app = express();
app.use(express.json()); // <-- parse JSON bodies

// Basic CORS (MVP): allow local frontends
app.use(cors({
  origin: [/^http:\/\/localhost:3000$/, /^http:\/\/127\.0\.0\.1:3000$/, /^http:\/\/127\.0\.0\.1:8081$/, /^http:\/\/localhost:8081$/],
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// Health
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    name: "FootballBettingBuddi API",
    message: "Minimal API is running",
    time_utc: new Date().toISOString()
  });
});

// Helper: get YYYY-MM-DD in Europe/Sofia
function sofiaTodayISO() {
  const fmt = new Intl.DateTimeFormat("bg-BG", { timeZone: "Europe/Sofia", year: "numeric", month: "2-digit", day: "2-digit" });
  const parts = fmt.formatToParts(new Date());
  const y = parts.find(p => p.type === "year").value;
  const m = parts.find(p => p.type === "month").value.padStart(2,"0");
  const d = parts.find(p => p.type === "day").value.padStart(2,"0");
  return `${y}-${m}-${d}`;
}

// Enhanced Smart Bets endpoint with advanced filtering
// Query params:
//   ?date=YYYY-MM-DD     - Specific date (default: today)
//   ?confidence=green    - Filter by confidence color (green/yellow/red)
//   ?market=Over/Under   - Filter by market type
//   ?league=Premier      - Filter by league name
//   ?minProb=0.65        - Minimum probability threshold
//   ?minEV=0.1           - Minimum Expected Value
//   ?status=pending      - Filter by bet status
//   ?sort=probability    - Sort by: probability, ev, odds, kickoff (default: probability desc)
app.get("/api/smart-bets", async (req, res) => {
  const date = req.query.date || sofiaTodayISO();
  const filePath = path.join(DATA_DIR, `smartbets-${date}.json`);
  
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    let bets = data.bets || [];

    // Filter by confidence color
    if (req.query.confidence) {
      const confidenceFilter = req.query.confidence.toLowerCase();
      bets = bets.filter(b => b.confidence_color === confidenceFilter);
    }

    // Filter by market type
    if (req.query.market) {
      const marketFilter = req.query.market;
      bets = bets.filter(b => b.market === marketFilter);
    }

    // Filter by league name (partial match)
    if (req.query.league) {
      const leagueFilter = req.query.league.toLowerCase();
      bets = bets.filter(b => 
        b.league.name.toLowerCase().includes(leagueFilter) ||
        b.league.country.toLowerCase().includes(leagueFilter)
      );
    }

    // Filter by minimum probability
    if (req.query.minProb) {
      const minProb = parseFloat(req.query.minProb);
      if (!isNaN(minProb)) {
        bets = bets.filter(b => b.probability >= minProb);
      }
    }

    // Filter by minimum Expected Value
    if (req.query.minEV) {
      const minEV = parseFloat(req.query.minEV);
      if (!isNaN(minEV)) {
        bets = bets.filter(b => b.ev !== null && b.ev >= minEV);
      }
    }

    // Filter by status
    if (req.query.status) {
      const statusFilter = req.query.status.toLowerCase();
      bets = bets.filter(b => b.status === statusFilter);
    }

    // Filter by team (home or away)
    if (req.query.team) {
      const teamFilter = req.query.team.toLowerCase();
      bets = bets.filter(b => 
        b.home.toLowerCase().includes(teamFilter) ||
        b.away.toLowerCase().includes(teamFilter)
      );
    }

    // Sorting
    const sortBy = req.query.sort || 'probability';
    const sortOrder = req.query.order || 'desc';
    
    bets.sort((a, b) => {
      let aVal, bVal;
      
      switch(sortBy) {
        case 'probability':
          aVal = a.probability;
          bVal = b.probability;
          break;
        case 'ev':
          aVal = a.ev || 0;
          bVal = b.ev || 0;
          break;
        case 'odds':
          aVal = a.odds || 0;
          bVal = b.odds || 0;
          break;
        case 'kickoff':
          aVal = new Date(a.kickoff_utc).getTime();
          bVal = new Date(b.kickoff_utc).getTime();
          break;
        default:
          aVal = a.probability;
          bVal = b.probability;
      }
      
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    // Calculate summary statistics for precision insights
    const summary = {
      total_bets: bets.length,
      confidence_distribution: {
        green: bets.filter(b => b.confidence_color === 'green').length,
        yellow: bets.filter(b => b.confidence_color === 'yellow').length,
        red: bets.filter(b => b.confidence_color === 'red').length
      },
      market_distribution: bets.reduce((acc, b) => {
        acc[b.market] = (acc[b.market] || 0) + 1;
        return acc;
      }, {}),
      avg_probability: bets.length > 0 
        ? (bets.reduce((sum, b) => sum + b.probability, 0) / bets.length).toFixed(3)
        : 0,
      avg_ev: bets.length > 0 && bets.some(b => b.ev !== null)
        ? (bets.filter(b => b.ev !== null).reduce((sum, b) => sum + b.ev, 0) / bets.filter(b => b.ev !== null).length).toFixed(3)
        : 0,
      avg_odds: bets.length > 0 && bets.some(b => b.odds !== null)
        ? (bets.filter(b => b.odds !== null).reduce((sum, b) => sum + b.odds, 0) / bets.filter(b => b.odds !== null).length).toFixed(2)
        : 0,
      leagues: [...new Set(bets.map(b => b.league.name))],
      date_range: {
        earliest: bets.length > 0 ? bets.reduce((min, b) => b.kickoff_utc < min ? b.kickoff_utc : min, bets[0].kickoff_utc) : null,
        latest: bets.length > 0 ? bets.reduce((max, b) => b.kickoff_utc > max ? b.kickoff_utc : max, bets[0].kickoff_utc) : null
      }
    };

    res.json({
      status: "ok",
      date: date,
      generated_at: data.generated_at_utc,
      filters_applied: {
        confidence: req.query.confidence || 'all',
        market: req.query.market || 'all',
        league: req.query.league || 'all',
        minProb: req.query.minProb || 'none',
        minEV: req.query.minEV || 'none',
        status: req.query.status || 'all'
      },
      summary: summary,
      bets: bets
    });
  } catch (err) {
    if (err.code === "ENOENT") {
      return res.status(404).json({ 
        status: "error", 
        message: `No smartbets file for ${date}. Available dates may differ.`,
        date: date
      });
    }
    console.error("smart-bets error:", err);
    res.status(500).json({ 
      status: "error", 
      message: "Failed to load smart bets." 
    });
  }
});

// P/L compute using today's file. Query overrides: ?stake=10&accaStake=5
app.get("/api/pl/compute", async (req, res) => {
  const date = sofiaTodayISO();
  const filePath = path.join(DATA_DIR, `smartbets-${date}.json`);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    const stake = Number(req.query.stake ?? 10);
    const accaStake = Number(req.query.accaStake ?? 5);
    const summary = computePL(data.bets || [], stake, accaStake);
    res.json({ date, stake, accaStake, ...summary });
  } catch (err) {
    if (err.code === "ENOENT") return res.status(404).json({ status: "error", message: `No smartbets file for ${date}` });
    console.error("pl/compute error:", err);
    res.status(500).json({ status: "error", message: "Failed to compute PL." });
  }
});

// Fixtures endpoint with filtering
app.get("/api/fixtures", async (req, res) => {
  const filePath = path.join(DATA_DIR, "mock-fixtures.json");
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    let fixtures = data.fixtures || [];

    // Filter by league
    if (req.query.league) {
      const leagueFilter = req.query.league.toLowerCase();
      fixtures = fixtures.filter(f => 
        f.league.name.toLowerCase().includes(leagueFilter) ||
        f.league.country.toLowerCase() === leagueFilter
      );
    }

    // Filter by date (YYYY-MM-DD format)
    if (req.query.date) {
      const dateFilter = req.query.date;
      fixtures = fixtures.filter(f => f.kickoff.startsWith(dateFilter));
    }

    // Filter by status
    if (req.query.status) {
      const statusFilter = req.query.status.toLowerCase();
      fixtures = fixtures.filter(f => f.status.toLowerCase() === statusFilter);
    }

    // Filter by team (home or away)
    if (req.query.team) {
      const teamFilter = req.query.team.toLowerCase();
      fixtures = fixtures.filter(f => 
        f.homeTeam.toLowerCase().includes(teamFilter) ||
        f.awayTeam.toLowerCase().includes(teamFilter)
      );
    }

    res.json({
      status: "ok",
      count: fixtures.length,
      fixtures: fixtures
    });
  } catch (err) {
    if (err.code === "ENOENT") {
      return res.status(404).json({ 
        status: "error", 
        message: "Fixtures data not found" 
      });
    }
    console.error("fixtures error:", err);
    res.status(500).json({ 
      status: "error", 
      message: "Failed to load fixtures." 
    });
  }
});

// Static UI
app.use(express.static(PUBLIC_DIR));
app.get("/", (req, res) => res.sendFile(path.join(PUBLIC_DIR, "index.html")));

app.listen(PORT, HOST, () => {
  console.log(`Minimal API listening on http://${HOST}:${PORT}`);
  console.log(`Health:   http://${HOST}:${PORT}/api/health`);
  console.log(`UI:       http://${HOST}:${PORT}/`);
  console.log(`Bets:     http://${HOST}:${PORT}/api/smart-bets`);
  console.log(`P/L:      http://${HOST}:${PORT}/api/pl/compute`);
  console.log(`Fixtures: http://${HOST}:${PORT}/api/fixtures`);
});
