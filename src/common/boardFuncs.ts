export interface Coords {
  x: number;
  y: number;
}

interface SafeGroup {
  safeStones: Coords[];
  eyes: Coords[][];
}

export function getEmptyBoard(defaultValue: number = 0): number[][] {
  const board: number[][] = new Array<any>(19);
  for (let x: number = 0; x < 19; x++) {
    board[x] = new Array<number>(19);
    for (let y: number = 0; y < 19; y++) board[x][y] = defaultValue;
  }
  return board;
}

function getAdjacent(coords: Coords, diagonal: boolean = false): Coords[] {
  const a: Coords[] = [];
  for (let dx: number = -1; dx < 2; dx++) {
    for (let dy: number = -1; dy < 2; dy++) {
      if (
        coords.x + dx >= 0 &&
        coords.x + dx <= 18 &&
        coords.y + dy >= 0 &&
        coords.y + dy <= 18 &&
        !(dx === 0 && dy === 0) &&
        (diagonal || dx === 0 || dy === 0)
      ) {
        a.push({ x: coords.x + dx, y: coords.y + dy });
      }
    }
  }
  return a;
}

function includesCoord(coordArray: Coords[], coord: Coords): boolean {
  for (const c of coordArray) if (c.x === coord.x && c.y === coord.y) return true;
  return false;
}

function getSurroundedStones(board: number[][], coords: Coords, color: number): Coords[] {
  const capStones: Coords[] = [{ x: coords.x, y: coords.y }];
  if (board[coords.x][coords.y] !== color) return [];
  for (const stone of capStones) {
    const adj = getAdjacent(stone);
    for (const a of adj) {
      if (board[a.x][a.y] === 0) return [];
      if (board[a.x][a.y] === color && !includesCoord(capStones, a)) capStones.push(a);
    }
  }
  return capStones;
}

function captureStones(board: number[][], coords: Coords, color: number): void {
  const adj = getAdjacent(coords);
  for (const a of adj) {
    const surr = getSurroundedStones(board, a, color);
    for (const s of surr) board[s.x][s.y] = 0;
  }
}

export function move(board: number[][], moves: Coords[], color: number): void {
  for (const m of moves) {
    if (m.x >= 0) {
      board[m.x][m.y] = color;
      captureStones(board, m, 3 - color);
    }
    color = 3 - color;
  }
}

export function movesToBoard(moves: Coords[]): number[][] {
  const board: number[][] = getEmptyBoard();
  move(board, moves, 1);
  return board;
}

export function isValidMove(moves: Coords[], coords: Coords, color: number): boolean {
  if (moves.length % 2 !== color - 1) return false;
  const board: number[][] = movesToBoard(moves);
  if (board[coords.x][coords.y] !== 0) return false;
  move(board, [coords], color);
  if (getSurroundedStones(board, coords, color).length > 0) return false;
  return true;
}

export function countPoints(board: number[][], scoreBoard: number[][]): number[] {
  const points: number[] = [0, 7.5];
  for (let x = 0; x < 19; x++) {
    for (let y = 0; y < 19; y++) {
      if (scoreBoard[x][y] === 0) {
        if (board[x][y] > 0) points[board[x][y] - 1]++;
      } else points[scoreBoard[x][y] - 1]++;
    }
  }
  return points;
}

function checkForEye(
  coords: Coords,
  color: number,
  board: number[][],
  eyes: Coords[][],
  notEyeSquares: Coords[],
): void {
  for (const eye of eyes) if (includesCoord(eye, coords)) return;
  if (includesCoord(notEyeSquares, coords)) return;
  const newEye: Coords[] = [{ x: coords.x, y: coords.y }];
  for (const eyeSquare of newEye) {
    const adjacent = getAdjacent(eyeSquare);
    for (const a of adjacent) if (board[a.x][a.y] !== color && !includesCoord(newEye, a)) newEye.push(a);
    if (newEye.length > 25) {
      notEyeSquares.push(...newEye);
      return;
    }
  }
  eyes.push(newEye);
}

