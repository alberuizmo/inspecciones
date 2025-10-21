import Dexie from 'dexie'

export interface InspeccionLocal {
  id?: number
  remoteId?: number | null
  posteId: number
  tecnicoId: number
  fechaAsignacion: string
  fechaEjecucion?: string | null
  estado: string
  altura?: number | null
  estadoPintura?: string | null
  colorId?: number | null
  funcionando?: boolean | null
  estadoBase?: string | null
  observaciones?: string | null
  fotos?: string[]
  latReal?: number | null
  lngReal?: number | null
  syncStatus?: 'pending' | 'synced' | 'conflict'
  lastModified?: string
}

export const db = new Dexie('inspeccionesDB')
db.version(1).stores({
  inspecciones: '++id,remoteId,posteid,tecnicoId,estado,syncStatus,lastModified',
  colores: '++id,name'
})

db.open().catch((err) => {
  console.error('Failed to open db:', err)
})

export default db
