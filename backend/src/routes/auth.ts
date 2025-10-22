import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db/connection'
import { RowDataPacket } from 'mysql2'

const router = Router()

interface UserRow extends RowDataPacket {
  id: number
  email: string
  name: string
  password: string
  role: string
  companyId: number
}

// Registro de empresa + admin (primer usuario)
router.post('/register-company', async (req: Request, res: Response) => {
  const connection = await pool.getConnection()
  
  try {
    const { companyName, companyAddress, companyPhone, name, email, password } = req.body

    // Validar campos requeridos
    if (!companyName || !name || !email || !password) {
      return res.status(400).json({ error: 'Nombre de empresa, nombre, email y contraseña son requeridos' })
    }

    // Iniciar transacción
    await connection.beginTransaction()

    try {
      // 1. Crear empresa
      const [companyResult] = await connection.query(
        'INSERT INTO Company (name, address, phone) VALUES (?, ?, ?)',
        [companyName, companyAddress || null, companyPhone || null]
      )
      
      const companyId = (companyResult as any).insertId

      // 2. Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // 3. Crear usuario admin
      const [userResult] = await connection.query(
        'INSERT INTO User (email, name, password, role, companyId) VALUES (?, ?, ?, ?, ?)',
        [email, name, hashedPassword, 'admin', companyId]
      )

      const userId = (userResult as any).insertId

      // Commit transacción
      await connection.commit()

      // 4. Generar token JWT
      const token = jwt.sign(
        { sub: userId, email, role: 'admin' },
        process.env.JWT_SECRET || 'changeme',
        { expiresIn: '7d' }
      )

      res.json({
        success: true,
        message: 'Empresa y administrador creados exitosamente',
        token,
        user: {
          id: userId,
          email,
          name,
          role: 'admin',
          companyId
        },
        company: {
          id: companyId,
          name: companyName
        }
      })
    } catch (error) {
      // Rollback en caso de error
      await connection.rollback()
      throw error
    }
  } catch (error: any) {
    console.error('Error en registro de empresa:', error)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El email ya está registrado' })
    }
    res.status(500).json({ error: 'Error al registrar empresa y administrador' })
  } finally {
    connection.release()
  }
})

// Registro de usuario (para admins que agregan usuarios a su empresa)
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, name, password, role, companyId } = req.body

    // Validar campos requeridos
    if (!email || !name || !password || !role) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insertar usuario
    const [result] = await pool.query(
      'INSERT INTO User (email, name, password, role, companyId) VALUES (?, ?, ?, ?, ?)',
      [email, name, hashedPassword, role, companyId || 1]
    )

    res.json({ 
      success: true, 
      message: 'Usuario creado exitosamente',
      userId: (result as any).insertId 
    })
  } catch (error: any) {
    console.error('Error en registro:', error)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El email ya está registrado' })
    }
    res.status(500).json({ error: 'Error al registrar usuario' })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son requeridos' })
    }

    // Buscar usuario
    const [rows] = await pool.query<UserRow[]>(
      'SELECT * FROM User WHERE email = ?',
      [email]
    )

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const user = rows[0]

    // Verificar password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    // Generar token
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'changeme',
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId
      }
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
})

export default router
