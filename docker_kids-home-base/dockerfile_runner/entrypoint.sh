#!/bin/sh
/usr/local/bin/kids-home-base-backend &
BACKEND_PID=$!
exec nginx -g 'daemon off;' &
NGINX_PID=$!

# どちらかのプロセスが終了したら、エントリポイントも終了する。
wait -n $BACKEND_PID $NGINX_PID
exit $?
