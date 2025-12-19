#!/bin/sh

/app/env.sh
if [ $? -ne 0 ]; then
    echo "Failed to replace vite placeholder variables!"
    exit 1
fi

exec "$@"   