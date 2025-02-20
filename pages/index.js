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
