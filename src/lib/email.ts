import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Gracefully skip if SMTP is not configured
  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  try {
    await t.sendMail({ from, to, subject, html });
    return true;
  } catch {
    console.error('Failed to send email');
    return false;
  }
}

/**
 * Notify admin of a new lead submission.
 * Fire-and-forget — never blocks the main request.
 */
export function notifyNewLead(name: string, leadType: string, email: string): void {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const typeLabel = leadType === 'fee_analysis' ? 'Fee Analysis' : 'Consultation';

  sendEmail(
    adminEmail,
    `New ${typeLabel} Lead: ${name}`,
    `
      <h2>New ${typeLabel} Request</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Type:</strong> ${typeLabel}</p>
      <p>Log in to the <a href="${process.env.BASE_URL || ''}/admin">admin dashboard</a> to view details.</p>
    `
  ).catch(() => {});
}

/**
 * Notify admin of a new contact form message.
 * Fire-and-forget — never blocks the main request.
 */
export function notifyNewContact(name: string, email: string, message: string): void {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  sendEmail(
    adminEmail,
    `New Contact Message from ${name}`,
    `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="border-left: 3px solid #C4A265; padding-left: 12px; color: #555;">
        ${escapeHtml(message)}
      </blockquote>
      <p>Log in to the <a href="${process.env.BASE_URL || ''}/admin">admin dashboard</a> to respond.</p>
    `
  ).catch(() => {});
}

/**
 * Notify admin of a new volunteer sign-up.
 * Fire-and-forget — never blocks the main request.
 */
export function notifyNewVolunteer(name: string, email: string): void {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  sendEmail(
    adminEmail,
    `New Relay For Life Volunteer: ${name}`,
    `
      <h2>New Volunteer Sign-Up</h2>
      <p><strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}) has signed up to volunteer at the Relay For Life booth.</p>
      <p>Log in to the <a href="${process.env.BASE_URL || ''}/admin">admin dashboard</a> to view details.</p>
    `
  ).catch(() => {});
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
