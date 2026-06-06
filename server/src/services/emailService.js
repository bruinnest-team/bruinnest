const nodemailer = require("nodemailer");
const env = require("../config/env");
const MailDeliveryError = require("../errors/MailDeliveryError");

let transporter;

function requireMailConfig() {
  if (!env.mail.smtpHost || !env.mail.smtpUser || !env.mail.smtpPass) {
    throw new MailDeliveryError();
  }
}

function getTransporter() {
  if (!env.mail.enabled) {
    return null;
  }

  if (!transporter) {
    requireMailConfig();
    transporter = nodemailer.createTransport({
      host: env.mail.smtpHost,
      port: env.mail.smtpPort,
      secure: env.mail.smtpSecure,
      auth: {
        user: env.mail.smtpUser,
        pass: env.mail.smtpPass,
      },
    });
  }

  return transporter;
}

async function sendVerificationCodeEmail({ to, code }) {
  if (!env.mail.enabled) {
    console.log(`Verification code for ${to}: ${code}`);
    return;
  }

  const from = env.mail.from || env.mail.smtpUser;
  const text = [
    "Welcome to BruinNest.",
    "",
    `Your verification code is ${code}.`,
    "This code expires in 10 minutes.",
  ].join("\n");
  const html = `
    <p>Welcome to BruinNest.</p>
    <p>Your verification code is <strong>${code}</strong>.</p>
    <p>This code expires in 10 minutes.</p>
  `;

  try {
    await getTransporter().sendMail({
      from,
      to,
      subject: "BruinNest verification code",
      text,
      html,
    });
  } catch {
    throw new MailDeliveryError();
  }
}

module.exports = {
  sendVerificationCodeEmail,
};
