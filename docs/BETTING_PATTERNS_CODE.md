# Betting Patterns Implementation Code

This code should be inserted into `backend/public/dashboard.html` at **line 318** (after the Advanced Statistics section, before the Filters section).

---

## HTML Section (Insert at line 318)

```html
    <!-- Betting Patterns Analysis -->
    <div class="analytics-section">
      <div class="section-header">
        <h2 class="section-title">🎲 Betting Patterns Analysis</h2>
      </div>

      <!-- Betting Behavior -->
      <div class="stat-card" style="margin-bottom:20px;">
        <div class="stat-card-title">📊 Betting Behavior</div>
        <div class="breakdown-grid">
          <div class="breakdown-card">
            <div class="breakdown-title">Favorite Markets</div>
            <div class="chart-container" style="height:200px;">
              <canvas id="marketPieChart"></canvas>
            </div>
          </div>
          <div class="breakdown-card">
            <div class="breakdown-title">Betting Frequency</div>
            <div id="betting-frequency"></div>
          </div>
          <div class="breakdown-card">
            <div class="breakdown-title">Average Stake & Risk</div>
            <div id="stake-risk"></div>
          </div>
        </div>
      </div>

      <!-- Pattern Recognition -->
      <div class="stat-card" style="margin-bottom:20px;">
        <div class="stat-card-title">🔍 Pattern Recognition</div>
        <div id="pattern-recognition"></div>
      </div>

      <!-- Recommendations -->
      <div class="stat-card">
        <div class="stat-card-title">💡 Personalized Recommendations</div>
        <div id="recommendations"></div>
      </div>
    </div>
```

---

## CSS Styles (Add to <style> section)

```css
    /* Betting Patterns */
    .pattern-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:16px; margin-top:16px; }
    .pattern-card { background:#0b0b12; border:1px solid #2a2151; border-radius:10px; padding:16px; }
    .pattern-card.winning { border-color:#2a914a; }
    .pattern-card.losing { border-color:#b54949; }
    .pattern-header { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
    .pattern-icon { font-size:24px; }
    .pattern-title { font-size:14px; font-weight:600; opacity:0.9; }
    .pattern-metrics { display:flex; flex-direction:column; gap:8px; }
    .pattern-metric { display:flex; justify-content:space-between; font-size:13px; padding:6px 0; border-bottom:1px solid #1a1a2e; }
    .pattern-metric:last-child { border-bottom:none; }
    .pattern-label { opacity:0.8; }
    .pattern-value { font-weight:600; }
    .pattern-value.green { color:#2a914a; }
    .pattern-value.red { color:#b54949; }
    
    .recommendation-list { display:flex; flex-direction:column; gap:12px; margin-top:16px; }
    .recommendation-card { background:#0b0b12; border:1px solid #5a4a9f; border-radius:10px; padding:14px; display:flex; gap:12px; }
    .recommendation-icon { font-size:24px; flex-shrink:0; }
    .recommendation-content { flex:1; }
    .recommendation-title { font-size:14px; font-weight:600; margin-bottom:6px; }
    .recommendation-text { font-size:13px; opacity:0.9; line-height:1.5; }
    .tip-badge { display:inline-block; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:600; margin-top:6px; }
    .tip-badge.success { background:#11311f; color:#2a914a; }
    .tip-badge.warning { background:#322d10; color:#a5972a; }
    .tip-badge.info { background:#1a1030; color:#7a6abf; }
    
    .frequency-stat { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #1a1a2e; }
    .frequency-stat:last-child { border-bottom:none; }
    .frequency-label { font-size:13px; opacity:0.8; }
    .frequency-value { font-size:16px; font-weight:600; }
    
    .stake-info { display:flex; flex-direction:column; gap:12px; }
    .stake-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #1a1a2e; }
    .stake-row:last-child { border-bottom:none; }
    .stake-label { font-size:13px; opacity:0.8; }
    .stake-value { font-size:16px; font-weight:600; }
    
    .risk-gauge { margin-top:12px; }
    .risk-bar { height:8px; background:#1a1a2e; border-radius:4px; overflow:hidden; margin-top:8px; }
    .risk-fill { height:100%; transition: width 0.3s; }
    .risk-fill.low { background:#2a914a; }
    .risk-fill.medium { background:#a5972a; }
    .risk-fill.high { background:#b54949; }
    .risk-label { font-size:12px; opacity:0.7; margin-top:6px; text-align:center; }
```

