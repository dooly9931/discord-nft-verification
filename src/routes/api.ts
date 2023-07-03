import express, { NextFunction, Request, Response } from "express";
import discord from "../api/discord";
import { holderRoleId, NODE_URL } from "../constants";
import Web3 from "web3";
import { address, abi } from "../NftRegistry.json";
import db from "../db/postgres";

const router = express.Router();

const sendClientError = (res: Response, error: any) => {
  if (error.response) {
    res.statusCode = error.response.status;
    res.statusMessage = error.response.statusText;
    res.send(
      JSON.stringify({
        ...error.response.data,
      })
    );
  } else {
    res.status(400).send(JSON.stringify({ error: error.message }));
  }
};

router.get(
  "/is_holder",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = req.body.code as string;
      const redirect_uri = req.body.redirect_uri as string;

      const oauth = await discord.getOauth(code, redirect_uri);
      const guildMember = await discord.getGuildMember(oauth);

      await db.upsertDiscordById(guildMember.user.id, oauth);

      const query = (await db.selectWalletById(guildMember.user.id)) as {
        rowCount: number;
      };
      const db_result = query.rowCount > 0;

      let discord_result = guildMember.roles.includes(holderRoleId);

      if (!discord_result && db_result) {
        await discord.addGuildMemberRole(oauth, guildMember.user);
      } else if (discord_result && !db_result) {
        await discord.removeGuildMemberRole(oauth, guildMember.user);
      }

      res.status(200).send(
        JSON.stringify({
          result: db_result,
          token_type: oauth.token_type,
          access_token: oauth.access_token,
        })
      );
    } catch (error) {
      console.error(error);
      return sendClientError(res, error);
    }
  }
);

router.put(
  "/verify",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const msg = req.body.msg as string;
      const signature = req.body.signature as string;
      const token_type = req.body.token_type as string;
      const access_token = req.body.access_token as string;

      const provider = new Web3.providers.HttpProvider(NODE_URL);
      const web3 = new Web3(provider);
      const wallet = web3.eth.accounts.recover(msg, signature);

      if (msg !== wallet) throw new Error("invalid signature");

      const query = (await db.selectWalletByWallet(wallet)) as {
        rowCount: number;
      };

      if (query.rowCount > 0) throw new Error("already verified wallet");

      const contract = new web3.eth.Contract(abi as any, address);
      const balance = await contract.methods.balanceOf(wallet).call();

      if (parseInt(balance) === 0) throw new Error("0 nft balance");

      const oauth = { token_type, access_token, refresh_token: "" };
      const user = await discord.getUser(oauth);

      await db.upsertWalletById(user.id, wallet);

      await discord.addGuildMemberRole(oauth, user);

      res.sendStatus(204);
    } catch (error) {
      console.error(error);
      return sendClientError(res, error);
    }
  }
);

export default router;
