#!/bin/sh

if [ ! -f "/config/.env" ]; then
    cp /build/.env_example /config/.env
fi

exec "$@"