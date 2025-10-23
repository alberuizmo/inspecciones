import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function addFirmaColumn() {
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

    console.log('\n📜 Verificando columnas de la tabla Inspeccion...\n')

    // Verificar si la columna firma existe
    const [columns] = await connection.query(
      `SHOW COLUMNS FROM Inspeccion LIKE 'firma'`
    )

    if ((columns as any[]).length === 0) {
      console.log('➕ Agregando columna firma...')
      await connection.query(
        `ALTER TABLE Inspeccion ADD COLUMN firma LONGTEXT NULL AFTER lngReal`
      )
      console.log('✅ Columna firma agregada')
    } else {
      console.log('✅ Columna firma ya existe')
    }

    // Verificar si la columna fotos existe y es LONGTEXT
    const [fotosColumn] = await connection.query(
      `SHOW COLUMNS FROM Inspeccion LIKE 'fotos'`
    ) as any[]

    if (fotosColumn.length > 0) {
      const columnType = fotosColumn[0].Type
      console.log(`📊 Columna fotos actual: ${columnType}`)
      
      if (!columnType.includes('longtext')) {
        console.log('🔄 Modificando columna fotos a LONGTEXT...')
        await connection.query(
          `ALTER TABLE Inspeccion MODIFY COLUMN fotos LONGTEXT NULL`
        )
        console.log('✅ Columna fotos modificada a LONGTEXT')
      } else {
        console.log('✅ Columna fotos ya es LONGTEXT')
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

addFirmaColumn()
