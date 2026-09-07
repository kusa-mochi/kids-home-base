# バックエンド（Go）をビルドするためのDockerfile
ARG BASE_IMAGE_ALPINE_VERSION=20260805
ARG GO_VERSION=1.25.10-r0
FROM alpine:${BASE_IMAGE_ALPINE_VERSION}

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
    go=${GO_VERSION}

# Goの環境変数を設定
ENV GOPATH=/home/builder/go
ENV GOBIN=$GOPATH/bin
ENV GOMODCACHE=/home/builder/go/pkg/mod
ENV GOCACHE=/home/builder/.cache/go-build

# GoのバイナリをPATHに追加
ENV PATH=$GOPATH/bin:$PATH

# ビルド用ユーザーを作成
RUN adduser -D builder
USER builder
WORKDIR /home/builder/app
