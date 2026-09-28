import { describe, it, expect } from 'vitest';
import { buildRsvpEmail } from '@/lib/email/rsvp-email';
import { SETTINGS_FALLBACK } from '@/lib/content';

const base = { name: 'Maria <Santos>', companions: ['Ana Cruz'], proxyName: null, total: 2 };

describe('buildRsvpEmail', () => {
  it('renders the RSVP card with escaped values and a calendar invite', () => {
    const mail = buildRsvpEmail({ ...base, response: 'yes' }, SETTINGS_FALLBACK, 'https://wedding.jcd.quest');
    expect(mail.subject).toContain('November 28, 2026');
    expect(mail.html).toContain('Maria &lt;Santos&gt;');
    expect(mail.html).not.toContain('<Santos>');
    expect(mail.html).toContain('Seats confirmed');
    expect(mail.text).toContain('Companions: Ana Cruz');
    expect(mail.ics).toContain('BEGIN:VEVENT');
    expect(mail.ics).toContain('DTSTART:20261128T070000Z');
  });

  it('names the proxy and skips the calendar for a decline', () => {
    const proxy = buildRsvpEmail({ ...base, response: 'proxy', proxyName: 'Lola Santos' }, SETTINGS_FALLBACK, 'https://x.test');
    expect(proxy.html).toContain('Lola Santos');
    const no = buildRsvpEmail({ ...base, response: 'no', total: 0 }, SETTINGS_FALLBACK, 'https://x.test');
    expect(no.ics).toBeNull();
    expect(no.html).not.toContain('Seats confirmed');
  });
});
