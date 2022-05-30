FROM node:16

WORKDIR /app

# Install required node dependencies
COPY package*.json ./
RUN npm install --only=production

# Only copy the dist directory in.
# This assumes that `npm run build` was run previously, before `docker build`.
# We don't want to copy the entire source project into the container.  This way, we won't
# risk accidentally packging up files that shouldn't be in the container (like .env files).
COPY ./dist ./dist

CMD [ "node", "dist/main" ]
