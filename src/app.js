const express = require("express");
const userRoutes = require("./routes/userRoutes")
const loginRoutes = require("./routes/loginRoute")
const gymRoutes = require("./routes/gymRoutes");
const memberRoutes = require("./routes/memberRoute");
const planRoutes = require("./routes/planRoutes");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running...");
});

app.use("/users",userRoutes)
app.use("/auth",loginRoutes)
app.use("/gyms", gymRoutes);
app.use("/members", memberRoutes);
app.use("/plans",planRoutes);

module.exports = app;