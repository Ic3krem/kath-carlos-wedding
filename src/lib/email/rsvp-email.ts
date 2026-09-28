import type { RsvpSummary } from '@/lib/rsvp/summary';
import type { Settings } from '@/lib/types';
import { formatLongDate, formatTime, formatWeekday } from '@/lib/date-utils';

export interface RsvpEmail {
  subject: string;
  html: string;
  text: string;
  /** Calendar invite, only when someone is attending. */
  ics: string | null;
}

const RESPONSE_LABEL = { yes: 'Joyfully Accepts', no: 'Regretfully Declines', proxy: 'Sending a proxy' } as const;

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function icsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function icsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (c) => `\\${c}`);
}

/**
 * The guest's own copy of their RSVP: an HTML "card" in the site's dusty-blue
 * style (tables and inline styles, so it survives email clients), a plain-text
 * version, and a calendar invite when attending.
 */
export function buildRsvpEmail(rsvp: RsvpSummary, settings: Settings, siteUrl: string): RsvpEmail {
  const couple = settings.couple_names;
  const date = formatLongDate(settings.wedding_date);
  const when = `${formatWeekday(settings.wedding_date)} · ${formatTime(settings.wedding_date)}`;
  const first = rsvp.name.split(' ')[0];
  const attending = rsvp.response !== 'no';

  const title =
    rsvp.response === 'yes' ? `See you there, ${first}!` : rsvp.response === 'proxy' ? `Thank you, ${first}` : `You will be missed, ${first}`;
  const message =
    rsvp.response === 'yes'
      ? `We're overjoyed you'll celebrate with us, and your seat${rsvp.total > 1 ? 's have' : ' has'} been reserved.`
      : rsvp.response === 'proxy'
        ? `We'll miss you, and we look forward to welcoming ${rsvp.proxyName} in your place.`
        : "Thank you for letting us know. We'll be thinking of you on our special day.";

  const rows: [string, string][] = [
    ['Guest', rsvp.name],
    ['Response', RESPONSE_LABEL[rsvp.response]],
    ...(rsvp.response === 'proxy' ? ([['Attending for you', rsvp.proxyName ?? '']] as [string, string][]) : []),
    ...(attending
      ? ([
          ['Companions', rsvp.companions.length ? rsvp.companions.join(', ') : 'None'],
          ['Seats confirmed', String(rsvp.total)],
        ] as [string, string][])
      : []),
  ];

  const venues = [
    ['Ceremony', settings.ceremony_name, settings.ceremony_address],
    ['Reception', settings.reception_name, settings.reception_address],
  ].filter(([, name]) => name) as [string, string, string | null][];

  const subject = `${couple} — your RSVP${attending ? ` for ${date}` : ''}`;

  const serif = "'Cormorant Garamond',Georgia,'Times New Roman',serif";
  const sans = "Lato,'Helvetica Neue',Arial,sans-serif";
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f5f9fc;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f9fc;padding:28px 12px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#4f6f8f;border-radius:8px;border:1px solid #dce7f0;">
  <tr><td style="padding:40px 32px 36px;text-align:center;color:#ffffff;font-family:${sans};">
    <div style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#dce7f0;">Your RSVP has been received</div>
    <div style="font-family:${serif};font-size:34px;line-height:1.2;margin:14px 0 6px;color:#ffffff;">${esc(title)}</div>
    <div style="width:60px;height:1px;background:#dce7f0;margin:20px auto 24px;"></div>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#ffffff;">${esc(message)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(220,231,240,0.6);border-radius:4px;background:#46637f;text-align:left;">
      ${rows
        .map(
          ([k, v], i) => `<tr><td style="padding:11px 16px;${i < rows.length - 1 ? 'border-bottom:1px solid rgba(255,255,255,0.15);' : ''}font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#dce7f0;white-space:nowrap;">${esc(k)}</td>
      <td style="padding:11px 16px;${i < rows.length - 1 ? 'border-bottom:1px solid rgba(255,255,255,0.15);' : ''}font-size:14px;color:#ffffff;text-align:right;">${esc(v)}</td></tr>`,
        )
        .join('\n      ')}
    </table>
    ${
      attending
        ? `<p style="margin:28px 0 4px;font-family:${serif};font-style:italic;font-size:20px;color:#ffffff;">We look forward to celebrating with you on</p>
    <div style="font-size:14px;letter-spacing:4px;text-transform:uppercase;font-weight:bold;color:#dce7f0;">${esc(date)}</div>
    <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#ffffff;margin-top:6px;">${esc(when)}</div>
    ${venues
      .map(
        ([kind, name, address]) => `<p style="margin:14px 0 0;font-size:13px;line-height:1.5;color:#ffffff;"><span style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#dce7f0;">${kind}</span><br>${esc(name)}${address ? `<br>${esc(address)}` : ''}</p>`,
      )
      .join('\n    ')}`
        : ''
    }
    <div style="font-family:'Great Vibes',${serif};font-style:italic;font-size:40px;color:#dce7f0;margin-top:26px;">${esc(couple)}</div>
    <p style="margin:22px 0 0;"><a href="${esc(siteUrl)}" style="display:inline-block;background:#dce7f0;color:#2c3e50;text-decoration:none;font-size:12px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;padding:12px 26px;border-radius:999px;">Visit our wedding site</a></p>
    <p style="margin:18px 0 0;font-size:12px;color:rgba(255,255,255,0.75);">Need to change something? Please message ${esc(couple)} directly.</p>
  </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;

  const text = [
    `${couple}`,
    '',
    title,
    message,
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    ...(attending ? ['', `${date} · ${when}`, ...venues.map(([kind, name, address]) => `${kind}: ${name}${address ? `, ${address}` : ''}`)] : []),
    '',
    `Wedding site: ${siteUrl}`,
    `Need to change something? Please message ${couple} directly.`,
  ].join('\n');

  let ics: string | null = null;
  if (attending) {
    const start = new Date(settings.wedding_date);
    const end = new Date(start.getTime() + 6 * 60 * 60 * 1000);
    const location = [settings.ceremony_name, settings.ceremony_address].filter(Boolean).join(', ');
    ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Carlos and Kath//Wedding//EN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:wedding-${start.getTime()}@${new URL(siteUrl).hostname}`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(start)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${icsText(`${couple} — Wedding`)}`,
      `LOCATION:${icsText(location)}`,
      `DESCRIPTION:${icsText(`${RESPONSE_LABEL[rsvp.response]} · ${rsvp.total} seat(s)\n${siteUrl}`)}`,
      `URL:${siteUrl}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  }

  return { subject, html, text, ics };
}
