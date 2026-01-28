FROM python:3.13.11-slim AS builder

WORKDIR /build

RUN apt update &&\
    apt install clang -y

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY ./backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.13.11-slim AS runner

WORKDIR /build

COPY ./backend/.env_example .

WORKDIR /app

RUN apt update &&\
    apt install curl jq fonts-dejavu-core -y &&\
    rm -rf /var/lib/apt/lists/*

COPY ./backend/alembic /app/alembic
COPY ./backend/app /app/app
COPY ./backend/alembic.ini /app/alembic.ini

COPY ./docker/api/entrypoint.sh .
RUN chmod +x ./entrypoint.sh

HEALTHCHECK --interval=5s --timeout=3s --retries=3 \
    CMD curl --fail http://localhost:8000/api || exit 1

EXPOSE 8000/tcp

VOLUME ["/uploads"]
VOLUME ["/config"]

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

ENV ENV_FILE=/config/.env
ENV UVICORN_HOST=0.0.0.0
ENV UVICORN_PORT=8000
ENV WEB_CONCURRENCY=4

ENTRYPOINT ["/app/entrypoint.sh", "uvicorn"]
CMD ["app.main:app"] 