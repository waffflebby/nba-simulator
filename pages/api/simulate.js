const nba = require('nba');

export default async function handler(req, res) {
  try {
    // Get date from query parameter, default to today if not provided
    const { date } = req.query;
    let gameDate;

    if (date) {
      // Validate and use the provided date (format: MM/DD/YYYY)
      const [month, day, year] = date.split('/').map(Number);
      if (isNaN(month) || isNaN(day) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > 31) {
        return res.status(400).json({ error: 'Invalid date format. Use MM/DD/YYYY' });
      }
      gameDate = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
    } else {
      // Default to today if no date is provided
      gameDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    }

    // Fetch only the scoreboard to check for games quickly
    const games = await nba.stats.scoreboard({ gameDate });

    if (!games.numGames || games.numGames === 0) {
      return res.status(404).json({ error: `No games scheduled on ${gameDate}` });
    }

    // Fetch team info in parallel for better performance
    const teamPromises = games.games.map(game => 
      Promise.all([
        nba.stats.teamInfoCommon({ TeamID: game.homeTeamId }),
        nba.stats.teamInfoCommon({ TeamID: game.visitorTeamId })
      ])
    );
    const teamResults = await Promise.all(teamPromises);

    const teamIdToName = {};
    teamResults.forEach(([homeTeam, visitorTeam]) => {
      teamIdToName[homeTeam.teamInfo[0].teamId] = homeTeam.teamInfo[0].teamName;
      teamIdToName[visitorTeam.teamInfo[0].teamId] = visitorTeam.teamInfo[0].teamName;
    });

    const results = games.games.map((game, index) => {
      const homeTeamId = game.homeTeamId;
      const visitorTeamId = game.visitorTeamId;
      const homeTeamName = teamIdToName[homeTeamId];
      const visitorTeamName = teamIdToName[visitorTeamId];

      // Use simplified, hardcoded stats to reduce processing time
      const homeStats = getTeamStats(homeTeamId);
      const visitorStats = getTeamStats(visitorTeamId);
      const { homeWinProb, avgHomeScore, avgVisitorScore } = simulateGame(homeStats, visitorStats, 100); // Reduce simulations

      const homeML = winProbToMoneyline(homeWinProb);
      const visitorML = winProbToMoneyline(1 - homeWinProb);
      const spread = avgHomeScore - avgVisitorScore;
      const total = avgHomeScore + avgVisitorScore;

      return {
        home_team: homeTeamName,
        visitor_team: visitorTeamName,
        home_stats: { ortg: homeStats.ortg, drtg: homeStats.drtg, pace: homeStats.pace },
        visitor_stats: { ortg: visitorStats.ortg, drtg: visitorStats.drtg, pace: visitorStats.pace },
        predictions: {
          moneyline: { home: homeML, visitor: visitorML },
          spread: { home: spread > 0 ? -spread : Math.abs(spread), visitor: spread > 0 ? spread : -spread },
          over_under: total,
        },
      };
    });

    res.status(200).json({ games: results, date: gameDate });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

function getTeamStats(teamId) {
  // Use hardcoded or cached stats to avoid additional API calls
  const teamStats = {
    1610612737: { ortg: 112, drtg: 108, pace: 98 }, // Boston Celtics (example)
    1610612738: { ortg: 110, drtg: 107, pace: 100 }, // Houston Rockets (example)
    // Add more teams as needed or fetch once and cache
  };
  return teamStats[teamId] || { ortg: 110, drtg: 108, pace: 100 }; // Default stats
}

function simulateGame(homeTeam, visitorTeam, numSimulations = 100) {
  let homeWins = 0;
  const homeScores = [];
  const visitorScores = [];

  for (let i = 0; i < numSimulations; i++) {
    const possessions = (homeTeam.pace + visitorTeam.pace) / 2;
    const homeAdjustedOrtg = homeTeam
