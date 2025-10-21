import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

async function setupDatabase() {
  try {
    // Conectar sin especificar base de datos para crearla
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    })

    console.log('📦 Configurando base de datos...\n')

    // Crear base de datos
    const dbName = process.env.DB_NAME || 'inspecciones_postes'
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`)
    console.log(`✅ Base de datos '${dbName}' creada`)

    await connection.query(`USE ${dbName}`)

    // Eliminar tablas existentes (en orden inverso por las foreign keys)
    console.log('🗑️  Eliminando tablas existentes...')
    await connection.query(`DROP TABLE IF EXISTS Inspeccion`)
    await connection.query(`DROP TABLE IF EXISTS Poste`)
    await connection.query(`DROP TABLE IF EXISTS Color`)
    await connection.query(`DROP TABLE IF EXISTS User`)
    console.log('✅ Tablas eliminadas\n')

    // Crear tabla User
    await connection.query(`
      CREATE TABLE IF NOT EXISTS User (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(191) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'supervisor', 'tecnico') NOT NULL,
        companyId INT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✅ Tabla User creada')

    // Crear tabla Color
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Color (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(191) UNIQUE NOT NULL,
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✅ Tabla Color creada')

    // Crear tabla Poste
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Poste (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(191) UNIQUE NOT NULL,
        lat DOUBLE NOT NULL,
        lng DOUBLE NOT NULL,
        direccion VARCHAR(500) NOT NULL,
        tipo VARCHAR(100) NOT NULL,
        companyId INT NOT NULL,
        INDEX idx_codigo (codigo),
        INDEX idx_location (lat, lng),
        INDEX idx_company (companyId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✅ Tabla Poste creada')

    // Crear tabla Inspeccion
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Inspeccion (
        id INT AUTO_INCREMENT PRIMARY KEY,
        posteId INT NOT NULL,
        tecnicoId INT NOT NULL,
        supervisorId INT NULL,
        fechaAsignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fechaEjecucion DATETIME NULL,
        estado VARCHAR(50) NOT NULL,
        altura DOUBLE NULL,
        estadoPintura VARCHAR(50) NULL,
        colorId INT NULL,
        funcionando BOOLEAN NULL,
        estadoBase VARCHAR(50) NULL,
        observaciones TEXT NULL,
        fotos TEXT NULL,
        latReal DOUBLE NULL,
        lngReal DOUBLE NULL,
        firma TEXT NULL,
        syncStatus VARCHAR(20) DEFAULT 'pending',
        lastModified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_poste (posteId),
        INDEX idx_tecnico (tecnicoId),
        INDEX idx_supervisor (supervisorId),
        INDEX idx_estado (estado),
        INDEX idx_sync (syncStatus)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✅ Tabla Inspeccion creada')

    // Insertar colores
    const colores = ['negro', 'gris', 'blanco', 'amarillo']
    for (const color of colores) {
      await connection.query(
        'INSERT INTO Color (name) VALUES (?) ON DUPLICATE KEY UPDATE name=name',
        [color]
      )
    }
    console.log('✅ Colores insertados')

    // Insertar usuarios de prueba
    const adminPassword = await bcrypt.hash('admin123', 10)
    const tecnicoPassword = await bcrypt.hash('tecnico123', 10)
    const supervisorPassword = await bcrypt.hash('supervisor123', 10)

    await connection.query(
      `INSERT INTO User (email, name, password, role, companyId) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE name=name`,
      ['admin@test.com', 'Admin Test', adminPassword, 'admin', 1]
    )

    await connection.query(
      `INSERT INTO User (email, name, password, role, companyId) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE name=name`,
      ['tecnico@test.com', 'Técnico Test', tecnicoPassword, 'tecnico', 1]
    )

    await connection.query(
      `INSERT INTO User (email, name, password, role, companyId) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE name=name`,
      ['supervisor@test.com', 'Supervisor Test', supervisorPassword, 'supervisor', 1]
    )
    console.log('✅ Usuarios de prueba creados')

    // Insertar postes de ejemplo
    const postes = [
      ['P-001', 4.6097, -74.0817, 'Calle 26 con Carrera 7', 'Metálico', 1],
      ['P-002', 4.6517, -74.0836, 'Calle 72 con Carrera 11', 'Concreto', 1],
      ['P-003', 4.6737, -74.0584, 'Calle 100 con Carrera 15', 'Metálico', 1]
    ]

    for (const poste of postes) {
      await connection.query(
        `INSERT INTO Poste (codigo, lat, lng, direccion, tipo, companyId) 
         VALUES (?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE codigo=codigo`,
        poste
      )
    }
    console.log('✅ Postes de ejemplo creados')

    console.log('\n🎉 Base de datos configurada exitosamente!\n')
    console.log('📝 Usuarios de prueba:')
    console.log('   - admin@test.com / admin123')
    console.log('   - supervisor@test.com / supervisor123')
    console.log('   - tecnico@test.com / tecnico123\n')

    await connection.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

setupDatabase()
