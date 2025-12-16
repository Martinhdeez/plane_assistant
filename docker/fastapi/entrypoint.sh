#!/bin/sh

if [ ! -f "/config/.env" ]; then
    cp /build/.env_example /config/.env
fi

if [ ! -f "/config/.ADMIN_CREATED" ]; then
    /build/create_admin.sh
    if [ $? -ne 0 ]; then
        echo "Failed to create admin account!"
        exit 1
    fi
fi

exec "$@"