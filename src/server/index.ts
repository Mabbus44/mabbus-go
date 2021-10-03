import * as uh from "./userHandling";
import * as lang from "./lang";
import * as pageFuncs from "./pageFuncs";
import * as express from "express";
import * as path from "path";
import * as session from "express-session";
import * as socketHandle from "./socketHandling";

const PORT = process.env.PORT;
const sessionMiddleware = session({ secret: "psfjigomisodfjnsiojfn", saveUninitialized: true, resave: true });
const server = express()
  .use(express.static(path.join(__dirname, "../../public")))
  .use(express.urlencoded())
  .use(sessionMiddleware)
  .set("views", path.join(__dirname, "../../views"))
  .set("view engine", "ejs")
  .get("/*", httpGet)
  .post("/*", httpPost)
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
socketHandle.initSockets(server, sessionMiddleware);

async function httpGet(req, res) {
  let splittedURL: string[] = req.url.split("?", 2);
  let adress: string = splittedURL[0];
  let args: string = typeof splittedURL[1] === "string" ? splittedURL[1] : "";
  switch (adress) {
    case "/challenge":
      await render("pages/challenge", req, res, {
        challengeblePlayers: await pageFuncs.getChallengeblePlayers(uh.getUserId(req.session)),
        challengedPlayers: await pageFuncs.getChallengedPlayers(uh.getUserId(req.session))
      });
      break;
    case "/main":
      await render("pages/main", req, res, {
        challengers: await pageFuncs.getChallengers(uh.getUserId(req.session)),
        currentMatches: await pageFuncs.getCurrentMatches(uh.getUserId(req.session))
      });
      break;
    case "/play":
      let playerIds: number[] = await uh.getPlayerIds(+getArg(args, "id"));
      let playerColor: number = uh.getUserColorFromList(playerIds, uh.getUserId(req.session));
      let playerNames: string[] = await uh.getUsernames(playerIds);
      if (playerNames.length !== 2) playerNames = ["", ""];
      await render("pages/play", req, res, {
        player1Name: playerNames[0],
        player2Name: playerNames[1],
        playerColor: playerColor
      });
      break;
    case "/profile":
      await render("pages/profile", req, res);
      break;
    case "/register":
      if (uh.isLoggedIn(req.session)) res.redirect("/main");
      else await render("pages/register", req, res);
      break;
    case "/logout":
      uh.logout(req.session);
      res.redirect("/login");
      break;
    case "/login":
      if (uh.isLoggedIn(req.session)) res.redirect("/main");
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
        const result = await uh.login(req.body.username, req.body.password, req.session);
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
        const result = await uh.createAccount(req.body.username, req.body.password, req.body.password2);
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
        await pageFuncs.challengePlayer(uh.getUserId(req.session), +req.body.challengedID);
      } else if (typeof req.body.alreadyChallengedID === "string") {
        await pageFuncs.unChallengePlayer(uh.getUserId(req.session), +req.body.alreadyChallengedID);
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
          let matchId: number;
          if (typeof req.body.black === "string")
            matchId = await pageFuncs.acceptChallange(uh.getUserId(req.session), +req.body.challengerID, 0);
          else matchId = await pageFuncs.acceptChallange(uh.getUserId(req.session), +req.body.challengerID, 1);
          await res.redirect(`pages/play?id=${matchId}`, req, res);
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
  const username = await uh.getUserName(req.session);
  await res.render(page, {
    username: username,
    langFunc: lang,
    lang: typeof req.session.language === "string" ? req.session.language : "EN",
    ...extraParam
  });
}

function getArg(argsString: string, arg: string): string {
  let argsSplit: string[] = argsString.split(/[=&]+/);
  for (let i: number = 0; i < argsSplit.length; i += 2) if (argsSplit[i] === arg) return argsSplit[i + 1];
  return "";
}
