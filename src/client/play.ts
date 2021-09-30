import { io } from "socket.io-client";
import * as bf from "../common/boardFuncs";

interface Dict {
  yourTurn: string;
  notYourTurn: string;
  selectLocation: string;
  areYouSureYouWantToGiveUp: string;
  areYouSureYouWantToPass: string;
  scoreWinner: string;
  surrenderWinner: string;
}

const urlParams = new URLSearchParams(window.location.search);
const matchId: number = +urlParams.get("id");
const boardSize: number = 19;
const squareSize: number = 30;
let board: number[][] = bf.getEmptyBoard();
let moves: bf.Coords[] = [];
let markedSquare: number[] = [-1, -1];
let blockingPopup: boolean = false;
let socket = io();
let t: Dict;
let userColor: number = 0;
let consecutiveMoves: number = 0;
let popupFunction: Function = null;

export function initJS(tData: Dict, userColorData: number): void {
  t = tData;
  userColor = userColorData;
  document.getElementById("goCanvas").addEventListener("click", canvasClick, false);

  socket.on("new moves", updateMoves);
  socket.on("message", showMessage);
  socket.on("match ended", showEndMatchPopup);

  socket.emit("get moves", matchId);
  socket.emit("subscribe to match", matchId);
  let blackStoneCanvas: HTMLCanvasElement = document.getElementById("blackStone") as HTMLCanvasElement;
  let bctx: CanvasRenderingContext2D = blackStoneCanvas.getContext("2d");
  drawBlackStone(bctx, 0, 0);
  let whiteStoneCanvas: HTMLCanvasElement = document.getElementById("whiteStone") as HTMLCanvasElement;
  let wctx: CanvasRenderingContext2D = whiteStoneCanvas.getContext("2d");
  drawWhiteStone(wctx, 0, 0);
  draw();
}

function updateMoves(newMoves: { [key: number]: bf.Coords }): void {
  let oldMaxMove = consecutiveMoves;
  for (let [i, coord] of Object.entries(newMoves)) moves[i] = coord;
  for (let i = consecutiveMoves; i < moves.length; i++) {
    if (typeof moves[i] === "object") consecutiveMoves++;
    else break;
  }
  if (consecutiveMoves > oldMaxMove) bf.move(board, moves.slice(oldMaxMove, consecutiveMoves), (oldMaxMove % 2) + 1);
  markedSquare = [-1, -1];
  draw();
}

export function btnConfirm(): void {
  if ((moves.length % 2) + 1 !== userColor) return showMessage(t.notYourTurn);
  if (markedSquare === [-1, -1]) return showMessage(t.selectLocation);
  socket.emit("make move", matchId, markedSquare[0], markedSquare[1]);
}

export function btnPass(): void {
  if ((moves.length % 2) + 1 !== userColor) return showMessage(t.notYourTurn);
  showPopup(t.areYouSureYouWantToPass, "YesNo", function () {
    socket.emit("pass turn", matchId);
  });
}

export function btnGiveUp(): void {
  if ((moves.length % 2) + 1 !== userColor) return showMessage(t.notYourTurn);
  showPopup(t.areYouSureYouWantToGiveUp, "YesNo", function () {
    socket.emit("give up", matchId);
  });
}

export function btnPreviewScore(): void {
  drawScorePreview();
}

export function btnYes() {
  hidePopup();
  popupFunction();
}

export function btnNo() {
  hidePopup();
}

export function btnOk() {
  hidePopup();
  popupFunction();
}

function canvasClick(evt): void {
  if (blockingPopup) return;
  const canvas = document.getElementById("goCanvas") as HTMLCanvasElement;
  let rect: DOMRect = canvas.getBoundingClientRect();
  let mousePos: number[] = [evt.clientX - rect.left, evt.clientY - rect.top];
  let boardPos: number[] = mouseToBoard(mousePos[0], mousePos[1]);
  if (boardPos[0] < 0) markedSquare = [-1, -1];
  if (boardPos[0] == markedSquare[0] && boardPos[1] == markedSquare[1]) {
    markedSquare = [-1, -1];
  } else {
    markedSquare = boardPos;
  }
  draw();
}

function mouseToBoard(x: number, y: number): number[] {
  let retX: number = Math.floor(x / squareSize);
  let retY: number = Math.floor(y / squareSize);
  if (retX < 0 || retX >= boardSize || retY < 0 || retY >= boardSize) {
    retX = -1;
    retY = -1;
  }
  return [retX, retY];
}

