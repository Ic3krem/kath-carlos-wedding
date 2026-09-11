import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const singleMock = vi.fn();
const eqMock = vi.fn(() => ({ single: singleMock, select: () => ({ single: singleMock }) }));
const updateMock = vi.fn(() => ({ eq: eqMock }));
const selectMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn(() => ({ select: selectMock, update: updateMock }));

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({ from: fromMock }),
}));

import { GET, PUT } from '@/app/api/admin/settings/route';

describe('/api/admin/settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    singleMock.mockResolvedValue({
      data: { id: 1, couple_names: 'Kath & Carlos', wedding_date: '2027-01-01T00:00:00Z', hero_image_url: null, theme: 'classic-green', maps_address: null, maps_embed_url: null },
      error: null,
    });
  });

  it('GET returns the settings row', async () => {
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.couple_names).toBe('Kath & Carlos');
  });

  it('PUT updates the settings row', async () => {
    const request = new NextRequest('http://localhost/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ couple_names: 'Kath & Carlos', wedding_date: '2027-06-01T00:00:00Z', theme: 'blush', hero_image_url: null, maps_address: null, maps_embed_url: null }),
    });
    const response = await PUT(request);
    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledOnce();
  });
});
