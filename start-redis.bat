@echo off
echo 🚀 Démarrage de Redis avec configuration personnalisée...

REM Vérifier si Redis est installé
where redis-server >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Redis n'est pas installé ou n'est pas dans le PATH
    echo 📥 Installez Redis depuis: https://github.com/microsoftarchive/redis/releases
    pause
    exit /b 1
)

REM Démarrer Redis avec la configuration personnalisée
echo ✅ Démarrage de Redis...
redis-server redis.conf

pause
