# Instalación de Heroku CLI

## ⚠️ Error: Heroku CLI no encontrado

El error que ves es porque Heroku CLI no está instalado en tu sistema.

## ✅ Solución: Instalar Heroku CLI

### Opción 1: Instalador de Windows (RECOMENDADO)

1. **Descarga el instalador desde**:
   https://cli-assets.heroku.com/heroku-x64.exe

2. **Ejecuta el instalador** (heroku-x64.exe)

3. **Sigue el asistente de instalación**

4. **Reinicia PowerShell** después de la instalación

5. **Verifica la instalación**:
   ```powershell
   heroku --version
   ```

### Opción 2: Con Chocolatey (requiere PowerShell como Admin)

```powershell
# Abre PowerShell como Administrador
# Haz clic derecho en PowerShell > "Ejecutar como Administrador"

choco install heroku-cli -y
```

Luego reinicia PowerShell.

### Opción 3: Con npm (si tienes Node.js)

```powershell
npm install -g heroku
```

---

## 📋 Después de Instalar

1. **Verifica la instalación**:
   ```powershell
   heroku --version
   ```

2. **Haz login**:
   ```powershell
   heroku login
   ```
   Esto abrirá el navegador para que inicies sesión.

3. **Continúa con el despliegue**:
   ```powershell
   # Crear apps
   heroku create inspecciones-app
   heroku create inspecciones-frontend
   
   # O si ya las creaste desde el dashboard web:
   heroku git:remote -a inspecciones-app
   git remote rename heroku heroku-backend
   
   heroku git:remote -a inspecciones-frontend
   git remote rename heroku heroku-frontend
   ```

---

## 🌐 Alternativa: Crear apps desde el Dashboard Web

Si prefieres no instalar Heroku CLI ahora, puedes crear las apps desde el navegador:

1. **Ve a**: https://dashboard.heroku.com/apps

2. **Haz clic en "New" > "Create new app"**

3. **Crea dos apps**:
   - `inspecciones-app` (backend)
   - `inspecciones-frontend` (frontend)

4. **En cada app**:
   - Ve a "Settings"
   - Copia el "Heroku git URL"
   - Agrégalo como remote en tu proyecto:
   
   ```powershell
   git remote add heroku-backend https://git.heroku.com/inspecciones-app.git
   git remote add heroku-frontend https://git.heroku.com/inspecciones-frontend.git
   ```

5. **Configura variables de entorno desde "Settings" > "Config Vars"**

---

## 🎯 Siguiente Paso

**Descarga e instala Heroku CLI desde**:
https://cli-assets.heroku.com/heroku-x64.exe

Luego continúa con el despliegue usando el script `deploy-heroku.bat` o los comandos manuales.
