# api-v2 (a NestJS app)

## Node version notes

This project currently uses Node 16. It's recommended that you install Node via NVM because it makes management of multiple Node versions easier.

See: https://github.com/nvm-sh/nvm

Specifically, were targeting Node 16.13.1 (as indicated by the .nvmrc file).

Also make sure that you're using a version of NPM that's at least 8.2.0.

## Initial setup

```bash
# Install dependencies
$ npm install

# Copy dev env template file to .env.development (required during development)
$ cp .env.development.template .env.development

# Copy test env template file to .env.test (required to run tests)
$ cp .env.test.template .env.test
```

## Development and testing

In the development/test environments, you'll need to use docker compose to run the development dependencies (right now, that's just MongoDB).  In a separate terminal window, run this from inside of the `api-v2` directory:

```bash
docker compose --file docker-compose.devtest.yml up --build
```

Note that the command above includes `--build`, and it will rebuild the compose setup if needed, in case the associated compose yml file has changed since you last ran it.

When you are done developing, you can stop docker compose by pressing ctrl+c, and then to clean up the images you can run:

```bash
docker compose --file docker-compose.devtest.yml down
```

Then, to start the app in development mode (with automatic watching of file changes), run:

```bash
# watch mode
$ npm run start:dev
```

And to run tests:

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e
```

You can also run the linter (and this step doesn't require docker):

```bash
npm run lint
```
