FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install && chown -R node:node /app

# ------ LOCAL DEV (docker-compose: target: dev, bind mount + node_modules volume) ------
FROM node:20-alpine AS dev

WORKDIR /app

USER node
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node package.json package-lock.json ./

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]

# ------ FRONTEND BUILD ------
FROM node:20-alpine AS builder

WORKDIR /app
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node . .

USER node
RUN npm run build

# ------ FINAL IMAGE ------
FROM node:18-alpine AS runner

WORKDIR /app

USER node
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "run", "start"]
