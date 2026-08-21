# Discord Emote Onion Site

[![CI][ci-badge]][ci-workflow]

A basic tor website where users can save and search for Discord emojis
and stickers.

## Setup

> [!TIP]
> The following setup instructions are mostly a copy-paste of the upstream
> project instructions, located at `./onion-website`. For more information
> about configuring an onion domain with this tool or for troubleshooting,
> see the [onion-website README](./onion-website/README.md#configuring-secrets)

Rename the following files to remove the `.example` postfix:

- [./onion-website/src/mongo/secrets/.env.example](./onion-website/src/mongo/secrets/.env.example)
- [./onion-website/src/mongo/secrets/root/username.txt.example](./onion-website/src/mongo/secrets/root/username.txt.example)
- [./onion-website/src/mongo/secrets/root/password.txt.example](./onion-website/src/mongo/secrets/root/password.txt.example)
- [./onion-website/src/mongo/secrets/express/username.txt.example](./onion-website/src/mongo/secrets/express/username.txt.example)
- [./onion-website/src/mongo/secrets/express/password.txt.example](./onion-website/src/mongo/secrets/express/password.txt.example)
- [./onion-website/src/onionprobe/config.yml.example](./onion-website/src/onionprobe/config.yml.example)
- [./secrets/.env.example](./secrets/.env.example)

The same goes with these files, except that these values should be memorable:

- [./onion-website/src/mongo/secrets/dev/username.txt.example](./onion-website/src/mongo/secrets/dev/username.txt.example)
- [./onion-website/src/mongo/secrets/dev/password.txt.example](./onion-website/src/mongo/secrets/dev/password.txt.example)
- [./onion-website/src/grafana/secrets/username.txt.example](./onion-website/src/grafana/secrets/username.txt.example)
- [./onion-website/src/grafana/secrets/password.txt.example](./onion-website/src/grafana/secrets/password.txt.example)
- [./onion-website/src/grafana/secrets/email.txt.example](./onion-website/src/grafana/secrets/email.txt.example)

Although this project will work with the example credentials
in each of these files, **for your own security, please change them.**

Next, generate a keyfile through Linux:

```sh
# Generation
openssl rand -base64 756 > ./onion-website/src/mongo/secrets/keyFile.pem
chmod 0400 ./onion-website/src/mongo/secrets/keyFile.pem
sudo chown 999:999 ./onion-website/src/mongo/secrets/keyFile.pem

# Tests
stat -c %a ./onion-website/src/mongo/secrets/keyFile.pem
stat -c %u:%g ./onion-website/src/mongo/secrets/keyFile.pem
```

If successful, you should see the following output:

```log
400
999:999
```

Finally, `cd` into `onion-website` and see:
[Configuring an Onion Domain](./onion-website/README.md#tor).
This domain will need to be put into `./onion-website/src/onionprobe/config.yml`

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
docker compose --profile production up -d tor
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
docker compose --profile production --profile development down --remove-orphans
```

[ci-workflow]: https://github.com/Vessel9817/discord-emote-onion-site/actions/workflows/ci.yml
[ci-badge]: https://github.com/Vessel9817/discord-emote-onion-site/actions/workflows/ci.yml/badge.svg
