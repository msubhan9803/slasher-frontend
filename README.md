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

In the development/test environments, you'll need to use docker compose to run the development dependencies (right now, that's just MongoDB).  In a separate terminal window, run this from inside of the top level directory:

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


## Scripts

### Local scripts

There's a top level `scripts/local` directory for creating custom scripts for testing, generating reports, or running manual data transformations.  Scripts in this directory are git ignored and aren't committed to the repository, so this is where you can put script that you only need for yourself. Here's an example script, which you could place at `scripts/local/testing.ts`:

```typescript
import { createApp } from '../createApp';
import { UsersService } from '../../src/users/providers/users.service';

(async () => {
  const app = await createApp();
  const usersService = await app.get<UsersService>(UsersService);
  console.log(`How many users are there? ${(await usersService.findAll(1, 9999)).length}`);
  app.close();
})();
```

And here's how you would run that script:
```
NODE_ENV=development npx ts-node ./scripts/local/testing.ts
```

### Committed scripts

Scripts added directly under the `scripts` directory are NOT git ignored, and we should only commit these if they are beneficial for the team.  There is currently one script in there – `createSampleData.ts` – which can be helpful during development.  It adds some sample data to the development environment.  You can run it like this:

```
NODE_ENV=development npx ts-node ./scripts/createSampleData.ts
```
