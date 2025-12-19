# Docker
## Building
From the project root directory run:
```
chmod +x docker/build.sh
``` 
This gives the build script execution permissions.
### Production
If you are using the provided `compose.yml` file, you do not need to build the images manually as they are already published in the Github Registry. If you want to build the images anyways for local use, run:
```
docker/build.sh
```
This will build all docker images for production deployment.
### Development
You need to pass a special environment variable to the script to build for development:
```
BUILD_DEV=1 docker/build.sh
```
This will build all docker images for development purposes.
## Running
First change into the `docker` directory.
### Production
```
docker compose up -d
```
API will run on port 8000 and web server in port 8080.
### Development
```
docker compose up -f compose-dev.yml -d
```
Database will run on port 5432, API will run on port 8000 and web server in port 5173.