# Slasher Web New (API + Cron) (a NestJS app)

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

In the development/test environments, you'll need to use docker compose to run the development dependencies (right now, that's MongoDB and Redis).

**IMPORTANT NOTE: If you have a separate copy of MongoDB installed, you must stop that MongoDB instance or it will claim the port that the Docker tries to use, and you will not be able to connect to MongoDB.**

If you're not sure if MongoDB is running, run:

```
ps aux | grep mongo
```

If you see a MongoDB process running, then you need to stop it before running the steps below.

*After confirming that no other copy of MongoDB is running, you can continue with the steps below.*

In a separate terminal window, run this from inside of the top level directory:

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

# e2e tests (this includes e2e-core and e2e-gateway)
$ npm run test:e2e
```

You can also run the linter (and this step doesn't require docker):

```bash
npm run lint
```

In the rare case you want to run the app locally over https with a self-signed certificate (usually only necessary when performing ad testing), you can run this:

```bash
npm run start:dev-https
```

Note: When using this with the slasher-web-frontend app, you'll probably need to visit https://localhost:4000 in your browser first and accept the self-signed certificate.

Monitoring memory usage:

If you want to monitor memory usage during tests, you can add the `--logHeapUsage` argument after any of the test commands in package.json.  Example:

```
"test": "jest --config ./test/jest-config.json --runInBand --logHeapUsage"
```

### Testing out a Docker build of the app or cron images

The command below will build the image and then run it (reading in the environment variables from .env.development). Watch out though: when Docker reads in a .env file, and reads in a value like `somekey="somevalue"`, it will actually store the leading and trailing quotes IN the string.  So make sure not to wrap .env values

```
docker build -t slasher-web-new-app:latest --file app.Dockerfile . && docker run --rm -ti --env-file ./.env.development slasher-web-new-app:latest
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

## NestJS Conventions

### Circular Dependency

Docs - Circular dependency | NestJS: [Click here](https://docs.nestjs.com/fundamentals/circular-dependency)

The circular dependency problem can be fixed -

  - (good way) with a @Global module directive .e.,g for the `UserModule`.  As we are using the `UserModule` in multiple modules (more than 3, otherwise second option of `forwardRef` seems good), so it seems like making it a `@Global` module is good option. Other global modules: `MoviesModule` and `FeedPostsModule`. NOTE: NestJS recommends avoiding that if possible, I think because it is bad practice to make something global because it's safer to limit access to functionality to only places in the app where it's needed.
  - (good way) with  forwardRef is the another way as mentioned in NestJS docs.
  - (good way?) by extracting the duplicate logics of each module into a common module to avoid dependency as [described here](https://blog.logrocket.com/avoid-circular-dependencies-nestjs/).
  - (bad way) by creating a model instace in a controller directly instead of a schema method via service layer.  We are avoiding performing mongodb queries directly in the controllers so we would like to use the services to wrap the mongodb query calls, so that we abstract the queries away and can change the implementation later as needed.

Note: The Movie module must always be declared with `useFactory`, to add the pre and post hooks, then if anyone forgets to do the same thing when that module is re-declared elsewhere, it creates bugs because the pre and post hooks won't be running properly in some places think and this is why NestJS encourages developers to re-use modules by using @Global module directive to make them global, rather than re-declaring them in each module.

Note: If we consider avoiding `forwardRef` because circular dependency is [common problem](https://en.wikipedia.org/wiki/Circular_dependency) in the way how modules behave in most of the popular programming languages, then a we have two options: export and import the modules, or make a module global.

## Deployment

Deploy to staging by pushing commits to the deploy/staging branch.

Deploy to prod by pushing commits to the deploy/prod branch.
