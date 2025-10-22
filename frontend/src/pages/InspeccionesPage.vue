<template>
  <div class="inspecciones-page">
    <header class="page-header">
      <h1>📋 Mis Inspecciones</h1>
      <div class="header-actions">
        <span class="user-info">{{ authStore.user?.name }}</span>
        <button @click="sincronizarTareas" class="btn-sync">🔄 Sincronizar</button>
        <button @click="logout" class="btn-logout">Salir</button>
      </div>
    </header>
    
    <div v-if="loading" class="loading">
      <p>Cargando tareas...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="cargarTareas" class="btn-retry">Reintentar</button>
    </div>

    <section v-else class="tareas-section">
      <div class="tabs">
        <button 
          :class="{ active: filtroEstado === 'todas' }" 
          @click="filtroEstado = 'todas'"
        >
          Todas ({{ tareas.length }})
        </button>
        <button 
          :class="{ active: filtroEstado === 'pendiente' }" 
          @click="filtroEstado = 'pendiente'"
        >
          Pendientes ({{ tareasPendientes.length }})
        </button>
        <button 
          :class="{ active: filtroEstado === 'completada' }" 
          @click="filtroEstado = 'completada'"
        >
          Completadas ({{ tareasCompletadas.length }})
        </button>
      </div>

      <div v-if="tareasFiltradas.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>No hay tareas {{ filtroEstado === 'todas' ? 'asignadas' : filtroEstado + 's' }}</p>
        <button @click="sincronizarTareas" class="btn-primary">
          Sincronizar desde el servidor
        </button>
      </div>

      <div v-else class="tareas-list">
        <div v-for="tarea in tareasFiltradas" :key="tarea.id" class="tarea-card">
          <!-- Indicador de pendiente de sincronización -->
          <div v-if="tarea.syncStatus === 'pending'" class="sync-indicator">
            ⏳ Pendiente de sincronización
          </div>
          
          <div class="tarea-header">
            <h3>{{ tarea.posteCodigo || `Poste #${tarea.posteId}` }}</h3>
            <span :class="['estado-badge', tarea.estado]">
              {{ estadoLabel(tarea.estado) }}
            </span>
          </div>
          
          <div class="tarea-details">
            <p><strong>📍 Ubicación:</strong> {{ tarea.posteUbicacion || 'Sin especificar' }}</p>
            <p><strong>📅 Asignada:</strong> {{ formatDate(tarea.fechaAsignacion) }}</p>
            <p v-if="tarea.fechaEjecucion">
              <strong>✅ Ejecutada:</strong> {{ formatDate(tarea.fechaEjecucion) }}
            </p>
          </div>

          <div class="tarea-actions">
            <button 
              v-if="tarea.estado === 'pendiente'"
              @click="iniciarInspeccion(tarea)" 
              class="btn-primary"
            >
              🚀 Iniciar Inspección
            </button>
            <button 
              v-else-if="tarea.estado === 'en_progreso'"
              @click="continuarInspeccion(tarea)" 
              class="btn-warning"
            >
              📝 Continuar Inspección
            </button>
            <button 
              v-else
              @click="verDetalles(tarea)" 
              class="btn-secondary"
            >
              👁️ Ver Detalles
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import { saveInspeccionesToLocal, getLocalInspecciones } from '../db/dexie'

const router = useRouter()
const authStore = useAuthStore()

const tareas = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const filtroEstado = ref<'todas' | 'pendiente' | 'completada'>('todas')

const tareasFiltradas = computed(() => {
  if (filtroEstado.value === 'todas') return tareas.value
  return tareas.value.filter(t => t.estado === filtroEstado.value)
})

const tareasPendientes = computed(() => 
  tareas.value.filter(t => t.estado === 'pendiente')
)

const tareasCompletadas = computed(() => 
  tareas.value.filter(t => t.estado === 'completada')
)

