@echo off
echo ========================================
echo   Setup de Base de Datos de Produccion
echo ========================================
echo.
echo Este script creara las tablas en AWS RDS
echo.
echo Credenciales:
echo Host: bfjrxdpxrza9qllq.cbetxkdyhwsb.us-east-1.rds.amazonaws.com
echo Database: ymjxfonpeqmofvg3
echo.
pause

cd backend
echo.
echo Instalando dependencias...
call npm install

echo.
echo Creando tablas en produccion...
call npm run db:setup:prod

echo.
echo ========================================
echo   Setup Completado!
echo ========================================
echo.
echo Ahora puedes ejecutar el servidor con:
echo   cd backend
echo   npm run start:prod
echo.
pause
