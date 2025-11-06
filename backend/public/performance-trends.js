// Performance Trends Module for Betopia Dashboard
// Week 3 Day 11 Implementation

// Global variables for trend charts
let trendsChart = null;
let seasonalChart = null;
let currentTrendPeriod = 'week';

// Calculate weekly performance
function calculateWeeklyPerformance(bets) {
  const weeks = {};
  const stake = 10;

  bets.forEach(bet => {
    if (bet.status !== 'won' && bet.status !== 'lost') return;
    
    const date = new Date(bet.kickoff);
    const weekNum = getWeekNumber(date);
    const weekKey = `${date.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
    
    if (!weeks[weekKey]) {
      weeks[weekKey] = {
        week: weekKey,
        startDate: getWeekStartDate(date),
        bets: 0,
        wins: 0,
        losses: 0,
        profit: 0
      };
    }
    
    weeks[weekKey].bets++;
    if (bet.status === 'won') {
      weeks[weekKey].wins++;
      weeks[weekKey].profit += (bet.odds - 1) * stake;
    } else {
      weeks[weekKey].losses++;
      weeks[weekKey].profit -= stake;
    }
  });

  return Object.values(weeks)
    .map(week => ({
      ...week,
      winRate: week.bets > 0 ? ((week.wins / week.bets) * 100).toFixed(1) : 0,
      roi: week.bets > 0 ? ((week.profit / (week.bets * stake)) * 100).toFixed(1) : 0
    }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-8); // Last 8 weeks
}

// Calculate monthly performance
function calculateMonthlyPerformance(bets) {
  const months = {};
  const stake = 10;

  bets.forEach(bet => {
    if (bet.status !== 'won' && bet.status !== 'lost') return;
    
    const date = new Date(bet.kickoff);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (!months[monthKey]) {
      months[monthKey] = {
        month: monthKey,
        monthName,
        bets: 0,
        wins: 0,
        losses: 0,
        profit: 0
      };
    }
    
    months[monthKey].bets++;
    if (bet.status === 'won') {
      months[monthKey].wins++;
      months[monthKey].profit += (bet.odds - 1) * stake;
    } else {
      months[monthKey].losses++;
      months[monthKey].profit -= stake;
    }
  });

  return Object.values(months)
    .map(month => ({
      ...month,
      winRate: month.bets > 0 ? ((month.wins / month.bets) * 100).toFixed(1) : 0,
      roi: month.bets > 0 ? ((month.profit / (month.bets * stake)) * 100).toFixed(1) : 0
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6); // Last 6 months
}

// Get best and worst months
function getBestWorstMonths(monthlyData) {
  const sorted = [...monthlyData].sort((a, b) => parseFloat(b.roi) - parseFloat(a.roi));
  return {
    best: sorted.slice(0, 3),
    worst: sorted.slice(-3).reverse()
  };
}

// Calculate improvement metrics
function calculateImprovement(bets) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  const thisWeek = bets.filter(b => new Date(b.kickoff) >= oneWeekAgo && (b.status === 'won' || b.status === 'lost'));
  const lastWeek = bets.filter(b => new Date(b.kickoff) >= twoWeeksAgo && new Date(b.kickoff) < oneWeekAgo && (b.status === 'won' || b.status === 'lost'));
  
  const stake = 10;
  
  const calcMetrics = (betList) => {
    const wins = betList.filter(b => b.status === 'won').length;
    const total = betList.length;
    const profit = betList.reduce((sum, b) => {
      return sum + (b.status === 'won' ? (b.odds - 1) * stake : -stake);
    }, 0);
    
    return {
      winRate: total > 0 ? (wins / total) * 100 : 0,
      roi: total > 0 ? (profit / (total * stake)) * 100 : 0,
      profit
    };
  };
  
  const current = calcMetrics(thisWeek);
  const previous = calcMetrics(lastWeek);
  
  return {
    winRate: {
      current: current.winRate.toFixed(1),
      previous: previous.winRate.toFixed(1),
      change: (current.winRate - previous.winRate).toFixed(1),
      improving: current.winRate >= previous.winRate
    },
    roi: {
      current: current.roi.toFixed(1),
      previous: previous.roi.toFixed(1),
      change: (current.roi - previous.roi).toFixed(1),
      improving: current.roi >= previous.roi
    },
    profit: {
      current: current.profit.toFixed(2),
      previous: previous.profit.toFixed(2),
      change: (current.profit - previous.profit).toFixed(2),
      improving: current.profit >= previous.profit
    }
  };
}

// Check milestone achievements
function checkMilestones(bets, totalProfit) {
  const milestones = [
    {
      id: 'first_profitable_week',
      name: 'First Profitable Week',
      description: 'Achieved your first profitable week',
      icon: '🎉',
      achieved: false,
      achievedDate: null
    },
    {
      id: 'ten_consecutive_wins',
      name: '10 Consecutive Wins',
      description: 'Won 10 bets in a row',
      icon: '🔥',
      achieved: false,
      achievedDate: null
    },
    {
      id: 'sixty_percent_winrate',
      name: '60%+ Win Rate',
      description: 'Achieved 60% or higher win rate',
      icon: '🎯',
      achieved: false,
      achievedDate: null
    },
    {
      id: 'hundred_profit',
      name: '£100 Profit',
      description: 'Reached £100 in total profit',
      icon: '💰',
      achieved: totalProfit >= 100,
      achievedDate: totalProfit >= 100 ? findMilestoneDate(bets, 100) : null
    },
    {
      id: 'five_hundred_profit',
      name: '£500 Profit',
      description: 'Reached £500 in total profit',
      icon: '💎',
      achieved: totalProfit >= 500,
      achievedDate: totalProfit >= 500 ? findMilestoneDate(bets, 500) : null
    },
    {
      id: 'thousand_profit',
      name: '£1000 Profit',
      description: 'Reached £1000 in total profit',
      icon: '👑',
      achieved: totalProfit >= 1000,
      achievedDate: totalProfit >= 1000 ? findMilestoneDate(bets, 1000) : null
    }
  ];
  
  // Check profitable week
  const weeklyData = calculateWeeklyPerformance(bets);
  if (weeklyData.some(w => parseFloat(w.profit) > 0)) {
    milestones[0].achieved = true;
    const firstProfitableWeek = weeklyData.find(w => parseFloat(w.profit) > 0);
    milestones[0].achievedDate = firstProfitableWeek?.startDate;
  }
  
  // Check consecutive wins
  let maxStreak = 0;
  let currentStreak = 0;
  let streakDate = null;
  
  bets.filter(b => b.status === 'won' || b.status === 'lost')
    .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))
    .forEach(bet => {
      if (bet.status === 'won') {
        currentStreak++;
        if (currentStreak >= 10 && !streakDate) {
          streakDate = bet.kickoff;
        }
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
  
  if (maxStreak >= 10) {
    milestones[1].achieved = true;
    milestones[1].achievedDate = streakDate;
  }
  
  // Check 60% win rate
  const settledBets = bets.filter(b => b.status === 'won' || b.status === 'lost');
  const wins = bets.filter(b => b.status === 'won').length;
  const winRate = settledBets.length > 0 ? (wins / settledBets.length) * 100 : 0;
  
  if (winRate >= 60) {
    milestones[2].achieved = true;
    milestones[2].achievedDate = new Date().toISOString();
  }
  
  return milestones;
}

// Find date when profit milestone was reached
function findMilestoneDate(bets, targetProfit) {
  const stake = 10;
  let runningProfit = 0;
  
  const sortedBets = bets
    .filter(b => b.status === 'won' || b.status === 'lost')
    .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
  
  for (const bet of sortedBets) {
    runningProfit += bet.status === 'won' ? (bet.odds - 1) * stake : -stake;
    if (runningProfit >= targetProfit) {
      return bet.kickoff;
    }
  }
  
  return null;
}

// Render performance trends chart
function renderPerformanceTrendsChart(bets, period) {
  const ctx = document.getElementById('trendsChart');
  if (!ctx) return;
  
  if (trendsChart) trendsChart.destroy();
  
  let data, labels, winRates, profits;
  
  if (period === 'week') {
    const weeklyData = calculateWeeklyPerformance(bets);
    labels = weeklyData.map(w => w.week.split('-W')[1]);
    winRates = weeklyData.map(w => parseFloat(w.winRate));
    profits = weeklyData.map(w => parseFloat(w.profit));
  } else {
    const monthlyData = calculateMonthlyPerformance(bets);
    labels = monthlyData.map(m => m.monthName.split(' ')[0]);
    winRates = monthlyData.map(m => parseFloat(m.winRate));
    profits = monthlyData.map(m => parseFloat(m.profit));
  }
  
  trendsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Win Rate %',
          data: winRates,
          borderColor: '#5a4a9f',
          backgroundColor: 'rgba(90, 74, 159, 0.1)',
          yAxisID: 'y',
          tension: 0.4
        },
        {
          label: 'Profit £',
          data: profits,
          borderColor: '#2a914a',
          backgroundColor: 'rgba(42, 145, 74, 0.1)',
          yAxisID: 'y1',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          labels: { color: '#e8e6ff' }
        },
        tooltip: {
          backgroundColor: '#141426',
          titleColor: '#e8e6ff',
          bodyColor: '#e8e6ff',
          borderColor: '#2a2151',
          borderWidth: 1
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: { color: '#2a2151' },
          ticks: { 
            color: '#e8e6ff',
            callback: value => `${value}%`
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { 
            color: '#e8e6ff',
            callback: value => `£${value}`
          }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#e8e6ff' }
        }
      }
    }
  });
}

// Render seasonal patterns chart
function renderSeasonalPatternsChart(bets) {
  const ctx = document.getElementById('seasonalChart');
  if (!ctx) return;
  
  if (seasonalChart) seasonalChart.destroy();
  
  const monthlyData = calculateMonthlyPerformance(bets);
  
  seasonalChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: monthlyData.map(m => m.monthName.split(' ')[0]),
      datasets: [{
        label: 'ROI %',
        data: monthlyData.map(m => parseFloat(m.roi)),
        backgroundColor: monthlyData.map(m => parseFloat(m.roi) >= 0 ? 'rgba(42, 145, 74, 0.8)' : 'rgba(181, 73, 73, 0.8)'),
        borderColor: monthlyData.map(m => parseFloat(m.roi) >= 0 ? '#2a914a' : '#b54949'),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#141426',
          titleColor: '#e8e6ff',
          bodyColor: '#e8e6ff',
          borderColor: '#2a2151',
          borderWidth: 1,
          callbacks: {
            label: (context) => {
              const data = monthlyData[context.dataIndex];
              return [
                `ROI: ${data.roi}%`,
                `Win Rate: ${data.winRate}%`,
                `Profit: £${data.profit.toFixed(2)}`,
                `Bets: ${data.bets}`
              ];
            }
          }
        }
      },
      scales: {
        y: {
          grid: { color: '#2a2151' },
          ticks: { 
            color: '#e8e6ff',
            callback: value => `${value}%`
          }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#e8e6ff' }
        }
      }
    }
  });
}

// Render performance trends section
function renderPerformanceTrends(bets) {
  const container = document.getElementById('performance-trends-container');
  if (!container) return;
  
  const improvement = calculateImprovement(bets);
  const monthlyData = calculateMonthlyPerformance(bets);
  const { best, worst } = getBestWorstMonths(monthlyData);
  const totalProfit = bets
    .filter(b => b.status === 'won' || b.status === 'lost')
    .reduce((sum, b) => sum + (b.status === 'won' ? (b.odds - 1) * 10 : -10), 0);
  const milestones = checkMilestones(bets, totalProfit);
  
  container.innerHTML = `
    <!-- Performance Over Time -->
    <div class="stat-card" style="margin-bottom:20px;">
      <div class="stat-card-title">📈 Performance Over Time</div>
      <div style="display:flex; gap:8px; margin-bottom:16px;">
        <button class="view-btn ${currentTrendPeriod === 'week' ? 'active' : ''}" onclick="switchTrendPeriod('week')">Week</button>
        <button class="view-btn ${currentTrendPeriod === 'month' ? 'active' : ''}" onclick="switchTrendPeriod('month')">Month</button>
      </div>
      <div class="chart-container" style="height:300px;">
        <canvas id="trendsChart"></canvas>
      </div>
    </div>
    
    <!-- Seasonal Patterns -->
    <div class="stat-card" style="margin-bottom:20px;">
      <div class="stat-card-title">🌍 Seasonal Patterns</div>
      
      ${best.length > 0 ? `
        <div style="margin-bottom:16px;">
          <div style="font-size:12px; opacity:0.7; margin-bottom:8px;">Best Months:</div>
          ${best.map((m, i) => `
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #1a1a2e;">
              <span>${['🥇', '🥈', '🥉'][i]} ${m.monthName}</span>
              <span style="color:#2a914a; font-weight:600;">${m.winRate}% WR, £${m.profit.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${worst.length > 0 ? `
        <div style="margin-bottom:16px;">
          <div style="font-size:12px; opacity:0.7; margin-bottom:8px;">Worst Months:</div>
          ${worst.map(m => `
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #1a1a2e;">
              <span>⚠️ ${m.monthName}</span>
              <span style="color:#b54949; font-weight:600;">${m.winRate}% WR, £${m.profit.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <div class="chart-container" style="height:250px;">
        <canvas id="seasonalChart"></canvas>
      </div>
    </div>
    
    <!-- Improvement Tracking -->
    <div class="stat-card">
      <div class="stat-card-title">🎯 Your Progress</div>
      
      <div style="margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span style="font-size:13px;">Win Rate: ${improvement.winRate.previous}% → ${improvement.winRate.current}% (${improvement.winRate.change > 0 ? '+' : ''}${improvement.winRate.change}%) ${improvement.winRate.improving ? '▲' : '▼'}</span>
        </div>
        <div style="background:#1a1a2e; height:8px; border-radius:4px; overflow:hidden;">
          <div style="background:${improvement.winRate.improving ? '#2a914a' : '#b54949'}; height:100%; width:${Math.min(parseFloat(improvement.winRate.current), 100)}%; transition:width 0.3s;"></div>
        </div>
      </div>
      
      <div style="margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span style="font-size:13px;">ROI: ${improvement.roi.previous}% → ${improvement.roi.current}% (${improvement.roi.change > 0 ? '+' : ''}${improvement.roi.change}%) ${improvement.roi.improving ? '▲' : '▼'}</span>
        </div>
        <div style="background:#1a1a2e; height:8px; border-radius:4px; overflow:hidden;">
          <div style="background:${improvement.roi.improving ? '#2a914a' : '#b54949'}; height:100%; width:${Math.min(Math.abs(parseFloat(improvement.roi.current)), 100)}%; transition:width 0.3s;"></div>
        </div>
      </div>
      
      <div style="font-size:13px; font-weight:600; margin:20px 0 12px;">🏆 Milestones:</div>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
        ${milestones.map(m => `
          <div style="background:#0b0b12; border:1px solid ${m.achieved ? '#2a914a' : '#2a2151'}; border-radius:8px; padding:12px;">
            <div style="font-size:24px; margin-bottom:4px;">${m.achieved ? '✅' : '🔒'} ${m.icon}</div>
            <div style="font-size:12px; font-weight:600; margin-bottom:4px;">${m.name}</div>
            <div style="font-size:10px; opacity:0.7;">${m.description}</div>
            ${m.achieved && m.achievedDate ? `<div style="font-size:10px; opacity:0.6; margin-top:4px;">${new Date(m.achievedDate).toLocaleDateString()}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  // Render charts after DOM update
  setTimeout(() => {
    renderPerformanceTrendsChart(bets, currentTrendPeriod);
    renderSeasonalPatternsChart(bets);
  }, 100);
}

// Switch trend period
function switchTrendPeriod(period) {
  currentTrendPeriod = period;
  const bets = loadSavedBets();
  renderPerformanceTrendsChart(bets, period);
  
  // Update button states
  document.querySelectorAll('#performance-trends-container .view-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
}

// Helper: Get week number
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Helper: Get week start date
function getWeekStartDate(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}
