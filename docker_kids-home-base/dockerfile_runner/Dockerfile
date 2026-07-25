# 運用環境でバックエンドとフロントエンドを実行するためのDockerfile。
# バックエンドとフロントエンドのビルド出力をそれぞれ所定のディレクトリに配置し、バックエンドを実行し、フロントエンドをnginxで配信する。
FROM alpine:3.23.5

# パッケージリストの更新
RUN apk update && \
    apk add --no-cache \
    bash \
    git \
    curl \
    wget \
    ca-certificates \
    build-base \
    nodejs=24.18.0 \
    npm=11.16.0 \
    go=1.26.4 \
    nginx

# ビルド済のバックエンドプログラム(src/backend/bin/kids-home-base-backend)を
# 所定のディレクトリに配置する。
COPY --chown=nginx:nginx src/backend/bin/kids-home-base-backend /usr/local/bin/kids-home-base-backend

# ビルド済のフロントエンドプログラム(src/frontend/dist)を
# 所定のディレクトリに配置する。
COPY --chown=nginx:nginx src/frontend/dist /usr/share/nginx/html

# nginxの設定ファイルを配置する。
COPY --chown=nginx:nginx src/frontend/nginx.conf /etc/nginx

# バックエンドを実行するためのユーザーを作成する。
RUN adduser -D backenduser
USER backenduser

# バックエンド実行、nginx実行
CMD /usr/local/bin/kids-home-base-backend & nginx -g 'daemon off;'