const estadoLabel = (estado: string) => {
  const labels: any = {
    pendiente: 'Pendiente',
    en_progreso: 'En Progreso',
    completada: 'Completada'
  }
  return labels[estado] || estado
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const cargarTareas = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const tecnicoId = authStore.user?.id
    if (!tecnicoId) {
      throw new Error('No se encontró el ID del técnico')
    }

    let tareasFromAPI: any[] = []
    let apiDisponible = true

    // Intentar cargar desde la API
    try {
      const response = await api.get(`/inspecciones/tecnico/${tecnicoId}`)
      tareasFromAPI = response.data
      
      // Guardar en IndexedDB para uso offline
      await saveInspeccionesToLocal(response.data)
      
      console.log(`✅ ${tareasFromAPI.length} tareas cargadas desde API`)
    } catch (apiError: any) {
      console.warn('⚠️ API no disponible')
      apiDisponible = false
    }

    // Cargar inspecciones guardadas localmente (offline)
    const { db } = await import('../db/dexie')
    const inspeccionesLocales = await db.inspecciones
      .where('tecnicoId')
      .equals(tecnicoId)
      .toArray()
    
    console.log(`💾 ${inspeccionesLocales.length} inspecciones locales encontradas`)

    // Combinar tareas del API con inspecciones locales
    const tareasMap = new Map()
    
    // Agregar tareas del API
    if (apiDisponible) {
      tareasFromAPI.forEach(t => {
        tareasMap.set(t.id, {
          id: t.id,
          posteId: t.posteId,
          posteCodigo: t.posteCodigo,
          posteUbicacion: t.posteUbicacion,
          tecnicoId: t.tecnicoId,
          supervisorId: t.supervisorId,
          fechaAsignacion: t.fechaAsignacion,
          fechaEjecucion: t.fechaEjecucion,
          estado: t.estado,
          syncStatus: 'synced'
        })
      })
    }
    
    // Agregar inspecciones locales pendientes de sincronización
    inspeccionesLocales.forEach(local => {
      if (local.syncStatus === 'pending') {
        // Usar ID negativo temporal para inspecciones locales
        const tempId = local.id || -(Date.now())
        
        tareasMap.set(tempId, {
          id: tempId,
          posteId: local.posteId,
          posteCodigo: `Poste #${local.posteId}`,
          posteUbicacion: 'Guardado offline',
          tecnicoId: local.tecnicoId,
          supervisorId: local.supervisorId,
          fechaAsignacion: local.fechaAsignacion,
          fechaEjecucion: local.fechaEjecucion,
          estado: local.estado,
          syncStatus: 'pending',
          localId: local.id
        })
      }
    })
    
    tareas.value = Array.from(tareasMap.values())
      .sort((a, b) => {
        // Mostrar pendientes de sync primero
        if (a.syncStatus === 'pending' && b.syncStatus !== 'pending') return -1
        if (a.syncStatus !== 'pending' && b.syncStatus === 'pending') return 1
        // Luego por fecha
        return new Date(b.fechaAsignacion).getTime() - new Date(a.fechaAsignacion).getTime()
      })
    
    console.log(`📊 Total de tareas mostradas: ${tareas.value.length}`)
    
    if (!apiDisponible && tareas.value.length === 0) {
      throw new Error('No hay conexión y no hay tareas guardadas localmente')
    }
  } catch (err: any) {
    console.error('Error cargando tareas:', err)
    error.value = err.message || 'Error al cargar las tareas'
  } finally {
    loading.value = false
  }
}

const sincronizarTareas = async () => {
  console.log('🔄 Iniciando sincronización...')
  
  // Primero sincronizar inspecciones pendientes
  await sincronizarInspeccionesPendientes()
  
  // Luego cargar tareas actualizadas
  await cargarTareas()
}

