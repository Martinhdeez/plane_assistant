FROM node:24.11.1-alpine AS builder

WORKDIR /app

COPY ./frontend/package.json .
COPY ./frontend/package-lock.json .
RUN npm ci --omit=dev && npm cache clean --force

COPY ./frontend/ .

RUN npm run build

FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080/tcp

ENV VITE_API_URL=http://localhost:8000

ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]