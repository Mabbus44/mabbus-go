import { Pool } from "pg";
import * as yn from "yn";

export async function query(query: string, arg: any[]) {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: yn(process.env.DATABASE_SSL),
    });
    const client = await pool.connect();
    const result = await client.query(query, arg);
    client.release();
    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
}
