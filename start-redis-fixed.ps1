# Script PowerShell amélioré pour démarrer Redis
Write-Host "🚀 Démarrage de Redis avec configuration optimisée..." -ForegroundColor Green

# Vérifier si Redis est installé
try {
    $redisPath = Get-Command redis-server -ErrorAction Stop
    Write-Host "✅ Redis trouvé: $($redisPath.Source)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Redis n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "📥 Installez Redis depuis: https://github.com/microsoftarchive/redis/releases" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour continuer"
    exit 1
}

# Vérifier si Redis est déjà en cours d'exécution
try {
    $redisProcesses = Get-Process redis-server -ErrorAction SilentlyContinue
    if ($redisProcesses) {
        Write-Host "⚠️ Redis est déjà en cours d'exécution. Arrêt des processus existants..." -ForegroundColor Yellow
        Stop-Process -Name redis-server -Force
        Start-Sleep -Seconds 2
    }
}
catch {
    Write-Host "ℹ️ Aucun processus Redis en cours d'exécution" -ForegroundColor Cyan
}

# Vérifier si le fichier de configuration existe
if (Test-Path "redis.conf") {
    Write-Host "✅ Utilisation de redis.conf" -ForegroundColor Green
    
    # Démarrer Redis avec la configuration personnalisée
    Start-Process redis-server -ArgumentList "redis.conf" -NoNewWindow -PassThru | Out-Null
    
    # Attendre que Redis démarre
    Start-Sleep -Seconds 3
    
    # Tester la connexion
    try {
        $testResult = & redis-cli ping 2>$null
        if ($testResult -eq "PONG") {
            Write-Host "✅ Redis démarré avec succès avec la configuration personnalisée" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️ Redis a démarré mais la connexion n'est pas stable" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "⚠️ Impossible de tester la connexion Redis" -ForegroundColor Yellow
    }
}
else {
    Write-Host "⚠️ Fichier redis.conf non trouvé, démarrage avec la configuration par défaut" -ForegroundColor Yellow
    
    # Démarrer Redis avec la configuration par défaut
    Start-Process redis-server -NoNewWindow -PassThru | Out-Null
    
    # Attendre que Redis démarre
    Start-Sleep -Seconds 3
    
    # Tester la connexion
    try {
        $testResult = & redis-cli ping 2>$null
        if ($testResult -eq "PONG") {
            Write-Host "✅ Redis démarré avec succès avec la configuration par défaut" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️ Redis a démarré mais la connexion n'est pas stable" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "⚠️ Impossible de tester la connexion Redis" -ForegroundColor Yellow
    }
}

Write-Host "🔍 Vérifiez le statut avec: redis-cli ping" -ForegroundColor Cyan
Write-Host "📊 Informations système: redis-cli info" -ForegroundColor Cyan
Write-Host "🔧 Configuration actuelle: redis-cli config get stop-writes-on-bgsave-error" -ForegroundColor Cyan
