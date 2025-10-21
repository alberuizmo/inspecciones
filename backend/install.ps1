# ================================================
# Script de Instalación y Configuración Completa
# Backend sin Prisma - MySQL directo
# ================================================

Write-Host "`n=== Instalación Backend (sin Prisma) ===" -ForegroundColor Green

# 1. Copiar .env si no existe
if (!(Test-Path .env)) {
    Write-Host "`n1. Creando archivo .env..." -ForegroundColor Cyan
    Copy-Item .env.example .env
    Write-Host "   ✅ Archivo .env creado" -ForegroundColor Green
    Write-Host "`n   ⚠️  IMPORTANTE: Edita el archivo .env con tus credenciales MySQL" -ForegroundColor Yellow
    Write-Host "   Configura: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME" -ForegroundColor Yellow
    
    $continue = Read-Host "`n   ¿Ya configuraste .env? (s/n)"
    if ($continue -ne 's') {
        Write-Host "   Por favor configura .env y vuelve a ejecutar este script" -ForegroundColor Red
        exit
    }
} else {
    Write-Host "`n1. Archivo .env ya existe" -ForegroundColor Cyan
}

# 2. Instalar dependencias
Write-Host "`n2. Instalando dependencias..." -ForegroundColor Cyan
npm install
Write-Host "   ✅ Dependencias instaladas" -ForegroundColor Green

# 3. Ejecutar setup de base de datos
Write-Host "`n3. Creando base de datos y tablas..." -ForegroundColor Cyan
npm run db:setup

Write-Host "`n=== ¡Instalación completada! ===" -ForegroundColor Green
Write-Host "`nPara iniciar el servidor:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host "`nUsuarios de prueba creados:" -ForegroundColor Yellow
Write-Host "   - admin@test.com / admin123" -ForegroundColor Cyan
Write-Host "   - supervisor@test.com / supervisor123" -ForegroundColor Cyan
Write-Host "   - tecnico@test.com / tecnico123" -ForegroundColor Cyan
