import nodemailer from 'nodemailer';

/*
 * Outgoing mail over SMTP, so any provider works. For Gmail:
 *   SMTP_HOST=smtp.gmail.com  SMTP_PORT=465
 *   SMTP_USER=you@gmail.com   SMTP_PASS=<16-letter app password>
 *   EMAIL_FROM="Carlos & Kath <you@gmail.com>"
 * Without these, emails are skipped and the RSVP still saves.
 */

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transport: nodemailer.Transporter | null = null;

function getTransport() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT) || 465;
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 8000,
      socketTimeout: 10000,
    });
  }
  return transport;
}

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: { filename: string; content: string; contentType: string }[];
}

/** Sends one email; resolves false (never throws) if it can't be sent. */
export async function sendMail(mail: Mail): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  try {
    await getTransport().sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      replyTo: process.env.EMAIL_REPLY_TO || undefined,
      ...mail,
    });
    return true;
  } catch (error) {
    console.error('RSVP email failed:', error instanceof Error ? error.message : error);
    return false;
  }
}
