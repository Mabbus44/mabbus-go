"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScoreBoard = exports.countPoints = exports.isValidMove = exports.movesToBoard = exports.move = exports.getEmptyBoard = void 0;
function getEmptyBoard(defaultValue) {
    if (defaultValue === void 0) { defaultValue = 0; }
    var board = new Array(19);
    for (var x = 0; x < 19; x++) {
        board[x] = new Array(19);
        for (var y = 0; y < 19; y++)
            board[x][y] = defaultValue;
    }
    return board;
}
exports.getEmptyBoard = getEmptyBoard;
function getAdjacent(coords, diagonal) {
    if (diagonal === void 0) { diagonal = false; }
    var a = [];
    for (var dx = -1; dx < 2; dx++) {
        for (var dy = -1; dy < 2; dy++) {
            if (coords.x + dx >= 0 &&
                coords.x + dx <= 18 &&
                coords.y + dy >= 0 &&
                coords.y + dy <= 18 &&
                !(dx === 0 && dy === 0) &&
                (diagonal || dx === 0 || dy === 0)) {
                a.push({ x: coords.x + dx, y: coords.y + dy });
            }
        }
    }
    return a;
}
function includesCoord(coordArray, coord) {
    for (var _i = 0, coordArray_1 = coordArray; _i < coordArray_1.length; _i++) {
        var c = coordArray_1[_i];
        if (c.x === coord.x && c.y === coord.y)
            return true;
    }
    return false;
}
function getSurroundedStones(board, coords, color) {
    var capStones = [{ x: coords.x, y: coords.y }];
    if (board[coords.x][coords.y] !== color)
        return [];
    for (var _i = 0, capStones_1 = capStones; _i < capStones_1.length; _i++) {
        var stone = capStones_1[_i];
        var adj = getAdjacent(stone);
        for (var _a = 0, adj_1 = adj; _a < adj_1.length; _a++) {
            var a = adj_1[_a];
            if (board[a.x][a.y] === 0)
                return [];
            if (board[a.x][a.y] === color && !includesCoord(capStones, a))
                capStones.push(a);
        }
    }
    return capStones;
}
function captureStones(board, coords, color) {
    var adj = getAdjacent(coords);
    for (var _i = 0, adj_2 = adj; _i < adj_2.length; _i++) {
        var a = adj_2[_i];
        var surr = getSurroundedStones(board, a, color);
        for (var _a = 0, surr_1 = surr; _a < surr_1.length; _a++) {
            var s = surr_1[_a];
            board[s.x][s.y] = 0;
        }
    }
}
function move(board, moves, color) {
    for (var _i = 0, moves_1 = moves; _i < moves_1.length; _i++) {
        var m = moves_1[_i];
        if (m.x >= 0) {
            board[m.x][m.y] = color;
            captureStones(board, m, 3 - color);
        }
        color = 3 - color;
    }
}
exports.move = move;
function movesToBoard(moves) {
    var board = getEmptyBoard();
    move(board, moves, 1);
    return board;
}
exports.movesToBoard = movesToBoard;
function isValidMove(moves, coords, color) {
    if (moves.length % 2 !== color - 1)
        return false;
    var board = movesToBoard(moves);
    if (board[coords.x][coords.y] !== 0)
        return false;
    move(board, [coords], color);
    if (getSurroundedStones(board, coords, color).length > 0)
        return false;
    return true;
}
exports.isValidMove = isValidMove;
function countPoints(board, scoreBoard) {
    var points = [0, 7.5];
    for (var x = 0; x < 19; x++) {
        for (var y = 0; y < 19; y++) {
            if (scoreBoard[x][y] === 0) {
                if (board[x][y] > 0)
                    points[board[x][y] - 1]++;
            }
            else
                points[scoreBoard[x][y] - 1]++;
        }
    }
    return points;
}
exports.countPoints = countPoints;
function checkForEye(coords, color, board, eyes, notEyeSquares) {
    for (var _i = 0, eyes_1 = eyes; _i < eyes_1.length; _i++) {
        var eye = eyes_1[_i];
        if (includesCoord(eye, coords))
            return;
    }
    if (includesCoord(notEyeSquares, coords))
        return;
    var newEye = [{ x: coords.x, y: coords.y }];
    for (var _a = 0, newEye_1 = newEye; _a < newEye_1.length; _a++) {
        var eyeSquare = newEye_1[_a];
        var adjacent = getAdjacent(eyeSquare);
        for (var _b = 0, adjacent_1 = adjacent; _b < adjacent_1.length; _b++) {
            var a = adjacent_1[_b];
            if (board[a.x][a.y] !== color && !includesCoord(newEye, a))
                newEye.push(a);
        }
        if (newEye.length > 25) {
            notEyeSquares.push.apply(notEyeSquares, newEye);
            return;
        }
    }
    eyes.push(newEye);
}
function getSafeStones(coords, color, board) {
    var safeStones = [];
    var notEyeSquares = [];
    var eyes = [];
    var adjacent = [];
    var x = coords.x;
    var y = coords.y;
    if (x >= 0 && x < 19 && y >= 0 && y < 19 && board[x][y] === color)
        safeStones[0] = { x: x, y: y };
    for (var _i = 0, safeStones_1 = safeStones; _i < safeStones_1.length; _i++) {
        var safeStone = safeStones_1[_i];
        adjacent = getAdjacent(safeStone, true);
        for (var _a = 0, adjacent_2 = adjacent; _a < adjacent_2.length; _a++) {
            var a = adjacent_2[_a];
            if (board[a.x][a.y] === color &&
                !(board[safeStone.x][a.y] === 3 - color && board[a.x][safeStone.y] === 3 - color) &&
                !includesCoord(safeStones, a)) {
                safeStones.push(a);
            }
            if (board[a.x][a.y] !== color && (a.x === safeStone.x || a.y === safeStone.y)) {
                checkForEye(a, color, board, eyes, notEyeSquares);
            }
        }
    }
    return { safeStones: safeStones, eyes: eyes };
}
function setSurroundedSafeStones(scoreBoard, coords) {
    var checkedStones = [{ x: coords.x, y: coords.y }];
    var color = -1;
    for (var _i = 0, checkedStones_1 = checkedStones; _i < checkedStones_1.length; _i++) {
        var stone = checkedStones_1[_i];
        var adj = getAdjacent(stone);
        for (var _a = 0, adj_3 = adj; _a < adj_3.length; _a++) {
            var a = adj_3[_a];
            var aColor = scoreBoard[a.x][a.y];
            if (aColor === -1 && !includesCoord(checkedStones, a))
                checkedStones.push(a);
            if (aColor > 0 && color === -1)
                color = aColor;
            else if (color > 0 && aColor > 0 && aColor !== color)
                color = 0;
        }
    }
    if (color === -1)
        color = 0;
    for (var _b = 0, checkedStones_2 = checkedStones; _b < checkedStones_2.length; _b++) {
        var stone = checkedStones_2[_b];
        scoreBoard[stone.x][stone.y] = color;
    }
}
function getScoreBoard(board) {
    var scoreBoard = getEmptyBoard(-1);
    var safeGroups = [];
    // Get safe groups
    for (var x = 0; x < 19; x++) {
        for (var y = 0; y < 19; y++) {
            if (board[x][y] !== 0 && scoreBoard[x][y] === -1) {
                var safeGroup = getSafeStones({ x: x, y: y }, board[x][y], board);
                if (safeGroup.eyes.length > 1)
                    safeGroups.push(safeGroup);
                for (var _i = 0, _a = safeGroup.safeStones; _i < _a.length; _i++) {
                    var p = _a[_i];
                    scoreBoard[p.x][p.y] = 0;
                }
            }
        }
    }
    scoreBoard = getEmptyBoard(-1);
    // Remove eyes with safegroups in them
    for (var _b = 0, safeGroups_1 = safeGroups; _b < safeGroups_1.length; _b++) {
        var safeGroup = safeGroups_1[_b];
        for (var i = safeGroup.eyes.length - 1; i >= 0; i--) {
            var isEye = true;
            for (var _c = 0, _d = safeGroup.eyes[i]; _c < _d.length; _c++) {
                var eyeSquare = _d[_c];
                if (board[eyeSquare.x][eyeSquare.y] !== 0) {
                    for (var _e = 0, safeGroups_2 = safeGroups; _e < safeGroups_2.length; _e++) {
                        var compSafeGroup = safeGroups_2[_e];
                        if (safeGroup !== compSafeGroup) {
                            if (includesCoord(safeGroup.safeStones, eyeSquare)) {
                                isEye = false;
                                break;
                            }
                        }
                    }
                }
                if (!isEye)
                    break;
            }
            if (!isEye)
                safeGroup.eyes.slice(i, 1);
        }
    }
    // Set safe scoreBoard squares
    for (var _f = 0, safeGroups_3 = safeGroups; _f < safeGroups_3.length; _f++) {
        var safeGroup = safeGroups_3[_f];
        if (safeGroup.eyes.length > 1) {
            var color = board[safeGroup.safeStones[0].x][safeGroup.safeStones[0].y];
            for (var _g = 0, _h = safeGroup.safeStones; _g < _h.length; _g++) {
                var safeSquare = _h[_g];
                scoreBoard[safeSquare.x][safeSquare.y] = color;
            }
        }
    }
    // Set squares surrounded by safe squares to also be safe
    for (var x = 0; x < 19; x++) {
        for (var y = 0; y < 19; y++) {
            if (scoreBoard[x][y] === -1) {
                setSurroundedSafeStones(scoreBoard, { x: x, y: y });
            }
        }
    }
    return scoreBoard;
}
exports.getScoreBoard = getScoreBoard;
