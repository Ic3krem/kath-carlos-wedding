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

import { GET, PUT } from '@/app/api/admin/our-story/route';

describe('/api/admin/our-story', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    singleMock.mockResolvedValue({
      data: { id: 1, image_url: null, title: 'How we Begin', excerpt: 'Short version.', full_story: 'Long version.', button_label: 'Continue Reading' },
      error: null,
    });
  });

  it('GET returns the our_story row', async () => {
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.title).toBe('How we Begin');
  });

  it('PUT updates the our_story row', async () => {
    const request = new NextRequest('http://localhost/api/admin/our-story', {
      method: 'PUT',
      body: JSON.stringify({ image_url: null, title: 'Our Journey', excerpt: 'e', full_story: 'f', button_label: 'Read more' }),
    });
    const response = await PUT(request);
    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledOnce();
  });
});
