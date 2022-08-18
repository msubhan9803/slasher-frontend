# slasher-web-backend

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Building and running a Docker image

The commands below will build the image and then run it:
```
# Build the app (MUST do before running docker build, since docker build pulls in dist directory)
npm run build

# Then build the image and give it the tag "latest"
docker build -t slasher-web-backend:latest .

# Run the image
docker run --env-file .env -p 4000:4000 --rm slasher-web-backend:latest

# Explanation of above options:
# --env-file .env (read in the local .env file and set environment variables in the container)
# -p 4000:3000 (map host port 4000 to container port 4000, and expose port 4000 internally)
# --rm (delete the container after it is stopped)
```
