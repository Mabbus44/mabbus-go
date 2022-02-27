import * as uh from './userHandling';
import * as db from './dbHandling';

interface NumStr {
  [key: number]: string;
}

interface MatchInfo {
  player1id: number;
  player2id: number;
  winner: number;
  matchindex: number;
  name1: string;
  name2: string;
  endCause: number;
  points1: number;
  points2: number;
}

export async function getChallengers(userId: number): Promise<NumStr> {
  const result = await db.query('SELECT "user1id" FROM "challenges" WHERE "user2id" = $1', [userId]);
  if (result === null) return {};
  const ids: number[] = [];
  for (const row of result.rows) ids.push(row.user1id);
  const usernames: string[] = await uh.getUsernames(ids);
  const ret: NumStr = {};
  for (const i in ids) ret[ids[i]] = usernames[i];
  return ret;
}

export async function getChallengedPlayers(userId: number): Promise<NumStr> {
  const result = await db.query('SELECT "user2id" FROM "challenges" WHERE "user1id" = $1', [userId]);
  if (result === null) return {};
  const ids: number[] = [];
  for (const row of result.rows) ids.push(row.user2id);
  const usernames: string[] = await uh.getUsernames(ids);
  const ret: NumStr = {};
  for (const i in ids) ret[ids[i]] = usernames[i];
  return ret;
}

export async function getChallengeblePlayers(userId: number): Promise<NumStr> {
  let query: string = 'SELECT "username", "id" FROM "credentials" WHERE "id" NOT IN (';
  query += 'SELECT "user1id" AS id FROM "challenges" WHERE "user2id" = $1 UNION ';
  query += 'SELECT "user2id" AS id FROM "challenges" WHERE "user1id" = $1 UNION ';
  query += 'SELECT "player1id" AS id FROM "matchlist" WHERE "player2id" = $1 AND "endcause" IS NULL UNION ';
  query += 'SELECT "player2id" AS id FROM "matchlist" WHERE "player1id" = $1 AND "endcause" IS NULL)';
  const result = await db.query(query, [userId]);
  if (result === null) return {};
  const ret: NumStr = {};
  console.log(result.rows);
  for (const row of result.rows) if (row.id !== userId) ret[row.id] = row.username;
  return ret;
}

export async function getCurrentMatches(userId: number): Promise<NumStr> {
  const result = await db.query(
    'SELECT "matchindex", "player1id", "player2id" FROM "matchlist" WHERE ("player1id"=$1 OR "player2id"=$1) AND "endcause" is null',
    [userId],
  );
  if (result === null) return {};
  const ids: number[] = [];
  for (const row of result.rows) {
    if (row.player1id === userId) ids.push(row.player2id);
    else ids.push(row.player1id);
  }
  const usernames: string[] = await uh.getUsernames(ids);
  const ret: NumStr = {};
  for (let i = 0; i < result.rows.length; i++) ret[result.rows[i].matchindex] = usernames[i];
  return ret;
}

export async function challengePlayer(userId: number, challengeId: number): Promise<boolean> {
  if (userId == null || challengeId == null) return false;
  let query: string = 'SELECT "id" FROM (';
  query += 'SELECT "user1id" AS id FROM "challenges" WHERE "user2id" = $1 UNION ';
  query += 'SELECT "user2id" AS id FROM "challenges" WHERE "user1id" = $1 UNION ';
  query += 'SELECT "player1id" AS id FROM "matchlist" WHERE "player2id" = $1 AND "endcause" IS NULL UNION ';
  query += 'SELECT "player2id" AS id FROM "matchlist" WHERE "player1id" = $1 AND "endcause" IS NULL';
  query += ') AS takenplayers WHERE "id" = $2';
  const result = await db.query(query, [userId, challengeId]);
  if (result === null || result.rowCount > 0) return false;
  query = 'INSERT INTO "challenges" ("user1id", "user2id") VALUES ($1, $2)';
  await db.query(query, [userId, challengeId]);
  return true;
}

export async function unChallengePlayer(userId: number, challengerId: number): Promise<boolean> {
  if (userId == null || isNaN(userId) || challengerId == null || isNaN(challengerId)) return false;
  const query: string = 'DELETE FROM "challenges" WHERE "user1id"=$1 AND "user2id"=$2';
  await db.query(query, [userId, challengerId]);
  return true;
}

export async function acceptChallange(userId: number, challengerId: number, color: number): Promise<number> {
  if (userId == null || isNaN(userId) || challengerId == null || isNaN(challengerId) || (color !== 0 && color !== 1)) {
    return 0;
  }
  let query: string = 'DELETE FROM "challenges" WHERE "user2id"=$1 AND "user1id"=$2';
  let result = await db.query(query, [userId, challengerId]);
  if (result === null || result.rowCount === 0) return 0;
  if (color === 0) query = 'INSERT INTO "matchlist" ("player1id", "player2id") VALUES ($1, $2) RETURNING "matchindex";';
  else query = 'INSERT INTO "matchlist" ("player1id", "player2id") VALUES ($2, $1) RETURNING "matchindex";';
  result = await db.query(query, [userId, challengerId]);
  if (result === null || result.rowCount !== 1) return 0;
  return result.rows[0].matchindex;
}

export async function getMatchHistory(userId: number): Promise<MatchInfo[]> {
  const result = await db.query(
    'SELECT m.player1id, m.player2id, m.matchindex, c1.username as name1, c2.username as name2, m.winner, m.endcause, m.points1, m.points2 FROM matchlist m INNER JOIN credentials c1 on c1.id = m.player1id INNER JOIN credentials c2 on c2.id = m.player2id WHERE m.player1id = $1 OR m.player2id = $1 AND "endcause" is null',
    [userId],
  );
  console.log(result);
  if (result === null) return [];
  const matches: MatchInfo[] = [];
  for (const row of result.rows) {
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
  return matches;
}
