const { Pool } = require("pg");
import * as yn from "yn";
import * as bc from "bcrypt";

export async function login(
  username: string,
  password: string,
  session: any
): Promise<{ result: boolean; message: string }> {
  if (typeof session != "object" || session == null) return { result: false, message: "Internal error" };
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: yn(process.env.DATABASE_SSL),
    });
    const client = await pool.connect();
    const result = await client.query('SELECT "id", "password" FROM "credentials" WHERE "username"=$1', [username]);
    client.release();
    if (result.rowCount != 1) return { result: false, message: "Username does not exist" };
    if (!(await bc.compare(password, result.rows[0].password))) return { result: false, message: "Wrong password" };
    session.userId = result.rows[0].id;
    return { result: true, message: "Login succeeded" };
  } catch (err) {
    console.error(err);
    return { result: false, message: "Internal error" };
  }
}

export function logout(session: any): boolean {
  if (typeof session != "object" || session == null) return false;
  session.destroy();
  return true;
}

export async function createAccount(
  username: string,
  password: string,
  password2: string
): Promise<{ result: boolean; message: string }> {
  const cresult = await checkNewCredentials(username, password, password2);
  if (!cresult.result) return cresult;
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: yn(process.env.DATABASE_SSL),
    });
    const client = await pool.connect();
    let hashedPassword = await bc.hash(password, 10);
    await client.query(
      'INSERT INTO "credentials" ("username", "password", "date_created") VALUES($1, $2, current_timestamp)',
      [username, hashedPassword]
    );
    client.release();
    return { result: true, message: "Account created" };
  } catch (err) {
    console.error(err);
    return { result: false, message: "Internal error" };
  }
}

async function checkNewCredentials(
  username: string,
  password: string,
  password2: string
): Promise<{ result: boolean; message: string }> {
  let usernameRegex = /^[\p{L}0-9_]{2,20}$/u;
  let passwordRegex = /^[\p{L}0-9!().?\[\]_`~;:@#$%^&*+=]{4,50}$/u;
  if (password != password2) return { result: false, message: "Passwords does not match" };
  if (!usernameRegex.test(username))
    return {
      result: false,
      message:
        "Username can only contain alphabetic symbols, 0-9 and the special character _ and must be between 2 and 20 symbols long",
    };
  if (!passwordRegex.test(password))
    return {
      result: false,
      message:
        "Password can only contain alphabetic symbols, 0-9 and the special characters !().?[]_`~;:@#$%^&*+= and must be between 4 and 50 symbols long",
    };
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: yn(process.env.DATABASE_SSL),
    });
    const client = await pool.connect();
    let result = await client.query('SELECT "username" FROM "credentials" WHERE "username"=$1', [username]);
    client.release();
    if (result.rowCount > 0) return { result: false, message: "Username taken" };
    return {
      result: true,
      message: "Credentials ok",
    };
  } catch (err) {
    console.error(err);
    return { result: false, message: "Internal error" };
  }
}

export function isLoggedIn(session: any): boolean {
  if (typeof session != "object" || session == null) return false;
  if (typeof session.userId != "number" || session.userId == null || session.userId <= 0) return false;
  return true;
}

export async function getUserName(session: any): Promise<string> {
  if (!isLoggedIn(session)) return "";
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: yn(process.env.DATABASE_SSL),
    });
    const client = await pool.connect();
    let result = await client.query('SELECT "username" FROM "credentials" WHERE "id"=$1', [getUserId(session)]);
    client.release();
    if (result.rowCount != 1) return "";
    return result.rows[0].username;
  } catch (err) {
    console.error(err);
    return "";
  }
}

export async function getUsernames(userIds: number[]): Promise<string[]> {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: yn(process.env.DATABASE_SSL),
    });
    const client = await pool.connect();
    const result = await client.query('SELECT "username" FROM "credentials" WHERE "id" = ANY($1::int[])', [userIds]);
    client.release();
    let usernames: string[] = [];
    for (let row of result.rows) usernames.push(row.username);
    return usernames;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export function getUserId(session: any): number {
  if (typeof session.userId != "number") return 0;
  if (session.userId == null) return 0;
  return session.userId;
}
