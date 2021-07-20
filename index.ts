import * as auth from "./modules/auth";
import * as lang from "./modules/lang";
import * as pageFuncs from "./modules/pageFuncs";
import * as express from "express";
import { Server } from "socket.io";
import * as path from "path";
import * as session from "express-session";
const PORT = process.env.PORT;

const server = express()
  .use(express.static(path.join(__dirname, "public")))
  .use(express.urlencoded())
  .use(session({ secret: "psfjigomisodfjnsiojfn", saveUninitialized: true, resave: true }))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/*", httpGet)
  .post("/*", httpPost)
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = new Server(server);
io.on("connection", (socket) => {
  console.log(`Client connected ${socket.id}`);
  socket.on("disconnect", () => console.log(`Client disconnected ${socket.id}`));
  socket.on("newMessage", (message) => console.log(message));
});

setInterval(() => io.emit("dbg", "bajsmsg"), 5000);

async function httpGet(req, res) {
  let splittedURL: string[] = req.url.split("?", 2);
  let adress = splittedURL[0];
  let args = splittedURL[1];
  switch (adress) {
    case "/challenge":
      await render("pages/challenge", req, res, {
        challengeblePlayers: await pageFuncs.getChallengeblePlayers(auth.getUserId(req.session)),
        challengedPlayers: await pageFuncs.getChallengedPlayers(auth.getUserId(req.session)),
      });
      break;
    case "/main":
      await render("pages/main", req, res, {
        challengers: await pageFuncs.getChallengers(auth.getUserId(req.session)),
        currentMatches: await pageFuncs.getCurrentMatches(auth.getUserId(req.session)),
      });
      break;
    case "/play":
      await render("pages/play", req, res);
      break;
    case "/profile":
      await render("pages/profile", req, res);
      break;
    case "/register":
      if (auth.isLoggedIn(req.session)) res.redirect("/main");
      else await render("pages/register", req, res);
      break;
    case "/logout":
      auth.logout(req.session);
      res.redirect("/login");
      break;
    case "/login":
      if (auth.isLoggedIn(req.session)) res.redirect("/main");
      else await render("pages/login", req, res);
      break;
    default:
      res.redirect("/login");
      break;
  }
}

async function httpPost(req, res) {
  let splittedURL: string[] = req.url.split("?", 2);
  let adress = splittedURL[0];
  let args = splittedURL[1];
  switch (adress) {
    case "/login":
      if (typeof req.body.username === "string" && typeof req.body.password === "string") {
        const result = await auth.login(req.body.username, req.body.password, req.session);
        if (result.result) res.redirect("/main");
        else await render("pages/login", req, res, { usernamefield: req.body.username, message: result.message });
      } else await render("pages/login", req, res);
      break;
    case "/register":
      if (
        typeof req.body.username === "string" &&
        typeof req.body.password === "string" &&
        typeof req.body.password2 === "string"
      ) {
        const result = await auth.createAccount(req.body.username, req.body.password, req.body.password2);
        if (!result.result) {
          await render("pages/register", req, res, { usernameField: req.body.username, message: result.message });
          return;
        }
      }
      await render("pages/register", req, res);
      break;
    case "/changeLanguage":
      if (typeof req.body.currentUrl === "string" && typeof req.body.language === "string") {
        lang.changeLanguage(req.session, req.body.language);
        res.redirect(req.body.currentUrl);
      } else res.redirect("/login");
      break;
    case "/challenge":
      if (typeof req.body.challengedID === "string") {
        await pageFuncs.challengePlayer(auth.getUserId(req.session), +req.body.challengedID);
      } else if (typeof req.body.alreadyChallengedID === "string") {
        await pageFuncs.unChallengePlayer(auth.getUserId(req.session), +req.body.alreadyChallengedID);
      }
      res.redirect("/challenge");
      break;
    case "/choseColor":
      if (
        typeof req.body.challengerID === "string" &&
        +req.body.challengerID != null &&
        !isNaN(+req.body.challengerID)
      ) {
        if (typeof req.body.black === "string" || typeof req.body.white === "string") {
          let matchID: number;
          if (typeof req.body.black === "string")
            matchID = await pageFuncs.acceptChallange(auth.getUserId(req.session), +req.body.challengerID, 0);
          else matchID = await pageFuncs.acceptChallange(auth.getUserId(req.session), +req.body.challengerID, 1);
          await res.redirect(`pages/play?id=${matchID}`, req, res);
        } else {
          await render("pages/choseColor", req, res, { challengerID: +req.body.challengerID });
        }
      } else res.redirect("/main");
      break;
    default:
      res.redirect("/login");
      break;
  }
}

async function render(page: string, req: any, res: any, extraParam = {}): Promise<void> {
  const username = await auth.getUserName(req.session);
  await res.render(page, {
    username: username,
    langFunc: lang,
    lang: typeof req.session.language === "string" ? req.session.language : "EN",
    ...extraParam,
  });
}
