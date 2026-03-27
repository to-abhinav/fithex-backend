const express = require("express");
const userRoutes = require("./routes/userRoutes")
const loginRoutes = require("./routes/loginRoute")

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running...");
});

app.use("/user",userRoutes)
app.use("/user",loginRoutes)

module.exports = app;