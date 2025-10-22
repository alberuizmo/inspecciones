import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function runMigration() {
  try {
    console.log('🔄 Conectando a base de datos...')
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306'),
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    })

    console.log('✅ Conectado a:', process.env.DB_HOST)
    console.log('📝 Base de datos:', process.env.DB_NAME)

    console.log('\n📜 Creando tabla Company...\n')

    // Crear tabla Company
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Company (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(500),
        phone VARCHAR(50),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✅ Tabla Company creada')

    // Verificar si existe alguna empresa
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM Company')
    const count = (rows as any)[0].count

    if (count === 0) {
      console.log('� Creando empresa por defecto...')
      await connection.query(
        `INSERT INTO Company (name, address, phone) VALUES (?, ?, ?)`,
        ['Empresa Principal', 'Por definir', '000000000']
      )
      console.log('✅ Empresa por defecto creada')
    } else {
      console.log(`✅ Ya existen ${count} empresa(s) en la base de datos`)
    }

    console.log('\n✅ Migración completada exitosamente!')

    await connection.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error en migración:', error)
    process.exit(1)
  }
}

runMigration()
