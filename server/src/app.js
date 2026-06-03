const express = require("express");
const session = require("express-session");
const cors = require("cors");
const env = require("./config/env");
const notFoundHandler = require("./middlewares/notFoundHandler");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const {
  conversationsRouter,
  messagesRouter,
} = require("./routes/messageRoutes");
const profileRoutes = require("./routes/profileRoutes");
const housingRoutes = require("./routes/housingRoutes");
const questionnaireRoutes = require("./routes/questionnaireRoutes");

const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(
  session({
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      server: "running",
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api", profileRoutes);
app.use("/api", questionnaireRoutes);
app.use("/api/housing", housingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
