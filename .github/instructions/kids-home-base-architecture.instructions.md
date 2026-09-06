---
name: "Kids Home Base Architecture"
description: "Use when modifying the Kids Home Base frontend, Go backend API and database, development test data, Docker Compose files, or container environment variables. Documents the current repository architecture and operational constraints."
applyTo: ["src/frontend/**", "src/backend/**", "docker_kids-home-base/**", "sample.json"]
---

# Kids Home Base の設計・開発ガイド

## プロジェクトの目的

- 小学校低学年の子どもが、家庭内で日々の予定を確認・編集するためのツールである。
- 子どもは主にタブレット、親は主にスマートフォンから利用する。
- 予定の単発登録・更新・削除、定期予定、親向けログインとパスワード変更を扱う。

## フロントエンド

- 実装は `src/frontend` の Next.js 16、React 19、TypeScript である。
- App Router の入口は `app/layout.tsx` と `app/page.tsx`。画面は `app/pages/`、再利用部品は `app/components/`、状態は `app/contexts/`、通信データ型は `app/dataStructures/` に置く。
- `layout.tsx` ではログイン状態と今日・明日・今後の予定、現在ページの Context Provider を合成している。画面間で共有する状態は既存の Context に追加し、画面固有の状態はコンポーネント内に置く。
- バックエンドへの通信は `NEXT_PUBLIC_BACKEND_URL` を基点に `fetch` で行う。API のリクエスト・レスポンス変更時は、対応する Go の構造体・handler・command とフロントエンドの型・呼び出しを同時に確認する。
- 日時は `app/timezone.ts` の変換関数を利用する。画面入力の日本時間を UTC ISO 8601/RFC3339 へ変換して送信し、UTC の応答を日本時間として表示する。変換処理を画面ごとに独自実装しない。
- `src/frontend/AGENTS.md` の Next.js 固有ルールを優先する。Next.js API を変更する前に、インストール済み Next.js のドキュメントを確認する。
- 基本コマンドは `npm run dev`、`npm run build`、`npm run lint`。依存関係は `package.json` に従う。

## バックエンド

- 実装は `src/backend` の Go モジュールで、HTTP フレームワークは Gin、永続化は SQLite (`github.com/mattn/go-sqlite3`) を用いる。
- `main.go` が設定読込、DB 初期化、Gin ルーティング、コマンド実行ループを担当する。
- API は `api_handlers/` に置く。handler は JSON のバインド・入力エラー応答・HTTP 応答を担当し、DB を直接操作しない。
- handler は `commands.ICommand` を実装する Command をチャネルへ送る。`main.go` の実行ループが `Execute(dbManager, conf)` を呼び、Command が DB 操作と応答生成を行う。
- DB に依存する SQL、トランザクション、初期テーブル・初期データは `db_manager/DBManager.go` に集約する。テーブル設計は `docs/er.puml` を確認する。
- API のデータ構造は `data_structures/`、JWT・ロガーなどの横断処理は `api_middlewares/`、現在時刻やパスワード処理は `utils/` に置く。
- DB の日時は UTC で保存する。日付境界と表示上の基準タイムゾーンは `Asia/Tokyo` である。日時を追加・更新・検索する場合は、既存の UTC 正規化とローカル日付境界の処理を維持する。
- 必須環境変数は `INITIAL_PASSWORD_HASH`、`JWT_SECRET_KEY`、`SALT`。値が未設定のときは起動に失敗するため、秘密情報をコード・コミット対象の設定ファイル・ログに記録しない。
- Go の依存関係は `go.mod` で管理する。検証の基本は `go test ./...` である。

## テスト用データと時刻固定

- 開発用の環境変数例は `docker_kids-home-base/.env.example`、ローカル実値は同ディレクトリの `.env.local` に置く。`.env.local` の秘密値は共有しない。
- `ADD_TEST_DATA=1` でバックエンドを起動すると、`main.go` の `AddTestData` が実行される。
- `AddTestData` は予定データをリセットし、`utils.Now()` を基準に Asia/Tokyo の当日・翌日・翌々日の単発予定を投入する。既存の予定を消すため、開発・検証環境だけで有効にする。
- `DEBUG_NOW` に RFC3339 の日時を設定すると、`utils.Now()` がその値を返す。日付またぎや予定取得の再現テストでは `ADD_TEST_DATA=1` と組み合わせる。
- `sample.json` は気象庁の天気予報 API 応答形式の静的サンプルである。天気予報の表示・パース変更時の確認データとして使い、本番 API 応答との差分を前提なく吸収しない。

## Docker と開発・運用フロー

- Docker 関連は `docker_kids-home-base/` に集約する。実行前にこのディレクトリで `.env.local` を用意する。
- 開発環境は `dev.up.ps1` を使用する。`compose.dev.yml` で Go と Next.js のビルダーコンテナを起動し、`src/backend` と `src/frontend` をマウントしてそれぞれ `:21226` と `:3000` を公開する。
- 開発コンテナは `ADD_TEST_DATA`、`DEBUG_NOW`、`NEXT_PUBLIC_BACKEND_URL`、`NEXT_PUBLIC_DEBUG_NOW`、`NEXT_PUBLIC_WEATHER_FORECAST_URL` を Compose 経由で受け取る。環境変数を増減するときは、Compose 定義・`.env.example`・アプリ側の参照を同期する。
- 停止は `dev.down.ps1`、再起動は `dev.restart.ps1` を使用する。スクリプトは自身の配置ディレクトリへ移動してから Compose を実行する。
- `compose.build.yml` は Raspberry Pi 4B 向けの Linux arm64 バイナリとフロントエンド成果物をビルドする。開発用 Compose の x64 ビルドと混同しない。
- `compose.pull.yml` は Docker Hub から運用イメージを取得するための定義である。運用コンテナの構成変更時は `dockerfile_runner/Dockerfile` と合わせて確認する。
- `dockerfile_go_builder/` と `dockerfile_node_builder/` はビルド用 Alpine イメージ、`dockerfile_runner/` はビルド済みバックエンドとフロントエンド成果物を実行・配信するためのイメージである。

## 変更時の確認

- API を変える場合は、handler、Command、DBManager、フロントエンドの呼び出し・型の整合性を確認する。
- 日時・予定取得を変える場合は、日本時間の日付境界、UTC 保存、`DEBUG_NOW` 使用時の挙動を確認する。
- Docker・環境変数を変える場合は、開発用起動、arm64 ビルド、秘密値の非公開を確認する。