# フロントエンド（Node.js v24.18.0）をビルドするためのDockerfile
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
    nodejs=24.17.0-r0 \
    npm=11.11.0-r0

# ビルド用ユーザーを作成
RUN adduser -D builder
USER builder
WORKDIR /home/builder/app
