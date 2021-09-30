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
exports.initSockets = void 0;
var socket_io_1 = require("socket.io");
var db = require("./dbHandling");
var uh = require("./userHandling");
var bf = require("../common/boardFuncs");
var lang = require("./lang");
var socketExtras = {};
var io;
function initSockets(server, sessionMiddleware) {
    io = new socket_io_1.Server(server);
    io.use(function (socket, next) {
        sessionMiddleware(socket.request, {}, next);
    });
    io.on("connection", socketConnect);
}
exports.initSockets = initSockets;
function socketConnect(socket) {
    var s = { matchId: 0 };
    socketExtras[socket.id] = s;
    console.log("Client connected " + socket.id);
    socket.on("disconnect", socketDisconnect);
    socket.on("subscribe to match", subscribeToMatch);
    socket.on("get moves", getMoves);
    socket.on("make move", makeMove);
    socket.on("pass turn", passTurn);
    socket.on("give up", giveUp);
}
function socketDisconnect() {
    var socket = this;
    console.log("Client disconnected " + socket.id);
    delete socketExtras[socket.id];
}
function getMoves(matchId, moveId) {
    if (moveId === void 0) { moveId = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var socket, result, moves, row;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    socket = this;
                    return [4 /*yield*/, db.query('SELECT "x", "y" FROM "moves" WHERE "matchindex" = $1 AND "moveindex" >= $2 ORDER BY "moveindex" ASC', [matchId, moveId])];
                case 1:
                    result = _a.sent();
                    if (result === null || result.rowCount === 0)
                        return [2 /*return*/];
                    moves = {};
                    for (row = 0; row < result.rowCount; row++)
                        moves[row + moveId] = { x: result.rows[row].x, y: result.rows[row].y };
                    socket.emit("new moves", moves);
                    return [2 /*return*/];
            }
        });
    });
}
function subscribeToMatch(matchId) {
    if (typeof matchId !== "number" || isNaN(matchId) || matchId <= 0)
        return;
    var socket = this;
    if (typeof socketExtras[socket.id] === "object")
        socketExtras[socket.id].matchId = matchId;
}
function makeMove(matchId, x, y) {
    return __awaiter(this, void 0, void 0, function () {
        var socket, userId, userColor;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof x !== "number" || isNaN(x) || x < 0 || x > 18)
                        return [2 /*return*/];
                    if (typeof y !== "number" || isNaN(y) || y < 0 || y > 18)
                        return [2 /*return*/];
                    socket = this;
                    userId = uh.getUserId(socket.request.session);
                    return [4 /*yield*/, uh.getUserColor(matchId, userId)];
                case 1:
                    userColor = _a.sent();
                    return [4 /*yield*/, commitMove(matchId, x, y, userColor)];
                case 2:
                    if (_a.sent())
                        sendMessage(socket, lang.translate("Stone added", socket.request.session.language));
                    return [2 /*return*/];
            }
        });
    });
}
function passTurn(matchId) {
    return __awaiter(this, void 0, void 0, function () {
        var socket, userId, userColor;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    socket = this;
                    userId = uh.getUserId(socket.request.session);
                    return [4 /*yield*/, uh.getUserColor(matchId, userId)];
                case 1:
                    userColor = _a.sent();
                    return [4 /*yield*/, commitMove(matchId, -1, -1, userColor)];
                case 2:
                    if (_a.sent())
                        sendMessage(socket, lang.translate("Turn passed", socket.request.session.language));
                    return [2 /*return*/];
            }
        });
    });
}
function giveUp(matchId) {
    return __awaiter(this, void 0, void 0, function () {
        var socket, userId, userColor;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    socket = this;
                    userId = uh.getUserId(socket.request.session);
                    return [4 /*yield*/, uh.getUserColor(matchId, userId)];
                case 1:
                    userColor = _a.sent();
                    commitMove(matchId, -2, -2, userColor);
                    return [2 /*return*/];
            }
        });
    });
}
function commitMove(matchId, x, y, userColor) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof matchId !== "number" || isNaN(matchId))
                        return [2 /*return*/, false];
                    if (typeof userColor !== "number" || isNaN(userColor) || userColor < 1 || userColor > 2)
                        return [2 /*return*/, false];
                    return [4 /*yield*/, db.query('SELECT "x", "y" FROM "moves" WHERE "matchindex" = $1 ORDER BY "moveindex" ASC', [
                            matchId,
                        ])];
                case 1:
                    result = _a.sent();
                    if (result === null)
                        return [2 /*return*/, false];
                    if (result.rowCount % 2 !== userColor - 1)
                        return [2 /*return*/, false];
                    return [4 /*yield*/, db.query('INSERT INTO "moves" ("x", "y", "moveindex", "matchindex") VALUES ($1, $2, $3, $4)', [
                            x,
                            y,
                            result.rowCount + 1,
                            matchId,
                        ])];
                case 2:
                    _a.sent();
                    pushMove(matchId, result.rowCount + 1, x, y);
                    if ((result.rowCount > 0 && result.rows[result.rowCount - 1] === -1 && x === -1) || x === -2) {
                        endMatch(matchId);
                    }
                    else
                        return [2 /*return*/, true];
                    return [2 /*return*/];
            }
        });
    });
}
function endMatch(matchId) {
    return __awaiter(this, void 0, void 0, function () {
        var result, points, moves, row, _i, _a, _b, socketId, socketExtra, board, _c, _d, _e, socketId, socketExtra;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, db.query('SELECT "x", "y" FROM "moves" WHERE "matchindex" = $1 ORDER BY "moveindex" ASC', [
                        matchId,
                    ])];
                case 1:
                    result = _f.sent();
                    if (result === null)
                        return [2 /*return*/];
                    moves = new Array(result.rowCount);
                    for (row = 0; row < result.rowCount; row++)
                        moves[row] = { x: result.rows[row].x, y: result.rows[row].y };
                    if (moves[moves.length - 1].x === -2) {
                        points = [-2, -2];
                        if (moves.length % 2 === 0) {
                            db.query('UPDATE "matchlist" SET "winner"="player1id", "endcause"=\'surrender\' WHERE "matchindex"=$1', [
                                matchId,
                            ]);
                            points[0] = -1;
                        }
                        else {
                            db.query('UPDATE "matchlist" SET "winner"="player2id", "endcause"=\'surrender\' WHERE "matchindex"=$1', [
                                matchId,
                            ]);
                            points[1] = -1;
                        }
                        for (_i = 0, _a = Object.entries(socketExtras); _i < _a.length; _i++) {
                            _b = _a[_i], socketId = _b[0], socketExtra = _b[1];
                            if (socketExtra.matchId === matchId)
                                io.sockets.sockets.get(socketId).emit("match ended", points);
                        }
                        return [2 /*return*/];
                    }
                    board = bf.movesToBoard(moves);
                    points = bf.countPoints(board, bf.getScoreBoard(board));
                    if (points[0] > points[1]) {
                        db.query('UPDATE "matchlist" SET "winner"="player1id", "endcause"=\'pass\', points1=$2, points2 = $3 WHERE "matchindex"=$1', [matchId, points[0], points[1]]);
                    }
                    else {
                        db.query('UPDATE "matchlist" SET "winner"="player2id", "endcause"=\'pass\', points1=$2, points2 = $3 WHERE "matchindex"=$1', [matchId, points[0], points[1]]);
                    }
                    for (_c = 0, _d = Object.entries(socketExtras); _c < _d.length; _c++) {
                        _e = _d[_c], socketId = _e[0], socketExtra = _e[1];
                        if (socketExtra.matchId === matchId)
                            io.sockets.sockets.get(socketId).emit("match ended", points);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function pushMove(matchId, moveId, x, y) {
    var moves = {};
    moves[moveId - 1] = { x: x, y: y };
    for (var _i = 0, _a = Object.entries(socketExtras); _i < _a.length; _i++) {
        var _b = _a[_i], socketId = _b[0], socketExtra = _b[1];
        if (socketExtra.matchId === matchId)
            io.sockets.sockets.get(socketId).emit("new moves", moves);
    }
}
function sendMessage(socket, message) {
    console.log("SendMessage:");
    console.log(message);
    socket.emit("message", message);
}
