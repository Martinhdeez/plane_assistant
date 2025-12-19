FROM node:24.11.1-alpine AS builder

WORKDIR /app

COPY ./frontend/package.json .
COPY ./frontend/package-lock.json .
RUN npm ci --omit=dev && npm cache clean --force

COPY ./frontend/ .

ARG VITE_API_URL=REAL_API_URL
RUN npm run build

FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

WORKDIR /app

COPY ./docker/web/env.sh .
COPY ./docker/web/entrypoint.sh .
RUN chmod +x ./env.sh ./entrypoint.sh

EXPOSE 8080/tcp

ENTRYPOINT ["/app/entrypoint.sh", "nginx"]
CMD ["-g", "daemon off;"]