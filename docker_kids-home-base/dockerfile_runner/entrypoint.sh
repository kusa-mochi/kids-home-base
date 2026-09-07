#!/bin/sh
/usr/local/bin/kids-home-base-backend &
exec nginx -g 'daemon off;'
