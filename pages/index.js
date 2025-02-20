import { useState } from 'react';

export default function Home() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/simulate');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGames(data.games);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>NBA Simulator - Today’s Games</h1>
      <button onClick={runSimulation} disabled={loading}>
        {loading ? 'Simulating...' : 'Run Simulation'}
      </button>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <div>
        {games.map((game, index) => (
          <div key={index} style={{ margin: '20px 0', border: '1px solid #ccc', padding: '10px' }}>
            <h2>{game.visitor_team} @ {game.home_team}</h2>
            <h3>Team Stats</h3>
            <p>
              {game.home_team}: ORTG {game.home_stats.ortg.toFixed(1)}, DRTG {game.home_stats.drtg.toFixed(1)}, Pace {game.home_stats.pace.toFixed(1)}
            </p>
            <p>
              {game.visitor_team}: ORTG {game.visitor_stats.ortg.toFixed(1)}, DRTG {game.visitor_stats.drtg.toFixed(1)}, Pace {game.visitor_stats.pace.toFixed(1)}
            </p>
            <h3>Predictions</h3>
            <p>Moneyline: {game.home_team} {game.predictions.moneyline.home}, {game.visitor_team} {game.predictions.moneyline.visitor}</p>
            <p>Spread: {game.home_team} {game.predictions.spread.home.toFixed(1)}, {game.visitor_team} {game.predictions.spread.visitor.toFixed(1)}</p>
            <p>Over/Under: {game.predictions.over_under.toFixed(1)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