function drawScorePreview(): void {
  let scoreBoard: number[][] = bf.getScoreBoard(board);
  let points: number[] = bf.countPoints(board, scoreBoard);
  let c: HTMLCanvasElement = document.getElementById("goCanvas") as HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D = c.getContext("2d");
  drawEmptyBoard(ctx, scoreBoard);
  for (let y: number = 0; y < boardSize; y++) {
    for (let x: number = 0; x < boardSize; x++) {
      if (board[x][y] === 1) drawBlackStone(ctx, x, y);
      if (board[x][y] === 2) drawWhiteStone(ctx, x, y);
      if ((board[x][y] == 1 && scoreBoard[x][y] == 2) || (board[x][y] == 2 && scoreBoard[x][y] == 1))
        drawCross(ctx, x, y);
    }
  }
  drawArrows(true);
  drawScore([points[0].toString(), points[1].toString()]);
}

function draw() {
  const canvas: HTMLCanvasElement = document.getElementById("goCanvas") as HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
  drawEmptyBoard(ctx);
  for (let x = 0; x < boardSize; x++) {
    for (let y = 0; y < boardSize; y++) {
      if (board[x][y] === 1) drawBlackStone(ctx, x, y);
      if (board[x][y] === 2) drawWhiteStone(ctx, x, y);
    }
  }
  let moveID = moves.length - 1;
  while (moveID >= 0 && moves[moveID].x < 0) moveID--;
  if (moveID >= 0) markLastPlayedStone(ctx, moves[moveID].x, moves[moveID].y);
  markSelectedStone(ctx);
  drawArrows();
  drawScore(["", ""]);
  drawYourTurn();
}

