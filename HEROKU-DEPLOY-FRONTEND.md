# 🚀 Guía de Despliegue del Frontend en Heroku

## 📋 Configuración Actual

- **Backend**: `inspecciones-app.herokuapp.com`
- **Frontend**: `inspecciones-frontend.herokuapp.com` (a crear)
- **Repositorio**: Monorepo con backend y frontend

## ✅ Archivos ya configurados:

- ✅ `frontend/Procfile` - Configuración de Heroku
- ✅ `frontend/server.js` - Servidor Express para servir la app
- ✅ `frontend/static.json` - Configuración de caché
- ✅ `frontend/.env.production` - URL del backend
- ✅ `frontend/package.json` - Scripts de build y start

---

## 🎯 Opción 1: Desplegar desde el mismo repositorio (RECOMENDADO)

Heroku permite crear múltiples apps desde el mismo repositorio usando **git subtrees**.

### Paso 1: Crear la app de frontend en Heroku

```powershell
# Crear app frontend
heroku create inspecciones-frontend

# Verificar que se creó
heroku apps
```

### Paso 2: Agregar el remote del frontend a git

```powershell
# Ya tienes el remote del backend:
# git remote heroku -> apunta a inspecciones-app

# Agregar nuevo remote para frontend
heroku git:remote -a inspecciones-frontend
git remote rename heroku heroku-frontend

# Volver a agregar el backend
heroku git:remote -a inspecciones-app
git remote rename heroku heroku-backend

# Verificar remotes
git remote -v
```

Deberías ver:
```
heroku-backend  https://git.heroku.com/inspecciones-app.git
heroku-frontend https://git.heroku.com/inspecciones-frontend.git
origin          https://github.com/alberuizmo/inspecciones.git
```

### Paso 3: Configurar variables de entorno del frontend

```powershell
# Configurar URL del backend
heroku config:set VITE_API_URL=https://inspecciones-app.herokuapp.com -a inspecciones-frontend

# Configurar modo producción
heroku config:set NODE_ENV=production -a inspecciones-frontend
```

### Paso 4: Desplegar frontend usando git subtree

```powershell
# Push solo la carpeta frontend al app frontend de Heroku
git subtree push --prefix frontend heroku-frontend main
```

Si da error por commits anteriores:
```powershell
git push heroku-frontend `git subtree split --prefix frontend main`:main --force
```

### Paso 5: Desplegar backend (si aún no lo hiciste)

```powershell
# Push solo la carpeta backend al app backend de Heroku
git subtree push --prefix backend heroku-backend main
```

---

## 🎯 Opción 2: Crear repositorios separados (alternativa)

Si prefieres tener repositorios separados:

### Para el Frontend:

```powershell
# Extraer solo la carpeta frontend a un nuevo repositorio
cd c:\Users\Elkin\Documents
git clone inspecciones inspecciones-frontend-only
cd inspecciones-frontend-only

# Filtrar solo la carpeta frontend
git filter-branch --subdirectory-filter frontend -- --all

# Mover archivos a la raíz
# (Los archivos de frontend/ ahora están en la raíz)

# Conectar con Heroku
heroku git:remote -a inspecciones-frontend

# Deploy
git push heroku main
```

---

## 📝 Comandos Útiles para Monorepo

### Desplegar Backend:
```powershell
git subtree push --prefix backend heroku-backend main
```

### Desplegar Frontend:
```powershell
git subtree push --prefix frontend heroku-frontend main
```

### Desplegar ambos:
```powershell
# Backend
git subtree push --prefix backend heroku-backend main

# Frontend
git subtree push --prefix frontend heroku-frontend main
```

### Ver logs:
```powershell
# Backend
heroku logs --tail -a inspecciones-app

# Frontend
heroku logs --tail -a inspecciones-frontend
```

### Abrir apps:
```powershell
# Backend
heroku open -a inspecciones-app

# Frontend
heroku open -a inspecciones-frontend
```

