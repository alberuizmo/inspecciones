import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import coloresRoutes from './routes/colores'
import inspeccionesRoutes from './routes/inspecciones'
import usersRoutes from './routes/users'
import postesRoutes from './routes/postes'
import pool from './db/connection'

dotenv.config()

const app = express()

// Configurar CORS para permitir el frontend
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://inspecciones-frontend.herokuapp.com'
]

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Health check básico
app.get('/', (req, res) => res.send('API is running'))

// Health check completo con DB
app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    const [rows] = await pool.query('SELECT 1 as ok')
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      service: 'inspecciones-postes-api',
      version: '0.1.0'
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Rutas
app.use('/auth', authRoutes)
app.use('/users', usersRoutes)
app.use('/colores', coloresRoutes)
app.use('/postes', postesRoutes)
app.use('/inspecciones', inspeccionesRoutes)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server listening on ${PORT}`))
