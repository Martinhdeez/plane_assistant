#!/bin/sh

# Database
docker build -t plane_assistant/postgres -f ./docker/postgres/Dockerfile .
if [ $? -ne 0 ]; then
    echo "Error compiling postgres image!"
    exit 1
fi

# Backend
docker build -t plane_assistant/fastapi -f ./docker/fastapi/Dockerfile .
if [ $? -ne 0 ]; then
    echo "Error compiling fastapi image!"
    exit 1
fi

# Frontend
docker build -t plane_assistant/npm -f ./docker/npm/Dockerfile .
if [ $? -ne 0 ]; then
    echo "Error compiling npm image!"
    exit 1
fi

echo "Everything done!"
echo "Run docker compose up -d to start the program!"
exit 0