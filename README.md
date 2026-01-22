# Desinteligentes Artificiales
Martín Hernández González

Samuel Hermida Rojo

## Fuentes de datos
- https://hub.docker.com/ (Imágenes de Docker)
- 

## Archivos
### Carpeta backend:
Contiene el código que interactua con la base de datos PostgreSQL y expone una API HTTP.

### Carpeta frontend:
Contiene el código de la página web con la que interactúa el usuario, desarrollada en Javascript con Vite.

### Carpeta docker
Contiene los scripts, Dockerfiles y Compose files para poder subir el proyecto a producción.

# Ejecución
## Desarrollo en local
### Backend
En la carpeta **backend**, ejecutar:
```
python -m venv .venv && source .venv/bin/activate
```

A continuación, instalar todos los paquetes relevantes:
```
pip install -r requirements.txt
```

Finalmente, se puede ejectuar el backend usando:
```
uvicorn app.main:app --reload
```

### Frontend
En la carpeta **frontend**, instalar los paquetes relevantes:
```
npm install
```

Finalmente, se puede ejecutar el frontend usando:
```
npm run dev
```

## Desplegando con Docker
### Compilación
Desde la carpeta padre del proyecto ejecutar:
```
chmod +x docker/build.sh
``` 

#### Desarrollo
Necesitas pasarle a docker una variable de entorno especial para compilar las imágenes de desarrollo:
```
BUILD_DEV=1 docker/build.sh
```

#### Producción
Si estás usando el archivo `docker/compose.yml`, no necesitas compilar las imágenes ya que están publicadas en el registro de Github.

Si las quieres compilar igualmente puedes ejecutar:
```
docker/build.sh
```
Pero no olvides cambiar los nombres de las imágenes en el archivo compose!

### Corriendo Docker
Primero cambia al directorio **docker**.

#### Development
Se debe ejecutar:
```
docker compose up -f compose-dev.yml -d
```
La base de datos se ejecutará en el puerto 5432, la API en el puerto 8000 y el servidor web en el puerto 5173.

### Production
Se debe ejecutar:
```
docker compose up -d
```
La API se ejecutará en el puerto 8000 del contenedor *pa-fastapi* y el servidor web en el puerto 8080 del contenedor *pa-website*. Ambos puertos se mapean al host automáticamente.

### Notas importantes
Al crear el stack de compose, se crearan dos carpetas:
- **config**: Contiene la configuración en el archivo `.env`.
- **uploads**: Contiene la ruta para subir plantillas e imágenes.