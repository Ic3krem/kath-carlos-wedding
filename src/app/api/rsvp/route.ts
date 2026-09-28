import { NextRequest, NextResponse } from 'next/server';
import { rsvpSchema } from '@/lib/validation/rsvp';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getInviteAllocations } from '@/lib/content';
import { companionsAllowed, findGuest, likeLiteral } from '@/lib/rsvp/guests';
import { summarize } from '@/lib/rsvp/summary';
import { getSettings, withSettingsDefaults } from '@/lib/content';
import { buildRsvpEmail } from '@/lib/email/rsvp-email';
import { sendMail } from '@/lib/email/send';

const SITE_URL = process.env.SITE_URL || 'https://wedding.jcd.quest';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.find((i) => i.path[0] === 'proxyName' || i.path[0] === 'email')?.message;
    return NextResponse.json({ error: message ?? 'Please check the form and try again.' }, { status: 400 });
  }

  // Only names on the invite list can RSVP, and never with more companions
  // than the seats reserved for them.
  const guest = findGuest(await getInviteAllocations(), parsed.data.name);
  if (!guest) {
    return NextResponse.json(
      { error: "We couldn't find that name. Please type your name as it appears on your invitation." },
      { status: 404 },
    );
  }

  const supabase = getSupabaseServerClient();

  // One RSVP per invitee. To change it, the couple removes it in /admin/rsvps.
  const { data: existing } = await supabase
    .from('rsvps')
    .select('*')
    .ilike('name', likeLiteral(guest.name))
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: 'We already have your RSVP.', alreadyResponded: true, rsvp: summarize(existing) },
      { status: 409 },
    );
  }

  const { response, proxyName } = parsed.data;
  const email = parsed.data.email || null;
  const attending = response !== 'no';
  const companions = attending ? parsed.data.companions : [];
  const allowed = companionsAllowed(guest);
  if (companions.length > allowed) {
    return NextResponse.json(
      { error: `Your invitation allows ${allowed} companion${allowed === 1 ? '' : 's'}.` },
      { status: 400 },
    );
  }

  const row = {
    name: guest.name,
    attending,
    guest_count: attending ? 1 + companions.length : 0,
    guest_names: companions.length ? companions.join(', ') : null,
    email,
    // Only sent when used, so plain RSVPs still work before migration 013.
    ...(response === 'proxy' ? { proxy_name: proxyName } : {}),
  };

  const { error } = await supabase.from('rsvps').insert(row);
  if (error) {
    return NextResponse.json({ error: 'We could not save your RSVP. Please try again.' }, { status: 500 });
  }

  // The guest's own copy. Awaited so the serverless function isn't frozen
  // mid-send; a failure never undoes the RSVP.
  const summary = summarize(row);
  let emailSent = false;
  if (email) {
    const mail = buildRsvpEmail(summary, withSettingsDefaults(await getSettings()), SITE_URL);
    emailSent = await sendMail({
      to: email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      attachments: mail.ics ? [{ filename: 'wedding.ics', content: mail.ics, contentType: 'text/calendar; charset=utf-8' }] : undefined,
    });
  }

  return NextResponse.json({ ...summary, email, emailSent }, { status: 201 });
}
