const express = require("express");
const socketIO = require("socket.io");
const path = require("path");
const PORT = process.env.PORT || 3000;
const { Pool } = require("pg");

const server = express()
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/login"))
  .get("/login", (req, res) => res.render("pages/login"))
  .get("/main", (req, res) => res.render("pages/main"))
  .get("/play", (req, res) => res.render("pages/play"))
  .get("/profile", (req, res) => res.render("pages/profile"))
  .get("/register", (req, res) => res.render("pages/register"))
  .get("/replay", (req, res) => res.render("pages/replay"))
  .get("/start-new-game", (req, res) => res.render("pages/start-new-game"))
  .get("/head", (req, res) => res.render("partials/head"))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
