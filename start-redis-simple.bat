@echo off
echo 🚀 Démarrage simple de Redis...

REM Arrêter Redis s'il est déjà en cours d'exécution
taskkill /f /im redis-server.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Démarrer Redis sans configuration (configuration par défaut)
echo ✅ Démarrage de Redis...
start /b redis-server

REM Attendre que Redis démarre
timeout /t 3 /nobreak >nul

REM Tester la connexion
echo 🔍 Test de connexion...
redis-cli ping >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Redis démarré avec succès!
    echo 📊 Test de connexion: OK
) else (
    echo ❌ Redis n'a pas pu démarrer
    echo 💡 Vérifiez que Redis est installé et dans le PATH
)

echo.
echo 🔍 Commandes utiles:
echo    redis-cli ping
echo    redis-cli info
echo    redis-cli shutdown
echo.
pause
