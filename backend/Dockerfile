FROM node:20-alpine AS base
WORKDIR /backend

FROM base AS deps-dev
COPY package*.json ./
RUN npm ci && npm cache clean --force

FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --if-present

FROM base AS development
ENV NODE_ENV=development
COPY --from=deps-dev /backend/node_modules ./node_modules
COPY . .
EXPOSE 3000
# после merge todo(#253): migration:run перед start:dev
CMD ["npm", "run", "start:dev"]