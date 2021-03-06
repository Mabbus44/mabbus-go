"use strict";
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
exports.getMatchHistory = exports.acceptChallange = exports.unChallengePlayer = exports.challengePlayer = exports.getCurrentMatches = exports.getChallengeblePlayers = exports.getChallengedPlayers = exports.getChallengers = void 0;
var uh = require("./userHandling");
var db = require("./dbHandling");
function getChallengers(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var result, ids, _i, _a, row, usernames, ret, i;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db.query('SELECT "user1id" FROM "challenges" WHERE "user2id" = $1', [userId])];
                case 1:
                    result = _b.sent();
                    if (result === null)
                        return [2 /*return*/, {}];
                    ids = [];
                    for (_i = 0, _a = result.rows; _i < _a.length; _i++) {
                        row = _a[_i];
                        ids.push(row.user1id);
                    }
                    return [4 /*yield*/, uh.getUsernames(ids)];
                case 2:
                    usernames = _b.sent();
                    ret = {};
                    for (i in ids)
                        ret[ids[i]] = usernames[i];
                    return [2 /*return*/, ret];
            }
        });
    });
}
exports.getChallengers = getChallengers;
function getChallengedPlayers(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var result, ids, _i, _a, row, usernames, ret, i;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db.query('SELECT "user2id" FROM "challenges" WHERE "user1id" = $1', [userId])];
                case 1:
                    result = _b.sent();
                    if (result === null)
                        return [2 /*return*/, {}];
                    ids = [];
                    for (_i = 0, _a = result.rows; _i < _a.length; _i++) {
                        row = _a[_i];
                        ids.push(row.user2id);
                    }
                    return [4 /*yield*/, uh.getUsernames(ids)];
                case 2:
                    usernames = _b.sent();
                    ret = {};
                    for (i in ids)
                        ret[ids[i]] = usernames[i];
                    return [2 /*return*/, ret];
            }
        });
    });
}
exports.getChallengedPlayers = getChallengedPlayers;
function getChallengeblePlayers(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var query, result, ret, _i, _a, row;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    query = 'SELECT "username", "id" FROM "credentials" WHERE "id" NOT IN (';
                    query += 'SELECT "user1id" AS id FROM "challenges" WHERE "user2id" = $1 UNION ';
                    query += 'SELECT "user2id" AS id FROM "challenges" WHERE "user1id" = $1 UNION ';
                    query += 'SELECT "player1id" AS id FROM "matchlist" WHERE "player2id" = $1 AND "endcause" IS NULL UNION ';
                    query += 'SELECT "player2id" AS id FROM "matchlist" WHERE "player1id" = $1 AND "endcause" IS NULL)';
                    return [4 /*yield*/, db.query(query, [userId])];
                case 1:
                    result = _b.sent();
                    if (result === null)
                        return [2 /*return*/, {}];
                    ret = {};
                    console.log(result.rows);
                    for (_i = 0, _a = result.rows; _i < _a.length; _i++) {
                        row = _a[_i];
                        if (row.id !== userId)
                            ret[row.id] = row.username;
                    }
                    return [2 /*return*/, ret];
            }
        });
    });
}
exports.getChallengeblePlayers = getChallengeblePlayers;
function getCurrentMatches(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var result, ids, _i, _a, row, usernames, ret, i;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db.query('SELECT "matchindex", "player1id", "player2id" FROM "matchlist" WHERE ("player1id"=$1 OR "player2id"=$1) AND "endcause" is null', [userId])];
                case 1:
                    result = _b.sent();
                    if (result === null)
                        return [2 /*return*/, {}];
                    ids = [];
                    for (_i = 0, _a = result.rows; _i < _a.length; _i++) {
                        row = _a[_i];
                        if (row.player1id === userId)
                            ids.push(row.player2id);
                        else
                            ids.push(row.player1id);
                    }
                    return [4 /*yield*/, uh.getUsernames(ids)];
                case 2:
                    usernames = _b.sent();
                    ret = {};
                    for (i = 0; i < result.rows.length; i++)
                        ret[result.rows[i].matchindex] = usernames[i];
                    return [2 /*return*/, ret];
            }
        });
    });
}
exports.getCurrentMatches = getCurrentMatches;
function challengePlayer(userId, challengeId) {
    return __awaiter(this, void 0, void 0, function () {
        var query, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (userId == null || challengeId == null)
                        return [2 /*return*/, false];
                    query = 'SELECT "id" FROM (';
                    query += 'SELECT "user1id" AS id FROM "challenges" WHERE "user2id" = $1 UNION ';
                    query += 'SELECT "user2id" AS id FROM "challenges" WHERE "user1id" = $1 UNION ';
                    query += 'SELECT "player1id" AS id FROM "matchlist" WHERE "player2id" = $1 AND "endcause" IS NULL UNION ';
                    query += 'SELECT "player2id" AS id FROM "matchlist" WHERE "player1id" = $1 AND "endcause" IS NULL';
                    query += ') AS takenplayers WHERE "id" = $2';
                    return [4 /*yield*/, db.query(query, [userId, challengeId])];
                case 1:
                    result = _a.sent();
                    if (result === null || result.rowCount > 0)
                        return [2 /*return*/, false];
                    query = 'INSERT INTO "challenges" ("user1id", "user2id") VALUES ($1, $2)';
                    return [4 /*yield*/, db.query(query, [userId, challengeId])];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.challengePlayer = challengePlayer;
function unChallengePlayer(userId, challengerId) {
    return __awaiter(this, void 0, void 0, function () {
        var query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (userId == null || isNaN(userId) || challengerId == null || isNaN(challengerId))
                        return [2 /*return*/, false];
                    query = 'DELETE FROM "challenges" WHERE "user1id"=$1 AND "user2id"=$2';
                    return [4 /*yield*/, db.query(query, [userId, challengerId])];
                case 1:
                    _a.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.unChallengePlayer = unChallengePlayer;
function acceptChallange(userId, challengerId, color) {
    return __awaiter(this, void 0, void 0, function () {
        var query, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (userId == null || isNaN(userId) || challengerId == null || isNaN(challengerId) || (color !== 0 && color !== 1)) {
                        return [2 /*return*/, 0];
                    }
                    query = 'DELETE FROM "challenges" WHERE "user2id"=$1 AND "user1id"=$2';
                    return [4 /*yield*/, db.query(query, [userId, challengerId])];
                case 1:
                    result = _a.sent();
                    if (result === null || result.rowCount === 0)
                        return [2 /*return*/, 0];
                    if (color === 0)
                        query = 'INSERT INTO "matchlist" ("player1id", "player2id") VALUES ($1, $2) RETURNING "matchindex";';
                    else
                        query = 'INSERT INTO "matchlist" ("player1id", "player2id") VALUES ($2, $1) RETURNING "matchindex";';
                    return [4 /*yield*/, db.query(query, [userId, challengerId])];
                case 2:
                    result = _a.sent();
                    if (result === null || result.rowCount !== 1)
                        return [2 /*return*/, 0];
                    return [2 /*return*/, result.rows[0].matchindex];
            }
        });
    });
}
exports.acceptChallange = acceptChallange;
function getMatchHistory(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var result, matches, _i, _a, row;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db.query('SELECT m.player1id, m.player2id, m.matchindex, c1.username as name1, c2.username as name2, m.winner, m.endcause, m.points1, m.points2 FROM matchlist m INNER JOIN credentials c1 on c1.id = m.player1id INNER JOIN credentials c2 on c2.id = m.player2id WHERE m.player1id = $1 OR m.player2id = $1 AND "endcause" is null', [userId])];
                case 1:
                    result = _b.sent();
                    console.log(result);
                    if (result === null)
                        return [2 /*return*/, []];
                    matches = [];
                    for (_i = 0, _a = result.rows; _i < _a.length; _i++) {
                        row = _a[_i];
                        matches.push({
                            player1id: row.player1id,
                            player2id: row.player2id,
                            winner: row.winner,
                            matchindex: row.matchindex,
                            name1: row.name1,
                            name2: row.name2,
                            endCause: row.endcause,
                            points1: row.points1,
                            points2: row.points2,
                        });
                    }
                    console.log(matches);
                    return [2 /*return*/, matches];
            }
        });
    });
}
exports.getMatchHistory = getMatchHistory;
