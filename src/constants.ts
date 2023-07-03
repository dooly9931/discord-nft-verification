import path from "path";
import dotenv from "dotenv";

const envPath = path.resolve(".env");
dotenv.config({ path: envPath });

export const port = parseInt(process.env.SERVER_PORT ?? "");
export const clientId = process.env.DISCORD_CLIENT_ID ?? "";
export const clientSecret = process.env.DISCORD_CLIENT_SECRET ?? "";
export const botToken = process.env.DISCORD_BOT_TOKEN ?? "";
export const guildId = process.env.DISCORD_GUILD_ID ?? "";
export const holderRoleId = process.env.DISCORD_HOLDER_ROLE_ID ?? "";
export const DB_NAME = process.env.DB_NAME ?? "";
export const DB_PASSWORD = process.env.DB_PASSWORD ?? "";
export const NODE_URL = process.env.NODE_URL ?? "";

if (
  !clientId ||
  !clientSecret ||
  !botToken ||
  !guildId ||
  !holderRoleId ||
  !DB_NAME ||
  !DB_PASSWORD ||
  !NODE_URL
) {
  throw new Error("invalid .env variables");
}
