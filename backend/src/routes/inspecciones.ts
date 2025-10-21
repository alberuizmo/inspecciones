import { Router, Request, Response } from 'express'
import pool from '../db/connection'
import { RowDataPacket } from 'mysql2'

const router = Router()

interface InspeccionRow extends RowDataPacket {
  id: number
  posteId: number
  tecnicoId: number
  supervisorId: number | null
  fechaAsignacion: Date
  fechaEjecucion: Date | null
  estado: string
  altura: number | null
  estadoPintura: string | null
  colorId: number | null
  funcionando: boolean | null
  estadoBase: string | null
  observaciones: string | null
  fotos: string | null
  latReal: number | null
  lngReal: number | null
  firma: string | null
  syncStatus: string
  lastModified: Date
}

// Crear inspección
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      posteId,
      tecnicoId,
      supervisorId,
      estado,
      altura,
      estadoPintura,
      colorId,
      funcionando,
      estadoBase,
      observaciones,
      fotos,
      latReal,
      lngReal,
      firma,
      fechaEjecucion
    } = req.body

    const [result] = await pool.query(
      `INSERT INTO Inspeccion (
        posteId, tecnicoId, supervisorId, estado, altura, estadoPintura,
        colorId, funcionando, estadoBase, observaciones, fotos, latReal,
        lngReal, firma, fechaEjecucion, syncStatus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        posteId, tecnicoId, supervisorId, estado, altura, estadoPintura,
        colorId, funcionando, estadoBase, observaciones, 
        fotos ? JSON.stringify(fotos) : null,
        latReal, lngReal, firma, fechaEjecucion, 'synced'
      ]
    )

    res.json({ 
      success: true, 
      id: (result as any).insertId 
    })
  } catch (error) {
    console.error('Error creando inspección:', error)
    res.status(500).json({ error: 'Error al crear inspección' })
  }
})

// Obtener inspecciones por técnico
router.get('/tecnico/:tecnicoId', async (req: Request, res: Response) => {
  try {
    const { tecnicoId } = req.params

    const [rows] = await pool.query<InspeccionRow[]>(
      `SELECT i.*, p.codigo as posteCodigo, p.direccion as posteUbicacion
       FROM Inspeccion i
       LEFT JOIN Poste p ON i.posteId = p.id
       WHERE i.tecnicoId = ?
       ORDER BY i.fechaAsignacion DESC`,
      [tecnicoId]
    )

    res.json(rows)
  } catch (error) {
    console.error('Error obteniendo inspecciones:', error)
    res.status(500).json({ error: 'Error al obtener inspecciones' })
  }
})

// Obtener inspecciones por supervisor
router.get('/supervisor/:supervisorId', async (req: Request, res: Response) => {
  try {
    const { supervisorId } = req.params

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        i.id,
        i.estado,
        i.fechaAsignacion,
        i.fechaEjecucion,
        p.codigo as posteCodigo,
        u.name as tecnicoNombre
       FROM Inspeccion i
       LEFT JOIN Poste p ON i.posteId = p.id
       LEFT JOIN User u ON i.tecnicoId = u.id
       WHERE i.supervisorId = ?
       ORDER BY i.fechaAsignacion DESC`,
      [supervisorId]
    )

    res.json(rows)
  } catch (error) {
    console.error('Error obteniendo inspecciones del supervisor:', error)
    res.status(500).json({ error: 'Error al obtener inspecciones' })
  }
})

// Obtener una inspección por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const [rows] = await pool.query<InspeccionRow[]>(
      'SELECT * FROM Inspeccion WHERE id = ?',
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Inspección no encontrada' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('Error obteniendo inspección:', error)
    res.status(500).json({ error: 'Error al obtener inspección' })
  }
})

// Actualizar inspección
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const {
      estado,
      altura,
      estadoPintura,
      colorId,
      funcionando,
      estadoBase,
      observaciones,
      fotos,
      latReal,
      lngReal,
      firma,
      fechaEjecucion
    } = req.body

    await pool.query(
      `UPDATE Inspeccion SET
        estado = ?, altura = ?, estadoPintura = ?, colorId = ?,
        funcionando = ?, estadoBase = ?, observaciones = ?, fotos = ?,
        latReal = ?, lngReal = ?, firma = ?, fechaEjecucion = ?,
        syncStatus = 'synced'
      WHERE id = ?`,
      [
        estado, altura, estadoPintura, colorId, funcionando, estadoBase,
        observaciones, fotos ? JSON.stringify(fotos) : null,
        latReal, lngReal, firma, fechaEjecucion, id
      ]
    )

    res.json({ success: true })
  } catch (error) {
    console.error('Error actualizando inspección:', error)
    res.status(500).json({ error: 'Error al actualizar inspección' })
  }
})

// Sincronizar inspecciones desde cliente (offline sync)
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const { inspecciones } = req.body

    if (!Array.isArray(inspecciones)) {
      return res.status(400).json({ error: 'Se esperaba un array de inspecciones' })
    }

    const results = []

    for (const insp of inspecciones) {
      try {
        const [result] = await pool.query(
          `INSERT INTO Inspeccion (
            posteId, tecnicoId, supervisorId, estado, altura, estadoPintura,
            colorId, funcionando, estadoBase, observaciones, fotos, latReal,
            lngReal, firma, fechaEjecucion, syncStatus
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            insp.posteId, insp.tecnicoId, insp.supervisorId, insp.estado,
            insp.altura, insp.estadoPintura, insp.colorId, insp.funcionando,
            insp.estadoBase, insp.observaciones,
            insp.fotos ? JSON.stringify(insp.fotos) : null,
            insp.latReal, insp.lngReal, insp.firma, insp.fechaEjecucion, 'synced'
          ]
        )

        results.push({
          localId: insp.id,
          remoteId: (result as any).insertId,
          success: true
        })
      } catch (error) {
        console.error('Error sincronizando inspección:', error)
        results.push({
          localId: insp.id,
          success: false,
          error: 'Error al sincronizar'
        })
      }
    }

    res.json({ results })
  } catch (error) {
    console.error('Error en sincronización:', error)
    res.status(500).json({ error: 'Error en sincronización' })
  }
})

export default router
