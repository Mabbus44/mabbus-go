import * as bc from 'bcrypt';
import * as db from './dbHandling';

export async function login(
  username: string,
  password: string,
  session: any,
): Promise<{ result: boolean; message: string }> {
  if (typeof session !== 'object' || session == null) return { result: false, message: 'Internal error' };
  const result = await db.query('SELECT "id", "password" FROM "credentials" WHERE "username"=$1', [username]);
  if (result.rowCount !== 1) return { result: false, message: 'Username does not exist' };
  if (!(await bc.compare(password, result.rows[0].password))) return { result: false, message: 'Wrong password' };
  session.userId = result.rows[0].id;
  session.language = 'EN';
  return { result: true, message: 'Login succeeded' };
}

export function logout(session: any): boolean {
  if (typeof session !== 'object' || session == null) return false;
  session.destroy();
  return true;
}

async function checkNewCredentials(
  username: string,
  password: string,
  password2: string,
): Promise<{ result: boolean; message: string }> {
  const usernameRegex = /^[\p{L}0-9_]{2,20}$/u;
  // eslint-disable-next-line
  const passwordRegex = /^[\p{L}0-9!().?\[\]_`~;:@#$%^&*+=]{4,50}$/u;
  if (password !== password2) return { result: false, message: 'Passwords does not match' };
  if (!usernameRegex.test(username)) {
    return {
      result: false,
      message:
        'Username can only contain alphabetic symbols, 0-9 and the special character _ and must be between 2 and 20 symbols long',
    };
  }
  if (!passwordRegex.test(password)) {
    return {
      result: false,
      message:
        'Password can only contain alphabetic symbols, 0-9 and the special characters !().?[]_`~;:@#$%^&*+= and must be between 4 and 50 symbols long',
    };
  }
  const result = await db.query('SELECT "username" FROM "credentials" WHERE "username"=$1', [username]);
  if (result.rowCount > 0) return { result: false, message: 'Username taken' };
  return {
    result: true,
    message: 'Credentials ok',
  };
}

export async function createAccount(
  username: string,
  password: string,
  password2: string,
): Promise<{ result: boolean; message: string }> {
  const cresult = await checkNewCredentials(username, password, password2);
  if (!cresult.result) return cresult;
  const hashedPassword = await bc.hash(password, 10);
  await db.query(
    'INSERT INTO "credentials" ("username", "password", "date_created") VALUES($1, $2, current_timestamp)',
    [username, hashedPassword],
  );
  return { result: true, message: 'Account created' };
}

export function getUserColorFromList(playerIds: number[], userId: number): number {
  if (userId === playerIds[0]) return 1;
  if (userId === playerIds[1]) return 2;
  return 0;
}

export async function getPlayerIds(matchId: number): Promise<number[]> {
  const userId: number[] = [0, 0];
  if (typeof matchId !== 'number' || matchId === undefined || isNaN(matchId)) return userId;
  const result = await db.query('SELECT "player1id", "player2id" FROM "matchlist" WHERE "matchindex" = $1', [matchId]);
  if (result === null || result.rowCount !== 1) return userId;
  userId[0] = result.rows[0].player1id;
  userId[1] = result.rows[0].player2id;
  return userId;
}

export async function getUserColor(matchId: number, userId: number): Promise<number> {
  const ids: number[] = await getPlayerIds(matchId);
  return getUserColorFromList(ids, userId);
}
export function isLoggedIn(session: any): boolean {
  if (typeof session !== 'object' || session == null) return false;
  if (typeof session.userId !== 'number' || session.userId == null || session.userId <= 0) return false;
  return true;
}

export function getUserId(session: any): number {
  if (typeof session.userId !== 'number') return 0;
  if (session.userId == null) return 0;
  return session.userId;
}

export async function getUserName(session: any): Promise<string> {
  if (!isLoggedIn(session)) return '';
  const result = await db.query('SELECT "username" FROM "credentials" WHERE "id"=$1', [getUserId(session)]);
  if (result.rowCount !== 1) return '';
  return result.rows[0].username;
}

export async function getUsernames(userIds: number[]): Promise<string[]> {
  const result = await db.query('SELECT "username", "id" FROM "credentials" WHERE "id" = ANY($1::int[])', [userIds]);
  const usernames: string[] = [];
  for (const id of userIds) {
    for (const row of result.rows) {
      if (row.id === id) {
        usernames.push(row.username);
        break;
      }
    }
  }
  return usernames;
}
