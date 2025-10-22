<template>
  <div class="supervisor-dashboard">
    <header class="dashboard-header">
      <h1>Panel de Supervisor</h1>
      <div class="header-actions">
        <span class="user-info">{{ authStore.user?.name }}</span>
        <button @click="logout" class="btn-logout">Salir</button>
      </div>
    </header>

    <div class="dashboard-content">
      <div class="tabs">
        <button 
          :class="{ active: activeTab === 'postes' }" 
          @click="activeTab = 'postes'"
        >
          💡 Postes
        </button>
        <button 
          :class="{ active: activeTab === 'tareas' }" 
          @click="activeTab = 'tareas'"
        >
          📋 Tareas
        </button>
      </div>

      <!-- Tab de Postes -->
      <div v-if="activeTab === 'postes'" class="tab-content">
        <div class="section-header">
          <h2>Gestión de Postes</h2>
          <button @click="showCreatePosteModal = true" class="btn-primary">
            + Crear Poste
          </button>
        </div>

        <div class="postes-list">
          <div v-if="postes.length === 0" class="empty-state">
            <p>No hay postes registrados</p>
            <button @click="showCreatePosteModal = true" class="btn-primary">
              Crear primer poste
            </button>
          </div>

          <table v-else class="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Dirección</th>
                <th>Tipo</th>
                <th>Ubicación (GPS)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="poste in postes" :key="poste.id">
                <td><strong>{{ poste.codigo }}</strong></td>
                <td>{{ poste.direccion }}</td>
                <td>{{ poste.tipo }}</td>
                <td>{{ poste.lat.toFixed(4) }}, {{ poste.lng.toFixed(4) }}</td>
                <td>
                  <button @click="asignarTarea(poste)" class="btn-success-sm">
                    Asignar
                  </button>
                  <button @click="editPoste(poste)" class="btn-edit-sm">
                    Editar
                  </button>
                  <button @click="deletePoste(poste.id)" class="btn-danger-sm">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab de Tareas -->
      <div v-if="activeTab === 'tareas'" class="tab-content">
        <div class="section-header">
          <h2>Tareas Asignadas</h2>
        </div>

        <div class="tareas-list">
          <div v-if="tareas.length === 0" class="empty-state">
            <p>No hay tareas asignadas</p>
          </div>

          <table v-else class="data-table">
            <thead>
              <tr>
                <th>Poste</th>
                <th>Técnico</th>
                <th>Fecha Asignación</th>
                <th>Estado</th>
                <th>Fecha Ejecución</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tarea in tareas" :key="tarea.id">
                <td>{{ tarea.posteCodigo }}</td>
                <td>{{ tarea.tecnicoNombre }}</td>
                <td>{{ formatDate(tarea.fechaAsignacion) }}</td>
                <td>
                  <span :class="['status-badge', tarea.estado]">
                    {{ estadoLabel(tarea.estado) }}
                  </span>
                </td>
                <td>{{ tarea.fechaEjecucion ? formatDate(tarea.fechaEjecucion) : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar Poste -->
    <div v-if="showCreatePosteModal" class="modal-overlay" @click="closePosteModal">
      <div class="modal-content" @click.stop>
        <h2>{{ editingPoste ? 'Editar Poste' : 'Crear Nuevo Poste' }}</h2>
        
        <form @submit.prevent="savePoste">
          <div class="form-group">
            <label>Código del Poste *</label>
            <input v-model="posteForm.codigo" type="text" placeholder="P-001" required />
          </div>

          <div class="form-group">
            <label>Dirección *</label>
            <input v-model="posteForm.direccion" type="text" placeholder="Calle 26 con Carrera 7" required />
          </div>

          <div class="form-group">
            <label>Tipo *</label>
            <select v-model="posteForm.tipo" required>
              <option value="">Seleccione tipo</option>
              <option value="Metálico">Metálico</option>
              <option value="Concreto">Concreto</option>
              <option value="Madera">Madera</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Latitud *</label>
              <input v-model.number="posteForm.lat" type="number" step="0.0001" required />
            </div>

            <div class="form-group">
              <label>Longitud *</label>
              <input v-model.number="posteForm.lng" type="number" step="0.0001" required />
            </div>
          </div>

          <div v-if="modalError" class="error-message">
            {{ modalError }}
          </div>

          <div class="modal-actions">
            <button type="button" @click="closePosteModal" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="modalLoading">
              {{ modalLoading ? 'Guardando...' : 'Guardar Poste' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Asignar Tarea -->
    <div v-if="showAsignarTareaModal" class="modal-overlay" @click="closeAsignarModal">
      <div class="modal-content" @click.stop>
        <h2>Asignar Inspección</h2>
        <p class="subtitle">Poste: <strong>{{ selectedPoste?.codigo }}</strong></p>
        
        <form @submit.prevent="crearTarea">
          <div class="form-group">
            <label>Técnico *</label>
            <select v-model="tareaForm.tecnicoId" required>
              <option value="">Seleccione un técnico</option>
              <option v-for="tecnico in tecnicos" :key="tecnico.id" :value="tecnico.id">
                {{ tecnico.name }}
              </option>
            </select>
          </div>

          <div v-if="modalError" class="error-message">
            {{ modalError }}
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeAsignarModal" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="modalLoading">
              {{ modalLoading ? 'Asignando...' : 'Asignar Tarea' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import { db, savePostesToLocal } from '../db/dexie'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('postes')
const postes = ref<any[]>([])
const tareas = ref<any[]>([])
const tecnicos = ref<any[]>([])

const showCreatePosteModal = ref(false)
const showAsignarTareaModal = ref(false)
const modalLoading = ref(false)
const modalError = ref('')
const editingPoste = ref<any>(null)
const selectedPoste = ref<any>(null)

const posteForm = ref({
  codigo: '',
  direccion: '',
  tipo: '',
  lat: 0,
  lng: 0
})

const tareaForm = ref({
  tecnicoId: ''
})

const logout = () => {
  authStore.logout()
  router.push('/')
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
  return new Date(date).toLocaleDateString('es-ES')
}

const loadPostes = async () => {
  try {
    const companyId = authStore.user?.companyId
    
    try {
      const response = await api.get(`/postes?companyId=${companyId}`)
      postes.value = response.data
      
      // Guardar en IndexedDB para uso offline
      await savePostesToLocal(response.data)
      console.log(`✅ ${postes.value.length} postes cargados y guardados localmente`)
    } catch (apiError) {
      console.warn('⚠️ API no disponible, cargando postes desde IndexedDB...')
      const localPostes = await db.postes.toArray()
      postes.value = localPostes.map(p => ({
        id: p.remoteId || p.id,
        codigo: p.codigo,
        direccion: p.direccion,
        tipo: p.tipo,
        lat: p.lat,
        lng: p.lng,
        companyId: p.companyId
      }))
      console.log(`💾 ${postes.value.length} postes cargados desde IndexedDB`)
    }
  } catch (error) {
    console.error('Error cargando postes:', error)
  }
}

const loadTareas = async () => {
  try {
    const supervisorId = authStore.user?.id
    const response = await api.get(`/inspecciones/supervisor/${supervisorId}`)
    tareas.value = response.data
  } catch (error) {
    console.error('Error cargando tareas:', error)
  }
}

const loadTecnicos = async () => {
  try {
    const companyId = authStore.user?.companyId
    const response = await api.get(`/users?companyId=${companyId}`)
    tecnicos.value = response.data.filter((u: any) => u.role === 'tecnico')
  } catch (error) {
    console.error('Error cargando técnicos:', error)
  }
}

const savePoste = async () => {
  modalError.value = ''
  modalLoading.value = true

  try {
    const companyId = authStore.user?.companyId
    const dataToSend = { ...posteForm.value, companyId }

    if (editingPoste.value) {
      await api.put(`/postes/${editingPoste.value.id}`, dataToSend)
      alert('Poste actualizado')
    } else {
      await api.post('/postes', dataToSend)
      alert('Poste creado')
    }

    await loadPostes()
    closePosteModal()
  } catch (err: any) {
    console.error('Error guardando poste:', err)
    modalError.value = err.response?.data?.error || 'Error al guardar poste'
  } finally {
    modalLoading.value = false
  }
}

const editPoste = (poste: any) => {
  editingPoste.value = poste
  posteForm.value = { ...poste }
  showCreatePosteModal.value = true
}

const deletePoste = async (posteId: number) => {
  if (!confirm('¿Estás seguro de eliminar este poste?')) return

  try {
    const companyId = authStore.user?.companyId
    await api.delete(`/postes/${posteId}?companyId=${companyId}`)
    await loadPostes()
    alert('Poste eliminado')
  } catch (error: any) {
    console.error('Error eliminando poste:', error)
    const errorMsg = error.response?.data?.error || 'Error al eliminar poste'
    alert(errorMsg)
  }
}

const asignarTarea = (poste: any) => {
  selectedPoste.value = poste
  showAsignarTareaModal.value = true
}

const crearTarea = async () => {
  modalError.value = ''
  modalLoading.value = true

  try {
    await api.post('/inspecciones', {
      posteId: selectedPoste.value.id,
      tecnicoId: tareaForm.value.tecnicoId,
      supervisorId: authStore.user?.id,
      estado: 'pendiente'
    })

    alert('Tarea asignada exitosamente')
    await loadTareas()
    closeAsignarModal()
  } catch (err: any) {
    console.error('Error asignando tarea:', err)
    modalError.value = err.response?.data?.error || 'Error al asignar tarea'
  } finally {
    modalLoading.value = false
  }
}

const closePosteModal = () => {
  showCreatePosteModal.value = false
  editingPoste.value = null
  modalError.value = ''
  posteForm.value = {
    codigo: '',
    direccion: '',
    tipo: '',
    lat: 0,
    lng: 0
  }
}

const closeAsignarModal = () => {
  showAsignarTareaModal.value = false
  selectedPoste.value = null
  modalError.value = ''
  tareaForm.value = {
    tecnicoId: ''
  }
}

onMounted(() => {
  // Verificar que sea supervisor
  if (authStore.user?.role !== 'supervisor') {
    router.push('/')
    return
  }

  loadPostes()
  loadTareas()
  loadTecnicos()
})
</script>

<style scoped>
h2 {
  font-size: 1.8rem;
}
.supervisor-dashboard {
  min-height: 100vh;
  background: #f5f5f5;
}

.dashboard-header {
  background: #FFD700;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.dashboard-header h1 {
  margin: 0;
  color: #000;
  font-size: 1.8rem;
}

.header-actions {
  display: flex;
  gap: 20px;
  align-items: center;
}

.user-info {
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

.dashboard-content {
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

.tab-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #f9f9f9;
  font-weight: 600;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.status-badge.pendiente {
  background: #fff3cd;
  color: #856404;
}

.status-badge.en_progreso {
  background: #cce5ff;
  color: #004085;
}

.status-badge.completada {
  background: #d4edda;
  color: #155724;
}

.btn-primary {
  padding: 12px 24px;
  background: #FFD700;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
}

.btn-success-sm {
  padding: 6px 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 5px;
}

.btn-edit-sm {
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 5px;
}

.btn-danger-sm {
  padding: 6px 12px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.subtitle {
  color: #666;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 15px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-secondary {
  padding: 10px 20px;
  background: #eee;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* Media Queries para Móvil */
@media (max-width: 768px) {
  .dashboard-header {
    padding: 15px 20px;
    flex-direction: column;
    gap: 15px;
  }

  .dashboard-header h1 {
    font-size: 1.4rem;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
    gap: 10px;
  }

  .user-info {
    font-size: 14px;
  }

  .btn-logout {
    padding: 8px 16px;
    font-size: 14px;
  }

  .dashboard-content {
    padding: 20px 15px;
  }

  .tabs {
    flex-direction: column;
    gap: 8px;
  }

  .tabs button {
    width: 100%;
    padding: 12px 16px;
    font-size: 15px;
  }

  .tab-content {
    padding: 20px 15px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .section-header h2 {
    font-size: 1.2rem;
  }

  .btn-primary {
    width: 100%;
    padding: 10px 20px;
    font-size: 15px;
  }

  .data-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  .data-table th,
  .data-table td {
    padding: 10px 8px;
    font-size: 14px;
  }

  .btn-success-sm,
  .btn-edit-sm,
  .btn-danger-sm {
    padding: 5px 10px;
    font-size: 12px;
    margin-right: 3px;
  }

  .modal-content {
    padding: 25px 20px;
    max-width: 95%;
  }

  .modal-content h2 {
    font-size: 1.3rem;
  }

  .subtitle {
    font-size: 14px;
  }

  .form-group input,
  .form-group select {
    font-size: 15px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .dashboard-header h1 {
    font-size: 1.2rem;
  }

  .section-header h2 {
    font-size: 1.1rem;
  }

  .tabs button {
    font-size: 14px;
    padding: 10px 14px;
  }

  .data-table th,
  .data-table td {
    font-size: 13px;
    padding: 8px 6px;
  }

  .status-badge {
    font-size: 12px;
    padding: 3px 10px;
  }

  .modal-content h2 {
    font-size: 1.1rem;
  }
}
</style>
