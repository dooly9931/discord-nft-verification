import axios, { AxiosInstance } from "axios";
import { URLSearchParams } from "url";
import {
  botToken,
  clientId,
  clientSecret,
  guildId,
  holderRoleId,
} from "../constants";
import { GuildMember, Oauth, User } from "./types";

class DiscordApi {
  api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: "https://discord.com/api",
      timeout: 3000,
    });
  }

  async getOauth(code: string, redirect_uri: string): Promise<Oauth> {
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri,
      scope: "identify%20guilds.members.read",
    }).toString();

    const response = await this.api.post("/oauth2/token", body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data;
  }

  async refreshToken(oauth: Oauth) {
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: oauth.refresh_token,
      grant_type: "refresh_token",
    }).toString();

    const response = await this.api.post(`/oauth2/token`, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data;
  }

  async getGuildMember(oauth: Oauth): Promise<GuildMember> {
    const response = await this.api.get(`/users/@me/guilds/${guildId}/member`, {
      headers: {
        Authorization: `${oauth.token_type} ${oauth.access_token}`,
      },
    });

    return response.data;
  }

  async getUser(oauth: Oauth): Promise<User> {
    const response = await this.api.get(`/users/@me`, {
      headers: {
        Authorization: `${oauth.token_type} ${oauth.access_token}`,
      },
    });

    return response.data;
  }

  async addGuildMemberRole(oauth: Oauth, user: User) {
    await this.api.put(
      `/guilds/${guildId}/members/${user.id}/roles/${holderRoleId}`,
      { access_token: oauth.access_token },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bot ${botToken}`,
        },
      }
    );
  }

  async removeGuildMemberRole(oauth: Oauth, user: User) {
    await this.api.delete(
      `/guilds/${guildId}/members/${user.id}/roles/${holderRoleId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bot ${botToken}`,
        },
        data: { access_token: oauth.access_token },
      }
    );
  }
}

const discord = new DiscordApi();

export default discord;
