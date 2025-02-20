import { useState } from 'react';

export default function Home() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('today');

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

  const [customDate, setCustomDate] = useState('');

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const date = getDateForSimulation();
      const res = await fetch(`/api/simulate?date=${date}`);
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
          <div key={index} className="
