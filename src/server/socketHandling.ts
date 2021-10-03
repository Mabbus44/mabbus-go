import { Server } from 'socket.io';
import * as db from './dbHandling';
import * as uh from './userHandling';
import * as bf from '../common/boardFuncs';
import * as lang from './lang';

interface SocketExtra {
  matchId: number;
}
const socketExtras: { [key: string]: SocketExtra } = {};

let io: Server;

function socketDisconnect() {
  const socket = this;
  console.log(`Client disconnected ${socket.id}`);
  delete socketExtras[socket.id];
}

async function getMoves(matchId: number, moveId: number = 0): Promise<void> {
  const socket = this;
  const result = await db.query(
    'SELECT "x", "y" FROM "moves" WHERE "matchindex" = $1 AND "moveindex" >= $2 ORDER BY "moveindex" ASC',
    [matchId, moveId],
  );
  if (result === null || result.rowCount === 0) return;
  const moves: { [key: number]: bf.Coords } = {};
  for (let row: number = 0; row < result.rowCount; row++) {
    moves[row + moveId] = { x: result.rows[row].x, y: result.rows[row].y };
  }
  socket.emit('new moves', moves);
}

function subscribeToMatch(matchId: number): void {
  if (typeof matchId !== 'number' || isNaN(matchId) || matchId <= 0) return;
  const socket = this;
  if (typeof socketExtras[socket.id] === 'object') socketExtras[socket.id].matchId = matchId;
}

async function endMatch(matchId: number): Promise<void> {
  const result = await db.query('SELECT "x", "y" FROM "moves" WHERE "matchindex" = $1 ORDER BY "moveindex" ASC', [
    matchId,
  ]);
  let points: number[];
  if (result === null) return;
  const moves = new Array<bf.Coords>(result.rowCount);
  for (let row: number = 0; row < result.rowCount; row++) moves[row] = { x: result.rows[row].x, y: result.rows[row].y };
  if (moves[moves.length - 1].x === -2) {
    points = [-2, -2];
    if (moves.length % 2 === 0) {
      db.query('UPDATE "matchlist" SET "winner"="player1id", "endcause"=\'surrender\' WHERE "matchindex"=$1', [
        matchId,
      ]);
      points[0] = -1;
    } else {
      db.query('UPDATE "matchlist" SET "winner"="player2id", "endcause"=\'surrender\' WHERE "matchindex"=$1', [
        matchId,
      ]);
      points[1] = -1;
    }
    for (const [socketId, socketExtra] of Object.entries(socketExtras)) {
      if (socketExtra.matchId === matchId) io.sockets.sockets.get(socketId).emit('match ended', points);
    }
    return;
  }
  const board: number[][] = bf.movesToBoard(moves);
  points = bf.countPoints(board, bf.getScoreBoard(board));
  if (points[0] > points[1]) {
    db.query(
      'UPDATE "matchlist" SET "winner"="player1id", "endcause"=\'pass\', points1=$2, points2 = $3 WHERE "matchindex"=$1',
      [matchId, points[0], points[1]],
    );
  } else {
    db.query(
      'UPDATE "matchlist" SET "winner"="player2id", "endcause"=\'pass\', points1=$2, points2 = $3 WHERE "matchindex"=$1',
      [matchId, points[0], points[1]],
    );
  }
  for (const [socketId, socketExtra] of Object.entries(socketExtras)) {
    if (socketExtra.matchId === matchId) io.sockets.sockets.get(socketId).emit('match ended', points);
  }
}

function pushMove(matchId: number, moveId: number, x: number, y: number): void {
  const moves: { [key: number]: bf.Coords } = {};
  moves[moveId - 1] = { x, y };
  for (const [socketId, socketExtra] of Object.entries(socketExtras)) {
    if (socketExtra.matchId === matchId) io.sockets.sockets.get(socketId).emit('new moves', moves);
  }
}

async function commitMove(matchId: number, x: number, y: number, userColor: number): Promise<boolean> {
  if (typeof matchId !== 'number' || isNaN(matchId)) return false;
  if (typeof userColor !== 'number' || isNaN(userColor) || userColor < 1 || userColor > 2) return false;
  const result = await db.query('SELECT "x", "y" FROM "moves" WHERE "matchindex" = $1 ORDER BY "moveindex" ASC', [
    matchId,
  ]);
  if (result === null) return false;
  if (result.rowCount % 2 !== userColor - 1) return false;
  await db.query('INSERT INTO "moves" ("x", "y", "moveindex", "matchindex") VALUES ($1, $2, $3, $4)', [
    x,
    y,
    result.rowCount + 1,
    matchId,
  ]);
  pushMove(matchId, result.rowCount + 1, x, y);
  if ((result.rowCount > 0 && result.rows[result.rowCount - 1] === -1 && x === -1) || x === -2) endMatch(matchId);
  return true;
}

function sendMessage(socket, message: string): void {
  console.log('SendMessage:');
  console.log(message);
  socket.emit('message', message);
}

async function makeMove(matchId: number, x: number, y: number): Promise<void> {
  if (typeof x !== 'number' || isNaN(x) || x < 0 || x > 18) return;
  if (typeof y !== 'number' || isNaN(y) || y < 0 || y > 18) return;
  const socket = this;
  const userId: number = uh.getUserId(socket.request.session);
  const userColor: number = await uh.getUserColor(matchId, userId);
  if (await commitMove(matchId, x, y, userColor)) {
    sendMessage(socket, lang.translate('Stone added', socket.request.session.language));
  }
}

async function passTurn(matchId: number): Promise<void> {
  const socket = this;
  const userId: number = uh.getUserId(socket.request.session);
  const userColor: number = await uh.getUserColor(matchId, userId);
  if (await commitMove(matchId, -1, -1, userColor)) {
    sendMessage(socket, lang.translate('Turn passed', socket.request.session.language));
  }
}

async function giveUp(matchId: number): Promise<void> {
  const socket = this;
  const userId: number = uh.getUserId(socket.request.session);
  const userColor: number = await uh.getUserColor(matchId, userId);
  commitMove(matchId, -2, -2, userColor);
}

function socketConnect(socket): void {
  const s: SocketExtra = { matchId: 0 };
  socketExtras[socket.id] = s;
  console.log(`Client connected ${socket.id}`);
  socket.on('disconnect', socketDisconnect);
  socket.on('subscribe to match', subscribeToMatch);
  socket.on('get moves', getMoves);
  socket.on('make move', makeMove);
  socket.on('pass turn', passTurn);
  socket.on('give up', giveUp);
}

export function initSockets(server: any, sessionMiddleware: any): void {
  io = new Server(server);
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });
  io.on('connection', socketConnect);
}
