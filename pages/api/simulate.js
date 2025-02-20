const { ScoreboardV2, TeamYearByYearStats } = require('nba_api/stats/endpoints');
const { teams } = require('nba_api/stats/static');
const numpy = require('numpy');

export default async function handler(req, res) {
  try {
    const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    const scoreboard = await new ScoreboardV2({ game_date: today }).get_data_frames()[0];
    const games = scoreboard[['GAME_ID', 'HOME_TEAM_ID', 'VISITOR_TEAM_ID']];

    if (games.length === 0) {
      return res.status(404).json({ error: 'No games scheduled today' });
    }

    const teamIdToName = teams.get_teams().reduce((acc, team) => ({ ...acc, [team.id]: team.full_name }), {});

    const results = await Promise.all(
      games.map(async (game) => {
        const homeTeam = await getTeamStats(game.HOME_TEAM_ID, teamIdToName);
        const visitorTeam = await getTeamStats(game.VISITOR_TEAM_ID, teamIdToName);
        const { homeWinProb, avgHomeScore, avgVisitorScore } = simulateGame(homeTeam, visitorTeam);

        const homeML = winProbToMoneyline(homeWinProb);
        const visitorML = winProbToMoneyline(1 - homeWinProb);
        const spread = avgHomeScore - avgVisitorScore;
        const total = avgHomeScore + avgVisitorScore;

        return {
          home_team: homeTeam.name,
          visitor_team: visitorTeam.name,
          home_stats: { ortg: homeTeam.ortg, drtg: homeTeam.drtg, pace: homeTeam.pace },
          visitor_stats: { ortg: visitorTeam.ortg, drtg: visitorTeam.drtg, pace: visitorTeam.pace },
          predictions: {
            moneyline: { home: homeML, visitor: visitorML },
            spread: { home: spread > 0 ? -spread : Math.abs(spread), visitor: spread > 0 ? spread : -spread },
            over_under: total,
          },
        };
      })
    );

    res.status(200).json({ games: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getTeamStats(teamId, teamIdToName) {
  const stats = await new TeamYearByYearStats({ team_id: teamId }).get_data_frames()[0];
  const latestStats = stats.find(row => row.YEAR === '2024-25');
  return {
    name: teamIdToName[teamId],
    ortg: latestStats.OFF_RATING,
    drtg: latestStats.DEF_RATING,
    pace: latestStats.PACE,
  };
}

function simulateGame(homeTeam, visitorTeam, numSimulations = 1000) {
  let homeWins = 0;
  const homeScores = [];
  const visitorScores = [];
  const leagueAvgDrtg = 112;

  for (let i = 0; i < numSimulations; i++) {
    const possessions = (homeTeam.pace + visitorTeam.pace) / 2;
    const homeAdjustedOrtg = homeTeam.ortg - (visitorTeam.drtg - leagueAvgDrtg);
    const visitorAdjustedOrtg = visitorTeam.ortg - (homeTeam.drtg - leagueAvgDrtg);
    const homePoints = numpy.random.normal((homeAdjustedOrtg / 100) * possessions, 10);
    const visitorPoints = numpy.random.normal((visitorAdjustedOrtg / 100) * possessions, 10);
    homeScores.push(homePoints);
    visitorScores.push(visitorPoints);
    if (homePoints > visitorPoints) homeWins++;
  }

  return {
    homeWinProb: homeWins / numSimulations,
    avgHomeScore: numpy.mean(homeScores),
    avgVisitorScore: numpy.mean(visitorScores),
  };
}

function winProbToMoneyline(prob) {
  if (prob > 0.5) return -Math.round((prob / (1 - prob)) * 100);
  return Math.round(((1 - prob) / prob) * 100);
}
