#!/bin/sh
set -eu

envsubst '${BACKEND_HOST} ${BACKEND_PORT}' < /etc/nginx/template/nginx.conf.template > /tmp/nginx.conf

/usr/local/bin/kids-home-base-backend &
BACKEND_PID=$!
exec nginx -c /tmp/nginx.conf -g 'daemon off;' &
NGINX_PID=$!

# どちらかのプロセスが終了したら、エントリポイントも終了する。
wait -n $BACKEND_PID $NGINX_PID
exit $?
