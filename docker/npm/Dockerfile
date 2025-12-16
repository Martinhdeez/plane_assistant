FROM node:24.11.1-alpine

WORKDIR /app

COPY ./frontend/package.json .
COPY ./frontend/package-lock.json .

# RUN npm ci --omit=dev && npm cache clean --force
RUN npm install

COPY ./frontend/ .

EXPOSE 5173/tcp

ENV API_HOST=pa-fastapi
ENV API_PORT=8000

# Remove dev in prod
ENTRYPOINT ["npm"]
CMD ["run", "dev"]