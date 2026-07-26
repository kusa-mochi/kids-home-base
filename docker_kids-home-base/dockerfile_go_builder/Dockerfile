# バックエンド（Go 1.25.10）をビルドするためのDockerfile
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
    go=1.25.10-r0

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
