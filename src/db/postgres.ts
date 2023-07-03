import { Pool } from "pg";
import { DB_NAME, DB_PASSWORD } from "../constants";
import { Oauth } from "../api/types";

export class DbClient {
  pool: Pool;

  constructor() {
    this.pool = new Pool({
      user: "admin",
      host: "db",
      database: DB_NAME,
      password: DB_PASSWORD,
      port: 5432,
    });
  }

  async init() {
    const client = await this.pool.connect();
    const createDiscordQuery = `CREATE TABLE IF NOT EXISTS discord (
      discord_id VARCHAR(32) PRIMARY KEY,
      token_type VARCHAR(32) NOT NULL,
      access_token VARCHAR(68) NOT NULL,
      refresh_token VARCHAR(68)NOT NULL
    );`;
    await client.query(createDiscordQuery, []);
    const createWalletQuery = `CREATE TABLE IF NOT EXISTS wallet (
      discord_id VARCHAR(32) PRIMARY KEY REFERENCES discord,
      wallet VARCHAR(68) NOT NULL
    );`;
    await client.query(createWalletQuery, []);
    client.release();
  }

  async upsertDiscordById(discordId: string, oauth: Oauth) {
    const client = await this.pool.connect();
    const upsertQuery = `INSERT INTO discord (discord_id, token_type, access_token, refresh_token) VALUES ($1, $2, $3, $4)
    ON CONFLICT (discord_id) DO UPDATE
      SET token_type = $2,
          access_token = $3,
          refresh_token = $4;`;
    await client.query(upsertQuery, [
      discordId,
      oauth.token_type,
      oauth.access_token,
      oauth.refresh_token,
    ]);
    client.release();
  }

  async deleteDiscordById(discordId: string) {
    const client = await this.pool.connect();
    const deleteQuery = `DELETE FROM discord WHERE discord_id = $1`;
    await client.query(deleteQuery, [discordId]);
    client.release();
  }

  async selectWalletById(discordId: string) {
    const client = await this.pool.connect();
    const selectQuery = `SELECT * FROM wallet WHERE discord_id = $1;`;
    const res = await client.query(selectQuery, [discordId]);
    client.release();
    return res;
  }

  async selectWalletByWallet(wallet: string) {
    const client = await this.pool.connect();
    const selectQuery = `SELECT * FROM wallet WHERE wallet = $1`;
    const res = await client.query(selectQuery, [wallet]);
    client.release();
    return res;
  }

  async upsertWalletById(discordId: string, wallet: string) {
    const client = await this.pool.connect();
    const upsertQuery = `INSERT INTO wallet (discord_id, wallet) VALUES ($1, $2)
      ON CONFLICT (discord_id) DO UPDATE
        SET wallet = $2;`;
    await client.query(upsertQuery, [discordId, wallet]);
    client.release();
  }

  async deleteWalletById(discordId: string) {
    const client = await this.pool.connect();
    const deleteQuery = `DELETE FROM wallet WHERE discord_id = $1`;
    await client.query(deleteQuery, [discordId]);
    client.release();
  }

  async selectDiscordJoinWallet() {
    const client = await this.pool.connect();
    const selectQuery = `SELECT * FROM discord JOIN wallet ON discord.discord_id = wallet.discord_id`;
    const res = await client.query(selectQuery, []);
    client.release();
    return res;
  }
}

const db = new DbClient();

export default db;
