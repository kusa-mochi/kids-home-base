# バックエンドとフロントエンドのコンテナをそれぞれデバッグ用の設定で起動する。

# このカレントディレクトリをこのスクリプトのあるディレクトリに変更する。
Set-Location -Path $PSScriptRoot

docker compose -f .\compose.dev.yml --env-file .env.local up --abort-on-container-exit
