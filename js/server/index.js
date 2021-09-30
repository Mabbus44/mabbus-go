"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var uh = require("./userHandling");
var lang = require("./lang");
var pageFuncs = require("./pageFuncs");
var express = require("express");
var path = require("path");
var session = require("express-session");
var socketHandle = require("./socketHandling");
var PORT = process.env.PORT;
var sessionMiddleware = session({ secret: "psfjigomisodfjnsiojfn", saveUninitialized: true, resave: true });
var server = express()
    .use(express.static(path.join(__dirname, "../../public")))
    .use(express.urlencoded())
    .use(sessionMiddleware)
    .set("views", path.join(__dirname, "../../views"))
    .set("view engine", "ejs")
    .get("/*", httpGet)
    .post("/*", httpPost)
    .listen(PORT, function () { return console.log("Listening on " + PORT); });
socketHandle.initSockets(server, sessionMiddleware);
function httpGet(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var splittedURL, adress, args, _a, _b, _c, _d, _e, playerIds, playerColor, playerNames;
        var _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    splittedURL = req.url.split("?", 2);
                    adress = splittedURL[0];
                    args = typeof splittedURL[1] === "string" ? splittedURL[1] : "";
                    _a = adress;
                    switch (_a) {
                        case "/challenge": return [3 /*break*/, 1];
                        case "/main": return [3 /*break*/, 5];
                        case "/play": return [3 /*break*/, 9];
                        case "/profile": return [3 /*break*/, 13];
                        case "/register": return [3 /*break*/, 15];
                        case "/logout": return [3 /*break*/, 19];
                        case "/login": return [3 /*break*/, 20];
                    }
                    return [3 /*break*/, 24];
                case 1:
                    _b = render;
                    _c = ["pages/challenge", req, res];
                    _f = {};
                    return [4 /*yield*/, pageFuncs.getChallengeblePlayers(uh.getUserId(req.session))];
                case 2:
                    _f.challengeblePlayers = _h.sent();
                    return [4 /*yield*/, pageFuncs.getChallengedPlayers(uh.getUserId(req.session))];
                case 3: return [4 /*yield*/, _b.apply(void 0, _c.concat([(_f.challengedPlayers = _h.sent(),
                            _f)]))];
                case 4:
                    _h.sent();
                    return [3 /*break*/, 25];
                case 5:
                    _d = render;
                    _e = ["pages/main", req, res];
                    _g = {};
                    return [4 /*yield*/, pageFuncs.getChallengers(uh.getUserId(req.session))];
                case 6:
                    _g.challengers = _h.sent();
                    return [4 /*yield*/, pageFuncs.getCurrentMatches(uh.getUserId(req.session))];
                case 7: return [4 /*yield*/, _d.apply(void 0, _e.concat([(_g.currentMatches = _h.sent(),
                            _g)]))];
                case 8:
                    _h.sent();
                    return [3 /*break*/, 25];
                case 9: return [4 /*yield*/, uh.getPlayerIds(+getArg(args, "id"))];
                case 10:
                    playerIds = _h.sent();
                    playerColor = uh.getUserColorFromList(playerIds, uh.getUserId(req.session));
                    return [4 /*yield*/, uh.getUsernames(playerIds)];
                case 11:
                    playerNames = _h.sent();
                    if (playerNames.length !== 2)
                        playerNames = ["", ""];
                    return [4 /*yield*/, render("pages/play", req, res, {
                            player1Name: playerNames[0],
                            player2Name: playerNames[1],
                            playerColor: playerColor,
                        })];
                case 12:
                    _h.sent();
                    return [3 /*break*/, 25];
                case 13: return [4 /*yield*/, render("pages/profile", req, res)];
                case 14:
                    _h.sent();
                    return [3 /*break*/, 25];
                case 15:
                    if (!uh.isLoggedIn(req.session)) return [3 /*break*/, 16];
                    res.redirect("/main");
                    return [3 /*break*/, 18];
                case 16: return [4 /*yield*/, render("pages/register", req, res)];
                case 17:
                    _h.sent();
                    _h.label = 18;
                case 18: return [3 /*break*/, 25];
                case 19:
                    uh.logout(req.session);
                    res.redirect("/login");
                    return [3 /*break*/, 25];
                case 20:
                    if (!uh.isLoggedIn(req.session)) return [3 /*break*/, 21];
                    res.redirect("/main");
                    return [3 /*break*/, 23];
                case 21: return [4 /*yield*/, render("pages/login", req, res)];
                case 22:
                    _h.sent();
                    _h.label = 23;
                case 23: return [3 /*break*/, 25];
                case 24:
                    res.redirect("/login");
                    return [3 /*break*/, 25];
                case 25: return [2 /*return*/];
            }
        });
    });
}
function httpPost(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var splittedURL, adress, args, _a, result, result, matchId;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    splittedURL = req.url.split("?", 2);
                    adress = splittedURL[0];
                    args = splittedURL[1];
                    _a = adress;
                    switch (_a) {
                        case "/login": return [3 /*break*/, 1];
                        case "/register": return [3 /*break*/, 9];
                        case "/changeLanguage": return [3 /*break*/, 14];
                        case "/challenge": return [3 /*break*/, 15];
                        case "/choseColor": return [3 /*break*/, 20];
                    }
                    return [3 /*break*/, 31];
                case 1:
                    if (!(typeof req.body.username === "string" && typeof req.body.password === "string")) return [3 /*break*/, 6];
                    return [4 /*yield*/, uh.login(req.body.username, req.body.password, req.session)];
                case 2:
                    result = _b.sent();
                    if (!result.result) return [3 /*break*/, 3];
                    res.redirect("/main");
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, render("pages/login", req, res, { usernamefield: req.body.username, message: result.message })];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, render("pages/login", req, res)];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8: return [3 /*break*/, 32];
                case 9:
                    if (!(typeof req.body.username === "string" &&
                        typeof req.body.password === "string" &&
                        typeof req.body.password2 === "string")) return [3 /*break*/, 12];
                    return [4 /*yield*/, uh.createAccount(req.body.username, req.body.password, req.body.password2)];
                case 10:
                    result = _b.sent();
                    if (!!result.result) return [3 /*break*/, 12];
                    return [4 /*yield*/, render("pages/register", req, res, { usernameField: req.body.username, message: result.message })];
                case 11:
                    _b.sent();
                    return [2 /*return*/];
                case 12: return [4 /*yield*/, render("pages/register", req, res)];
                case 13:
                    _b.sent();
                    return [3 /*break*/, 32];
                case 14:
                    if (typeof req.body.currentUrl === "string" && typeof req.body.language === "string") {
                        lang.changeLanguage(req.session, req.body.language);
                        res.redirect(req.body.currentUrl);
                    }
                    else
                        res.redirect("/login");
                    return [3 /*break*/, 32];
                case 15:
                    if (!(typeof req.body.challengedID === "string")) return [3 /*break*/, 17];
                    return [4 /*yield*/, pageFuncs.challengePlayer(uh.getUserId(req.session), +req.body.challengedID)];
                case 16:
                    _b.sent();
                    return [3 /*break*/, 19];
                case 17:
                    if (!(typeof req.body.alreadyChallengedID === "string")) return [3 /*break*/, 19];
                    return [4 /*yield*/, pageFuncs.unChallengePlayer(uh.getUserId(req.session), +req.body.alreadyChallengedID)];
                case 18:
                    _b.sent();
                    _b.label = 19;
                case 19:
                    res.redirect("/challenge");
                    return [3 /*break*/, 32];
                case 20:
                    if (!(typeof req.body.challengerID === "string" &&
                        +req.body.challengerID != null &&
                        !isNaN(+req.body.challengerID))) return [3 /*break*/, 29];
                    if (!(typeof req.body.black === "string" || typeof req.body.white === "string")) return [3 /*break*/, 26];
                    matchId = void 0;
                    if (!(typeof req.body.black === "string")) return [3 /*break*/, 22];
                    return [4 /*yield*/, pageFuncs.acceptChallange(uh.getUserId(req.session), +req.body.challengerID, 0)];
                case 21:
                    matchId = _b.sent();
                    return [3 /*break*/, 24];
                case 22: return [4 /*yield*/, pageFuncs.acceptChallange(uh.getUserId(req.session), +req.body.challengerID, 1)];
                case 23:
                    matchId = _b.sent();
                    _b.label = 24;
                case 24: return [4 /*yield*/, res.redirect("pages/play?id=" + matchId, req, res)];
                case 25:
                    _b.sent();
                    return [3 /*break*/, 28];
                case 26: return [4 /*yield*/, render("pages/choseColor", req, res, { challengerID: +req.body.challengerID })];
                case 27:
                    _b.sent();
                    _b.label = 28;
                case 28: return [3 /*break*/, 30];
                case 29:
                    res.redirect("/main");
                    _b.label = 30;
                case 30: return [3 /*break*/, 32];
                case 31:
                    res.redirect("/login");
                    return [3 /*break*/, 32];
                case 32: return [2 /*return*/];
            }
        });
    });
}
function render(page, req, res, extraParam) {
    if (extraParam === void 0) { extraParam = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var username;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, uh.getUserName(req.session)];
                case 1:
                    username = _a.sent();
                    return [4 /*yield*/, res.render(page, __assign({ username: username, langFunc: lang, lang: typeof req.session.language === "string" ? req.session.language : "EN" }, extraParam))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function getArg(argsString, arg) {
    var argsSplit = argsString.split(/[=&]+/);
    for (var i = 0; i < argsSplit.length; i += 2)
        if (argsSplit[i] === arg)
            return argsSplit[i + 1];
    return "";
}
