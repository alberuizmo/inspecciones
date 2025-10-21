# Backend - Inspecciones Postes (sin Prisma)

API REST para el sistema de inspecciones de postes con MySQL directo.

## 📦 Instalación Rápida

```powershell
# Ejecutar script de instalación
.\install.ps1
```

O manualmente:

```powershell
# 1. Instalar dependencias
npm install

# 2. Configurar .env
cp .env.example .env
# Edita .env con tus credenciales MySQL

# 3. Crear base de datos
npm run db:setup

# 4. Iniciar servidor
npm run dev
```

## 🗄️ Base de Datos

### Opción 1: Script automático (Recomendado)
```powershell
npm run db:setup
```

### Opción 2: SQL manual
```powershell
mysql -u root -p < schema.sql
```

## 🔧 Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=inspecciones_postes

JWT_SECRET=tu_secreto_super_seguro
PORT=4000
```

## 🚀 Scripts Disponibles

```powershell
npm run dev        # Modo desarrollo con hot-reload
npm run build      # Compilar TypeScript
npm run start      # Iniciar servidor en producción
npm run db:setup   # Crear y poblar base de datos
```

## 📡 Endpoints API

### Autenticación
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Login (devuelve JWT)

### Colores
- `GET /colores` - Listar colores
- `POST /colores` - Crear color

### Inspecciones
- `POST /inspecciones` - Crear inspección
- `GET /inspecciones/tecnico/:id` - Inspecciones por técnico
- `GET /inspecciones/:id` - Obtener inspección
- `PUT /inspecciones/:id` - Actualizar inspección
- `POST /inspecciones/sync` - Sincronizar inspecciones offline

## 👤 Usuarios de Prueba

Creados automáticamente por `db:setup`:

- **Admin**: admin@test.com / admin123
- **Supervisor**: supervisor@test.com / supervisor123
- **Técnico**: tecnico@test.com / tecnico123

## 🏗️ Estructura

```
backend/
├── src/
│   ├── db/
│   │   ├── connection.ts   # Pool de conexiones MySQL
│   │   └── setup.ts        # Script de setup de BD
│   ├── routes/
│   │   ├── auth.ts         # Rutas de autenticación
│   │   ├── colores.ts      # Rutas de colores
│   │   └── inspecciones.ts # Rutas de inspecciones
│   └── index.ts            # Servidor Express
├── .env                    # Variables de entorno
├── schema.sql              # Script SQL alternativo
└── package.json
```

## 🔐 Autenticación

Usa JWT tokens. Incluye el token en el header:

```
Authorization: Bearer <token>
```

## 📊 Base de Datos

Tablas creadas:
- `User` - Usuarios del sistema
- `Color` - Colores de postes
- `Poste` - Postes de alumbrado
- `Inspeccion` - Inspecciones realizadas
