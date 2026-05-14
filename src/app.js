const express = require("express");
const userRoutes = require("./routes/userRoutes")
const loginRoutes = require("./routes/loginRoute")
const gymRoutes = require("./routes/gymRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const memberRoutes = require("./routes/memberRoute");
const planRoutes = require("./routes/planRoutes");
const requestRoutes = require("./routes/requestRoutes");
const cors = require("cors");
const weightRoutes = require("./routes/weightRoutes");
const { startAutoCheckoutCron } = require("../cron/autoCheckout");
const { startStreakEvaluatorCron } = require("../cron/streakEvaluator");
const entryRoutes = require("./routes/entryRoute");
const streakRoutes = require("./routes/streakRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { startMembershipNotifierCron } = require("../cron/membershipNotifier");
const { startSessionSweeperCron } = require("../cron/sessionSweeper");
const { startVisitNudgeCron } = require("../cron/visitNudge");
const analyticsRoutes = require("./routes/analyticsRoutes");
const closureRoutes = require("./routes/closureRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000", "http://localhost:8081"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        if (process.env.NODE_ENV !== "production") return callback(null, true);
        return callback(new Error("CORS: requests without Origin blocked in production"));
      }
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running...");
});

app.use("/users",userRoutes)
app.use("/auth",loginRoutes)
app.use("/gyms", gymRoutes);
app.use("/gyms", reviewRoutes);
app.use("/members", memberRoutes);
app.use("/plans",planRoutes);
app.use("/requests", requestRoutes);
app.use("/weight", weightRoutes);
app.use("/entry",entryRoutes)
app.use("/streaks", streakRoutes);
app.use("/notifications", notificationRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/closures", closureRoutes);
app.use("/announcements", announcementRoutes);
app.use("/api/payment", paymentRoutes);


startAutoCheckoutCron();
startStreakEvaluatorCron();
startMembershipNotifierCron();
startSessionSweeperCron();
startVisitNudgeCron();

app.use(notFound);
app.use(errorHandler);

module.exports = app;
