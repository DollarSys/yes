require("dotenv").config();
require("./src/strategies/discord");

const express = require("express");
const session = require("express-session");
const ms = require("ms");

const passport = require("passport");
const mongoose = require("mongoose");
const Store = require("connect-mongo");

const authRoutes = require("./src/routes/auth");
const pagesRoutes = require("./src/routes/pages");

const port = process.env.PORT || 8080;
const connection = mongoose.connection;
const app = express();
const store = Store.create({
  mongoUrl: process.env.MONGOURI,
  autoRemove: "native",
});

mongoose.connect(process.env.MONGOURI);
connection
  .on("connected", () => console.info("Successfully connected to mongodb."))
  .on("error", (err) => console.error(err))
  .on("disconnected", () => console.info("Disconnected from mongodb."));

app.use(
  session({
    secret: "secret-discord-login-69",
    cookie: {
      maxAge: ms("1d"),
    },
    resave: false,
    saveUninitialized: false,
    store,
  })
);

app.set('view engine', 'ejs');
app.use(express.static('views'))
app.use(passport.initialize());
app.use(passport.session());

app.use("/", authRoutes);
app.use("/", pagesRoutes);

app.listen(port, () => console.log(`Webserver listening on port ${port}`));