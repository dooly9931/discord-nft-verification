export interface Oauth {
  access_token: string;
  token_type: string;
  refresh_token: string;
}

export interface User {
  id: string;
}

export interface GuildMember {
  user: User;
  roles: string[];
}
