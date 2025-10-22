# 🎯 Resumen de Despliegue - Backend y Frontend en Heroku

## 📊 Configuración Actual

| Componente | App Heroku | URL |
|------------|-----------|-----|
| Backend | `inspecciones-app` | https://inspecciones-app.herokuapp.com |
| Frontend | `inspecciones-frontend` | https://inspecciones-frontend.herokuapp.com |

---

## ✅ Archivos Configurados

### Backend:
- ✅ `backend/Procfile` - Configuración de Heroku
- ✅ `backend/package.json` - Scripts actualizados
- ✅ `backend/.env.production` - Credenciales AWS RDS
- ✅ `backend/src/index.ts` - CORS configurado para frontend

### Frontend:
- ✅ `frontend/Procfile` - Configuración de Heroku  
- ✅ `frontend/server.js` - Servidor Express
- ✅ `frontend/static.json` - Configuración de caché
- ✅ `frontend/.env.production` - URL del backend
- ✅ `frontend/package.json` - Scripts de build

### Scripts:
- ✅ `deploy-heroku.bat` - Script automatizado de despliegue
- ✅ `HEROKU-DEPLOY.md` - Guía backend
- ✅ `HEROKU-DEPLOY-FRONTEND.md` - Guía frontend

---

## 🚀 Pasos para Desplegar (Primera Vez)

### 1. Crear las apps en Heroku (si no existen)

```powershell
# Backend (si no existe)
heroku create inspecciones-app

# Frontend (si no existe)  
heroku create inspecciones-frontend
```

### 2. Configurar Git Remotes

```powershell
# Agregar remote del backend
heroku git:remote -a inspecciones-app
git remote rename heroku heroku-backend

# Agregar remote del frontend
heroku git:remote -a inspecciones-frontend
git remote rename heroku heroku-frontend

# Verificar
git remote -v
```

### 3. Configurar Variables de Entorno

**Backend:**
```powershell
heroku config:set DB_HOST=bfjrxdpxrza9qllq.cbetxkdyhwsb.us-east-1.rds.amazonaws.com -a inspecciones-app
heroku config:set DB_USER=iup5rp5is7m2yxvn -a inspecciones-app
heroku config:set DB_PASSWORD=djyop2fhei2r1gvx -a inspecciones-app
heroku config:set DB_NAME=ymjxfonpeqmofvg3 -a inspecciones-app
heroku config:set DB_PORT=3306 -a inspecciones-app
heroku config:set NODE_ENV=production -a inspecciones-app

# Generar JWT_SECRET seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Usar el valor generado:
heroku config:set JWT_SECRET=valor_generado_aqui -a inspecciones-app
```

**Frontend:**
```powershell
heroku config:set VITE_API_URL=https://inspecciones-app.herokuapp.com -a inspecciones-frontend
heroku config:set NODE_ENV=production -a inspecciones-frontend
```

### 4. Crear Tablas en la Base de Datos

```powershell
cd backend
npm install
npm run db:setup:prod
cd ..
```

### 5. Instalar Dependencias del Frontend

```powershell
cd frontend
npm install
cd ..
```

### 6. Commit y Deploy

**Opción A: Usar el script automatizado (RECOMENDADO)**
```powershell
.\deploy-heroku.bat
```

**Opción B: Manual**
```powershell
# Commit cambios
git add .
git commit -m "Deploy backend and frontend to Heroku"

# Deploy backend
git subtree push --prefix backend heroku-backend main

# Deploy frontend
git subtree push --prefix frontend heroku-frontend main
```

---

## 🔄 Despliegues Futuros

### Desplegar Solo Backend:
```powershell
git add .
git commit -m "Update backend"
git subtree push --prefix backend heroku-backend main
```

### Desplegar Solo Frontend:
```powershell
git add .
git commit -m "Update frontend"
git subtree push --prefix frontend heroku-frontend main
```

### Desplegar Ambos:
```powershell
.\deploy-heroku.bat
# Selecciona opción 3
```

---

## 📱 Verificar Despliegue

### Backend:
```powershell
# Ver logs
heroku logs --tail -a inspecciones-app

# Verificar health
curl https://inspecciones-app.herokuapp.com/health

# Abrir en navegador
heroku open -a inspecciones-app
```

### Frontend:
```powershell
# Ver logs
heroku logs --tail -a inspecciones-frontend

# Abrir en navegador
heroku open -a inspecciones-frontend
```

---

## 🧪 Probar la Aplicación

1. **Abrir frontend**: https://inspecciones-frontend.herokuapp.com

2. **Registrar primera empresa/admin**:
   - Ir a "Registra tu empresa"
   - Llenar formulario
   - Iniciar sesión

3. **Probar funcionalidad offline**:
   - Abrir DevTools > Network > Offline
   - Navegar por la app
   - Crear inspección offline
   - Volver online
   - Sincronizar

4. **Instalar PWA**:
   - En Chrome/Edge: Ver ícono de instalación
   - Instalar app
   - Usar desde escritorio/home screen

---

## ⚠️ Solución de Problemas Comunes

### Error: "Updates were rejected"
```powershell
# Forzar push
git push heroku-backend `git subtree split --prefix backend main`:main --force
git push heroku-frontend `git subtree split --prefix frontend main`:main --force
```

### Error CORS en Frontend
Verifica que `backend/src/index.ts` tenga la URL del frontend en `allowedOrigins`:
```typescript
const allowedOrigins = [
  'https://inspecciones-frontend.herokuapp.com'
]
```

### Error 503 en Backend
```powershell
# Ver logs
heroku logs --tail -a inspecciones-app

# Verificar variables
heroku config -a inspecciones-app

# Verificar conexión a BD
heroku run npm run db:setup -a inspecciones-app
```

### Frontend muestra página en blanco
```powershell
# Ver logs
heroku logs --tail -a inspecciones-frontend

# Verificar build
cd frontend
npm run build
# Si funciona localmente, hacer commit y redeploy
```

### Build del Frontend falla
```powershell
# Limpiar caché
heroku repo:purge_cache -a inspecciones-frontend

# Verificar dependencias
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Comandos de Monitoreo

### Ver uso de recursos:
```powershell
heroku ps -a inspecciones-app
heroku ps -a inspecciones-frontend
```

### Ver configuración:
```powershell
heroku config -a inspecciones-app
heroku config -a inspecciones-frontend
```

### Ver releases:
```powershell
heroku releases -a inspecciones-app
heroku releases -a inspecciones-frontend
```

### Rollback (si algo sale mal):
```powershell
heroku rollback -a inspecciones-app
heroku rollback -a inspecciones-frontend
```

---

## 🎉 URLs Finales

- **API Backend**: https://inspecciones-app.herokuapp.com
- **App Frontend**: https://inspecciones-frontend.herokuapp.com

¡Tu aplicación completa está desplegada y lista para usar! 🚀

---

## 📝 Notas Importantes

1. **Free Dynos**: Heroku duerme los dynos después de 30 min de inactividad
2. **Base de Datos**: AWS RDS está siempre activa (no es free tier de Heroku)
3. **HTTPS**: Automático en todas las apps de Heroku
4. **Custom Domain**: Puedes agregar dominio propio en Settings
5. **Logs**: Se guardan por 7 días en el plan gratuito

---

## 🔐 Seguridad Post-Despliegue

1. ✅ Cambia el JWT_SECRET por un valor único
2. ✅ Cambia las contraseñas de usuarios de prueba
3. ✅ Configura rate limiting (opcional)
4. ✅ Habilita 2FA en tu cuenta de Heroku
5. ✅ Revisa logs regularmente
