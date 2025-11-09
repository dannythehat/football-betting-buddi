/**
 * Betting Patterns Integration Script
 * This script adds the betting patterns analysis feature to dashboard.html
 * 
 * Usage: Run this in the browser console on dashboard.html page
 * Or integrate the functions directly into the dashboard.html file
 */

// Global variable for market pie chart
let marketPieChart = null;

/**
 * Analyze betting behavior patterns
 */
function analyzeBettingBehavior(bets) {
  if (!bets || bets.length === 0) return null;

  const settledBets = bets.filter(b => b.status === 'won' || b.status === 'lost');
  if (settledBets.length === 0) return null;

  // Market distribution
  const markets = {};
  bets.forEach(bet => {
    markets[bet.market] = (markets[bet.market] || 0) + 1;
  });

  // Betting frequency
  const dates = bets.map(b => new Date(b.kickoff).toDateString());
  const uniqueDates = [...new Set(dates)];
  const daysSinceFirst = Math.max(1, Math.ceil((Date.now() - new Date(bets[bets.length - 1].kickoff)) / (1000 * 60 * 60 * 24)));
  
  const frequency = {
    perDay: (bets.length / daysSinceFirst).toFixed(1),
    perWeek: ((bets.length / daysSinceFirst) * 7).toFixed(1),
    perMonth: ((bets.length / daysSinceFirst) * 30).toFixed(0),
    activeDays: uniqueDates.length
  };

  // Stake analysis
  const stakes = bets.map(b => b.stake);
  const avgStake = stakes.reduce((a, b) => a + b, 0) / stakes.length;
  const minStake = Math.min(...stakes);
  const maxStake = Math.max(...stakes);

  // Risk profile
  const avgOdds = (bets.reduce((sum, b) => sum + b.odds, 0) / bets.length).toFixed(2);
  const highRiskBets = bets.filter(b => b.odds >= 2.5).length;
  const highRiskPercent = ((highRiskBets / bets.length) * 100).toFixed(0);
  
  let riskLevel = 'Low';
  let riskScore = 33;
  if (avgOdds >= 2.5 || highRiskPercent >= 50) {
    riskLevel = 'High';
    riskScore = 85;
  } else if (avgOdds >= 1.8 || highRiskPercent >= 30) {
    riskLevel = 'Medium';
    riskScore = 60;
  }

  return {
    markets,
    frequency,
    stakes: { average: avgStake, min: minStake, max: maxStake },
    risk: { level: riskLevel, score: riskScore, avgOdds, highRiskPercent }
  };
}

/**
 * Recognize winning and losing patterns
 */
function recognizePatterns(bets) {
  const settledBets = bets.filter(b => b.status === 'won' || b.status === 'lost');
  if (settledBets.length < 5) return null;

  // Market performance
  const marketStats = {};
  settledBets.forEach(bet => {
    if (!marketStats[bet.market]) {
      marketStats[bet.market] = { won: 0, lost: 0, total: 0 };
    }
    marketStats[bet.market].total++;
    if (bet.status === 'won') marketStats[bet.market].won++;
    else marketStats[bet.market].lost++;
  });

  // Time of day performance
  const timeStats = { morning: { won: 0, lost: 0, total: 0 }, afternoon: { won: 0, lost: 0, total: 0 }, evening: { won: 0, lost: 0, total: 0 }, night: { won: 0, lost: 0, total: 0 } };
  settledBets.forEach(bet => {
    const hour = new Date(bet.kickoff).getHours();
    let period = 'night';
    if (hour >= 6 && hour < 12) period = 'morning';
    else if (hour >= 12 && hour < 18) period = 'afternoon';
    else if (hour >= 18) period = 'evening';
    
    timeStats[period].total++;
    if (bet.status === 'won') timeStats[period].won++;
    else timeStats[period].lost++;
  });

  // League performance
  const leagueStats = {};
  settledBets.forEach(bet => {
    if (!leagueStats[bet.league]) {
      leagueStats[bet.league] = { won: 0, lost: 0, total: 0 };
    }
    leagueStats[bet.league].total++;
    if (bet.status === 'won') leagueStats[bet.league].won++;
    else leagueStats[bet.league].lost++;
  });

  // Find best patterns (minimum 3 bets)
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

/**
 * Generate personalized recommendations
 */
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

/**
 * Main render function for betting patterns
 */
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

/**
 * Render behavior analysis section
 */
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

/**
 * Render pattern recognition section
 */
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

/**
 * Render recommendations section
 */
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

// Export functions for use in dashboard
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    analyzeBettingBehavior,
    recognizePatterns,
    generateRecommendations,
    renderBettingPatterns,
    renderBehaviorAnalysis,
    renderPatternRecognition,
    renderRecommendations
  };
}
