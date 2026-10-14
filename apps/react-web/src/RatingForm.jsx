import { useState } from 'react';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export default function RatingForm({ fetchImpl = fetch }) {
  const [revenue, setRevenue] = useState('');
  const [rating, setRating] = useState(null);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setRating(null);
    try {
      const res = await fetchImpl(`${API}/api/rating?revenue=${encodeURIComponent(revenue)}`);
      if (!res.ok) throw new Error('Request failed');
      setRating((await res.json()).rating);
    } catch {
      setError('Could not get a rating');
    }
  }

  return (
    <form onSubmit={submit}>
      <label>
        Annual revenue
        <input value={revenue} onChange={(e) => setRevenue(e.target.value)} inputMode="numeric" />
      </label>
      <button type="submit">Get rating</button>
      {rating && <p data-testid="rating">{rating}</p>}
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
