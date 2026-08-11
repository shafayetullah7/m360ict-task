FROM node:22-alpine

# Native build toolchain for argon2
RUN apk add --no-cache python3 make g++

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN mkdir -p uploads && chown -R node:node /app

USER node

EXPOSE 4000

CMD ["pnpm", "run", "dev"]
