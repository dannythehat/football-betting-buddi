#!/usr/bin/env node

/**
 * Mock Results Update Script
 * 
 * Simulates bet results for testing the dashboard P/L tracking.
 * In production, this would integrate with a real sports data API.
 * 
 * Usage:
 *   node scripts/update-mock-results.js
 *   node scripts/update-mock-results.js --win-rate 0.6
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const winRateArg = args.find(arg => arg.startsWith('--win-rate='));
const WIN_RATE = winRateArg ? parseFloat(winRateArg.split('=')[1]) : 0.55; // Default 55% win rate

console.log('🎲 Mock Results Update Script');
console.log('================================\n');
console.log(`Target Win Rate: ${(WIN_RATE * 100).toFixed(0)}%\n`);

/**
 * Generate mock result for a bet
 * @param {Object} bet - Bet object
 * @param {number} winRate - Target win rate (0-1)
 * @returns {string} - 'won', 'lost', or 'void'
 */
function generateMockResult(bet, winRate) {
  // Check if bet is in the past
  const kickoff = new Date(bet.kickoff);
  const now = new Date();
  
  if (kickoff > now) {
    return 'pending'; // Future match
  }
  
  // 2% chance of void (cancelled/postponed)
  if (Math.random() < 0.02) {
    return 'void';
  }
  
  // Use probability-weighted random for more realistic results
  // Higher probability bets should win more often
  const adjustedWinRate = (winRate + bet.probability) / 2;
  
  return Math.random() < adjustedWinRate ? 'won' : 'lost';
}

/**
 * Update results in localStorage format
 * This generates a JSON file that can be imported into localStorage
 */
function updateMockResults() {
  // Read saved bets from a sample file (in real scenario, this would be from localStorage)
  // For now, we'll create a sample structure
  
  const sampleBets = [
    {
      id: 'bet_001',
      homeTeam: 'Manchester City',
      awayTeam: 'Arsenal',
      league: 'Premier League',
      market: 'Over/Under',
      selection: 'Over 2.5',
      odds: 1.85,
      probability: 0.68,
      kickoff: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    },
    {
      id: 'bet_002',
      homeTeam: 'Liverpool',
      awayTeam: 'Chelsea',
      league: 'Premier League',
      market: 'BTTS',
      selection: 'Yes',
      odds: 1.72,
      probability: 0.71,
      kickoff: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    },
    {
      id: 'bet_003',
      homeTeam: 'Real Madrid',
      awayTeam: 'Barcelona',
      league: 'La Liga',
      market: '1X2',
      selection: 'Home Win',
      odds: 2.10,
      probability: 0.58,
      kickoff: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      addedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    },
    {
      id: 'bet_004',
      homeTeam: 'Bayern Munich',
      awayTeam: 'Borussia Dortmund',
      league: 'Bundesliga',
      market: 'Asian Handicap',
      selection: 'Bayern -1.5',
      odds: 1.95,
      probability: 0.62,
      kickoff: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      addedAt: new Date().toISOString(),
      status: 'pending'
    },
    {
      id: 'bet_005',
      homeTeam: 'PSG',
      awayTeam: 'Marseille',
      league: 'Ligue 1',
      market: 'Over/Under',
      selection: 'Over 3.5',
      odds: 2.25,
      probability: 0.55,
      kickoff: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      addedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    }
  ];
  
  // Update results
  const updatedBets = sampleBets.map(bet => {
    const result = generateMockResult(bet, WIN_RATE);
    return {
      ...bet,
      status: result
    };
  });
  
  // Calculate statistics
  const settled = updatedBets.filter(b => b.status === 'won' || b.status === 'lost');
  const won = updatedBets.filter(b => b.status === 'won');
  const lost = updatedBets.filter(b => b.status === 'lost');
  const pending = updatedBets.filter(b => b.status === 'pending');
  const voided = updatedBets.filter(b => b.status === 'void');
  
  const actualWinRate = settled.length > 0 ? (won.length / settled.length) : 0;
  
  // Calculate P/L
  const stake = 10; // £10 per bet
  let totalPL = 0;
  
  won.forEach(bet => {
    totalPL += (bet.odds - 1) * stake;
  });
  
  lost.forEach(bet => {
    totalPL -= stake;
  });
  
  const totalStaked = settled.length * stake;
  const roi = totalStaked > 0 ? (totalPL / totalStaked) * 100 : 0;
  
  // Output results
  console.log('📊 Results Summary:');
  console.log('-------------------');
  console.log(`Total Bets: ${updatedBets.length}`);
  console.log(`Pending: ${pending.length}`);
  console.log(`Won: ${won.length} ✅`);
  console.log(`Lost: ${lost.length} ❌`);
  console.log(`Void: ${voided.length} ⚪`);
  console.log(`\nActual Win Rate: ${(actualWinRate * 100).toFixed(1)}%`);
  console.log(`Total P/L: £${totalPL.toFixed(2)} ${totalPL > 0 ? '📈' : totalPL < 0 ? '📉' : '➖'}`);
  console.log(`ROI: ${roi.toFixed(1)}%\n`);
  
  // Save to file
  const outputPath = path.join(__dirname, '..', 'data', 'mock-results.json');
  const output = {
    generated_at: new Date().toISOString(),
    win_rate_target: WIN_RATE,
    actual_win_rate: actualWinRate,
    statistics: {
      total: updatedBets.length,
      pending: pending.length,
      won: won.length,
      lost: lost.length,
      void: voided.length,
      total_pl: totalPL,
      roi: roi
    },
    bets: updatedBets
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`✅ Mock results saved to: ${outputPath}`);
  console.log('\n💡 To use these results:');
  console.log('   1. Open your browser console on the dashboard page');
  console.log('   2. Run: localStorage.setItem("fbb_saved_bets", JSON.stringify(' + JSON.stringify(updatedBets) + '))');
  console.log('   3. Refresh the page\n');
  
  // Also create a browser-ready script
  const browserScriptPath = path.join(__dirname, '..', 'data', 'load-mock-results.js');
  const browserScript = `// Load Mock Results into Browser
// Copy and paste this into your browser console on http://127.0.0.1:8081/dashboard.html

const mockBets = ${JSON.stringify(updatedBets, null, 2)};

localStorage.setItem('fbb_saved_bets', JSON.stringify(mockBets));
console.log('✅ Loaded ${updatedBets.length} mock bets into localStorage');
console.log('📊 Statistics:', ${JSON.stringify(output.statistics, null, 2)});
console.log('🔄 Refresh the page to see results');
`;
  
  fs.writeFileSync(browserScriptPath, browserScript);
  console.log(`✅ Browser script saved to: ${browserScriptPath}`);
  console.log('   Copy contents and paste into browser console\n');
}

// Run the script
try {
  updateMockResults();
  console.log('✅ Mock results update complete!\n');
} catch (error) {
  console.error('❌ Error updating mock results:', error.message);
  process.exit(1);
}
