import { Router, Request, Response } from 'express'
import pool from '../db/connection'
import { RowDataPacket } from 'mysql2'

const router = Router()

interface UserRow extends RowDataPacket {
  id: number
  email: string
  name: string
  role: string
  companyId: number
  createdAt: Date
}

// Listar usuarios de la misma empresa (filtrado por companyId)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.query
    
    if (!companyId) {
      return res.status(400).json({ error: 'companyId es requerido' })
    }

    const [rows] = await pool.query<UserRow[]>(
      'SELECT id, email, name, role, companyId, createdAt FROM User WHERE companyId = ? ORDER BY createdAt DESC',
      [companyId]
    )
    res.json(rows)
  } catch (error) {
    console.error('Error obteniendo usuarios:', error)
    res.status(500).json({ error: 'Error al obtener usuarios' })
  }
})

// Eliminar usuario (solo si pertenece a la misma empresa)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { companyId } = req.query
    
    if (!companyId) {
      return res.status(400).json({ error: 'companyId es requerido' })
    }

    // Verificar que el usuario pertenece a la empresa antes de eliminar
    const [users] = await pool.query<UserRow[]>(
      'SELECT id FROM User WHERE id = ? AND companyId = ?',
      [id, companyId]
    )

    if (users.length === 0) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este usuario' })
    }

    await pool.query('DELETE FROM User WHERE id = ? AND companyId = ?', [id, companyId])
    
    res.json({ success: true, message: 'Usuario eliminado' })
  } catch (error) {
    console.error('Error eliminando usuario:', error)
    res.status(500).json({ error: 'Error al eliminar usuario' })
  }
})

export default router
