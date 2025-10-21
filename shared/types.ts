export interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'supervisor' | 'tecnico'
  companyId: number
}

export interface Color {
  id: number
  name: string
}

export interface Poste {
  id: number
  codigo: string
  lat: number
  lng: number
  direccion: string
  tipo: string
}

export interface Inspeccion {
  id: number
  posteId: number
  tecnicoId: number
  supervisorId?: number
  fechaAsignacion: Date
  fechaEjecucion?: Date
  estado: 'pendiente' | 'en_progreso' | 'completada'
  altura?: number
  estadoPintura?: 'excelente' | 'bueno' | 'regular' | 'malo'
  colorId?: number
  funcionando?: boolean
  estadoBase?: 'solida' | 'deteriorada' | 'requiere_reparacion'
  observaciones?: string
  fotos?: string[]
  latReal?: number
  lngReal?: number
  firma?: string
  syncStatus: 'pending' | 'synced' | 'conflict'
  lastModified: Date
}
