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
        <input 
          type="file" 
          accept="image/*" 
          multiple 
          capture="environment"
          @change="seleccionarFotos"
          ref="inputFotos"
        />
        <div v-if="inspeccion.fotos.length > 0" class="fotos-preview">
          <p>{{ inspeccion.fotos.length }} foto(s) seleccionada(s)</p>
          <div class="fotos-grid">
            <div v-for="(foto, index) in inspeccion.fotos" :key="index" class="foto-item">
              <img :src="foto" alt="Foto" />
              <button type="button" @click="eliminarFoto(index)">❌</button>
            </div>
          </div>
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
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import { db, saveColoresToLocal } from '../db/dexie'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const inspeccionId = ref<number>(0)
const posteId = ref<number>(0)
const posteCodigo = ref<string>('')
const posteUbicacion = ref<string>('')
const colores = ref<any[]>([])
const inputFotos = ref<HTMLInputElement | null>(null)
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

const seleccionarFotos = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (!files || files.length === 0) return
  
  console.log(`📸 Procesando ${files.length} foto(s)...`)
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    console.log(`📸 Archivo ${i + 1}: ${file.name}, Tamaño: ${(file.size / 1024).toFixed(2)} KB`)
    
    // Limitar tamaño de archivo a 5MB (aumentado)
    if (file.size > 5 * 1024 * 1024) {
      alert(`La foto ${file.name} es muy grande (máx 5MB)`)
      continue
    }
    
    try {
      // Redimensionar y comprimir la imagen (más calidad: 0.8)
      const fotoBase64 = await redimensionarImagen(file, 1200, 0.8)
      inspeccion.value.fotos.push(fotoBase64)
      console.log(`✅ Foto ${i + 1} agregada - Tamaño final: ${(fotoBase64.length / 1024).toFixed(2)} KB`)
    } catch (error) {
      console.error('❌ Error procesando foto:', error)
      alert('Error al procesar la foto: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    }
  }
  
  console.log(`📸 Total de fotos agregadas: ${inspeccion.value.fotos.length}`)
  
  // Limpiar input para permitir seleccionar las mismas fotos de nuevo
  if (inputFotos.value) {
    inputFotos.value.value = ''
  }
}

const redimensionarImagen = (file: File, maxWidth: number, quality: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Redimensionar manteniendo proporción
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('No se pudo obtener contexto del canvas'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convertir a base64 con compresión
        const base64 = canvas.toDataURL('image/jpeg', quality)
        resolve(base64)
      }
      
      img.onerror = () => reject(new Error('Error cargando imagen'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Error leyendo archivo'))
    reader.readAsDataURL(file)
  })
}