const sincronizarInspeccionesPendientes = async () => {
  try {
    const { db } = await import('../db/dexie')
    
    // Obtener inspecciones pendientes de sincronización
    const pendientes = await db.inspecciones
      .where('syncStatus')
      .equals('pending')
      .toArray()
    
    if (pendientes.length === 0) {
      console.log('✅ No hay inspecciones pendientes de sincronizar')
      return
    }
    
    console.log(`📤 Sincronizando ${pendientes.length} inspecciones pendientes...`)
    
    for (const inspeccion of pendientes) {
      try {
        console.log(`📤 Sincronizando inspección local ID: ${inspeccion.id}, remoteId: ${inspeccion.remoteId}`)
        
        // Convertir firma blob a base64
        let firmaBase64 = ''
        if (inspeccion.firma instanceof Blob) {
          firmaBase64 = await blobToBase64(inspeccion.firma)
        }
        
        // Convertir fotos blobs a base64
        const fotosBase64: string[] = []
        for (let i = 0; i < 10; i++) {
          const fotoKey = `foto${i}` as keyof typeof inspeccion
          const foto = inspeccion[fotoKey]
          if (foto instanceof Blob) {
            const fotoB64 = await blobToBase64(foto)
            fotosBase64.push(fotoB64)
          }
        }
        
        // Preparar datos para enviar al servidor
        const dataParaServidor = {
          fechaEjecucion: inspeccion.fechaEjecucion,
          estado: inspeccion.estado,
          altura: inspeccion.altura,
          estadoPintura: inspeccion.estadoPintura,
          colorId: inspeccion.colorId,
          funcionando: inspeccion.funcionando,
          estadoBase: inspeccion.estadoBase,
          observaciones: inspeccion.observaciones,
          fotos: JSON.stringify(fotosBase64),
          latReal: inspeccion.latReal,
          lngReal: inspeccion.lngReal,
          firma: firmaBase64
        }
        
        // ACTUALIZAR el registro existente usando el remoteId
        if (inspeccion.remoteId) {
          await api.put(`/inspecciones/${inspeccion.remoteId}`, dataParaServidor)
          console.log(`✅ Inspección actualizada. ID remoto: ${inspeccion.remoteId}`)
          
          // Marcar como sincronizada en IndexedDB
          await db.inspecciones.update(inspeccion.id!, {
            syncStatus: 'synced'
          })
        } else {
          console.warn(`⚠️ Inspección ${inspeccion.id} no tiene remoteId, no se puede sincronizar`)
        }
        
      } catch (syncError) {
        console.error(`❌ Error sincronizando inspección ${inspeccion.id}:`, syncError)
        // Continuar con la siguiente inspección
      }
    }
    
    console.log('✅ Sincronización completada')
    
  } catch (error) {
    console.error('❌ Error en sincronización:', error)
  }
}

// Función helper para convertir Blob a base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

const iniciarInspeccion = (tarea: any) => {
  router.push(`/inspeccion/${tarea.id}`)
}

const continuarInspeccion = (tarea: any) => {
  router.push(`/inspeccion/${tarea.id}`)
}

const verDetalles = (tarea: any) => {
  router.push(`/inspeccion/${tarea.id}/detalle`)
}

const logout = () => {
  authStore.logout()
  router.push('/')
}

onMounted(() => {
  // Verificar que sea técnico
  if (authStore.user?.role !== 'tecnico') {
    router.push('/')
    return
  }

  cargarTareas()
  
  // Sincronizar automáticamente cuando se detecte conexión
  window.addEventListener('online', async () => {
    console.log('🌐 Conexión restaurada - iniciando sincronización automática...')
    await sincronizarInspeccionesPendientes()
    await cargarTareas()
  })
})
</script>

<style scoped>
.inspecciones-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 0; /* El offline indicator se ajusta automáticamente */
}

.page-header {
  background: #FFD700;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.page-header h1 {
  margin: 0;
  color: #000;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.user-info {
  font-weight: 600;
}

.btn-sync {
  padding: 10px 20px;
  background: white;
  color: #000;
  border: 2px solid #000;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
}

.btn-logout {
  padding: 10px 20px;
  background: #000;
  color: #FFD700;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  font-size: 18px;
}

.error-message {
  text-align: center;
  padding: 40px 20px;
  background: #ffebee;
  color: #c62828;
  margin: 20px;
  border-radius: 10px;
}

.btn-retry {
  margin-top: 15px;
  padding: 10px 20px;
  background: #c62828;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.tareas-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.tabs button {
  padding: 12px 24px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.tabs button.active {
  background: #FFD700;
  border-color: #FFD700;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 10px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.tareas-list {
  display: grid;
  gap: 20px;
}

.tarea-card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  position: relative;
}

.sync-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff9800;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.tarea-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.tarea-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.tarea-header h3 {
  margin: 0;
  color: #333;
}

.estado-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.estado-badge.pendiente {
  background: #fff3cd;
  color: #856404;
}

.estado-badge.en_progreso {
  background: #cce5ff;
  color: #004085;
}

.estado-badge.completada {
  background: #d4edda;
  color: #155724;
}

.tarea-details {
  margin: 15px 0;
}

.tarea-details p {
  margin: 8px 0;
  color: #666;
}

.tarea-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.btn-primary {
  padding: 12px 24px;
  background: #FFD700;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
}

.btn-warning {
  padding: 12px 24px;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
}

.btn-secondary {
  padding: 12px 24px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
}
</style>
