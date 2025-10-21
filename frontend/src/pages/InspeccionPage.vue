<template>
  <div class="inspeccion-form">
    <header>
      <h1>Inspección de Poste</h1>
      <button @click="volver">← Volver</button>
    </header>

    <form @submit.prevent="guardarInspeccion">
      <div class="form-group">
        <label>Altura (metros)</label>
        <input v-model.number="inspeccion.altura" type="number" step="0.1" required />
      </div>

      <div class="form-group">
        <label>Estado de la Pintura</label>
        <select v-model="inspeccion.estadoPintura" required>
          <option value="">Seleccione...</option>
          <option value="excelente">Excelente</option>
          <option value="bueno">Bueno</option>
          <option value="regular">Regular</option>
          <option value="malo">Malo</option>
        </select>
      </div>

      <div class="form-group">
        <label>Color del Poste</label>
        <select v-model="inspeccion.colorId" required>
          <option value="">Seleccione...</option>
          <option v-for="color in colores" :key="color.id" :value="color.id">
            {{ color.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>
          <input v-model="inspeccion.funcionando" type="checkbox" />
          ¿Está funcionando?
        </label>
      </div>

      <div class="form-group">
        <label>Estado de la Base</label>
        <select v-model="inspeccion.estadoBase" required>
          <option value="">Seleccione...</option>
          <option value="solida">Sólida</option>
          <option value="deteriorada">Deteriorada</option>
          <option value="requiere_reparacion">Requiere Reparación</option>
        </select>
      </div>

      <div class="form-group">
        <label>Observaciones</label>
        <textarea v-model="inspeccion.observaciones" rows="4"></textarea>
      </div>

      <div class="form-group">
        <label>Ubicación (GPS)</label>
        <button type="button" @click="obtenerUbicacion">Obtener Ubicación</button>
        <p v-if="inspeccion.latReal">
          Lat: {{ inspeccion.latReal }}, Lng: {{ inspeccion.lngReal }}
        </p>
      </div>

      <div class="form-group">
        <label>Fotos del Poste</label>
        <button type="button" @click="tomarFoto">📷 Tomar Foto</button>
        <div v-if="inspeccion.fotos.length > 0">
          <p>{{ inspeccion.fotos.length }} foto(s) capturada(s)</p>
        </div>
      </div>

      <div class="form-group">
        <label>Firma del Técnico</label>
        <canvas ref="canvasFirma" width="400" height="200" 
                @mousedown="iniciarFirma" 
                @mousemove="dibujarFirma" 
                @mouseup="finalizarFirma"
                @touchstart="iniciarFirma"
                @touchmove="dibujarFirma"
                @touchend="finalizarFirma"></canvas>
        <button type="button" @click="limpiarFirma">Limpiar Firma</button>
      </div>

      <button type="submit" class="btn-submit">Guardar Inspección</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../services/api'
import db from '../db/dexie'

const router = useRouter()
const route = useRoute()

const colores = ref<any[]>([])
const canvasFirma = ref<HTMLCanvasElement | null>(null)
let dibujando = false
let ctx: CanvasRenderingContext2D | null = null

const inspeccion = ref({
  altura: null as number | null,
  estadoPintura: '',
  colorId: null as number | null,
  funcionando: false,
  estadoBase: '',
  observaciones: '',
  latReal: null as number | null,
  lngReal: null as number | null,
  fotos: [] as string[],
  firma: ''
})

const volver = () => {
  router.back()
}

const obtenerUbicacion = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        inspeccion.value.latReal = position.coords.latitude
        inspeccion.value.lngReal = position.coords.longitude
      },
      (error) => {
        alert('Error obteniendo ubicación: ' + error.message)
      }
    )
  } else {
    alert('Geolocalización no disponible en este navegador')
  }
}

const tomarFoto = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    const video = document.createElement('video')
    video.srcObject = stream
    video.play()

    // Esperar que el video esté listo
    await new Promise(resolve => {
      video.onloadedmetadata = resolve
    })

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    
    const fotoBase64 = canvas.toDataURL('image/jpeg', 0.8)
    inspeccion.value.fotos.push(fotoBase64)
    
    stream.getTracks().forEach(track => track.stop())
  } catch (error) {
    console.error('Error al tomar foto:', error)
    alert('Error al acceder a la cámara')
  }
}

const iniciarFirma = (e: MouseEvent | TouchEvent) => {
  dibujando = true
  const rect = canvasFirma.value?.getBoundingClientRect()
  if (!rect || !ctx) return
  
  const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
  const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
  
  ctx.beginPath()
  ctx.moveTo(x, y)
}

const dibujarFirma = (e: MouseEvent | TouchEvent) => {
  if (!dibujando || !ctx) return
  e.preventDefault()
  
  const rect = canvasFirma.value?.getBoundingClientRect()
  if (!rect) return
  
  const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
  const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
  
  ctx.lineTo(x, y)
  ctx.stroke()
}

const finalizarFirma = () => {
  dibujando = false
  if (canvasFirma.value) {
    inspeccion.value.firma = canvasFirma.value.toDataURL()
  }
}

const limpiarFirma = () => {
  if (ctx && canvasFirma.value) {
    ctx.clearRect(0, 0, canvasFirma.value.width, canvasFirma.value.height)
    inspeccion.value.firma = ''
  }
}

const guardarInspeccion = async () => {
  // Validar ubicación obligatoria
  if (!inspeccion.value.latReal || !inspeccion.value.lngReal) {
    alert('Debe obtener la ubicación GPS antes de guardar')
    return
  }

  // Validar firma
  if (!inspeccion.value.firma) {
    alert('Debe firmar la inspección')
    return
  }

  try {
    // Guardar en IndexedDB para sincronización posterior
    await db.table('inspecciones').add({
      ...inspeccion.value,
      posteId: Number(route.params.id),
      tecnicoId: 1, // TODO: get from auth store
      fechaEjecucion: new Date().toISOString(),
      estado: 'completada',
      syncStatus: 'pending',
      lastModified: new Date().toISOString()
    })

    alert('Inspección guardada localmente. Se sincronizará cuando haya conexión.')
    router.push('/inspecciones')
  } catch (error) {
    console.error('Error al guardar:', error)
    alert('Error al guardar la inspección')
  }
}

onMounted(async () => {
  // Cargar colores desde API o IndexedDB
  try {
    const response = await api.get('/colores')
    colores.value = response.data
    
    // Guardar en IndexedDB para offline
    await db.table('colores').clear()
    await db.table('colores').bulkAdd(response.data)
  } catch (error) {
    // Si no hay conexión, cargar desde IndexedDB
    colores.value = await db.table('colores').toArray()
  }

  // Inicializar canvas para firma
  if (canvasFirma.value) {
    ctx = canvasFirma.value.getContext('2d')
    if (ctx) {
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
    }
  }

  // Obtener ubicación automáticamente al cargar
  obtenerUbicacion()
})
</script>

<style scoped>
.inspeccion-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}
.form-group {
  margin-bottom: 20px;
}
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
input, select, textarea {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
canvas {
  border: 2px solid #000;
  margin-top: 10px;
  background: white;
  cursor: crosshair;
}
button {
  padding: 10px 20px;
  background: #FFD700;
  border: none;
  cursor: pointer;
  margin-right: 10px;
}
.btn-submit {
  width: 100%;
  font-size: 18px;
  padding: 15px;
  background: #FFD700;
  font-weight: bold;
}
</style>
