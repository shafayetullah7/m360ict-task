FROM node:22-alpine

WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable

# Install dependencies first (better layer caching)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy the rest of the project
COPY . .

EXPOSE 4000

CMD ["pnpm", "run", "dev"]