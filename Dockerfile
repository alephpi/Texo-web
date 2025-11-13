FROM pandoc/core:latest AS base

RUN apk add --no-cache curl nodejs npm \
  && npm install -g pnpm

WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm build

FROM base AS runtime
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=build /app/.output /app/.output

EXPOSE 300
ENV NODE_ENV=production

ENTRYPOINT []
CMD ["node", ".output/server/index.mjs"]