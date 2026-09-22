# 運用環境でバックエンドとフロントエンドを実行するためのDockerfile。
# バックエンドとフロントエンドのビルド出力をそれぞれ所定のディレクトリに配置し、バックエンドを実行し、フロントエンドをnginxで配信する。
ARG BASE_IMAGE_ALPINE_VERSION=20260805
ARG NODE_VERSION=24.17.0-r0
ARG NPM_VERSION=11.11.0-r0
ARG GO_VERSION=1.25.10-r0
ARG BACKEND_PORT=20080
ARG BACKEND_HOST=192.168.0.10
FROM alpine:${BASE_IMAGE_ALPINE_VERSION}

ARG NODE_VERSION
ARG NPM_VERSION
ARG GO_VERSION
ARG BACKEND_PORT
ARG BACKEND_HOST

# パッケージリストの更新
RUN apk update && \
    apk add --no-cache \
    bash \
    git \
    curl \
    wget \
    ca-certificates \
    gettext \
    build-base \
    nodejs=${NODE_VERSION} \
    npm=${NPM_VERSION} \
    go=${GO_VERSION} \
    nginx

# ビルド用ユーザーとユーザーグループを作成する。
RUN addgroup -S builder && adduser -S builder -G builder

# バックエンドを実行するためのユーザーを作成する。
RUN adduser -u 1000 -D backenduser
RUN mkdir -p /app && chown -R backenduser:backenduser /app
RUN chown -R backenduser:backenduser /var/lib/nginx /var/log/nginx /app

# ビルド済のバックエンドプログラム(src/backend/bin/kids-home-base-backend)を
# 所定のディレクトリに配置する。
COPY --chown=backenduser:backenduser src/backend/bin/kids-home-base-backend /usr/local/bin/kids-home-base-backend

# ビルド済のフロントエンドプログラム(src/frontend/dist)を
# 所定のディレクトリに配置する。
COPY --chown=backenduser:backenduser src/frontend/dist /usr/share/nginx/html

# nginxの設定ファイルを配置する。
COPY --chown=backenduser:backenduser src/frontend/nginx.conf.template /etc/nginx/template/nginx.conf.template

# エントリーポイントスクリプトを配置する。
COPY docker_kids-home-base/dockerfile_runner/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /app
USER backenduser

# バックエンド実行、nginx実行
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
