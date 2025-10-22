import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import path from 'path'

// Cargar el archivo .env correcto según el entorno
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env'

dotenv.config({ path: path.resolve(process.cwd(), envFile) })

console.log(`🔧 Cargando configuración desde: ${envFile}`)

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'inspecciones_postes',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Para AWS RDS
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
})

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL connected successfully')
    connection.release()
  })
  .catch(err => {
    console.error('❌ MySQL connection error:', err.message)
  })

export default pool
