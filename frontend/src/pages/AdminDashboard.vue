<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <h1>Panel de Administración</h1>
      <div class="header-actions">
        <span class="user-info">{{ authStore.user?.name }}</span>
        <button @click="logout" class="btn-logout">Salir</button>
      </div>
    </header>

    <div class="dashboard-content">
      <div class="tabs">
        <button 
          :class="{ active: activeTab === 'users' }" 
          @click="activeTab = 'users'"
        >
          👥 Usuarios
        </button>
        <button 
          :class="{ active: activeTab === 'company' }" 
          @click="activeTab = 'company'"
        >
          🏢 Empresa
        </button>
      </div>

      <!-- Tab de Usuarios -->
      <div v-if="activeTab === 'users'" class="tab-content">
        <div class="section-header">
          <h2>Gestión de Usuarios</h2>
          <button @click="showCreateUserModal = true" class="btn-primary">
            + Crear Usuario
          </button>
        </div>

        <div class="users-list">
          <div v-if="users.length === 0" class="empty-state">
            <p>No hay usuarios registrados</p>
            <button @click="showCreateUserModal = true" class="btn-primary">
              Crear primer usuario
            </button>
          </div>

          <table v-else class="users-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span :class="['role-badge', user.role]">
                    {{ roleLabel(user.role) }}
                  </span>
                </td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td>
                  <button @click="deleteUser(user.id)" class="btn-danger-sm">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab de Empresa -->
      <div v-if="activeTab === 'company'" class="tab-content">
        <h2>Información de la Empresa</h2>
        <div class="company-info">
          <p>Funcionalidad en desarrollo...</p>
        </div>
      </div>
    </div>

    <!-- Modal Crear Usuario -->
    <div v-if="showCreateUserModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>Crear Nuevo Usuario</h2>
        
        <form @submit.prevent="createUser">
          <div class="form-group">
            <label>Nombre Completo</label>
            <input v-model="newUser.name" type="text" required />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input v-model="newUser.email" type="email" required />
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <input v-model="newUser.password" type="password" required minlength="6" />
          </div>

          <div class="form-group">
            <label>Rol</label>
            <select v-model="newUser.role" required>
              <option value="">Seleccione un rol</option>
              <option value="supervisor">Supervisor</option>
              <option value="tecnico">Técnico</option>
            </select>
          </div>

          <div v-if="modalError" class="error-message">
            {{ modalError }}
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="modalLoading">
              {{ modalLoading ? 'Creando...' : 'Crear Usuario' }}
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

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('users')
const users = ref<any[]>([])
const showCreateUserModal = ref(false)
const modalLoading = ref(false)
const modalError = ref('')

const newUser = ref({
  name: '',
  email: '',
  password: '',
  role: ''
})

const logout = () => {
  authStore.logout()
  router.push('/')
}

const roleLabel = (role: string) => {
  const labels: any = {
    admin: 'Administrador',
    supervisor: 'Supervisor',
    tecnico: 'Técnico'
  }
  return labels[role] || role
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES')
}

const loadUsers = async () => {
  try {
    const companyId = authStore.user?.companyId
    if (!companyId) {
      console.error('No se encontró companyId')
      return
    }

    const response = await api.get(`/users?companyId=${companyId}`)
    users.value = response.data
  } catch (error) {
    console.error('Error cargando usuarios:', error)
  }
}

const createUser = async () => {
  modalError.value = ''
  modalLoading.value = true

  try {
    await api.post('/auth/register', {
      ...newUser.value,
      companyId: authStore.user?.companyId || 1
    })

    // Recargar lista
    await loadUsers()

    // Cerrar modal y limpiar
    closeModal()
    alert('Usuario creado exitosamente')
  } catch (err: any) {
    console.error('Error creando usuario:', err)
    modalError.value = err.response?.data?.error || 'Error al crear usuario'
  } finally {
    modalLoading.value = false
  }
}

const deleteUser = async (userId: number) => {
  if (!confirm('¿Estás seguro de eliminar este usuario?')) return

  try {
    const companyId = authStore.user?.companyId
    if (!companyId) {
      alert('Error: No se encontró información de la empresa')
      return
    }

    await api.delete(`/users/${userId}?companyId=${companyId}`)
    await loadUsers()
    alert('Usuario eliminado')
  } catch (error: any) {
    console.error('Error eliminando usuario:', error)
    const errorMsg = error.response?.data?.error || 'Error al eliminar usuario'
    alert(errorMsg)
  }
}

const closeModal = () => {
  showCreateUserModal.value = false
  modalError.value = ''
  newUser.value = {
    name: '',
    email: '',
    password: '',
    role: ''
  }
}

onMounted(() => {
  // Verificar que sea admin
  if (authStore.user?.role !== 'admin') {
    router.push('/')
    return
  }
  
  loadUsers()
})
</script>

<style scoped>
.admin-dashboard {
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

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.users-table th {
  background: #f9f9f9;
  font-weight: 600;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.role-badge.admin {
  background: #ffebee;
  color: #c62828;
}

.role-badge.supervisor {
  background: #e3f2fd;
  color: #1565c0;
}

.role-badge.tecnico {
  background: #e8f5e9;
  color: #2e7d32;
}

.btn-primary {
  padding: 12px 24px;
  background: #FFD700;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
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

/* Modal */
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
</style>
