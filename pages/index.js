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
    <div className="bg-gray-900 text-white p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">NBA Simulator - Today’s Games</h1>
      <button
        onClick={runSimulation}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-auto block"
      >
        {loading ? 'Simulating...' : 'Run Simulation'}
      </button>
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      <div className="mt-6 space-y-4">
        {games.map((game, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{game.visitor_team} @ {game.home_team}</h2>
            <h3 className="text-lg mt-2">Team Stats</h3>
            <p>
              {game.home_team}: ORTG {game.home_stats.ortg.toFixed(1)}, DRTG {game.home_stats.drtg.toFixed(1)}, Pace {game.home_stats.pace.toFixed(1)}
            </p>
            <p>
              {game.visitor_team}: ORTG {game.visitor_stats.ortg.toFixed(1)}, DRTG {game.visitor_stats.drtg.toFixed(1)}, Pace {game.visitor_stats.pace.toFixed(1)}
            </p>
            <h3 className="text-lg mt-2">Predictions</h3>
            <p>Moneyline: {game.home_team} {game.predictions.moneyline.home}, {game.visitor_team} {game.predictions.moneyline.visitor}</p>
            <p>Spread: {game.home_team} {game.predictions.spread.home.toFixed(1)}, {game.visitor_team} {game.predictions.spread.visitor.toFixed(1)}</p>
            <p>Over/Under: {game.predictions.over_under.toFixed(1)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
