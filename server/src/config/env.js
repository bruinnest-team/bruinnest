const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: Number(process.env.PORT ?? 3000),
  sessionSecret: process.env.SESSION_SECRET ?? "change-me",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  databasePath:
    process.env.DATABASE_PATH ??
    path.join(process.cwd(), "database", "bruinnest.sqlite"),
};
