FROM node:24.11.1-alpine

WORKDIR /build

COPY ./frontend/package*.json ./

# RUN npm ci --omit=dev && npm cache clean --force
RUN npm install

WORKDIR /app

COPY ./frontend/* .

EXPOSE 5173/tcp

ENTRYPOINT ["npm"]
CMD ["run", "dev"]