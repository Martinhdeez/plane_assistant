FROM python:3.13.11-alpine

WORKDIR /build

COPY ./backend/requirements.txt .

RUN apk add --no-cache gcc clang
RUN pip install -r requirements.txt

RUN apk add --no-cache curl jq
COPY ./backend/.env_example .

WORKDIR /app

COPY --exclude=uploads \
    --exclude=.gitignore \
    --exclude=requirements.txt \
    --exclude=.env_example \
    --exclude=.venv \
    ./backend/ .

COPY ./docker/fastapi/entrypoint.sh .
RUN chmod +x ./entrypoint.sh

HEALTHCHECK --interval=5s --timeout=3s --retries=3 \
    CMD curl --fail http://localhost:8000/ || exit 1

EXPOSE 8000/tcp

VOLUME ["/uploads"]
VOLUME ["/config"]

ENV ENV_FILE=/config/.env

ENTRYPOINT ["/app/entrypoint.sh", "uvicorn"]
CMD ["app.main:app", "--reload"]