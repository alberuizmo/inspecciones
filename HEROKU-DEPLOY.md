# 🚀 Guía de Despliegue en Heroku (Monorepo)

## Tu estructura actual (Monorepo):
```
inspecciones/
├── backend/       ← Backend (Express + TypeScript)
├── frontend/      ← Frontend (Vue + Quasar)
├── Procfile       ← Archivo para Heroku
└── package.json   ← Raíz del proyecto
```

## ✅ Archivos ya configurados:
- ✅ `Procfile` en la raíz
- ✅ `backend/package.json` con scripts de build
- ✅ `backend/.env.production` con credenciales de AWS RDS

---

## 📋 Pasos para desplegar en Heroku

### 1️⃣ Instalar Heroku CLI (si no lo tienes)

Descarga desde: https://devcenter.heroku.com/articles/heroku-cli

O con Chocolatey:
```powershell
choco install heroku-cli
```

### 2️⃣ Login en Heroku

```powershell
heroku login
```

### 3️⃣ Crear aplicación en Heroku (si no existe)

```powershell
# Desde la raíz del proyecto
cd c:\Users\Elkin\Documents\inspecciones

# Crear app (Heroku asigna nombre único si no especificas)
heroku create mi-app-inspecciones
```

O especifica un nombre:
```powershell
heroku create nombre-unico-para-tu-app
```

### 4️⃣ Configurar variables de entorno en Heroku

**IMPORTANTE**: Heroku NO lee archivos `.env`, debes configurar las variables manualmente:

```powershell
# Configurar todas las variables de la BD
heroku config:set DB_HOST=bfjrxdpxrza9qllq.cbetxkdyhwsb.us-east-1.rds.amazonaws.com
heroku config:set DB_USER=iup5rp5is7m2yxvn
heroku config:set DB_PASSWORD=djyop2fhei2r1gvx
heroku config:set DB_NAME=ymjxfonpeqmofvg3
heroku config:set DB_PORT=3306

# JWT Secret (CAMBIA ESTO por un valor único y seguro)
heroku config:set JWT_SECRET=tu_secreto_jwt_super_seguro_cambiar_esto_123

# Entorno de producción
heroku config:set NODE_ENV=production
```

### 5️⃣ Verificar configuración

```powershell
heroku config
```

Deberías ver todas las variables configuradas.

### 6️⃣ Crear las tablas en la base de datos

**Opción A: Desde tu computadora** (más fácil)
```powershell
cd backend
npm run db:setup:prod
```

**Opción B: Desde Heroku** (después del deploy)
```powershell
heroku run npm run db:setup --app tu-app-inspecciones
```

### 7️⃣ Desplegar a Heroku

```powershell
# Asegúrate de estar en la raíz del proyecto
cd c:\Users\Elkin\Documents\inspecciones

# Inicializar git si no lo has hecho
git init
git add .
git commit -m "Initial commit - Backend ready for Heroku"

# Conectar con Heroku (si usaste heroku create, esto ya está hecho)
heroku git:remote -a tu-app-inspecciones

# Push a Heroku
git push heroku main
```

Si tu rama principal se llama `master`:
```powershell
git push heroku master
```

---

## 🔍 Verificar despliegue

### Ver logs en tiempo real:
```powershell
heroku logs --tail
```

Deberías ver:
```
✅ MySQL connected successfully
Server listening on <PORT>
```

### Abrir la aplicación:
```powershell
heroku open
```

### Verificar que funciona:
```
https://tu-app-inspecciones.herokuapp.com/health
```

Debería responder:
```json
{
  "status": "healthy",
  "database": "connected",
  "service": "inspecciones-postes-api"
}
```

---

## ⚠️ Solución de Problemas

### Error: "Application error"
```powershell
heroku logs --tail
```
Revisa los logs para ver el error específico.

### Error: "Couldn't find that app"
```powershell
heroku apps
heroku git:remote -a nombre-correcto-de-tu-app
```

### Error: "Permission denied"
```powershell
heroku login
git push heroku main --force
```

### Error de base de datos
Verifica que las variables de entorno estén correctas:
```powershell
heroku config
```

### Reinstalar dependencias
```powershell
heroku repo:purge_cache -a tu-app-inspecciones
git commit --allow-empty -m "Rebuild"
git push heroku main
```

---

## 🎯 Después del despliegue

### 1. Actualizar URL en el Frontend

Edita `frontend/.env.production`:
```
VITE_API_URL=https://tu-app-inspecciones.herokuapp.com
```

### 2. Registrar primer usuario Admin

Hacer POST a:
```
https://tu-app-inspecciones.herokuapp.com/auth/register
```

Body:
```json
{
  "name": "Admin Principal",
  "email": "admin@tuempresa.com",
  "password": "password_seguro",
  "companyName": "Tu Empresa",
  "companyAddress": "Dirección de la empresa",
  "companyPhone": "3001234567"
}
```

### 3. Desplegar Frontend

El frontend se puede desplegar en:
- **Netlify** (recomendado para Vue/Quasar)
- **Vercel**
- **GitHub Pages**
- **Firebase Hosting**

---

## 📝 Comandos útiles

```powershell
# Ver apps
heroku apps

# Ver logs
heroku logs --tail

# Ejecutar comandos en Heroku
heroku run node --version
heroku run npm run db:setup

# Abrir dashboard web
heroku dashboard

# Abrir app en navegador
heroku open

# Reiniciar app
heroku restart

# Ver variables de entorno
heroku config

# Cambiar una variable
heroku config:set VARIABLE=valor

# Eliminar una variable
heroku config:unset VARIABLE
```

---

## 🔒 Seguridad

1. **NUNCA** subas archivos `.env` a git (ya está en `.gitignore`)
2. **Genera un JWT_SECRET seguro**:
   ```powershell
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Luego configúralo:
   ```powershell
   heroku config:set JWT_SECRET=el_valor_generado
   ```

3. **Habilita SSL** (Heroku lo hace automáticamente)

---

## 📞 Siguiente paso

Ejecuta estos comandos en orden:

```powershell
# 1. Login
heroku login

# 2. Crear app
heroku create mi-app-inspecciones

# 3. Configurar variables (todas las de arriba)
heroku config:set DB_HOST=bfjrxdpxrza9qllq.cbetxkdyhwsb.us-east-1.rds.amazonaws.com
# ... etc

# 4. Crear tablas (desde tu PC)
cd backend
npm run db:setup:prod
cd ..

# 5. Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

¡Listo! 🎉
