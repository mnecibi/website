# syntax=docker/dockerfile:1

# ---- build -----------------------------------------------------------------
# index.js and output.css are generated here rather than committed, so pushing
# source is enough to deploy.
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY config.js boid.js hawk.js sky.js sketch.js input.css index.html ./
RUN npm run build

# ---- serve -----------------------------------------------------------------
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html
COPY fonts fonts
COPY img img
COPY favicon.ico site.webmanifest index.html ./
COPY --from=build /app/index.js /app/output.css ./
