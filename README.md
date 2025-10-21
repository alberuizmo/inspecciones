# Inspecciones Postes PWA

PWA para inspecciones de postes de alumbrado público con soporte offline.

## 🚀 Stack Tecnológico

### Frontend
- Vue 3 + TypeScript
- Quasar Framework
- Pinia (State Management)
- Dexie.js (IndexedDB)
- Service Workers (PWA)

### Backend
- Express + TypeScript
- MySQL2 (driver nativo, sin ORM)
- MySQL
- JWT Authentication

## 📋 Características

- ✅ Autenticación con JWT
- ✅ Roles: Admin, Supervisor, Técnico
- ✅ Trabajo offline con sincronización automática
- ✅ Cámara para fotos de postes
- ✅ Geolocalización obligatoria
- ✅ Firma digital del técnico
- ✅ Formularios de inspección completos

## 🛠️ Instalación y Configuración

### Requisitos Previos
- Node.js 18+ 
- MySQL 8.0+

### 1. Clonar e instalar dependencias

```powershell
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Configurar Backend y Base de Datos

```powershell
cd backend

# Copiar y editar .env
cp .env.example .env
# Edita .env con tus credenciales MySQL:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=tu_password
# DB_NAME=inspecciones_postes

# Crear base de datos y tablas automáticamente
npm run db:setup

# O usar script de PowerShell
.\install.ps1
```

Esto creará:
- Base de datos `inspecciones_postes`
- Todas las tablas necesarias
- Datos iniciales (colores y usuarios de prueba)

### 3. Ejecutar en Desarrollo

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend  
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## 👤 Usuarios de Prueba

Creados automáticamente al ejecutar `npm run db:setup`:

- **Admin**: `admin@test.com` / `admin123`
- **Supervisor**: `supervisor@test.com` / `supervisor123`
- **Técnico**: `tecnico@test.com` / `tecnico123`

## 📱 Uso de la Aplicación

### Flujo del Técnico

1. **Login** con credenciales
2. **Sincronizar tareas** cuando hay internet
3. **Descargar datos maestros** (colores, etc.)
4. **Trabajar offline** en campo:
   - Seleccionar tarea
   - Completar formulario de inspección
   - Tomar fotos del poste
   - Obtener geolocalización (automática)
   - Firmar digitalmente
5. **Sincronizar** cuando vuelve la conexión

### Roles y Permisos

**Admin:**
- Gestionar usuarios (supervisores y técnicos)
- Administrar datos de la empresa

**Supervisor:**
- CRUD de postes de energía
- Asignar tareas a técnicos

**Técnico:**
- Ejecutar inspecciones asignadas
- Completar formularios
- Trabajar offline

## 🗄️ Estructura del Proyecto

```
inspecciones-postes-pwa/
├── frontend/
│   ├── src/
│   │   ├── pages/          # Páginas Vue (LoginPage, InspeccionPage)
│   │   ├── stores/         # Pinia stores (auth)
│   │   ├── services/       # API services
│   │   ├── db/             # Dexie (IndexedDB)
│   │   └── main.ts
│   ├── public/
│   │   ├── manifest.json   # PWA manifest
│   │   └── sw.js           # Service Worker
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── connection.ts  # Pool MySQL
│   │   │   └── setup.ts       # Setup BD
│   │   ├── routes/            # Express routes
│   │   └── index.ts
│   ├── schema.sql          # SQL alternativo
│   ├── install.ps1         # Script instalación
│   └── package.json
└── shared/
    └── types.ts            # TypeScript types compartidos
```

## 🔄 Base de Datos

### Tablas creadas:

- **User** - Usuarios (admin, supervisor, técnico)
- **Color** - Colores de postes (negro, gris, blanco, amarillo)
- **Poste** - Postes de alumbrado
- **Inspeccion** - Inspecciones realizadas

### Alternativas de Setup:

**Opción 1 (Recomendada)**: Script automático
```powershell
cd backend
npm run db:setup
```

**Opción 2**: SQL manual
```powershell
mysql -u root -p < backend/schema.sql
```

**Opción 3**: Script PowerShell
```powershell
cd backend
.\install.ps1
```

## 🔄 Sincronización Offline

La aplicación utiliza:
- **IndexedDB** (Dexie) para almacenamiento local
- **Service Workers** para cache de recursos
- **Background Sync API** para sincronización automática
- Cola de operaciones pendientes con estado `syncStatus`

## 📡 API Endpoints

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

## 🚢 Despliegue en Heroku

### Backend

```powershell
cd backend

