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

    const games = await nba.stats.scoreboard({ gameDate });

    if (!games.numGames || games.numGames === 0) {
      return res.status(404).json({ error: `No games scheduled on ${gameDate}` });
    }

    const teamIdToName = {};
    const teams = await nba.stats.teamInfoCommon();
    teams.teamInfo.forEach(team => {
      teamIdToName[team.teamId] = team.teamName;
    });

    const results = games.games.map(game => {
      const homeTeamId = game.homeTeamId;
      const visitorTeamId = game.visitorTeamId;
      const homeTeamName = teamIdToName[homeTeamId];
      const visitorTeamName = teamIdToName[visitorTeamId];

      // Simplified stats (you can expand this with more detailed data from nba.stats)
      const homeStats = getTeamStats(homeTeamId);
      const visitorStats = getTeamStats(visitorTeamId);
      const { homeWinProb, avgHomeScore, avgVisitorScore } = simulateGame(homeStats, visitorStats);

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
    res.status(500).json({ error: error.message });
  }
}

function getTeamStats(teamId) {
  // Placeholder for team stats (ORTG, DRTG, Pace). You’d need to fetch or hardcode these from nba.stats or another source.
  // For now, use approximate values or expand with real data from nba.stats.teamStats or similar endpoints.
  return {
    ortg: 110, // Offensive Rating (placeholder)
    drtg: 108, // Defensive Rating (placeholder)
    pace: 100, // Pace (placeholder)
  };
}

function simulateGame(homeTeam, visitorTeam, numSimulations = 1000) {
  let homeWins = 0;
  const homeScores = [];
  const visitorScores = [];

  for (let i = 0; i < numSimulations; i++) {
    const possessions = (homeTeam.pace + visitorTeam.pace) / 2;
    const homeAdjustedOrtg = homeTeam.ortg - (visitorTeam.drtg - 112); // Using league average DRTG of 112 as a placeholder
    const visitorAdjustedOrtg = visitorTeam.ortg - (homeTeam.drtg - 112);
    const homePoints = Math.random() * ((homeAdjustedOrtg / 100) * possessions * 1.1); // Simplified random simulation
    const visitorPoints = Math.random() * ((visitorAdjustedOrtg / 100) * possessions * 1.1);
    homeScores.push(homePoints);
    visitorScores.push(visitorPoints);
    if (homePoints > visitorPoints) homeWins++;
  }

  return {
    homeWinProb: homeWins / numSimulations,
    avgHomeScore: homeScores.reduce((a, b) => a + b, 0) / numSimulations,
    avgVisitorScore: visitorScores.reduce((a, b) => a + b, 0) / numSimulations,
  };
}

function winProbToMoneyline(prob) {
  if (prob > 0.5) return -Math.round((prob / (1 - prob)) * 100);
  return Math.round(((1 - prob) / prob) * 100);
}
