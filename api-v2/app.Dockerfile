# Step 1: Build the app in a container
FROM node:16 as builder

WORKDIR /source

# Install required node dependencies
COPY . .
RUN npm install
RUN npm run build

# Remove non-production dependencies
RUN npm prune --omit=dev

# Step 2: Produce a different container to run this app. THIS is the container that will be output
# in the end because it is the LAST one in this file.
FROM node:16
WORKDIR /app

# Copy required files for running production app
COPY --from=builder /source/package*.json ./
COPY --from=builder /source/node_modules/ ./node_modules/
COPY --from=builder /source/dist ./dist/

CMD [ "node", "dist/main" ]
