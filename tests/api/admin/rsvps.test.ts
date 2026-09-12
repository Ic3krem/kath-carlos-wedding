import { describe, it, expect, vi, beforeEach } from 'vitest';

const orderMock = vi.fn();
const selectMock = vi.fn(() => ({ order: orderMock }));
const fromMock = vi.fn(() => ({ select: selectMock }));

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({ from: fromMock }),
}));

import { GET as listRsvps } from '@/app/api/admin/rsvps/route';
import { GET as exportRsvps } from '@/app/api/admin/rsvps/export/route';

const sampleRsvp = {
  id: '1',
  name: 'Juan Dela Cruz',
  email: 'juan@example.com',
  phone: null,
  attending: true,
  guest_count: 2,
  meal_preference: 'Vegetarian',
  message: 'Excited!',
  created_at: '2026-01-01T00:00:00Z',
};

describe('/api/admin/rsvps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderMock.mockResolvedValue({ data: [sampleRsvp], error: null });
  });

  it('GET lists RSVPs newest-first', async () => {
    const response = await listRsvps();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual([sampleRsvp]);
    expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('GET export returns a CSV with a header row and the RSVP data', async () => {
    const response = await exportRsvps();
    const text = await response.text();
    expect(response.headers.get('content-type')).toContain('text/csv');
    expect(text.split('\n')[0]).toBe(
      'name,email,phone,attending,guest_count,guest_names,meal_preference,allergies,song_request,message,created_at'
    );
    expect(text).toContain('Juan Dela Cruz');
  });
});
