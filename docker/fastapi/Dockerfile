FROM python:3.13-alpine

WORKDIR /build

COPY ./backend/requirements.txt .

RUN pip install -r requirements.txt

COPY ./backend/.env_example .
COPY ./backend/create_admin.sh .
RUN chmod +x ./create_admin.sh

WORKDIR /app

COPY --exclude=./backend/uploads \
    --exclude=./backend/.gitignore \
    --exclude=./backend/create_admin.sh \
    --exclude=./backend/requirements.txt \
    --exclude=./backend/.env_example \
    --exclude=./backend/.venv \
    ./backend/* .

COPY ./docker/fastapi/entrypoint.sh .
RUN chmod +x ./entrypoint.sh

HEALTHCHECK --interval=5s --timeout=3s --retries=3 \
    CMD curl --fail http://localhost:8000/ || exit 1

EXPOSE 8000/tcp

VOLUME ["/uploads"]
VOLUME ["/config"]

ENTRYPOINT ["/app/entrypoint.sh", "uvicorn"]
CMD ["app.main:app", "--reload"]