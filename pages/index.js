import { useState } from 'react';

export default function Home() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('today');
  const [customDate, setCustomDate] = useState('');

  const getDateForSimulation = () => {
    const today = new Date();
    if (selectedDate === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return yesterday.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    } else if (selectedDate === 'today') {
      return today.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    } else if (selectedDate === 'custom' && customDate) {
      return customDate;
    }
    return today.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const date = getDateForSimulation();
      const res = await fetch(`/api/simulate?date=${date}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
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
      <div className="flex justify-center mb-4 space-x-4">
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-gray-700 text-white p-2 rounded"
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="custom">Custom Date</option>
        </select>
        {selectedDate === 'custom' && (
          <input
            type="text"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            placeholder="MM/DD/YYYY"
            className="bg-gray-700 text-white p-2 rounded"
          />
        )}
        <button
          onClick={runSimulation}
          disabled={loading || (selectedDate === 'custom' && !customDate)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? 'Simulating...' : 'Run Simulation'}
        </button>
      </div>
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
