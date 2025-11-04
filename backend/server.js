import express from 'express';
import cors from 'cors';

const HOST = '127.0.0.1';
const PORT = 8081;

const app = express();

// Basic CORS (MVP): allow local frontends
app.use(cors({
  origin: [/^http:\/\/localhost:3000$/, /^http:\/\/127\.0\.0\.1:3000$/],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    name: 'FootballBettingBuddi API',
    message: 'Minimal API is running',
    time_utc: new Date().toISOString()
  });
});

// Root info
app.get('/', (req, res) => {
  res.type('text/plain').send('FootballBettingBuddi API — try GET /api/health');
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(✅ Minimal API listening on http://System.Management.Automation.Internal.Host.InternalHost:);
  console.log(➡️  Health: http://System.Management.Automation.Internal.Host.InternalHost:/api/health);
});
