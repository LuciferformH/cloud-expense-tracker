// ==========================================
// Email Configuration (Nodemailer)
// ==========================================
// Configures the SMTP transport for sending emails
// (password resets, budget alerts, etc.).
// Only initializes if SMTP credentials are provided.

import nodemailer from "nodemailer";
import { env } from "./env";

// Create transporter only if SMTP config is available
export const emailTransporter =
  env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT || 587,
        secure: (env.SMTP_PORT || 587) === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      })
    : null;

// Default sender address
export const EMAIL_FROM = env.EMAIL_FROM || "Cloud Expense Tracker <noreply@cloudexpensetracker.com>";
