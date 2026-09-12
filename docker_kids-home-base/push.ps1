# このカレントディレクトリをこのスクリプトのあるディレクトリに変更する。
Set-Location -Path $PSScriptRoot

$envFile = ".env.build"
if (-not (Test-Path $envFile)) {
    Write-Error "$envFile が見つかりません。.env.example を参考に作成してください。"
    exit 1
}

Write-Host "=== Docker Hubへイメージをプッシュ中... ==="
docker compose -f .\compose.build.yml --env-file $envFile push build-image

Write-Host "=== Docker Hubへのプッシュ完了 ==="