---

## 🔧 Script de Despliegue Rápido

Guarda esto como `deploy.bat` en la raíz:

```batch
@echo off
echo ========================================
echo   Desplegando Backend y Frontend
echo ========================================

echo.
echo [1/4] Verificando cambios en git...
git status

echo.
echo [2/4] Commit de cambios...
set /p commit_msg="Mensaje de commit: "
git add .
git commit -m "%commit_msg%"

echo.
echo [3/4] Desplegando Backend...
git subtree push --prefix backend heroku-backend main

echo.
echo [4/4] Desplegando Frontend...
git subtree push --prefix frontend heroku-frontend main

echo.
echo ========================================
echo   Despliegue Completado!
echo ========================================
echo.
echo URLs:
echo   Backend:  https://inspecciones-app.herokuapp.com
echo   Frontend: https://inspecciones-frontend.herokuapp.com
echo.
pause
```

---

## ⚠️ Solución de Problemas

### Error: "Updates were rejected"

```powershell
# Forzar push (cuidado, sobrescribe)
git push heroku-frontend `git subtree split --prefix frontend main`:main --force
```

### Error: "No such app"

```powershell
# Verificar apps
heroku apps

# Reconectar remote
heroku git:remote -a inspecciones-frontend
git remote rename heroku heroku-frontend
```

### Frontend no encuentra el backend (CORS)

Asegúrate de que el backend tenga CORS configurado:

En `backend/src/index.ts`:
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://inspecciones-frontend.herokuapp.com'
  ],
  credentials: true
}));
```

### Build del frontend falla

```powershell
# Limpiar caché de Heroku
heroku repo:purge_cache -a inspecciones-frontend

# Reinstalar dependencias localmente
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build

# Si funciona localmente, hacer commit y redeploy
```

---

## 🚀 Pasos Completos (Resumen)

```powershell
# 1. Crear app frontend
heroku create inspecciones-frontend

# 2. Configurar remotes
heroku git:remote -a inspecciones-frontend
git remote rename heroku heroku-frontend
heroku git:remote -a inspecciones-app
git remote rename heroku heroku-backend

# 3. Configurar variables frontend
heroku config:set VITE_API_URL=https://inspecciones-app.herokuapp.com -a inspecciones-frontend
heroku config:set NODE_ENV=production -a inspecciones-frontend

# 4. Deploy backend
git subtree push --prefix backend heroku-backend main

# 5. Deploy frontend
git subtree push --prefix frontend heroku-frontend main

# 6. Verificar
heroku open -a inspecciones-app
heroku open -a inspecciones-frontend
```

---

## 📱 PWA y Service Workers

El frontend ya tiene configuración PWA. Después del despliegue:

1. Visita `https://inspecciones-frontend.herokuapp.com`
2. En Chrome/Edge, verás el ícono de instalación
3. Haz clic en "Instalar" para instalar la PWA
4. La app funcionará offline con los datos cacheados

---

## 🔐 Configurar HTTPS (Automático)

Heroku proporciona HTTPS automáticamente para todos los apps:
- Backend: `https://inspecciones-app.herokuapp.com`
- Frontend: `https://inspecciones-frontend.herokuapp.com`

No necesitas configurar certificados SSL manualmente.

---

## 📊 Monitoreo

### Ver métricas:
```powershell
heroku logs --tail -a inspecciones-frontend
```

### Ver uso de dynos:
```powershell
heroku ps -a inspecciones-frontend
```

### Ver configuración:
```powershell
heroku config -a inspecciones-frontend
```

---

## 🎉 ¡Listo!

Tu aplicación completa estará disponible en:
- **API Backend**: https://inspecciones-app.herokuapp.com
- **App Frontend**: https://inspecciones-frontend.herokuapp.com

Los usuarios pueden instalar la PWA y usarla offline! 🚀
