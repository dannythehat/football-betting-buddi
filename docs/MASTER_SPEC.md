# Master Spec — FootballBettingBuddi (MVP)

## 1) Core Experience
- **Landing:** Dark black-purple UI showing **Today’s Smart Bets** and a **fixture browser** for upcoming days.
- **Browse:** Filter fixtures worldwide (API-Football).
- **AI Runs:**
  - **Daily batch** each morning → Smart Bets + Smart Daily Tips (historical JSON).
  - **On-demand** per game/market when user clicks **AI Smart Bet** or selects a specific market.

- **Access:** MVP supports anonymous saving (localStorage). Accounts later.

## 2) AI & Markets
- **Markets (MVP):** 1X2, O/U Goals (2.5), BTTS, Asian Handicap, Corners (O/U), Cards (O/U/team totals).
- **Logic:** Numeric probability models + GPT explanations per prediction.
- **EV:** Initially from AI probabilities; live odds EV in Phase 2.
- **Confidence Colors:** Green ≥65%, Yellow 50–65%, Red <50%.

## 3) Daily Smart Bets
- **Publish:** 2–5 top picks by EV + confidence.
- **Storage:** Daily JSON with full history, e.g., data/smartbets/smartbets-YYYY-MM-DD.json.
- **Fields:** fixture, market, selection, probability, bookmaker odds (if any), EV, confidence color, explanation, result, P/L.
- **Access:** Free users see basics; Premium unlocks more.

## 4) Dashboard & P/L
- **MVP:** Save picks locally; show AI reasoning; auto-update results + P/L.
- **Views:** Table + charts (daily/weekly/monthly).
- **Export:** CSV/Excel. ACCA planned later.

## 5) Backend, Data & Automation
- **Sources:** API-Football (primary) + scrapers (odds/stats).
- **Storage path:** Start with JSON cache → Postgres later.
- **Automation:** GitHub Actions → GCP Cloud Functions (cron for batch + results updates).

## 6) Monetization
- **Stripe subscriptions:** Premium = extended tips, granular confidence, early alerts, API access.
- **Free tier:** Core features to grow users.

## 7) Frontend & Design
- **Tech:** Vanilla JS (MVP), React/Vite later.
- **Theme:** Dark black-purple, minimal but data-rich.
- **UX:** Fixture/league filters, AI Smart Bet per game, dashboard, global Smart Bets page.

## 8) AI Integration
- **Engine:** GPT + numeric model; natural-language reasoning.
- **Caching:** Daily batch cached; on-demand per game generated live; cache per-day/per-fixture.

## 9) Calculations
- **Stake:** £10 default. Two decimals for odds/P&L. GBP initial. Automated results with manual override.

## 10) Admin
- **Admin ops:** Trigger recompute, edit results, approve Smart Bets.
- **Audit:** Store AI decision trace per pick.

