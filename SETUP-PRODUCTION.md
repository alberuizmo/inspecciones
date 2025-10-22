# Guía de Configuración para Producción

## 📋 Resumen

Has configurado correctamente los archivos para producción. Aquí está lo que se creó:

### Backend
- ✅ `.env.production` - Configuración de producción con credenciales de AWS RDS
- ✅ `Procfile` - Para despliegue en Heroku
- ✅ `DEPLOY.md` - Instrucciones detalladas de despliegue
- ✅ Scripts actualizados en `package.json`
- ✅ Conexión mejorada con soporte para SSL (AWS RDS)

### Frontend
- ✅ `.env.production` - URL del backend en producción

## 🚀 Pasos Siguientes

### 1. Crear las tablas en AWS RDS

**Opción A: Desde tu computadora local**
```bash
cd backend
npm run db:setup:prod
```

**Opción B: Conectar manualmente con HeidiSQL**
- Host: `bfjrxdpxrza9qllq.cbetxkdyhwsb.us-east-1.rds.amazonaws.com`
- Usuario: `iup5rp5is7m2yxvn`
- Password: `djyop2fhei2r1gvx`
- Base de datos: `ymjxfonpeqmofvg3`
- Puerto: `3306`

Luego ejecuta el contenido de `backend/src/db/setup.ts` manualmente.

### 2. Verificar conexión local con BD de producción

```bash
cd backend
npm run start:prod
```

Deberías ver: `✅ MySQL connected successfully`

### 3. Configurar Heroku (si usas Heroku)

```bash
# Iniciar sesión
heroku login

# Crear app (si aún no existe)
heroku create tu-app-inspecciones

# Configurar variables de entorno
heroku config:set NODE_ENV=production
heroku config:set DB_HOST=bfjrxdpxrza9qllq.cbetxkdyhwsb.us-east-1.rds.amazonaws.com
heroku config:set DB_USER=iup5rp5is7m2yxvn
heroku config:set DB_PASSWORD=djyop2fhei2r1gvx
heroku config:set DB_NAME=ymjxfonpeqmofvg3
heroku config:set DB_PORT=3306
heroku config:set JWT_SECRET=cambiar_por_secreto_seguro_unico

# Deploy
git add .
git commit -m "Configure production environment"
git push heroku main
```

### 4. Actualizar URL del frontend

En `frontend/.env.production`, reemplaza:
```
VITE_API_URL=https://tu-app-inspecciones.herokuapp.com
```

### 5. Registrar primer admin en producción

Una vez el backend esté corriendo en producción:

```bash
# Ir a: https://tu-app-inspecciones.herokuapp.com/register
# O hacer POST a /auth/register con:
{
  "name": "Admin Principal",
  "email": "admin@tuempresa.com",
  "password": "password_seguro",
  "companyName": "Tu Empresa",
  "companyAddress": "Dirección",
  "companyPhone": "3001234567"
}
```

## ⚠️ Seguridad

1. **JWT_SECRET**: Genera un secreto único y seguro:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **NO subas archivos .env a git**: Ya están en `.gitignore`

3. **Passwords**: Cambia todas las contraseñas de usuarios después del primer registro

## 🧪 Testing

### Probar conexión a AWS RDS localmente:

```bash
cd backend
npm run start:prod
```

### Verificar que carga el .env correcto:
Deberías ver en consola:
```
🔧 Cargando configuración desde: .env.production
✅ MySQL connected successfully
Server listening on 4000
```

## 📦 Build Frontend

```bash
cd frontend
npm run build
```

Esto generará la carpeta `dist/` lista para desplegar en Netlify, Vercel, o servidor estático.

## ❓ Problemas Comunes

### Error: "Access denied for user"
- Verifica que las credenciales en `.env.production` sean correctas
- Confirma que AWS RDS permite conexiones desde tu IP

### Error: "connect ETIMEDOUT"
- AWS RDS puede tener restricciones de firewall
- Verifica el Security Group permite conexiones en puerto 3306

### Error: "ER_BAD_DB_ERROR: Unknown database"
- La base de datos `ymjxfonpeqmofvg3` debe existir en AWS RDS
- Heroku/JawsDB la crea automáticamente

## 📞 Siguiente Paso

Ejecuta:
```bash
npm run db:setup:prod
```

Para crear las tablas en tu base de datos de producción.
