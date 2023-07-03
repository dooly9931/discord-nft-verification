import discord from "../api/discord";
import { NODE_URL } from "../constants";
import db from "../db/postgres";
import { address, abi } from "../NftRegistry.json";
import Web3 from "web3";

const provider = new Web3.providers.HttpProvider(NODE_URL);
const web3 = new Web3(provider);
const contract = new web3.eth.Contract(abi as any, address);

const reset = async () => {
  const query = (await db.selectDiscordJoinWallet()) as {
    rowCount: number;
    rows: {
      discord_id: string;
      wallet: string;
      token_type: string;
      access_token: string;
      refresh_token: string;
    }[];
  };

  query.rows.forEach(async (row) => {
    const { discord_id, wallet, token_type, access_token, refresh_token } = row;
    const balance = await contract.methods.balanceOf(wallet).call();

    if (parseInt(balance) === 0) {
      db.deleteWalletById(discord_id);
      discord.removeGuildMemberRole(
        { token_type, access_token, refresh_token },
        { id: discord_id }
      );
    } else {
      const oauth = await discord.refreshToken({
        token_type,
        access_token,
        refresh_token,
      });
      db.upsertDiscordById(discord_id, oauth);
    }
  });
};

const interval = setInterval(reset, 1000 * 60 * 60 * 24);
