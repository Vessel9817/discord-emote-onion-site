# Discord Emote Onion Site

A basic tor website where users can save and search for Discord emojis
and stickers.

## Secrets

- [./onion-website/src/mongo/secrets/.env.example](./onion-website/src/mongo/secrets/.env.example)
- [./onion-website/src/mongo/secrets/root/username.txt.example](./onion-website/src/mongo/secrets/root/username.txt.example)
- [./onion-website/src/mongo/secrets/root/password.txt.example](./onion-website/src/mongo/secrets/root/password.txt.example)
- [./onion-website/src/mongo/secrets/express/username.txt.example](./onion-website/src/mongo/secrets/express/username.txt.example)
- [./onion-website/src/mongo/secrets/express/password.txt.example](./onion-website/src/mongo/secrets/express/password.txt.example)
- [./onion-website/src/mongo/secrets/dev/username.txt.example](./onion-website/src/mongo/secrets/dev/username.txt.example)
- [./onion-website/src/mongo/secrets/dev/password.txt.example](./onion-website/src/mongo/secrets/dev/password.txt.example)
- [./secrets/.env.example](./secrets/.env.example)

## Commands

### Build

Builds the services.

```shell
docker compose --profile production --profile development build
```

### Start (production)

Exposes the website to the tor network.
Can be executed before or after [Start (development)](#start-development).

```shell
docker compose --profile production up -d vanguards
```

### Start (development)

Exposes the website locally.
Can be executed before or after [Start (production)](#start-production).

```shell
docker compose --profile development up -d
```

### Stop

Stops the website.
Undoes both [Start (development)](#start-development)
and [Start (production)](#start-production).

```shell
docker compose --profile production --profile development down --remove-orphans && docker volume rm -f emote-website_tor-data
```