---

## JavaScript Functions (Add before `renderDashboard()` function)

```javascript
    // Betting Patterns Analysis
    let marketPieChart = null;

    function analyzeBettingBehavior(bets) {
      if (bets.length === 0) return null;

      // Favorite markets
      const marketCounts = {};
      bets.forEach(bet => {
        marketCounts[bet.market] = (marketCounts[bet.market] || 0) + 1;
      });

      // Betting frequency
      const dates = bets.map(b => new Date(b.addedAt).toDateString());
      const uniqueDays = [...new Set(dates)].length;
      const daysSinceFirst = Math.max(1, Math.ceil((Date.now() - new Date(bets[bets.length - 1].addedAt)) / (1000 * 60 * 60 * 24)));
      
      // Stake analysis
      const stakes = bets.map(b => b.stake || 10);
      const avgStake = stakes.reduce((a, b) => a + b, 0) / stakes.length;
      const minStake = Math.min(...stakes);
      const maxStake = Math.max(...stakes);
      
      // Risk profile
      const avgOdds = bets.reduce((sum, b) => sum + b.odds, 0) / bets.length;
      const highRiskBets = bets.filter(b => b.odds >= 3.0).length;
      const riskScore = Math.min(100, Math.round((avgOdds - 1) * 30 + (highRiskBets / bets.length) * 50));

      return {
        markets: marketCounts,
        frequency: {
          total: bets.length,
          perDay: (bets.length / daysSinceFirst).toFixed(1),
          perWeek: ((bets.length / daysSinceFirst) * 7).toFixed(1),
          perMonth: ((bets.length / daysSinceFirst) * 30).toFixed(1),
          activeDays: uniqueDays
        },
        stakes: {
          average: avgStake,
          min: minStake,
          max: maxStake
        },
        risk: {
          score: riskScore,
          level: riskScore < 40 ? 'Low' : riskScore < 70 ? 'Medium' : 'High',
          avgOdds: avgOdds.toFixed(2),
          highRiskPercent: ((highRiskBets / bets.length) * 100).toFixed(0)
        }
      };
    }

    function recognizePatterns(bets) {
      if (bets.length === 0) return null;

      const settledBets = bets.filter(b => b.status === 'won' || b.status === 'lost');
      if (settledBets.length === 0) return null;

      // Market patterns
      const marketStats = {};
      settledBets.forEach(bet => {
        if (!marketStats[bet.market]) {
          marketStats[bet.market] = { total: 0, won: 0 };
        }
        marketStats[bet.market].total++;
        if (bet.status === 'won') marketStats[bet.market].won++;
      });

      // Time patterns
      const timeStats = { morning: { total: 0, won: 0 }, afternoon: { total: 0, won: 0 }, evening: { total: 0, won: 0 }, night: { total: 0, won: 0 } };
      settledBets.forEach(bet => {
        const hour = new Date(bet.addedAt).getHours();
        const period = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : hour < 24 ? 'evening' : 'night';
        timeStats[period].total++;
        if (bet.status === 'won') timeStats[period].won++;
      });

      // League patterns
      const leagueStats = {};
      settledBets.forEach(bet => {
        if (!leagueStats[bet.league]) {
          leagueStats[bet.league] = { total: 0, won: 0 };
        }
        leagueStats[bet.league].total++;
        if (bet.status === 'won') leagueStats[bet.league].won++;
      });

      // Find best patterns
      const bestMarket = Object.entries(marketStats)
        .filter(([_, stats]) => stats.total >= 3)
        .sort((a, b) => (b[1].won / b[1].total) - (a[1].won / a[1].total))[0];
      
      const bestTime = Object.entries(timeStats)
        .filter(([_, stats]) => stats.total >= 3)
        .sort((a, b) => (b[1].won / b[1].total) - (a[1].won / a[1].total))[0];
      
      const bestLeague = Object.entries(leagueStats)
        .filter(([_, stats]) => stats.total >= 3)
        .sort((a, b) => (b[1].won / b[1].total) - (a[1].won / a[1].total))[0];

      // Find worst patterns
      const worstMarket = Object.entries(marketStats)
        .filter(([_, stats]) => stats.total >= 3)
        .sort((a, b) => (a[1].won / a[1].total) - (b[1].won / b[1].total))[0];

      return {
        winning: {
          market: bestMarket ? { name: bestMarket[0], winRate: ((bestMarket[1].won / bestMarket[1].total) * 100).toFixed(0), total: bestMarket[1].total } : null,
          time: bestTime ? { period: bestTime[0], winRate: ((bestTime[1].won / bestTime[1].total) * 100).toFixed(0), total: bestTime[1].total } : null,
          league: bestLeague ? { name: bestLeague[0], winRate: ((bestLeague[1].won / bestLeague[1].total) * 100).toFixed(0), total: bestLeague[1].total } : null
        },
        losing: {
          market: worstMarket ? { name: worstMarket[0], winRate: ((worstMarket[1].won / worstMarket[1].total) * 100).toFixed(0), total: worstMarket[1].total } : null
        }
      };
    }

    function generateRecommendations(bets, patterns, behavior) {
      const recommendations = [];

      if (!patterns || !behavior) return recommendations;

      // Market recommendation
      if (patterns.winning.market && patterns.losing.market) {
        recommendations.push({
          icon: '📊',
          title: 'Focus on Your Best Market',
          text: `Your ${patterns.winning.market.name} bets have a ${patterns.winning.market.winRate}% win rate. Consider focusing more on this market and reducing ${patterns.losing.market.name} bets (${patterns.losing.market.winRate}% win rate).`,
          badge: 'success'
        });
      }

      // Time recommendation
      if (patterns.winning.time) {
        const timeLabels = { morning: '06:00-12:00', afternoon: '12:00-18:00', evening: '18:00-00:00', night: '00:00-06:00' };
        recommendations.push({
          icon: '⏰',
          title: 'Bet at Your Optimal Time',
          text: `You perform best during ${patterns.winning.time.period} (${timeLabels[patterns.winning.time.period]}) with a ${patterns.winning.time.winRate}% win rate. Try to place more bets during this window.`,
          badge: 'success'
        });
      }

      // Risk management
      if (behavior.risk.level === 'High') {
        recommendations.push({
          icon: '⚠️',
          title: 'Consider Reducing Risk',
          text: `Your risk profile is ${behavior.risk.level} with ${behavior.risk.highRiskPercent}% high-odds bets. Consider lowering your average odds (currently ${behavior.risk.avgOdds}) for more consistent returns.`,
          badge: 'warning'
        });
      }

      // Stake management
      if (behavior.stakes.max > behavior.stakes.average * 3) {
        recommendations.push({
          icon: '💰',
          title: 'Maintain Consistent Stakes',
          text: `Your stake sizes vary significantly (£${behavior.stakes.min.toFixed(2)} - £${behavior.stakes.max.toFixed(2)}). Consider using more consistent stake sizes around your average of £${behavior.stakes.average.toFixed(2)}.`,
          badge: 'info'
        });
      }

      // League recommendation
      if (patterns.winning.league) {
        recommendations.push({
          icon: '🏆',
          title: 'Leverage Your League Expertise',
          text: `You have strong performance in ${patterns.winning.league.name} (${patterns.winning.league.winRate}% win rate). Consider increasing your exposure to this league.`,
          badge: 'success'
        });
      }

      return recommendations.slice(0, 5); // Max 5 recommendations
    }

    function renderBettingPatterns(bets) {
      const behavior = analyzeBettingBehavior(bets);
      const patterns = recognizePatterns(bets);
      const recommendations = generateRecommendations(bets, patterns, behavior);

      // Render behavior analysis
      if (behavior) {
        renderBehaviorAnalysis(behavior);
      }

      // Render pattern recognition
      if (patterns) {
        renderPatternRecognition(patterns);
      } else {
        document.getElementById('pattern-recognition').innerHTML = '<p style="opacity:0.6; text-align:center; padding:20px;">Not enough settled bets to identify patterns. Keep betting!</p>';
      }

      // Render recommendations
      if (recommendations.length > 0) {
        renderRecommendations(recommendations);
      } else {
        document.getElementById('recommendations').innerHTML = '<p style="opacity:0.6; text-align:center; padding:20px;">Not enough data for personalized recommendations yet.</p>';
      }
    }

    function renderBehaviorAnalysis(behavior) {
      // Market pie chart
      const ctx = document.getElementById('marketPieChart');
      if (ctx) {
        if (marketPieChart) marketPieChart.destroy();
        
        const labels = Object.keys(behavior.markets);
        const data = Object.values(behavior.markets);
        const colors = ['#5a4a9f', '#7a6abf', '#9a8adf', '#2a914a', '#a5972a', '#b54949'];

        marketPieChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: colors.slice(0, labels.length),
              borderColor: '#0b0b12',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { color: '#e8e6ff', font: { size: 11 } } },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percent = ((context.parsed / total) * 100).toFixed(1);
                    return `${context.label}: ${context.parsed} bets (${percent}%)`;
                  }
                }
              }
            }
          }
        });
      }

      // Frequency
      document.getElementById('betting-frequency').innerHTML = `
        <div class="frequency-stat">
          <span class="frequency-label">Per Day</span>
          <span class="frequency-value">${behavior.frequency.perDay}</span>
        </div>
        <div class="frequency-stat">
          <span class="frequency-label">Per Week</span>
          <span class="frequency-value">${behavior.frequency.perWeek}</span>
        </div>
        <div class="frequency-stat">
          <span class="frequency-label">Per Month</span>
          <span class="frequency-value">${behavior.frequency.perMonth}</span>
        </div>
        <div class="frequency-stat">
          <span class="frequency-label">Active Days</span>
          <span class="frequency-value">${behavior.frequency.activeDays}</span>
        </div>
      `;

      // Stake & Risk
      const riskColor = behavior.risk.level === 'Low' ? 'low' : behavior.risk.level === 'Medium' ? 'medium' : 'high';
      document.getElementById('stake-risk').innerHTML = `
        <div class="stake-info">
          <div class="stake-row">
            <span class="stake-label">Average Stake</span>
            <span class="stake-value">£${behavior.stakes.average.toFixed(2)}</span>
          </div>
          <div class="stake-row">
            <span class="stake-label">Stake Range</span>
            <span class="stake-value">£${behavior.stakes.min.toFixed(2)} - £${behavior.stakes.max.toFixed(2)}</span>
          </div>
          <div class="risk-gauge">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <span style="font-size:12px; opacity:0.8;">Risk Profile</span>
              <span style="font-size:13px; font-weight:600;">${behavior.risk.level}</span>
            </div>
            <div class="risk-bar">
              <div class="risk-fill ${riskColor}" style="width:${behavior.risk.score}%"></div>
            </div>
            <div class="risk-label">Avg Odds: ${behavior.risk.avgOdds} | High Risk: ${behavior.risk.highRiskPercent}%</div>
          </div>
        </div>
      `;
    }

    function renderPatternRecognition(patterns) {
      const winningCards = [];
      
      if (patterns.winning.market) {
        winningCards.push(`
          <div class="pattern-card winning">
            <div class="pattern-header">
              <span class="pattern-icon">📊</span>
              <span class="pattern-title">Best Market</span>
            </div>
            <div class="pattern-metrics">
              <div class="pattern-metric">
                <span class="pattern-label">Market</span>
                <span class="pattern-value">${patterns.winning.market.name}</span>
              </div>
              <div class="pattern-metric">
                <span class="pattern-label">Win Rate</span>
                <span class="pattern-value green">${patterns.winning.market.winRate}%</span>
              </div>
              <div class="pattern-metric">
                <span class="pattern-label">Total Bets</span>
                <span class="pattern-value">${patterns.winning.market.total}</span>
              </div>
            </div>
          </div>
        `);
      }

      if (patterns.winning.time) {
        const timeLabels = { morning: 'Morning (06-12)', afternoon: 'Afternoon (12-18)', evening: 'Evening (18-00)', night: 'Night (00-06)' };
        winningCards.push(`
          <div class="pattern-card winning">
            <div class="pattern-header">
              <span class="pattern-icon">⏰</span>
              <span class="pattern-title">Best Time</span>
            </div>
            <div class="pattern-metrics">
              <div class="pattern-metric">
                <span class="pattern-label">Period</span>
                <span class="pattern-value">${timeLabels[patterns.winning.time.period]}</span>
              </div>
              <div class="pattern-metric">
                <span class="pattern-label">Win Rate</span>
                <span class="pattern-value green">${patterns.winning.time.winRate}%</span>
              </div>
              <div class="pattern-metric">
                <span class="pattern-label">Total Bets</span>
                <span class="pattern-value">${patterns.winning.time.total}</span>
              </div>
            </div>
          </div>
        `);
      }

      if (patterns.winning.league) {
        winningCards.push(`
          <div class="pattern-card winning">
            <div class="pattern-header">
              <span class="pattern-icon">🏆</span>
              <span class="pattern-title">Best League</span>
            </div>
            <div class="pattern-metrics">
              <div class="pattern-metric">
                <span class="pattern-label">League</span>
                <span class="pattern-value">${patterns.winning.league.name}</span>
              </div>
              <div class="pattern-metric">
                <span class="pattern-label">Win Rate</span>
                <span class="pattern-value green">${patterns.winning.league.winRate}%</span>
              </div>
              <div class="pattern-metric">
                <span class="pattern-label">Total Bets</span>
                <span class="pattern-value">${patterns.winning.league.total}</span>
              </div>
            </div>
          </div>
        `);
      }

      const losingCard = patterns.losing.market ? `
        <div class="pattern-card losing">
          <div class="pattern-header">
            <span class="pattern-icon">⚠️</span>
            <span class="pattern-title">Avoid This Market</span>
          </div>
          <div class="pattern-metrics">
            <div class="pattern-metric">
              <span class="pattern-label">Market</span>
              <span class="pattern-value">${patterns.losing.market.name}</span>
            </div>
            <div class="pattern-metric">
              <span class="pattern-label">Win Rate</span>
              <span class="pattern-value red">${patterns.losing.market.winRate}%</span>
            </div>
            <div class="pattern-metric">
              <span class="pattern-label">Total Bets</span>
              <span class="pattern-value">${patterns.losing.market.total}</span>
            </div>
          </div>
        </div>
      ` : '';

      document.getElementById('pattern-recognition').innerHTML = `
        <div class="pattern-grid">
          ${winningCards.join('')}
          ${losingCard}
        </div>
      `;
    }

    function renderRecommendations(recommendations) {
      const html = recommendations.map(rec => `
        <div class="recommendation-card">
          <span class="recommendation-icon">${rec.icon}</span>
          <div class="recommendation-content">
            <div class="recommendation-title">${rec.title}</div>
            <div class="recommendation-text">${rec.text}</div>
            <span class="tip-badge ${rec.badge}">${rec.badge === 'success' ? '✅ Recommended' : rec.badge === 'warning' ? '⚠️ Caution' : 'ℹ️ Tip'}</span>
          </div>
        </div>
      `).join('');

      document.getElementById('recommendations').innerHTML = `<div class="recommendation-list">${html}</div>`;
    }
```

---

## Update renderDashboard() function

Find the `renderDashboard()` function and add this line after `renderAdvancedStats(allBets);`:

```javascript
      renderBettingPatterns(allBets);
```

The complete section should look like:

```javascript
    function renderDashboard() {
      const allBets = loadSavedBets();
      const stats = calculateStats(allBets);
      renderSummary(stats);
      renderPLChart(allBets);
      renderBreakdown(allBets);
      renderTimeChart(allBets);
      renderAdvancedStats(allBets);
      renderBettingPatterns(allBets);  // <-- ADD THIS LINE

      const filteredBets = filterAndSortBets(allBets);
      // ... rest of function
    }
```

---

## Testing

After adding the code:
1. Open `http://127.0.0.1:8081/dashboard.html`
2. Verify the new "Betting Patterns Analysis" section appears
3. Check that all visualizations render correctly
4. Test with different bet scenarios

---

**Status**: Ready to implement  
**Estimated time**: 10-15 minutes to add code  
**File to modify**: `backend/public/dashboard.html`