# Login a Heroku
heroku login

# Crear app
heroku create inspecciones-postes-api

# Agregar MySQL addon
heroku addons:create jawsdb:kitefin

# Configurar variables
heroku config:set JWT_SECRET=tu_secreto_produccion

# Deploy
git subtree push --prefix backend heroku main
```

### Frontend

```powershell
cd frontend

# Build
npm run build

# Deploy (puedes usar Vercel, Netlify o Heroku)
# Configurar VITE_API_URL con la URL de tu backend en Heroku
```

## 🧪 Testing

```powershell
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📄 Licencia

MIT

## 👥 Contribuidores

Proyecto desarrollado para gestión de inspecciones de postes de alumbrado público.

## 📋 Características

- ✅ Autenticación con JWT
- ✅ Roles: Admin, Supervisor, Técnico
- ✅ Trabajo offline con sincronización automática
- ✅ Cámara para fotos de postes
- ✅ Geolocalización obligatoria
- ✅ Firma digital del técnico
- ✅ Formularios de inspección completos

## 🛠️ Instalación y Configuración

### 1. Clonar e instalar dependencias

```powershell
# Instalar dependencias raíz
npm install

# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Configurar Base de Datos

```powershell
cd backend
cp .env.example .env
```

Editar `backend/.env`:
```env
DATABASE_URL=mysql://usuario:password@localhost:3306/inspecciones_postes
JWT_SECRET=tu_secreto_super_seguro
PORT=4000
```

### 3. Inicializar Prisma y Base de Datos

```powershell
cd backend
npx prisma generate
npx prisma db push
```

Para poblar datos iniciales (colores):
```sql
INSERT INTO Color (name) VALUES ('negro'), ('gris'), ('blanco'), ('amarillo');
```

### 4. Ejecutar en Desarrollo

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## 📱 Uso de la Aplicación

### Flujo del Técnico

1. **Login** con credenciales
2. **Sincronizar tareas** cuando hay internet
3. **Descargar datos maestros** (colores, etc.)
4. **Trabajar offline** en campo:
   - Seleccionar tarea
   - Completar formulario de inspección
   - Tomar fotos del poste
   - Obtener geolocalización (automática)
   - Firmar digitalmente
5. **Sincronizar** cuando vuelve la conexión

### Roles y Permisos

**Admin:**
- Gestionar usuarios (supervisores y técnicos)
- Administrar datos de la empresa

**Supervisor:**
- CRUD de postes de energía
- Asignar tareas a técnicos

**Técnico:**
- Ejecutar inspecciones asignadas
- Completar formularios
- Trabajar offline

## 🗄️ Estructura del Proyecto

```
inspecciones-postes-pwa/
├── frontend/
│   ├── src/
│   │   ├── pages/          # Páginas Vue
│   │   ├── stores/         # Pinia stores
│   │   ├── services/       # API services
│   │   ├── db/             # Dexie (IndexedDB)
│   │   └── main.ts
│   ├── public/
│   │   ├── manifest.json   # PWA manifest
│   │   └── sw.js           # Service Worker
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/         # Express routes
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma   # DB schema
│   └── package.json
└── shared/
    └── types.ts            # TypeScript types compartidos
```

## 🔄 Sincronización Offline

La aplicación utiliza:
- **IndexedDB** (Dexie) para almacenamiento local
- **Service Workers** para cache de recursos
- **Background Sync API** para sincronización automática
- Cola de operaciones pendientes con estado `syncStatus`

## 🚢 Despliegue en Heroku

### Backend

```powershell
cd backend

# Login a Heroku
heroku login

# Crear app
heroku create inspecciones-postes-api

# Agregar MySQL addon
heroku addons:create jawsdb:kitefin

# Configurar variables
heroku config:set JWT_SECRET=tu_secreto_produccion

# Deploy
git subtree push --prefix backend heroku main

# Ejecutar migraciones
heroku run npx prisma db push
```

### Frontend

```powershell
cd frontend

# Build
npm run build

# Deploy (puedes usar Vercel, Netlify o Heroku)
# Configurar VITE_API_URL con la URL de tu backend en Heroku
```

## 🧪 Testing

```powershell
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📄 Licencia

MIT

## 👥 Contribuidores

Proyecto desarrollado para gestión de inspecciones de postes de alumbrado público.
