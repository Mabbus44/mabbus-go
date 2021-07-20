const { Pool } = require("pg");
import * as yn from "yn";
import * as auth from "./auth";

interface NumStr {
  [key: number]: string;
}

export async function getChallengers(userId: number): Promise<NumStr> {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: yn(process.env.DATABASE_SSL),
    });
    const client = await pool.connect();
    const result = await client.query('SELECT "user1id" FROM "challenges" WHERE "user2id" = $1', [userId]);
    client.release();
    let ids: number[] = [];
    for (let row of result.rows) ids.push(row.user1id);
    const usernames: string[] = await auth.getUsernames(ids);
    let ret: NumStr = {};
    for (let i in ids) ret[ids[i]] = usernames[i];
    return ret;
  } catch (err) {
    console.error(err);
    return {};
  }
}

export async function getChallengedPlayers(userId: number): Promise<NumStr> {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: yn(process.env.DATABASE_SSL),
    });
    const client = await pool.connect();
    const result = await client.query('SELECT "user2id" FROM "challenges" WHERE "user1id" = $1', [userId]);
    client.release();
    let ids: number[] = [];
    for (let row of result.rows) ids.push(row.user2id);
    const usernames: string[] = await auth.getUsernames(ids);
    let ret: NumStr = {};
    for (let i in ids) ret[ids[i]] = usernames[i];
    return ret;
  } catch (err) {
    console.error(err);
    return {};
  }
}

export async function getChallengeblePlayers(userId: number): Promise<NumStr> {
  let query: string = 'SELECT "username", "id" FROM "credentials" WHERE "id" NOT IN (';
  query += 'SELECT "user1id" AS id FROM "challenges" WHERE "user2id" = $1 UNION ';
  query += 'SELECT "user2id" AS id FROM "challenges" WHERE "user1id" = $1 UNION ';
  query += 'SELECT "player1id" AS id FROM "matchlist" WHERE "player2id" = $1 AND "endcause" IS NULL UNION ';
  query += 'SELECT "player2id" AS id FROM "matchlist" WHERE "player1id" = $1 AND "endcause" IS NULL)';
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: yn(process.env.DATABASE_SSL),
    });
    const client = await pool.connect();
    const result = await client.query(query, [userId]);
    client.release();
    let ret: NumStr = {};
    for (let row of result.rows) if (row.id != userId) ret[row.id] = row.username;
    return ret;
  } catch (err) {
    console.error(err);
    return {};
  }
}

export async function getCurrentMatches(userId: number): Promise<NumStr> {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: yn(process.env.DATABASE_SSL),
    });
    const client = await pool.connect();
    const result = await client.query(
      'SELECT "matchindex", "player1id", "player2id" FROM "matchlist" WHERE "player1id"=$1 OR "player2id"=$1',
      [userId]
    );
    client.release();
    let ids: number[] = [];
    for (let row of result.rows)
      if (row.player1id == userId) ids.push(row.player2id);
      else ids.push(row.player1id);
    const usernames: string[] = await auth.getUsernames(ids);
    let ret: NumStr = {};
    for (let i in result.rows) ret[result.rows[i].matchindex] = usernames[i];
    return ret;
  } catch (err) {
    console.error(err);
    return {};
  }
}

export async function challengePlayer(userId: number, challengeId: number): Promise<boolean> {
  if (userId == null || challengeId == null) return false;
  let query: string = 'SELECT "id" FROM (';
  query += 'SELECT "user1id" AS id FROM "challenges" WHERE "user2id" = $1 UNION ';
  query += 'SELECT "user2id" AS id FROM "challenges" WHERE "user1id" = $1 UNION ';
  query += 'SELECT "player1id" AS id FROM "matchlist" WHERE "player2id" = $1 AND "endcause" IS NULL UNION ';
  query += 'SELECT "player2id" AS id FROM "matchlist" WHERE "player1id" = $1 AND "endcause" IS NULL';
  query += ') AS takenplayers WHERE "id" = $2';
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: yn(process.env.DATABASE_SSL),
    });
    const client = await pool.connect();
    let result = await client.query(query, [userId, challengeId]);
    if (result.rowCount > 0) {
      client.release();
      return false;
    }
    query = 'INSERT INTO "challenges" ("user1id", "user2id") VALUES ($1, $2)';
    await client.query(query, [userId, challengeId]);
    client.release();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export async function unChallengePlayer(userId: number, challengerId: number): Promise<boolean> {
  if (userId == null || isNaN(userId) || challengerId == null || isNaN(challengerId)) return false;
  let query: string = 'DELETE FROM "challenges" WHERE "user1id"=$1 AND "user2id"=$2';
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: yn(process.env.DATABASE_SSL),
    });
    const client = await pool.connect();
    await client.query(query, [userId, challengerId]);
    client.release();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export async function acceptChallange(userId: number, challengerId: number, color: number): Promise<number> {
  if (userId == null || isNaN(userId) || challengerId == null || isNaN(challengerId) || (color !== 0 && color !== 1))
    return 0;
  let query: string = 'DELETE FROM "challenges" WHERE "user2id"=$1 AND "user1id"=$2';
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: yn(process.env.DATABASE_SSL),
    });
    const client = await pool.connect();
    let result = await client.query(query, [userId, challengerId]);
    client.release();
    if (result.rowCount == 0) return 0;
    if (color == 0)
      query = 'INSERT INTO "matchlist" ("player1id", "player2id") VALUES ($1, $2) RETURNING "matchindex";';
    else query = 'INSERT INTO "matchlist" ("player1id", "player2id") VALUES ($2, $1) RETURNING "matchindex";';
    result = await client.query(query, [userId, challengerId]);
    if (result.rowCount != 1) return 0;
    return result.rows[0].matchindex;
  } catch (err) {
    console.log(err);
    return 0;
  }
}
