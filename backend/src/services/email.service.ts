// ==========================================
// Email Service
// ==========================================
// Centralized email sending functionality.
// Handles budget alerts, notifications, and general emails.
// Gracefully skips if SMTP is not configured.

import { emailTransporter, EMAIL_FROM } from "../config/email";

// ==========================================
// Send budget alert email
// ==========================================
export const sendBudgetAlert = async (
  to: string,
  budgetName: string,
  percentUsed: number,
  spent: number,
  limit: number,
  isExceeded: boolean
) => {
  if (!emailTransporter) {
    console.log("📧 Email not configured, skipping budget alert");
    return;
  }

  const subject = isExceeded
    ? `⚠️ Budget "${budgetName}" Exceeded!`
    : `⚠️ Budget "${budgetName}" Alert - ${percentUsed.toFixed(0)}% Used`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${isExceeded ? "#DC2626" : "#F59E0B"};">
        ${isExceeded ? "Budget Exceeded!" : "Budget Alert"}
      </h2>
      <p>Your budget <strong>"${budgetName}"</strong> has ${isExceeded ? "been exceeded" : "reached the alert threshold"}.</p>
      <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Budget:</strong> ${budgetName}</p>
        <p><strong>Spent:</strong> $${spent.toFixed(2)}</p>
        <p><strong>Limit:</strong> $${limit.toFixed(2)}</p>
        <p><strong>Usage:</strong> ${percentUsed.toFixed(1)}%</p>
      </div>
      <p>Please review your cloud spending to stay within budget.</p>
      <p style="color: #6B7280; font-size: 12px;">Cloud Expense Tracker</p>
    </div>
  `;

  await emailTransporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    html,
  });
};

// ==========================================
// Send general notification email
// ==========================================
export const sendNotificationEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  if (!emailTransporter) {
    console.log("📧 Email not configured, skipping notification");
    return;
  }

  await emailTransporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    html,
  });
};
