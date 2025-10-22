import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

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

    // Leer archivo SQL
    const sqlFile = path.join(__dirname, 'migrate-company.sql')
    const sql = fs.readFileSync(sqlFile, 'utf-8')

    // Ejecutar cada statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`\n📜 Ejecutando ${statements.length} statements...\n`)

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('⚡', statement.substring(0, 80) + '...')
        await connection.query(statement)
      }
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
