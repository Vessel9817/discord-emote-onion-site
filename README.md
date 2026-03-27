# Discord Emote Onion Site

A basic tor website where users can save and search for Discord emojis
and stickers.

## Setup

Rename the following files to remove the `.example` postfix:

- [./onion-website/src/mongo/secrets/.env.example](./onion-website/src/mongo/secrets/.env.example)
- [./onion-website/src/mongo/secrets/root/username.txt.example](./onion-website/src/mongo/secrets/root/username.txt.example)
- [./onion-website/src/mongo/secrets/root/password.txt.example](./onion-website/src/mongo/secrets/root/password.txt.example)
- [./onion-website/src/mongo/secrets/express/username.txt.example](./onion-website/src/mongo/secrets/express/username.txt.example)
- [./onion-website/src/mongo/secrets/express/password.txt.example](./onion-website/src/mongo/secrets/express/password.txt.example)
- [./secrets/.env.example](./secrets/.env.example)

The same goes with these files, except that these values should be memorable:

- [./onion-website/src/mongo/secrets/dev/username.txt.example](./onion-website/src/mongo/secrets/dev/username.txt.example)
- [./onion-website/src/mongo/secrets/dev/password.txt.example](./onion-website/src/mongo/secrets/dev/password.txt.example)

Although this project will work with the example credentials
in each of these files, **for your own security, please change them.**

For more information about configuring an existing onion domain, see the
[upstream's README](./onion-website/README.md#tor)

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
