import Dexie, { Table } from 'dexie'

export interface InspeccionLocal {
  id?: number
  remoteId?: number | null
  posteId: number
  posteCodigo?: string
  posteUbicacion?: string
  tecnicoId: number
  supervisorId?: number | null
  fechaAsignacion: string
  fechaEjecucion?: string | null
  estado: string
  altura?: number | null
  estadoPintura?: string | null
  colorId?: number | null
  funcionando?: boolean | null
  estadoBase?: string | null
  observaciones?: string | null
  fotosJson?: string // Fotos guardadas como JSON string
  fotos?: string[] // Para compatibilidad
  foto0?: Blob // Fotos individuales como Blobs
  foto1?: Blob
  foto2?: Blob
  foto3?: Blob
  foto4?: Blob
  foto5?: Blob
  foto6?: Blob
  foto7?: Blob
  foto8?: Blob
  foto9?: Blob
  fotosCount?: number // Contador de fotos
  latReal?: number | null
  lngReal?: number | null
  firma?: Blob | string | null // Puede ser Blob (offline) o string (desde API)
  syncStatus: 'pending' | 'synced' | 'conflict'
  lastModified: string
}

export interface ColorLocal {
  id?: number
  remoteId?: number | null
  name: string
}

export interface PosteLocal {
  id?: number
  remoteId?: number | null
  codigo: string
  direccion: string
  tipo: string
  lat: number
  lng: number
  companyId: number
}

export class InspeccionesDatabase extends Dexie {
  inspecciones!: Table<InspeccionLocal, number>
  colores!: Table<ColorLocal, number>
  postes!: Table<PosteLocal, number>

  constructor() {
    super('inspeccionesDB')
    
    // Versión 1 (inicial)
    this.version(1).stores({
      inspecciones: '++id,remoteId,posteId,tecnicoId,estado,syncStatus,lastModified',
      colores: '++id,remoteId,name',
      postes: '++id,remoteId,codigo,companyId'
    })
    
    // Versión 2 (actual)
    this.version(2).stores({
      inspecciones: '++id,remoteId,posteId,tecnicoId,estado,syncStatus,lastModified',
      colores: '++id,remoteId,name',
      postes: '++id,remoteId,codigo,companyId'
    })
  }
}

export const db = new InspeccionesDatabase()

// Verificar que la base de datos esté lista
db.on('ready', () => {
  console.log('✅ IndexedDB (Dexie) inicializada correctamente')
})

db.on('blocked', () => {
  console.error('⚠️ IndexedDB bloqueada - cierra otras pestañas')
})

db.on('versionchange', (event) => {
  console.warn('⚠️ Cambio de versión de IndexedDB detectado:', event)
  db.close()
})

// Helper para guardar inspecciones desde la API
export async function saveInspeccionesToLocal(inspecciones: any[]) {
  try {
    console.log('📋 Guardando inspecciones en IndexedDB:', inspecciones.length)
    
    const localInspecciones: InspeccionLocal[] = inspecciones.map(insp => ({
      remoteId: insp.id,
      posteId: insp.posteId,
      posteCodigo: insp.posteCodigo,
      posteUbicacion: insp.posteUbicacion,
      tecnicoId: insp.tecnicoId,
      supervisorId: insp.supervisorId,
      fechaAsignacion: insp.fechaAsignacion,
      fechaEjecucion: insp.fechaEjecucion,
      estado: insp.estado,
      altura: insp.altura,
      estadoPintura: insp.estadoPintura,
      colorId: insp.colorId,
      funcionando: insp.funcionando,
      estadoBase: insp.estadoBase,
      observaciones: insp.observaciones,
      fotos: insp.fotos ? JSON.parse(insp.fotos) : [],
      latReal: insp.latReal,
      lngReal: insp.lngReal,
      firma: insp.firma,
      syncStatus: 'synced',
      lastModified: new Date().toISOString()
    }))

    // Limpiar inspecciones antiguas del mismo técnico
    const firstInsp = inspecciones[0]
    if (firstInsp) {
      const deleted = await db.inspecciones
        .where('tecnicoId')
        .equals(firstInsp.tecnicoId)
        .and(item => item.syncStatus === 'synced')
        .delete()
      console.log(`🗑️ ${deleted} inspecciones antiguas eliminadas`)
    }

    // Insertar nuevas
    await db.inspecciones.bulkAdd(localInspecciones)
    console.log(`💾 ${localInspecciones.length} inspecciones guardadas en IndexedDB`)
    
    // Verificar
    const count = await db.inspecciones.count()
    console.log(`✅ Total de inspecciones en IndexedDB: ${count}`)
  } catch (error) {
    console.error('❌ Error guardando inspecciones locales:', error)
    // No lanzar el error para no interrumpir el flujo
  }
}

// Helper para obtener inspecciones locales
export async function getLocalInspecciones(tecnicoId: number): Promise<InspeccionLocal[]> {
  try {
    return await db.inspecciones
      .where('tecnicoId')
      .equals(tecnicoId)
      .toArray()
  } catch (error) {
    console.error('Error obteniendo inspecciones locales:', error)
    return []
  }
}

// Helper para guardar colores
export async function saveColoresToLocal(colores: any[]) {
  try {
    console.log('🎨 Guardando colores en IndexedDB:', colores)
    
    const localColores: ColorLocal[] = colores.map(color => ({
      remoteId: color.id,
      name: color.name
    }))

    console.log('🎨 Colores mapeados:', localColores)
    
    await db.colores.clear()
    console.log('🗑️ Tabla colores limpiada')
    
    await db.colores.bulkAdd(localColores)
    console.log(`💾 ${localColores.length} colores guardados en IndexedDB`)
    
    // Verificar que se guardaron
    const count = await db.colores.count()
    console.log(`✅ Verificación: ${count} colores en IndexedDB`)
    
    if (count !== localColores.length) {
      console.error('⚠️ Advertencia: No se guardaron todos los colores')
    }
  } catch (error) {
    console.error('❌ Error guardando colores locales:', error)
    // No lanzar el error para no interrumpir el flujo
  }
}

// Helper para guardar postes
export async function savePostesToLocal(postes: any[]) {
  try {
    console.log('📍 Guardando postes en IndexedDB:', postes.length)
    
    const localPostes: PosteLocal[] = postes.map(poste => ({
      remoteId: poste.id,
      codigo: poste.codigo,
      direccion: poste.direccion,
      tipo: poste.tipo,
      lat: poste.lat,
      lng: poste.lng,
      companyId: poste.companyId
    }))

    console.log('📍 Postes mapeados:', localPostes.length)
    
    await db.postes.clear()
    console.log('🗑️ Tabla postes limpiada')
    
    await db.postes.bulkAdd(localPostes)
    console.log(`💾 ${localPostes.length} postes guardados en IndexedDB`)
    
    // Verificar que se guardaron
    const count = await db.postes.count()
    console.log(`✅ Verificación: ${count} postes en IndexedDB`)
    
    if (count !== localPostes.length) {
      console.error('⚠️ Advertencia: No se guardaron todos los postes')
    }
  } catch (error) {
    console.error('❌ Error guardando postes locales:', error)
    // No lanzar el error para no interrumpir el flujo
  }
}

export default db
