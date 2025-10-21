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
