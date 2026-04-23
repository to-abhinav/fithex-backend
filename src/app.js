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

const app = express();
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
app.use(cors());
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


startAutoCheckoutCron();
startStreakEvaluatorCron();
startMembershipNotifierCron();
startSessionSweeperCron();
startVisitNudgeCron();


module.exports = app;