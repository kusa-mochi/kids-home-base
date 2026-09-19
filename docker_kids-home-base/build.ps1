# 運用環境（Raspberry Pi 4B, arm64）向けのバックエンドバイナリとフロントエンド静的ファイルをビルドし、
# 運用用Dockerイメージをビルドするスクリプト

# このカレントディレクトリをこのスクリプトのあるディレクトリに変更する。
Set-Location -Path $PSScriptRoot

$envFile = ".env.build"
if (-not (Test-Path $envFile)) {
    Write-Error "$envFile が見つかりません。.env.example を参考に作成してください。"
    exit 1
}

# 直前のコマンドの終了コードを確認し、失敗していればエラーを出力してスクリプトを終了する。
function Assert-Success($stepName) {
    if ($LASTEXITCODE -ne 0) {
        Write-Error "$stepName に失敗しました（終了コード: $LASTEXITCODE）。処理を中断します。"
        exit $LASTEXITCODE
    }
}

function Invoke-BuildContainer($serviceName, $stepName) {
    $containerName = "kids-home-base-$serviceName"

    # 前回ビルド時のコンテナが残っている場合は削除
    docker rm -f $containerName 2>$null

    Write-Host "=== $stepName のビルド中... ==="

    # -T: TTY無効化　これにより、ログをコンソールにそのまま出力する。
    docker compose `
        -f .\compose.build.yml `
        --env-file $envFile `
        run `
        --name $containerName `
        -T `
        $serviceName
    
    $exitCode = $LASTEXITCODE

    if ($exitCode -ne 0) {
        Write-Host ""
        Write-Host "=== $stepName のエラーログ詳細 ===" -ForegroundColor Red

        docker logs `
            --timestamps `
            $containerName
        
        Write-Error "=== $stepName のビルドに失敗しました（終了コード: $exitCode） ==="
        docker rm -f $containerName 2>$null
        exit $exitCode
    }

    docker rm -f $containerName 2>$null
}



Write-Host "=== 1. バックエンドおよびフロントエンドのビルダーイメージをビルド中... ==="
docker compose -f .\compose.build.yml --env-file $envFile build build-backend build-frontend
Assert-Success "1. ビルダーイメージのビルド"

Write-Host "=== 2. バックエンドバイナリ（ARM64）をコンパイル中... ==="
# docker compose -f .\compose.build.yml --env-file $envFile run --rm build-backend
Invoke-BuildContainer "build-backend" "2. バックエンドバイナリのコンパイル"
Assert-Success "2. バックエンドバイナリのコンパイル"

Write-Host "=== 3. フロントエンド（Next.js 静的ファイル）をビルド中... ==="
# docker compose -f .\compose.build.yml --env-file $envFile run --rm build-frontend
Invoke-BuildContainer "build-frontend" "3. フロントエンドのビルド"
Assert-Success "3. フロントエンドのビルド"

Write-Host "=== 4. 運用用Dockerイメージ（ARM64）をビルド中... ==="
docker compose -f .\compose.build.yml --env-file $envFile build --no-cache build-image
Assert-Success "4. 運用用Dockerイメージのビルド"

Write-Host "=== ビルド完了: compose.push.yml でDocker Hubへプッシュ可能です。 ==="
