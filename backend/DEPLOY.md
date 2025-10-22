# Despliegue a Producción

## Variables de Entorno

### Opción 1: Archivo .env.production (NO subir a git)

Crea un archivo `.env.production` en la raíz del backend con:

```env
DB_HOST=bfjrxdpxrza9qllq.cbetxkdyhwsb.us-east-1.rds.amazonaws.com
DB_USER=iup5rp5is7m2yxvn
DB_PASSWORD=djyop2fhei2r1gvx
DB_NAME=ymjxfonpeqmofvg3
DB_PORT=3306
JWT_SECRET=tu_secreto_jwt_super_seguro_en_produccion
PORT=4000
```

### Opción 2: Variables de Entorno en Heroku

Si despliegas en Heroku, configura las variables desde el dashboard o CLI:

```bash
heroku config:set DB_HOST=bfjrxdpxrza9qllq.cbetxkdyhwsb.us-east-1.rds.amazonaws.com
heroku config:set DB_USER=iup5rp5is7m2yxvn
heroku config:set DB_PASSWORD=djyop2fhei2r1gvx
heroku config:set DB_NAME=ymjxfonpeqmofvg3
heroku config:set DB_PORT=3306
heroku config:set JWT_SECRET=tu_secreto_jwt_super_seguro
heroku config:set NODE_ENV=production
```

## Crear las Tablas en Producción

Una vez configuradas las variables, ejecuta:

```bash
npm run db:setup:prod
```

Esto creará todas las tablas necesarias en tu base de datos de AWS RDS.

## Build y Deploy

### Build local:
```bash
npm run build
```

### Deploy a Heroku:
```bash
git add .
git commit -m "Deploy to production"
git push heroku main
```

### O ejecutar en producción:
```bash
npm run start:prod
```

## Scripts Disponibles

- `npm run dev` - Desarrollo local con hot reload
- `npm run build` - Compilar TypeScript a JavaScript
- `npm run start` - Iniciar servidor compilado
- `npm run start:prod` - Iniciar en modo producción (carga .env.production)
- `npm run db:setup` - Crear tablas en desarrollo
- `npm run db:setup:prod` - Crear tablas en producción
- `npm run build:prod` - Build + setup DB para producción

## Notas Importantes

1. **NUNCA subas el archivo `.env.production` a git** - Contiene credenciales sensibles
2. **Cambia el JWT_SECRET** por un valor único y seguro
3. La conexión a AWS RDS usa SSL automáticamente en producción
4. Heroku asigna el PORT automáticamente mediante `process.env.PORT`
