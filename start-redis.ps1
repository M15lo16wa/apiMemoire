# Script PowerShell pour démarrer Redis
Write-Host "🚀 Démarrage de Redis avec configuration personnalisée..." -ForegroundColor Green

# Vérifier si Redis est installé
try {
    $redisPath = Get-Command redis-server -ErrorAction Stop
    Write-Host "✅ Redis trouvé: $($redisPath.Source)" -ForegroundColor Green
} catch {
    Write-Host "❌ Redis n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "📥 Installez Redis depuis: https://github.com/microsoftarchive/redis/releases" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour continuer"
    exit 1
}

# Vérifier si le fichier de configuration existe
if (-not (Test-Path "redis.conf")) {
    Write-Host "⚠️ Fichier redis.conf non trouvé, utilisation de la configuration par défaut" -ForegroundColor Yellow
    Start-Process redis-server -NoNewWindow
} else {
    Write-Host "✅ Utilisation de redis.conf" -ForegroundColor Green
    Start-Process redis-server -ArgumentList "redis.conf" -NoNewWindow
}

Write-Host "✅ Redis démarré en arrière-plan" -ForegroundColor Green
Write-Host "🔍 Vérifiez le statut avec: redis-cli ping" -ForegroundColor Cyan
