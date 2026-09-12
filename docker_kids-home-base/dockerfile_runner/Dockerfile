# 運用環境でバックエンドとフロントエンドを実行するためのDockerfile。
# バックエンドとフロントエンドのビルド出力をそれぞれ所定のディレクトリに配置し、バックエンドを実行し、フロントエンドをnginxで配信する。
ARG BASE_IMAGE_ALPINE_VERSION=20260805
ARG NODE_VERSION=24.17.0-r0
ARG NPM_VERSION=11.11.0-r0
ARG GO_VERSION=1.25.10-r0
FROM alpine:${BASE_IMAGE_ALPINE_VERSION}

ARG NODE_VERSION
ARG NPM_VERSION
ARG GO_VERSION

# パッケージリストの更新
RUN apk update && \
    apk add --no-cache \
    bash \
    git \
    curl \
    wget \
    ca-certificates \
    build-base \
    nodejs=${NODE_VERSION} \
    npm=${NPM_VERSION} \
    go=${GO_VERSION} \
    nginx

# ビルド用ユーザーとユーザーグループを作成する。
RUN addgroup -S builder && adduser -S builder -G builder

# ビルド済のバックエンドプログラム(src/backend/bin/kids-home-base-backend)を
# 所定のディレクトリに配置する。
COPY --chown=nginx:nginx src/backend/bin/kids-home-base-backend /usr/local/bin/kids-home-base-backend

# ビルド済のフロントエンドプログラム(src/frontend/dist)を
# 所定のディレクトリに配置する。
COPY --chown=nginx:nginx src/frontend/dist /usr/share/nginx/html

# nginxの設定ファイルを配置する。
COPY --chown=nginx:nginx src/frontend/nginx.conf /etc/nginx

# エントリーポイントスクリプトを配置する。
COPY docker_kids-home-base/dockerfile_runner/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# バックエンドを実行するためのユーザーを作成する。
RUN adduser -D backenduser
RUN chown -R backenduser:backenduser /var/lib/nginx /var/log/nginx
USER backenduser

# バックエンド実行、nginx実行
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
