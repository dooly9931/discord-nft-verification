# discord-nft-verification

## What is this?

This is a server that checks nft balance of given wallet with signature and adds/deletes nft holder role on a discord server.

## How to run

### 1. Save environment variables at .env.

### 2. Run the application.

```
$ docker compose up -d
```

### 3. Termination

```
$ docker stop $(docker ps --filter name="discord-nft-*" -aq) && docker rm $(docker ps --filter name="discord-nft-*" -aq) && docker rmi $(docker images "discord-nft-*" -aq)
```
