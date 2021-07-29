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
exports.getUserId = exports.getUsernames = exports.getUserName = exports.isLoggedIn = exports.createAccount = exports.logout = exports.login = void 0;
var Pool = require("pg").Pool;
var yn = require("yn");
var bc = require("bcrypt");
function login(username, password, session) {
    return __awaiter(this, void 0, void 0, function () {
        var pool, client, result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof session != "object" || session == null)
                        return [2 /*return*/, { result: false, message: "Internal error" }];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    pool = new Pool({
                        connectionString: process.env.DATABASE_URL,
                        ssl: yn(process.env.DATABASE_SSL),
                    });
                    return [4 /*yield*/, pool.connect()];
                case 2:
                    client = _a.sent();
                    return [4 /*yield*/, client.query('SELECT "id", "password" FROM "credentials" WHERE "username"=$1', [username])];
                case 3:
                    result = _a.sent();
                    client.release();
                    if (result.rowCount != 1)
                        return [2 /*return*/, { result: false, message: "Username does not exist" }];
                    return [4 /*yield*/, bc.compare(password, result.rows[0].password)];
                case 4:
                    if (!(_a.sent()))
                        return [2 /*return*/, { result: false, message: "Wrong password" }];
                    session.userId = result.rows[0].id;
                    return [2 /*return*/, { result: true, message: "Login succeeded" }];
                case 5:
                    err_1 = _a.sent();
                    console.error(err_1);
                    return [2 /*return*/, { result: false, message: "Internal error" }];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.login = login;
function logout(session) {
    if (typeof session != "object" || session == null)
        return false;
    session.destroy();
    return true;
}
exports.logout = logout;
function createAccount(username, password, password2) {
    return __awaiter(this, void 0, void 0, function () {
        var cresult, pool, client, hashedPassword, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, checkNewCredentials(username, password, password2)];
                case 1:
                    cresult = _a.sent();
                    if (!cresult.result)
                        return [2 /*return*/, cresult];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, , 7]);
                    pool = new Pool({
                        connectionString: process.env.DATABASE_URL,
                        ssl: yn(process.env.DATABASE_SSL),
                    });
                    return [4 /*yield*/, pool.connect()];
                case 3:
                    client = _a.sent();
                    return [4 /*yield*/, bc.hash(password, 10)];
                case 4:
                    hashedPassword = _a.sent();
                    return [4 /*yield*/, client.query('INSERT INTO "credentials" ("username", "password", "date_created") VALUES($1, $2, current_timestamp)', [username, hashedPassword])];
                case 5:
                    _a.sent();
                    client.release();
                    return [2 /*return*/, { result: true, message: "Account created" }];
                case 6:
                    err_2 = _a.sent();
                    console.error(err_2);
                    return [2 /*return*/, { result: false, message: "Internal error" }];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.createAccount = createAccount;
function checkNewCredentials(username, password, password2) {
    return __awaiter(this, void 0, void 0, function () {
        var usernameRegex, passwordRegex, pool, client, result, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    usernameRegex = /^[\p{L}0-9_]{2,20}$/u;
                    passwordRegex = /^[\p{L}0-9!().?\[\]_`~;:@#$%^&*+=]{4,50}$/u;
                    if (password != password2)
                        return [2 /*return*/, { result: false, message: "Passwords does not match" }];
                    if (!usernameRegex.test(username))
                        return [2 /*return*/, {
                                result: false,
                                message: "Username can only contain alphabetic symbols, 0-9 and the special character _ and must be between 2 and 20 symbols long",
                            }];
                    if (!passwordRegex.test(password))
                        return [2 /*return*/, {
                                result: false,
                                message: "Password can only contain alphabetic symbols, 0-9 and the special characters !().?[]_`~;:@#$%^&*+= and must be between 4 and 50 symbols long",
                            }];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    pool = new Pool({
                        connectionString: process.env.DATABASE_URL,
                        ssl: yn(process.env.DATABASE_SSL),
                    });
                    return [4 /*yield*/, pool.connect()];
                case 2:
                    client = _a.sent();
                    return [4 /*yield*/, client.query('SELECT "username" FROM "credentials" WHERE "username"=$1', [username])];
                case 3:
                    result = _a.sent();
                    client.release();
                    if (result.rowCount > 0)
                        return [2 /*return*/, { result: false, message: "Username taken" }];
                    return [2 /*return*/, {
                            result: true,
                            message: "Credentials ok",
                        }];
                case 4:
                    err_3 = _a.sent();
                    console.error(err_3);
                    return [2 /*return*/, { result: false, message: "Internal error" }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function isLoggedIn(session) {
    if (typeof session != "object" || session == null)
        return false;
    if (typeof session.userId != "number" || session.userId == null || session.userId <= 0)
        return false;
    return true;
}
exports.isLoggedIn = isLoggedIn;
function getUserName(session) {
    return __awaiter(this, void 0, void 0, function () {
        var pool, client, result, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isLoggedIn(session))
                        return [2 /*return*/, ""];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    pool = new Pool({
                        connectionString: process.env.DATABASE_URL,
                        ssl: yn(process.env.DATABASE_SSL),
                    });
                    return [4 /*yield*/, pool.connect()];
                case 2:
                    client = _a.sent();
                    return [4 /*yield*/, client.query('SELECT "username" FROM "credentials" WHERE "id"=$1', [getUserId(session)])];
                case 3:
                    result = _a.sent();
                    client.release();
                    if (result.rowCount != 1)
                        return [2 /*return*/, ""];
                    return [2 /*return*/, result.rows[0].username];
                case 4:
                    err_4 = _a.sent();
                    console.error(err_4);
                    return [2 /*return*/, ""];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.getUserName = getUserName;
function getUsernames(userIds) {
    return __awaiter(this, void 0, void 0, function () {
        var pool, client, result, usernames, _i, _a, row, err_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    pool = new Pool({
                        connectionString: process.env.DATABASE_URL,
                        ssl: yn(process.env.DATABASE_SSL),
                    });
                    return [4 /*yield*/, pool.connect()];
                case 1:
                    client = _b.sent();
                    return [4 /*yield*/, client.query('SELECT "username" FROM "credentials" WHERE "id" = ANY($1::int[])', [userIds])];
                case 2:
                    result = _b.sent();
                    client.release();
                    usernames = [];
                    for (_i = 0, _a = result.rows; _i < _a.length; _i++) {
                        row = _a[_i];
                        usernames.push(row.username);
                    }
                    return [2 /*return*/, usernames];
                case 3:
                    err_5 = _b.sent();
                    console.error(err_5);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getUsernames = getUsernames;
function getUserId(session) {
    if (typeof session.userId != "number")
        return 0;
    if (session.userId == null)
        return 0;
    return session.userId;
}
exports.getUserId = getUserId;
