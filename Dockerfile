# syntax=mirror.gcr.io/docker/dockerfile:1

# Site 100 % statique : les pages HTML sont générées et commitées (voir tools/README.md),
# nginx les sert telles quelles. Image tirée via mirror.gcr.io : Docker Hub rate-limite
# les pulls anonymes (429) sur l'IP partagée du VPS Semisto.
FROM mirror.gcr.io/library/nginx:1.31-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/deploy
EXPOSE 80
