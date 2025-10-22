@echo off
echo ========================================
echo   Deploy Backend y Frontend a Heroku
echo ========================================
echo.

REM Verificar si git está configurado
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git no esta inicializado
    echo Ejecuta: git init
    pause
    exit /b 1
)

REM Verificar remotes
echo Verificando remotes de Heroku...
git remote -v | findstr "heroku-backend" >nul
if %errorlevel% neq 0 (
    echo.
    echo [ADVERTENCIA] Remote 'heroku-backend' no encontrado
    echo Configurando remotes...
    heroku git:remote -a inspecciones-app
    git remote rename heroku heroku-backend
    echo [OK] Remote backend configurado
)

git remote -v | findstr "heroku-frontend" >nul
if %errorlevel% neq 0 (
    echo.
    echo [ADVERTENCIA] Remote 'heroku-frontend' no encontrado
    echo Configurando remotes...
    heroku git:remote -a inspecciones-frontend
    git remote rename heroku heroku-frontend
    echo [OK] Remote frontend configurado
)

echo.
echo Remotes configurados:
git remote -v

echo.
echo ========================================
echo   ¿Que deseas desplegar?
echo ========================================
echo   1. Backend solamente
echo   2. Frontend solamente
echo   3. Ambos (Backend + Frontend)
echo   4. Salir
echo.
set /p choice="Selecciona una opcion (1-4): "

if "%choice%"=="1" goto deploy_backend
if "%choice%"=="2" goto deploy_frontend
if "%choice%"=="3" goto deploy_both
if "%choice%"=="4" goto end

echo Opcion invalida
goto end

:deploy_backend
echo.
echo ========================================
echo   Desplegando Backend
echo ========================================
echo.
set /p commit_msg="Mensaje de commit (o Enter para usar 'Deploy backend'): "
if "%commit_msg%"=="" set commit_msg=Deploy backend

echo.
echo [1/3] Agregando cambios a git...
git add .

echo [2/3] Haciendo commit...
git commit -m "%commit_msg%"

echo [3/3] Desplegando a Heroku (inspecciones-app)...
git subtree push --prefix backend heroku-backend main

if %errorlevel% equ 0 (
    echo.
    echo [OK] Backend desplegado exitosamente!
    echo URL: https://inspecciones-app.herokuapp.com
) else (
    echo.
    echo [ERROR] Fallo el despliegue del backend
    echo Intenta: git push heroku-backend `git subtree split --prefix backend main`:main --force
)
goto show_logs

:deploy_frontend
echo.
echo ========================================
echo   Desplegando Frontend
echo ========================================
echo.
set /p commit_msg="Mensaje de commit (o Enter para usar 'Deploy frontend'): "
if "%commit_msg%"=="" set commit_msg=Deploy frontend

echo.
echo [1/3] Agregando cambios a git...
git add .

echo [2/3] Haciendo commit...
git commit -m "%commit_msg%"

echo [3/3] Desplegando a Heroku (inspecciones-frontend)...
git subtree push --prefix frontend heroku-frontend main

if %errorlevel% equ 0 (
    echo.
    echo [OK] Frontend desplegado exitosamente!
    echo URL: https://inspecciones-frontend.herokuapp.com
) else (
    echo.
    echo [ERROR] Fallo el despliegue del frontend
    echo Intenta: git push heroku-frontend `git subtree split --prefix frontend main`:main --force
)
goto show_logs

:deploy_both
echo.
echo ========================================
echo   Desplegando Backend + Frontend
echo ========================================
echo.
set /p commit_msg="Mensaje de commit (o Enter para usar 'Deploy all'): "
if "%commit_msg%"=="" set commit_msg=Deploy backend and frontend

echo.
echo [1/5] Agregando cambios a git...
git add .

echo [2/5] Haciendo commit...
git commit -m "%commit_msg%"

echo [3/5] Desplegando Backend...
git subtree push --prefix backend heroku-backend main

echo [4/5] Desplegando Frontend...
git subtree push --prefix frontend heroku-frontend main

echo [5/5] Verificando despliegue...
echo.
echo [OK] Despliegue completado!
echo.
echo URLs:
echo   Backend:  https://inspecciones-app.herokuapp.com
echo   Frontend: https://inspecciones-frontend.herokuapp.com
goto show_logs

:show_logs
echo.
echo ========================================
echo   ¿Deseas ver los logs?
echo ========================================
echo   1. Logs del Backend
echo   2. Logs del Frontend
echo   3. Abrir Backend en navegador
echo   4. Abrir Frontend en navegador
echo   5. Salir
echo.
set /p log_choice="Selecciona una opcion (1-5): "

if "%log_choice%"=="1" (
    heroku logs --tail -a inspecciones-app
)
if "%log_choice%"=="2" (
    heroku logs --tail -a inspecciones-frontend
)
if "%log_choice%"=="3" (
    heroku open -a inspecciones-app
)
if "%log_choice%"=="4" (
    heroku open -a inspecciones-frontend
)

:end
echo.
echo Presiona cualquier tecla para salir...
pause >nul
