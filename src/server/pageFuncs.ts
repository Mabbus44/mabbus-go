import * as uh from "./userHandling";
import * as db from "./dbHandling";

interface NumStr {
  [key: number]: string;
}

export async function getChallengers(userId: number): Promise<NumStr> {
  let result = await db.query('SELECT "user1id" FROM "challenges" WHERE "user2id" = $1', [userId]);
  if (result === null) return {};
  let ids: number[] = [];
  for (let row of result.rows) ids.push(row.user1id);
  const usernames: string[] = await uh.getUsernames(ids);
  let ret: NumStr = {};
  for (let i in ids) ret[ids[i]] = usernames[i];
  return ret;
}

export async function getChallengedPlayers(userId: number): Promise<NumStr> {
  let result = await db.query('SELECT "user2id" FROM "challenges" WHERE "user1id" = $1', [userId]);
  if (result === null) return {};
  let ids: number[] = [];
  for (let row of result.rows) ids.push(row.user2id);
  const usernames: string[] = await uh.getUsernames(ids);
  let ret: NumStr = {};
  for (let i in ids) ret[ids[i]] = usernames[i];
  return ret;
}

export async function getChallengeblePlayers(userId: number): Promise<NumStr> {
  let query: string = 'SELECT "username", "id" FROM "credentials" WHERE "id" NOT IN (';
  query += 'SELECT "user1id" AS id FROM "challenges" WHERE "user2id" = $1 UNION ';
  query += 'SELECT "user2id" AS id FROM "challenges" WHERE "user1id" = $1 UNION ';
  query += 'SELECT "player1id" AS id FROM "matchlist" WHERE "player2id" = $1 AND "endcause" IS NULL UNION ';
  query += 'SELECT "player2id" AS id FROM "matchlist" WHERE "player1id" = $1 AND "endcause" IS NULL)';
  let result = await db.query(query, [userId]);
  if (result === null) return {};
  let ret: NumStr = {};
  console.log(result.rows);
  for (let row of result.rows) if (row.id != userId) ret[row.id] = row.username;
  return ret;
}

export async function getCurrentMatches(userId: number): Promise<NumStr> {
  let result = await db.query(
    'SELECT "matchindex", "player1id", "player2id" FROM "matchlist" WHERE ("player1id"=$1 OR "player2id"=$1) AND "endcause" is null',
    [userId]
  );
  if (result === null) return {};
  let ids: number[] = [];
  for (let row of result.rows)
    if (row.player1id == userId) ids.push(row.player2id);
    else ids.push(row.player1id);
  const usernames: string[] = await uh.getUsernames(ids);
  let ret: NumStr = {};
  for (let i in result.rows) ret[result.rows[i].matchindex] = usernames[i];
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
  let result = await db.query(query, [userId, challengeId]);
  if (result === null || result.rowCount > 0) return false;
  query = 'INSERT INTO "challenges" ("user1id", "user2id") VALUES ($1, $2)';
  await db.query(query, [userId, challengeId]);
  return true;
}

export async function unChallengePlayer(userId: number, challengerId: number): Promise<boolean> {
  if (userId == null || isNaN(userId) || challengerId == null || isNaN(challengerId)) return false;
  let query: string = 'DELETE FROM "challenges" WHERE "user1id"=$1 AND "user2id"=$2';
  await db.query(query, [userId, challengerId]);
  return true;
}

export async function acceptChallange(userId: number, challengerId: number, color: number): Promise<number> {
  if (userId == null || isNaN(userId) || challengerId == null || isNaN(challengerId) || (color !== 0 && color !== 1))
    return 0;
  let query: string = 'DELETE FROM "challenges" WHERE "user2id"=$1 AND "user1id"=$2';
  let result = await db.query(query, [userId, challengerId]);
  if (result === null || result.rowCount === 0) return 0;
  if (color == 0) query = 'INSERT INTO "matchlist" ("player1id", "player2id") VALUES ($1, $2) RETURNING "matchindex";';
  else query = 'INSERT INTO "matchlist" ("player1id", "player2id") VALUES ($2, $1) RETURNING "matchindex";';
  result = await db.query(query, [userId, challengerId]);
  if (result === null || result.rowCount != 1) return 0;
  return result.rows[0].matchindex;
}

export function matchList(){
  let result = await db.query(
    'SELECT m.matchindex, c1.username as name1, c2.username as name2, m.winner, m.endCause, m.points1, m.points2 FROM matchlist m INNER JOIN credentials c1 on c1.id = m.player1id INNER JOIN credentials c2 on c2.id = m.player2id WHERE m.player1id = 13 OR m.player2id = 13 AND "endcause" is null',
    [userId]
  );
  if (result === null) return {};
  let ids: number[] = [];
  for (let row of result.rows)
    if (row.player1id == userId) ids.push(row.player2id);
    else ids.push(row.player1id);


  //Get challenged users from database
	$stmt = ps($conn, "SELECT `player1ID`, `player2ID`, `matchIndex`, `winner`, `endCause`, `points1`, `points2` FROM `tableName` WHERE `player1ID` = ? OR `player2ID` = ?", "matchList");
	$sessionID = getSession("id");
	$stmt->bind_param("ii", $sessionID, $sessionID);
	if(!$stmt->execute()){
		er("Prepared statement failed (" . $stmt->errno . ") " . $stmt->error . "SELECT `player1ID`, `player2ID`, `matchIndex`, `winner`, `endCause`, `points1`, `points2` FROM `matchList` WHERE `player1ID` = ? OR `player2ID` = ? ORDER BY `matchIndex` ASC");
		exit();
	}
	$result = $stmt->get_result();

	//Create challenger name list
	$oponentName = "";
	$outcome = "";
	echo "<select size=\"" . $result->num_rows . "\" name=\"matchList\" id=\"matchList\">";
	if($result->num_rows > 0) {
		while($row = $result->fetch_assoc()) {
			if($row["player1ID"] == $sessionID){
				$oponentName = getNameFromID($row["player2ID"]);
			}else{
				$oponentName = getNameFromID($row["player1ID"]);
			}
			if(is_null($row["endCause"])){
				echo "<option>" . "Oponent: " . $oponentName . ". Match not ended</option>";
			}else{
				if($row["winner"] == $sessionID){
					$outcome = dictRet("Win");
				}else{
					$outcome = dictRet("Loss");
				}
				if($row["endCause"] == "pass"){
					echo "<option>" . $outcome . ". " . dictRet("Oponent") . ": " . $oponentName . ". " . dictRet("Score") . ": " . $row["points1"] . "-" . $row["points2"] . "</option>";
				}else{
					echo "<option>" . $outcome . ". " . dictRet("Oponent") . ": " . $oponentName . ". " . dictRet("Surrender") . "</option>";
				}
			}
		}
	}
	echo "</select>";

	$stmt->close();
	$conn->close();
}