# フロントエンド（Node.js v24.18.0）をビルドするためのDockerfile
ARG BASE_IMAGE_ALPINE_VERSION=20260805
ARG NODE_VERSION=24.17.0-r0
ARG NPM_VERSION=11.11.0-r0
FROM alpine:${BASE_IMAGE_ALPINE_VERSION}

ARG NODE_VERSION
ARG NPM_VERSION

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
    npm=${NPM_VERSION}

# ビルド用ユーザーを作成
RUN adduser -D builder
USER builder
WORKDIR /home/builder/app
