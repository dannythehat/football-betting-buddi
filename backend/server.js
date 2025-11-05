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

// Smart bets JSON for today
app.get("/api/smart-bets", async (req, res) => {
  const date = sofiaTodayISO();
  const filePath = path.join(DATA_DIR, `smartbets-${date}.json`);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    res.json(JSON.parse(raw));
  } catch (err) {
    if (err.code === "ENOENT") return res.status(404).json({ status: "error", message: `No smartbets file for ${date}` });
    console.error("smart-bets error:", err);
    res.status(500).json({ status: "error", message: "Failed to load smart bets." });
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
