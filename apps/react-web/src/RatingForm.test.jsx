import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RatingForm from './RatingForm.jsx';

describe('RatingForm', () => {
  it('shows the rating returned by the API', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ rating: 'Hot' }) });
    render(<RatingForm fetchImpl={fetchImpl} />);
    fireEvent.change(screen.getByLabelText(/annual revenue/i), { target: { value: '20000000' } });
    fireEvent.click(screen.getByRole('button', { name: /get rating/i }));
    await waitFor(() => expect(screen.getByTestId('rating')).toHaveTextContent('Hot'));
    expect(fetchImpl.mock.calls[0][0]).toContain('revenue=20000000');
  });

  it('shows an error when the API fails', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false });
    render(<RatingForm fetchImpl={fetchImpl} />);
    fireEvent.click(screen.getByRole('button', { name: /get rating/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });
});
