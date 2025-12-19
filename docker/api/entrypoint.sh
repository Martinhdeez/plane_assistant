#!/bin/sh

if [ ! -f "/config/.env" ]; then
    cp /build/.env_example /config/.env
fi

alembic upgrade head
if [ $? -ne 0 ]; then
    echo "Failed to run database migrations!"
    exit 1
fi

exec "$@"   