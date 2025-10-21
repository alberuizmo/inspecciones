# Script para crear la base de datos con Prisma
# Ejecutar desde la carpeta backend

Write-Host "=== Creando Base de Datos con Prisma ===" -ForegroundColor Green

# 1. Verificar que existe .env
if (!(Test-Path .env)) {
    Write-Host "Copiando .env.example a .env..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "IMPORTANTE: Edita el archivo .env con tus credenciales MySQL" -ForegroundColor Red
    Read-Host "Presiona Enter cuando hayas configurado .env"
}

# 2. Generar Prisma Client
Write-Host "`n1. Generando Prisma Client..." -ForegroundColor Cyan
npm install
npx prisma generate

# 3. Crear la base de datos y tablas
Write-Host "`n2. Creando base de datos y tablas..." -ForegroundColor Cyan
npx prisma db push

# 4. Poblar datos iniciales (colores)
Write-Host "`n3. Poblando datos iniciales (colores)..." -ForegroundColor Cyan
npx prisma db seed

Write-Host "`n=== Base de datos creada exitosamente! ===" -ForegroundColor Green
Write-Host "Puedes ejecutar 'npm run dev' para iniciar el servidor" -ForegroundColor Yellow
