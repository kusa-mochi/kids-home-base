# バックエンドとフロントエンドのコンテナをそれぞれデバッグ用の設定で再起動する。

# このカレントディレクトリをこのスクリプトのあるディレクトリに変更する。
Set-Location -Path $PSScriptRoot

.\dev.down.ps1
.\dev.up.ps1
