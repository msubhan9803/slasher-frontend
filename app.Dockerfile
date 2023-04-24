# Step 1: Build the app in a container
FROM node:16.13.1-alpine3.15 as builder

WORKDIR /source

COPY . .

# Dev and prod dependencies are required for build
RUN npm install

# Build app
RUN npm run build

# Remove non-production dependencies (because we'll be
# re-using the node_modules dir in a prod context later)
RUN npm prune --omit=dev

# Step 2: Produce a different container to run this app. THIS is the container
# that will be output in the end because it is the LAST one in this file.
FROM node:16.13.1-alpine3.15
WORKDIR /app

# Copy required files for running the production build
COPY --from=builder /source/package*.json ./
COPY --from=builder /source/node_modules/ ./node_modules/
COPY --from=builder /source/dist ./dist/

# The line below runs the build in dist, and also makes the process.env.npm_package_version
# available.  If we just ran `node dist/main`, then the npm_package_version wouldn't be available.
CMD [ "npm", "run", "start:prod" ]
