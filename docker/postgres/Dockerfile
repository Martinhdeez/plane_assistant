FROM postgres:18-trixie

RUN apt-get update &&\
    apt-get install -y postgresql-18-pgvector

RUN echo "shared_preload_libraries='pg_vector'" >> /usr/share/postgresql/postgresql.conf.sample

HEALTHCHECK --interval=5s --timeout=3s --retries=3 \
    CMD pg_isready -U postgres || exit 1