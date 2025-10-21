import { Router, Request, Response } from 'express'
import pool from '../db/connection'
import { RowDataPacket } from 'mysql2'

const router = Router()

interface ColorRow extends RowDataPacket {
  id: number
  name: string
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<ColorRow[]>('SELECT * FROM Color ORDER BY name')
    res.json(rows)
  } catch (error) {
    console.error('Error obteniendo colores:', error)
    res.status(500).json({ error: 'Error al obtener colores' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name } = req.body
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre es requerido' })
    }

    const [result] = await pool.query(
      'INSERT INTO Color (name) VALUES (?)',
      [name]
    )

    res.json({ 
      success: true, 
      id: (result as any).insertId,
      name 
    })
  } catch (error: any) {
    console.error('Error creando color:', error)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El color ya existe' })
    }
    res.status(500).json({ error: 'Error al crear color' })
  }
})

export default router