const eliminarFoto = (index: number) => {
  inspeccion.value.fotos.splice(index, 1)
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
    const tecnicoId = authStore.user?.id
    if (!tecnicoId) {
      throw new Error('No se encontró el ID del técnico')
    }

    // Intentar guardar en servidor primero
    try {
      // Para el servidor, crear objeto limpio
      const dataParaServidor = {
        fechaEjecucion: new Date().toISOString(),
        estado: 'completada',
        altura: inspeccion.value.altura,
        estadoPintura: inspeccion.value.estadoPintura,
        colorId: inspeccion.value.colorId,
        funcionando: inspeccion.value.funcionando,
        estadoBase: inspeccion.value.estadoBase,
        observaciones: inspeccion.value.observaciones,
        fotos: JSON.stringify(inspeccion.value.fotos), // JSON string para API
        latReal: inspeccion.value.latReal,
        lngReal: inspeccion.value.lngReal,
        firma: inspeccion.value.firma
      }
      
      console.log('📤 Enviando inspección al servidor:', dataParaServidor)
      console.log('📸 Número de fotos:', inspeccion.value.fotos.length)
      
      // ACTUALIZAR el registro existente con PUT
      await api.put(`/inspecciones/${route.params.id}`, dataParaServidor)
      alert('✅ Inspección guardada exitosamente')
      router.push('/inspecciones')
    } catch (apiError) {
      // Si falla la API, guardar solo en IndexedDB
      console.warn('⚠️ No hay conexión, guardando solo localmente...', apiError)
      
      try {
        console.log('💾 Guardando inspección offline...')
        
        // Buscar si ya existe una inspección local con este remoteId
        const inspeccionExistente = await db.inspecciones
          .where('remoteId')
          .equals(inspeccionId.value)
          .first()
        
        let localId: number
        
        if (inspeccionExistente) {
          // ACTUALIZAR el registro existente
          console.log(`🔄 Actualizando inspección local existente (ID: ${inspeccionExistente.id})`)
          localId = inspeccionExistente.id!
          
          await db.inspecciones.update(localId, {
            fechaEjecucion: String(new Date().toISOString()),
            estado: 'completada' as const,
            altura: inspeccion.value.altura ? parseFloat(String(inspeccion.value.altura)) : null,
            estadoPintura: String(inspeccion.value.estadoPintura || ''),
            colorId: inspeccion.value.colorId ? parseInt(String(inspeccion.value.colorId)) : null,
            funcionando: Boolean(inspeccion.value.funcionando),
            estadoBase: String(inspeccion.value.estadoBase || ''),
            observaciones: String(inspeccion.value.observaciones || ''),
            latReal: parseFloat(String(inspeccion.value.latReal)),
            lngReal: parseFloat(String(inspeccion.value.lngReal)),
            syncStatus: 'pending' as const,
            lastModified: String(new Date().toISOString()),
            fotosCount: inspeccion.value.fotos.length,
            posteCodigo: posteCodigo.value,
            posteUbicacion: posteUbicacion.value
          })
          
          console.log('✅ Inspección actualizada')
        } else {
          // CREAR nuevo registro solo si no existe
          console.log('➕ Creando nueva inspección local')
          
          const plainObject: any = {
            remoteId: inspeccionId.value,
            posteId: posteId.value,
            posteCodigo: posteCodigo.value,
            posteUbicacion: posteUbicacion.value,
            tecnicoId: parseInt(String(tecnicoId)),
            supervisorId: null,
            fechaAsignacion: String(new Date().toISOString()),
            fechaEjecucion: String(new Date().toISOString()),
            estado: 'completada' as const,
            altura: inspeccion.value.altura ? parseFloat(String(inspeccion.value.altura)) : null,
            estadoPintura: String(inspeccion.value.estadoPintura || ''),
            colorId: inspeccion.value.colorId ? parseInt(String(inspeccion.value.colorId)) : null,
            funcionando: Boolean(inspeccion.value.funcionando),
            estadoBase: String(inspeccion.value.estadoBase || ''),
            observaciones: String(inspeccion.value.observaciones || ''),
            latReal: parseFloat(String(inspeccion.value.latReal)),
            lngReal: parseFloat(String(inspeccion.value.lngReal)),
            syncStatus: 'pending' as const,
            lastModified: String(new Date().toISOString()),
            fotosCount: inspeccion.value.fotos.length
          }
          
          localId = await db.inspecciones.add(plainObject) as number
          console.log('✅ Inspección creada con ID:', localId)
        }
        
        // Guardar firma como blob si existe
        if (inspeccion.value.firma) {
          console.log('📝 Guardando firma como blob...')
          const base64Data = inspeccion.value.firma.split(',')[1]
          const byteCharacters = atob(base64Data)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const firmaBlob = new Blob([byteArray], { type: 'image/png' })
          await db.inspecciones.update(localId, { firma: firmaBlob })
          console.log('✅ Firma guardada')
        }
        
        // Guardar fotos como blobs si existen
        if (inspeccion.value.fotos.length > 0) {
          console.log(`📸 Guardando ${inspeccion.value.fotos.length} fotos...`)
          
          // Limpiar fotos antiguas primero
          const updateClearFotos: Record<string, undefined> = {}
          for (let i = 0; i < 10; i++) {
            updateClearFotos[`foto${i}`] = undefined
          }
          await db.inspecciones.update(localId, updateClearFotos)
          
          // Guardar cada foto por separado
          for (let i = 0; i < inspeccion.value.fotos.length; i++) {
            const fotoBase64 = inspeccion.value.fotos[i]
            const base64Data = fotoBase64.split(',')[1]
            const byteCharacters = atob(base64Data)
            const byteNumbers = new Array(byteCharacters.length)
            for (let j = 0; j < byteCharacters.length; j++) {
              byteNumbers[j] = byteCharacters.charCodeAt(j)
            }
            const byteArray = new Uint8Array(byteNumbers)
            const fotoBlob = new Blob([byteArray], { type: 'image/jpeg' })
            
            // Guardar cada foto en un campo separado
            const updateObj: Record<string, Blob> = {}
            updateObj[`foto${i}`] = fotoBlob
            await db.inspecciones.update(localId, updateObj)
            console.log(`✅ Foto ${i + 1} guardada`)
          }
        }
        
        alert('💾 Inspección guardada localmente. Se sincronizará cuando haya conexión.')
        router.push('/inspecciones')
      } catch (dbError) {
        console.error('❌ Error de IndexedDB:', dbError)
        alert('Error al guardar offline: ' + (dbError instanceof Error ? dbError.message : 'Error desconocido'))
      }
    }
  } catch (error) {
    console.error('Error al guardar:', error)
    alert('❌ Error al guardar la inspección: ' + (error instanceof Error ? error.message : 'Error desconocido'))
  }
}

onMounted(async () => {
  // Cargar la inspección asignada para obtener el posteId
  try {
    const response = await api.get(`/inspecciones/${route.params.id}`)
    inspeccionId.value = response.data.id
    posteId.value = response.data.posteId
    posteCodigo.value = response.data.posteCodigo || `Poste #${response.data.posteId}`
    posteUbicacion.value = response.data.posteUbicacion || ''
    console.log(`📋 Inspección cargada - ID: ${inspeccionId.value}, Poste: ${posteCodigo.value}`)
  } catch (error) {
    console.error('Error cargando inspección:', error)
    alert('Error al cargar la inspección')
    router.push('/inspecciones')
    return
  }

  // Cargar colores desde API o IndexedDB
  try {
    const response = await api.get('/colores')
    colores.value = response.data
    
    // Guardar en IndexedDB para offline
    await saveColoresToLocal(response.data)
  } catch (error) {
    // Si no hay conexión, cargar desde IndexedDB
    console.warn('⚠️ Cargando colores desde IndexedDB...')
    const localColores = await db.colores.toArray()
    colores.value = localColores.map(c => ({
      id: c.remoteId || c.id,
      name: c.name
    }))
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
input[type="file"] {
  padding: 5px;
}
.fotos-preview {
  margin-top: 15px;
}
.fotos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 10px;
}
.foto-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #ddd;
}
.foto-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.foto-item button {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 12px;
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