function getSafeStones(coords: Coords, color: number, board: number[][]): SafeGroup {
  const safeStones: Coords[] = [];
  const notEyeSquares: Coords[] = [];
  const eyes: Coords[][] = [];
  let adjacent: Coords[] = [];
  const { x } = coords;
  const { y } = coords;
  if (x >= 0 && x < 19 && y >= 0 && y < 19 && board[x][y] === color) safeStones[0] = { x, y };
  for (const safeStone of safeStones) {
    adjacent = getAdjacent(safeStone, true);
    for (const a of adjacent) {
      if (
        board[a.x][a.y] === color &&
        !(board[safeStone.x][a.y] === 3 - color && board[a.x][safeStone.y] === 3 - color) &&
        !includesCoord(safeStones, a)
      ) {
        safeStones.push(a);
      }
      if (board[a.x][a.y] !== color && (a.x === safeStone.x || a.y === safeStone.y)) {
        checkForEye(a, color, board, eyes, notEyeSquares);
      }
    }
  }
  return { safeStones, eyes };
}

function setSurroundedSafeStones(scoreBoard: number[][], coords: Coords): void {
  const checkedStones: Coords[] = [{ x: coords.x, y: coords.y }];
  let color: number = -1;
  for (const stone of checkedStones) {
    const adj = getAdjacent(stone);
    for (const a of adj) {
      const aColor: number = scoreBoard[a.x][a.y];
      if (aColor === -1 && !includesCoord(checkedStones, a)) checkedStones.push(a);
      if (aColor > 0 && color === -1) color = aColor;
      else if (color > 0 && aColor > 0 && aColor !== color) color = 0;
    }
  }
  if (color === -1) color = 0;
  for (const stone of checkedStones) scoreBoard[stone.x][stone.y] = color;
}

export function getScoreBoard(board: number[][]): number[][] {
  let scoreBoard: number[][] = getEmptyBoard(-1);
  const safeGroups: SafeGroup[] = [];
  // Get safe groups
  for (let x: number = 0; x < 19; x++) {
    for (let y: number = 0; y < 19; y++) {
      if (board[x][y] !== 0 && scoreBoard[x][y] === -1) {
        const safeGroup: SafeGroup = getSafeStones({ x, y }, board[x][y], board);
        if (safeGroup.eyes.length > 1) safeGroups.push(safeGroup);
        for (const p of safeGroup.safeStones) scoreBoard[p.x][p.y] = 0;
      }
    }
  }
  scoreBoard = getEmptyBoard(-1);
  // Remove eyes with safegroups in them
  for (const safeGroup of safeGroups) {
    for (let i: number = safeGroup.eyes.length - 1; i >= 0; i--) {
      let isEye: boolean = true;
      for (const eyeSquare of safeGroup.eyes[i]) {
        if (board[eyeSquare.x][eyeSquare.y] !== 0) {
          for (const compSafeGroup of safeGroups) {
            if (safeGroup !== compSafeGroup) {
              if (includesCoord(safeGroup.safeStones, eyeSquare)) {
                isEye = false;
                break;
              }
            }
          }
        }
        if (!isEye) break;
      }
      if (!isEye) safeGroup.eyes.slice(i, 1);
    }
  }
  // Set safe scoreBoard squares
  for (const safeGroup of safeGroups) {
    if (safeGroup.eyes.length > 1) {
      const color: number = board[safeGroup.safeStones[0].x][safeGroup.safeStones[0].y];
      for (const safeSquare of safeGroup.safeStones) scoreBoard[safeSquare.x][safeSquare.y] = color;
    }
  }
  // Set squares surrounded by safe squares to also be safe
  for (let x: number = 0; x < 19; x++) {
    for (let y: number = 0; y < 19; y++) {
      if (scoreBoard[x][y] === -1) {
        setSurroundedSafeStones(scoreBoard, { x, y });
      }
    }
  }
  return scoreBoard;
}
