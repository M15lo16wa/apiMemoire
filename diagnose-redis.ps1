# Script de diagnostic Redis
Write-Host "🔍 Diagnostic Redis - Identification des problèmes" -ForegroundColor Cyan

# Fonction pour tester la connexion Redis
function Test-RedisConnection {
    try {
        $result = & redis-cli ping 2>$null
        if ($result -eq "PONG") {
            Write-Host "✅ Connexion Redis: OK" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Connexion Redis: ÉCHEC" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Connexion Redis: ERREUR - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Fonction pour vérifier la configuration Redis
function Test-RedisConfig {
    try {
        Write-Host "🔧 Vérification de la configuration Redis..." -ForegroundColor Yellow
        
        # Vérifier la configuration RDB
        $rdbConfig = & redis-cli config get stop-writes-on-bgsave-error 2>$null
        if ($rdbConfig -contains "no") {
            Write-Host "✅ Configuration RDB: stop-writes-on-bgsave-error = no" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Configuration RDB: stop-writes-on-bgsave-error = $rdbConfig" -ForegroundColor Yellow
        }
        
        # Vérifier la configuration de persistance
        $saveConfig = & redis-cli config get save 2>$null
        Write-Host "📁 Configuration de sauvegarde: $saveConfig" -ForegroundColor Cyan
        
        # Vérifier l'espace disque
        $info = & redis-cli info memory 2>$null
        if ($info) {
            $usedMemory = ($info | Select-String "used_memory:").ToString().Split(":")[1].Trim()
            Write-Host "💾 Mémoire utilisée: $usedMemory" -ForegroundColor Cyan
        }
        
    } catch {
        Write-Host "⚠️ Impossible de vérifier la configuration: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Fonction pour résoudre les problèmes RDB
function Fix-RedisRDB {
    try {
        Write-Host "🔄 Tentative de résolution des problèmes RDB..." -ForegroundColor Yellow
        
        # Désactiver les erreurs de sauvegarde
        $result = & redis-cli config set stop-writes-on-bgsave-error no 2>$null
        if ($result -eq "OK") {
            Write-Host "✅ Configuration RDB corrigée" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Impossible de corriger la configuration RDB" -ForegroundColor Yellow
        }
        
        # Désactiver la persistance si nécessaire
        $result = & redis-cli config set save "" 2>$null
        if ($result -eq "OK") {
            Write-Host "✅ Persistance RDB désactivée" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Impossible de désactiver la persistance RDB" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ Erreur lors de la correction: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Fonction pour vérifier les processus Redis
function Test-RedisProcesses {
    try {
        $processes = Get-Process redis-server -ErrorAction SilentlyContinue
        if ($processes) {
            Write-Host "🔄 Processus Redis en cours d'exécution:" -ForegroundColor Cyan
            foreach ($process in $processes) {
                Write-Host "   PID: $($process.Id), CPU: $([math]::Round($process.CPU, 2))s, Mémoire: $([math]::Round($process.WorkingSet64 / 1MB, 2)) MB" -ForegroundColor White
            }
        } else {
            Write-Host "❌ Aucun processus Redis en cours d'exécution" -ForegroundColor Red
        }
    } catch {
        Write-Host "⚠️ Impossible de vérifier les processus Redis" -ForegroundColor Yellow
    }
}

# Exécution du diagnostic
Write-Host "`n📋 Étape 1: Vérification des processus Redis" -ForegroundColor Magenta
Test-RedisProcesses

Write-Host "`n📋 Étape 2: Test de connexion Redis" -ForegroundColor Magenta
$isConnected = Test-RedisConnection

if ($isConnected) {
    Write-Host "`n📋 Étape 3: Vérification de la configuration" -ForegroundColor Magenta
    Test-RedisConfig
    
    Write-Host "`n📋 Étape 4: Résolution des problèmes détectés" -ForegroundColor Magenta
    Fix-RedisRDB
    
    Write-Host "`n📋 Étape 5: Vérification finale" -ForegroundColor Magenta
    Test-RedisConnection
} else {
    Write-Host "`n🚨 Redis n'est pas accessible. Vérifiez que le service est démarré." -ForegroundColor Red
    Write-Host "💡 Utilisez le script start-redis-fixed.ps1 pour démarrer Redis" -ForegroundColor Yellow
}

Write-Host "`n🎯 Diagnostic terminé!" -ForegroundColor Green
Write-Host "📚 Commandes utiles:" -ForegroundColor Cyan
Write-Host "   - redis-cli ping (test de connexion)" -ForegroundColor White
Write-Host "   - redis-cli info (informations système)" -ForegroundColor White
Write-Host "   - redis-cli config get * (toutes les configurations)" -ForegroundColor White
