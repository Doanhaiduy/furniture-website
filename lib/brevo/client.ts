import "server-only";

import nodemailer from "nodemailer";

const BREVO_SMTP_HOST = "smtp-relay.brevo.com";
const BREVO_SMTP_PORT = 587;

/**
 * Build an SMTP transporter for Brevo from an explicitly-resolved login/key pair
 * (e.g. one decrypted from integration_secrets at request time). Isolated here so
 * it can be mocked in tests.
 */
export function getBrevoTransporter(login: string, smtpKey: string) {
  return nodemailer.createTransport({
    host: BREVO_SMTP_HOST,
    port: BREVO_SMTP_PORT,
    secure: false, // STARTTLS on 587
    auth: { user: login, pass: smtpKey },
  });
}