function drawEmptyBoard(ctx: CanvasRenderingContext2D, scoreBoard: number[][] = null): void {
  if (scoreBoard === null) {
    ctx.fillStyle = "#DFC156";
    ctx.beginPath();
    ctx.fillRect(0, 0, boardSize * squareSize, boardSize * squareSize);
  } else {
    for (let y: number = 0; y < boardSize; y++) {
      for (let x: number = 0; x < boardSize; x++) {
        if (scoreBoard[x][y] == 0) {
          ctx.fillStyle = "#DFC156";
        } else if (scoreBoard[x][y] == 1) {
          ctx.fillStyle = "#444444";
        } else if (scoreBoard[x][y] == 2) {
          ctx.fillStyle = "#BBBBBB";
        }
        ctx.beginPath();
        ctx.fillRect(x * squareSize, y * squareSize, x * squareSize + squareSize, y * squareSize + squareSize);
      }
    }
  }
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1;
  for (let i = 0; i < boardSize; i++) {
    ctx.beginPath();
    ctx.moveTo(0.5 * squareSize, (i + 0.5) * squareSize);
    ctx.lineTo((boardSize - 0.5) * squareSize, (i + 0.5) * squareSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo((i + 0.5) * squareSize, 0.5 * squareSize);
    ctx.lineTo((i + 0.5) * squareSize, (boardSize - 0.5) * squareSize);
    ctx.stroke();
  }
}

function drawBlackStone(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc((x + 0.5) * squareSize, (y + 0.5) * squareSize, squareSize * 0.4, 0, 2 * Math.PI);
  ctx.fill();
}

function drawWhiteStone(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc((x + 0.5) * squareSize, (y + 0.5) * squareSize, squareSize * 0.4, 0, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = "#000000";
  ctx.beginPath();
  ctx.arc((x + 0.5) * squareSize, (y + 0.5) * squareSize, squareSize * 0.4, 0, 2 * Math.PI);
  ctx.stroke();
}

function drawCross(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.strokeStyle = "#FF0000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo((x + 0.1) * squareSize, (y + 0.1) * squareSize);
  ctx.lineTo((x + 0.9) * squareSize, (y + 0.9) * squareSize);
  ctx.moveTo((x + 0.9) * squareSize, (y + 0.1) * squareSize);
  ctx.lineTo((x + 0.1) * squareSize, (y + 0.9) * squareSize);
  ctx.stroke();
}

function markLastPlayedStone(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.strokeStyle = "#FFFF00";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc((x + 0.5) * squareSize, (y + 0.5) * squareSize, squareSize * 0.4 + 1, 0, 2 * Math.PI);
  ctx.stroke();
}

function markSelectedStone(ctx: CanvasRenderingContext2D): void {
  if (markedSquare[0] > -1) {
    ctx.fillStyle = "#FF0000";
    ctx.beginPath();
    ctx.arc(
      (markedSquare[0] + 0.5) * squareSize,
      (markedSquare[1] + 0.5) * squareSize,
      squareSize * 0.4,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
}

function drawArrows(hideBoth: boolean = false): void {
  if (hideBoth) {
    document.getElementById("whiteArrow").style.display = "none";
    document.getElementById("blackArrow").style.display = "none";
    return;
  }
  if (moves.length % 2 === 0) {
    document.getElementById("whiteArrow").style.display = "none";
    document.getElementById("blackArrow").style.display = "block";
  } else {
    document.getElementById("whiteArrow").style.display = "block";
    document.getElementById("blackArrow").style.display = "none";
  }
}

function drawScore(score: string[]): void {
  document.getElementById("blackScore").innerHTML = score[0];
  document.getElementById("whiteScore").innerHTML = score[1];
}

function drawYourTurn(): void {
  if ((moves.length % 2) + 1 === userColor) {
    document.getElementById("yourTurn").innerHTML = t.yourTurn;
    document.getElementById("yourTurnDiv").style.display = "block";
  }
  if ((moves.length % 2) + 1 === 3 - userColor) {
    document.getElementById("yourTurn").innerHTML = t.notYourTurn;
    document.getElementById("yourTurnDiv").style.display = "none";
  }
  if (userColor === 0) {
    document.getElementById("yourTurn").innerHTML = "";
    document.getElementById("yourTurnDiv").style.display = "none";
  }
}

function showEndMatchPopup(points: number[]): void {
  let msg: string;
  let blackName: string = document.getElementById("blackName").innerHTML;
  let whiteName: string = document.getElementById("whiteName").innerHTML;
  if (points[0] < 0) {
    if (points[0] > points[1]) {
      msg = multiReplace(t.surrenderWinner, [whiteName, blackName]);
    } else {
      msg = multiReplace(t.surrenderWinner, [blackName, whiteName]);
    }
  } else {
    if (points[0] > points[1]) {
      msg = multiReplace(t.surrenderWinner, [
        blackName,
        whiteName,
        points[0].toString(),
        points[1].toString(),
        blackName,
      ]);
    } else {
      msg = multiReplace(t.surrenderWinner, [
        blackName,
        whiteName,
        points[0].toString(),
        points[1].toString(),
        whiteName,
      ]);
    }
  }
  showPopup(msg, "Ok", function () {
    window.location.href = "/main";
  });
}

function multiReplace(str: string, substitutions: string[]): string {
  let ret = str;
  for (let i = 0; i < substitutions.length; i++) ret = ret.replace(`$(${i})`, substitutions[i]);
  return ret;
}

function showMessage(msg: string) {
  if (blockingPopup) return;
  document.getElementById("canvasMessageDiv").style.display = "inline";
  document.getElementById("canvasLabel").innerHTML = msg;
  setTimeout(function () {
    document.getElementById("canvasMessageDiv").style.display = "none";
    document.getElementById("canvasLabel").innerHTML = "";
  }, 3000);
}

function showPopup(msg: string, type: string, func: Function) {
  if (blockingPopup) return;
  document.getElementById("canvasMessageDiv").style.display = "inline";
  document.getElementById("canvasLabel").innerHTML = msg;
  if (type == "Ok") {
    document.getElementById("canvasOkButton").style.display = "inline";
    blockingPopup = true;
    popupFunction = func;
  } else if (type == "YesNo") {
    document.getElementById("canvasYesButton").style.display = "inline";
    document.getElementById("canvasNoButton").style.display = "inline";
    blockingPopup = true;
    popupFunction = func;
  }
}

function hidePopup() {
  document.getElementById("canvasMessageDiv").style.display = "none";
  document.getElementById("canvasOkButton").style.display = "none";
  document.getElementById("canvasYesButton").style.display = "none";
  document.getElementById("canvasNoButton").style.display = "none";
  document.getElementById("canvasLabel").innerHTML = "";
  blockingPopup = false;
}
