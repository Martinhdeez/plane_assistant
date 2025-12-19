FROM python:3.13.11-slim AS builder

WORKDIR /build

RUN python -m venv /build/venv
ENV PATH="/build/venv/bin:$PATH"

RUN apt update
RUN apt install clang -y

COPY ./backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.13.11-alpine AS runner

WORKDIR /build

RUN apk add --no-cache curl jq
COPY ./backend/.env_example .

WORKDIR /app

COPY --exclude=uploads \
    --exclude=.gitignore \
    --exclude=requirements.txt \
    --exclude=.env_example \
    --exclude=.venv \
    ./backend/ .

COPY ./docker/api/entrypoint.sh .
RUN chmod +x ./entrypoint.sh

HEALTHCHECK --interval=5s --timeout=3s --retries=3 \
    CMD curl --fail http://localhost:8000/api || exit 1

EXPOSE 8000/tcp

VOLUME ["/uploads"]
VOLUME ["/config"]

ENV PATH="/app/venv/bin:$PATH"
COPY --from=builder /build/venv /app/venv

ENV ENV_FILE=/config/.env
ENV UVICORN_HOST=0.0.0.0
ENV UVICORN_PORT=8000
ENV WEB_CONCURRENCY=4

ENTRYPOINT ["/app/entrypoint.sh", "uvicorn"]
CMD ["app.main:app"] 