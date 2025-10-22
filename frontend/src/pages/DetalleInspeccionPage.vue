<template>
  <div class="detalle-inspeccion">
    <header>
      <h1>📋 Detalle de Inspección</h1>
      <button @click="volver">← Volver</button>
    </header>

    <div v-if="loading" class="loading">
      <p>Cargando inspección...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="volver">Volver</button>
    </div>

    <div v-else-if="inspeccion" class="detalle-container">
      <!-- Información General -->
      <section class="seccion">
        <h2>🏷️ Información General</h2>
        <div class="info-grid">
          <div class="info-item">
            <strong>Estado:</strong>
            <span :class="['badge', inspeccion.estado]">{{ estadoLabel(inspeccion.estado) }}</span>
          </div>
          <div class="info-item">
            <strong>Fecha Asignación:</strong>
            <span>{{ formatDate(inspeccion.fechaAsignacion) }}</span>
          </div>
          <div class="info-item">
            <strong>Fecha Ejecución:</strong>
            <span>{{ inspeccion.fechaEjecucion ? formatDate(inspeccion.fechaEjecucion) : 'Pendiente' }}</span>
          </div>
          <div class="info-item">
            <strong>Poste:</strong>
            <span>{{ inspeccion.posteCodigo || `#${inspeccion.posteId}` }}</span>
          </div>
        </div>
      </section>

      <!-- Datos Técnicos -->
      <section class="seccion">
        <h2>🔧 Datos Técnicos</h2>
        <div class="info-grid">
          <div class="info-item">
            <strong>Altura:</strong>
            <span>{{ inspeccion.altura || 'N/A' }} metros</span>
          </div>
          <div class="info-item">
            <strong>Estado Pintura:</strong>
            <span class="capitalize">{{ inspeccion.estadoPintura || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <strong>Color:</strong>
            <span>{{ inspeccion.colorNombre || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <strong>Funcionando:</strong>
            <span>{{ inspeccion.funcionando ? '✅ Sí' : '❌ No' }}</span>
          </div>
          <div class="info-item">
            <strong>Estado Base:</strong>
            <span class="capitalize">{{ inspeccion.estadoBase || 'N/A' }}</span>
          </div>
        </div>
      </section>

      <!-- Observaciones -->
      <section v-if="inspeccion.observaciones" class="seccion">
        <h2>📝 Observaciones</h2>
        <p class="observaciones">{{ inspeccion.observaciones }}</p>
      </section>

      <!-- Ubicación GPS -->
      <section v-if="inspeccion.latReal && inspeccion.lngReal" class="seccion">
        <h2>📍 Ubicación GPS</h2>
        <div class="info-grid">
          <div class="info-item">
            <strong>Latitud:</strong>
            <span>{{ inspeccion.latReal }}</span>
          </div>
          <div class="info-item">
            <strong>Longitud:</strong>
            <span>{{ inspeccion.lngReal }}</span>
          </div>
        </div>
        <a 
          :href="`https://www.google.com/maps?q=${inspeccion.latReal},${inspeccion.lngReal}`" 
          target="_blank"
          class="btn-mapa"
        >
          🗺️ Ver en Google Maps
        </a>
      </section>

      <!-- Fotos -->
      <section v-if="fotos.length > 0" class="seccion">
        <h2>📸 Fotos del Poste ({{ fotos.length }})</h2>
        <div class="fotos-grid">
          <div v-for="(foto, index) in fotos" :key="index" class="foto-item" @click="abrirFoto(foto)">
            <img :src="foto" :alt="`Foto ${index + 1}`" />
          </div>
        </div>
      </section>

      <!-- Firma -->
      <section v-if="firma" class="seccion">
        <h2>✍️ Firma del Técnico</h2>
        <div class="firma-container">
          <img :src="firma" alt="Firma del técnico" />
        </div>
      </section>
    </div>

    <!-- Modal para ver foto en grande -->
    <div v-if="fotoAmpliada" class="modal-foto" @click="cerrarFoto">
      <div class="modal-contenido">
        <button class="btn-cerrar" @click="cerrarFoto">✖</button>
        <img :src="fotoAmpliada" alt="Foto ampliada" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../services/api'
import { db } from '../db/dexie'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const error = ref('')
const inspeccion = ref<any>(null)
const fotos = ref<string[]>([])
const firma = ref<string>('')
const fotoAmpliada = ref<string>('')

const volver = () => {
  router.back()
}

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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const abrirFoto = (foto: string) => {
  fotoAmpliada.value = foto
}

const cerrarFoto = () => {
  fotoAmpliada.value = ''
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

const cargarInspeccion = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const inspeccionId = route.params.id

    // Intentar cargar desde API
    try {
      const response = await api.get(`/inspecciones/${inspeccionId}`)
      inspeccion.value = response.data
      
      console.log('📋 Inspección cargada:', inspeccion.value)
      console.log('📸 Fotos raw:', inspeccion.value.fotos)
      console.log('📸 Tipo de fotos:', typeof inspeccion.value.fotos)
      
      // Parsear fotos si vienen como JSON string
      if (inspeccion.value.fotos) {
        if (typeof inspeccion.value.fotos === 'string') {
          try {
            const fotosParsed = JSON.parse(inspeccion.value.fotos)
            console.log('📸 Fotos parseadas:', fotosParsed)
            console.log('📸 Es array?', Array.isArray(fotosParsed))
            console.log('📸 Longitud:', fotosParsed.length)
            
            if (Array.isArray(fotosParsed)) {
              fotos.value = fotosParsed.filter(f => f && f.length > 0)
            } else {
              fotos.value = []
            }
          } catch (e) {
            console.warn('⚠️ Error parseando fotos:', e)
            fotos.value = []
          }
        } else if (Array.isArray(inspeccion.value.fotos)) {
          fotos.value = inspeccion.value.fotos.filter(f => f && f.length > 0)
        } else {
          fotos.value = []
        }
      }
      
      console.log('📸 Fotos finales:', fotos.value.length)
      
      // Firma ya viene como base64
      firma.value = inspeccion.value.firma || ''
      
      console.log('✅ Inspección cargada desde API')
    } catch (apiError) {
      // Si no hay conexión, intentar cargar desde IndexedDB
      console.warn('⚠️ API no disponible, cargando desde IndexedDB...')
      
      const localInspeccion = await db.inspecciones
        .where('remoteId')
        .equals(Number(inspeccionId))
        .first()
      
      if (!localInspeccion) {
        throw new Error('Inspección no encontrada')
      }
      
      inspeccion.value = localInspeccion
      
      // Convertir fotos de Blobs a base64
      const fotosTemp: string[] = []
      for (let i = 0; i < 10; i++) {
        const fotoKey = `foto${i}` as keyof typeof localInspeccion
        const foto = localInspeccion[fotoKey]
        if (foto instanceof Blob) {
          const fotoBase64 = await blobToBase64(foto)
          fotosTemp.push(fotoBase64)
        }
      }
      fotos.value = fotosTemp
      
      console.log(`📸 ${fotosTemp.length} fotos cargadas desde IndexedDB`)
      
      // Convertir firma de Blob a base64
      if (localInspeccion.firma instanceof Blob) {
        firma.value = await blobToBase64(localInspeccion.firma)
      }
      
      console.log('✅ Inspección cargada desde IndexedDB')
    }
  } catch (err: any) {
    console.error('Error cargando inspección:', err)
    error.value = err.message || 'Error al cargar la inspección'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarInspeccion()
})
</script>

<style scoped>
.detalle-inspeccion {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: #FFD700;
  padding: 20px;
  border-radius: 10px;
}

header h1 {
  margin: 0;
  color: #000;
}

header button {
  padding: 10px 20px;
  background: #000;
  color: #FFD700;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
}

.loading, .error {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.error {
  background: #ffebee;
  color: #c62828;
}

.detalle-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.seccion {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.seccion h2 {
  margin: 0 0 20px 0;
  color: #333;
  border-bottom: 3px solid #FFD700;
  padding-bottom: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item strong {
  color: #666;
  font-size: 14px;
}

.info-item span {
  color: #000;
  font-size: 16px;
}

.capitalize {
  text-transform: capitalize;
}

.badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.badge.pendiente {
  background: #fff3cd;
  color: #856404;
}

.badge.en_progreso {
  background: #cce5ff;
  color: #004085;
}

.badge.completada {
  background: #d4edda;
  color: #155724;
}

.observaciones {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  border-left: 4px solid #FFD700;
  margin: 0;
  white-space: pre-wrap;
}

.btn-mapa {
  display: inline-block;
  margin-top: 15px;
  padding: 12px 24px;
  background: #4285f4;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: 600;
}

.btn-mapa:hover {
  background: #3367d6;
}

.fotos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.foto-item {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #ddd;
  transition: transform 0.2s, box-shadow 0.2s;
}

.foto-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.foto-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.firma-container {
  max-width: 500px;
  margin: 0 auto;
  border: 2px solid #000;
  border-radius: 8px;
  padding: 10px;
  background: white;
}

.firma-container img {
  width: 100%;
  display: block;
}

.modal-foto {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-contenido {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.modal-contenido img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.btn-cerrar {
  position: absolute;
  top: -40px;
  right: 0;
  background: #FFD700;
  color: #000;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .detalle-inspeccion {
    padding: 10px;
  }
  
  header {
    flex-direction: column;
    gap: 15px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .fotos-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
