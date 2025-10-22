@echo off
echo ========================================
echo   Verificacion Pre-Deploy para Heroku
echo ========================================
echo.

echo Checklist:
echo.
echo [1/6] Verificando estructura de archivos...
if exist "Procfile" (
    echo   [OK] Procfile encontrado
) else (
    echo   [ERROR] Procfile no encontrado
    goto :error
)

if exist "backend\package.json" (
    echo   [OK] backend\package.json encontrado
) else (
    echo   [ERROR] backend\package.json no encontrado
    goto :error
)

if exist "backend\.env.production" (
    echo   [OK] backend\.env.production encontrado
) else (
    echo   [ADVERTENCIA] backend\.env.production no encontrado
    echo   Debes configurar variables en Heroku
)

echo.
echo [2/6] Verificando dependencias backend...
cd backend
call npm list express >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] Dependencias instaladas
) else (
    echo   [ADVERTENCIA] Ejecuta: cd backend ^&^& npm install
)
cd ..

echo.
echo [3/6] Verificando build de TypeScript...
cd backend
if exist "tsconfig.json" (
    echo   [OK] tsconfig.json encontrado
) else (
    echo   [ERROR] tsconfig.json no encontrado
    goto :error
)
cd ..

echo.
echo [4/6] Verificando Git...
git status >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] Git inicializado
) else (
    echo   [ADVERTENCIA] Git no inicializado. Ejecuta: git init
)

echo.
echo [5/6] Verificando Heroku CLI...
heroku --version >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] Heroku CLI instalado
    heroku auth:whoami 2>nul
    if %errorlevel% equ 0 (
        echo   [OK] Sesion de Heroku activa
    ) else (
        echo   [ADVERTENCIA] No has hecho login en Heroku. Ejecuta: heroku login
    )
) else (
    echo   [ERROR] Heroku CLI no instalado
    echo   Descarga desde: https://devcenter.heroku.com/articles/heroku-cli
    goto :error
)

echo.
echo [6/6] Verificando conexion a base de datos...
cd backend
call npm run db:setup:prod >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] Conexion a AWS RDS exitosa
) else (
    echo   [ADVERTENCIA] No se pudo conectar a la BD. Verifica credenciales.
)
cd ..

echo.
echo ========================================
echo   Verificacion Completa!
echo ========================================
echo.
echo Proximos pasos:
echo   1. heroku login
echo   2. heroku create mi-app-inspecciones
echo   3. Configura variables: heroku config:set DB_HOST=...
echo   4. git add .
echo   5. git commit -m "Deploy to Heroku"
echo   6. git push heroku main
echo.
pause
exit /b 0

:error
echo.
echo ========================================
echo   Verificacion Fallida
echo ========================================
echo.
echo Revisa los errores arriba y corrigelos antes de continuar.
echo.
pause
exit /b 1
