import { Router, Request, Response } from 'express';
import pool from '../db/connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

// GET /postes - Obtener todos los postes de una empresa
router.get('/', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Se requiere companyId' });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Poste WHERE companyId = ? ORDER BY codigo ASC',
      [companyId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo postes:', error);
    res.status(500).json({ error: 'Error obteniendo postes' });
  }
});

// GET /postes/:id - Obtener un poste específico
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Poste WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Poste no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error obteniendo poste:', error);
    res.status(500).json({ error: 'Error obteniendo poste' });
  }
});

// POST /postes - Crear un nuevo poste
router.post('/', async (req: Request, res: Response) => {
  try {
    const { codigo, direccion, tipo, lat, lng, companyId } = req.body;

    if (!codigo || !direccion || !tipo || lat === undefined || lng === undefined || !companyId) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Poste (codigo, direccion, tipo, lat, lng, companyId) VALUES (?, ?, ?, ?, ?, ?)',
      [codigo, direccion, tipo, lat, lng, companyId]
    );

    res.status(201).json({
      id: result.insertId,
      codigo,
      direccion,
      tipo,
      lat,
      lng,
      companyId
    });
  } catch (error: any) {
    console.error('Error creando poste:', error);
    
    // Verificar si es un error de código duplicado
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El código del poste ya existe' });
    }
    
    res.status(500).json({ error: 'Error creando poste' });
  }
});

// PUT /postes/:id - Actualizar un poste
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { codigo, direccion, tipo, lat, lng, companyId } = req.body;

    if (!codigo || !direccion || !tipo || lat === undefined || lng === undefined || !companyId) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Validar que el poste pertenezca a la compañía
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM Poste WHERE id = ? AND companyId = ?',
      [id, companyId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Poste no encontrado o no tienes permiso' });
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE Poste SET codigo = ?, direccion = ?, tipo = ?, lat = ?, lng = ? WHERE id = ? AND companyId = ?',
      [codigo, direccion, tipo, lat, lng, id, companyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Poste no encontrado' });
    }

    res.json({
      id: parseInt(id),
      codigo,
      direccion,
      tipo,
      lat,
      lng,
      companyId
    });
  } catch (error: any) {
    console.error('Error actualizando poste:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El código del poste ya existe' });
    }
    
    res.status(500).json({ error: 'Error actualizando poste' });
  }
});

// DELETE /postes/:id - Eliminar un poste
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Se requiere companyId' });
    }

    // Verificar si tiene inspecciones asociadas
    const [inspecciones] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM Inspeccion WHERE posteId = ?',
      [id]
    );

    if (inspecciones.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el poste porque tiene inspecciones asociadas' 
      });
    }

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM Poste WHERE id = ? AND companyId = ?',
      [id, companyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Poste no encontrado o no tienes permiso' });
    }

    res.json({ message: 'Poste eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando poste:', error);
    res.status(500).json({ error: 'Error eliminando poste' });
  }
});

export default router;
