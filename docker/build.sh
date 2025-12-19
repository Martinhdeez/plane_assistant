#!/bin/bash

# Run with BUILD_DEV=1 to build dev images

IMAGES=("db" "api" "web")
DEV_IMAGES=("db" "api-dev" "web-dev")

function build_image() {
    IMAGE_NAME=$(echo $1 | cut -d "-" -f 1)
    IS_DEV=$(echo $1 | cut -d "-" -f 2)

    echo "Building ${IMAGE_NAME}..."

    # If IS_DEV is different than IMAGE_NAME it means it has "-dev"
    if [[ $IS_DEV == $IMAGE_NAME ]]; then
        docker build -t plane_assistant/$IMAGE_NAME -f ./docker/$IMAGE_NAME/Dockerfile .
    else
        echo "Building development image..."
        docker build -t plane_assistant/$IMAGE_NAME:dev -f ./docker/$IMAGE_NAME/Dockerfile.dev .
    fi

    if [[ $? != 0 ]]; then
        echo "Failed to build image ${IMAGE_NAME}! Aborting..."
        exit 1
    fi
}

function loop_build() {
    for image in $@; do
        build_image $image
    done
}

if [[ $BUILD_DEV == 1 ]]; then
    echo "Building development images..."
    loop_build ${DEV_IMAGES[*]}
else
    echo "Building production images..."
    echo "You can build development images running this script with BUILD_DEV=1"
    loop_build ${IMAGES[*]}
fi

echo "Everything done!"
exit 0