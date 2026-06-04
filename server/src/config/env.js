const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const databasePath = process.env.DATABASE_PATH
  ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
  : path.join(process.cwd(), "database", "bruinnest.sqlite");

function parseBoolean(value, defaultValue = false) {
  if (value === undefined) {
    return defaultValue;
  }

  return value.trim().toLowerCase() === "true";
}

module.exports = {
  port: Number(process.env.PORT ?? 3000),
  sessionSecret: process.env.SESSION_SECRET ?? "change-me",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  databasePath,
  mail: {
    enabled: parseBoolean(process.env.MAIL_ENABLED, false),
    smtpHost: process.env.SMTP_HOST ?? "smtp.gmail.com",
    smtpPort: Number(process.env.SMTP_PORT ?? 587),
    smtpSecure: parseBoolean(process.env.SMTP_SECURE, false),
    smtpUser: process.env.SMTP_USER ?? "",
    smtpPass: process.env.SMTP_PASS ?? "",
    from: process.env.MAIL_FROM ?? "",
  },
};
