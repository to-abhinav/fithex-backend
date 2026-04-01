const express = require("express");
const userRoutes = require("./routes/userRoutes")
const loginRoutes = require("./routes/loginRoute")
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running...");
});

app.use("/users",userRoutes)
app.use("/auth",loginRoutes)

module.exports = app;