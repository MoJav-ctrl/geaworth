import nodemailer from "nodemailer";

/**
 * Optional email notifications. If SMTP_HOST is not set this is a no-op,
 * and a mail failure never affects the HTTP response.
 */
let transporter: nodemailer.Transporter | null | undefined;

function getTransporter() {
  if (transporter !== undefined) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  if (!SMTP_HOST) {
    transporter = null;
    return transporter;
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === "true",
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  return transporter;
}

export function notify(subject: string, lines: Record<string, unknown>): void {
  const t = getTransporter();
  if (!t) return;
  const to = process.env.NOTIFICATION_EMAIL || "info@geaworthproperties.com";
  const text = Object.entries(lines)
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
    .join("\n");
  // Pressing Reply on the notification goes straight to the visitor who filled in the form.
  // (Form emails are validated upstream, so this is always a clean address.)
  const replyTo = typeof lines.email === "string" ? lines.email : undefined;
  t.sendMail({ from: process.env.SMTP_FROM || to, to, replyTo, subject, text }).catch((err) =>
    console.error("Email notification failed (submission was still saved):", err.message),
  );
}
