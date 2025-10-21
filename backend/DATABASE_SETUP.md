# ================================================
# Guía de Configuración de Base de Datos
# ================================================

## Opción 1: Usar Prisma (Recomendado) ✅

### Ventajas:
- ✅ Migraciones automáticas
- ✅ Type-safety con TypeScript
- ✅ Queries más fáciles
- ✅ Relaciones automáticas

### Pasos:

1. **Instalar dependencias:**
```powershell
cd backend
npm install
```

2. **Configurar .env:**
```powershell
cp .env.example .env
```

Edita `backend/.env`:
```env
DATABASE_URL="mysql://root:tu_password@localhost:3306/inspecciones_postes"
JWT_SECRET="tu_secreto_super_seguro_123"
PORT=4000
```

3. **Crear base de datos y tablas:**
```powershell
# Generar Prisma Client
npx prisma generate

# Crear tablas en MySQL
npx prisma db push

# Poblar datos iniciales
npx prisma db seed
```

4. **Verificar en MySQL:**
```sql
USE inspecciones_postes;
SHOW TABLES;
SELECT * FROM Color;
SELECT * FROM User;
```

---

## Opción 2: SQL Directo (Sin Prisma)

### Si prefieres no usar Prisma:

1. **Crear la base de datos con el script SQL:**
```powershell
# Desde MySQL command line:
mysql -u root -p < backend/schema.sql

# O desde MySQL Workbench:
# Abrir backend/schema.sql y ejecutar
```

2. **Modificar el código para usar mysql2 en lugar de Prisma:**
```powershell
cd backend
npm install mysql2
npm uninstall prisma @prisma/client
```

3. **Crear conexión manual (backend/src/db/mysql.ts):**
```typescript
import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'tu_password',
  database: 'inspecciones_postes',
  waitForConnections: true,
  connectionLimit: 10
})
```

---

## Recomendación Final

**Usa Prisma** porque:
- Ya está configurado en el proyecto
- Más fácil de mantener
- Type-safety automático
- No necesitas escribir SQL manualmente

Solo necesitas:
1. Tener MySQL corriendo
2. Configurar `.env` con tus credenciales
3. Ejecutar `npx prisma db push`

¡Listo! 🚀
