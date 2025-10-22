<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Indicador de estado offline -->
      <div v-if="isOffline" class="offline-banner">
        ⚠️ Sin conexión a internet
      </div>

      <h1 style="">Inspecciones de Postes</h1>
      <p class="subtitle">Sistema de gestión de inspecciones</p>
      
      <form @submit.prevent="login">
        <div class="form-group">
          <label>Email</label>
          <input v-model="email" type="email" placeholder="tu@email.com" required />
        </div>
        
        <div class="form-group">
          <label>Contraseña</label>
          <input v-model="password" type="password" placeholder="Contraseña" required />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn-login" :disabled="loading || isOffline">
          {{ loading ? 'Iniciando...' : isOffline ? '⚠️ Sin conexión' : 'Entrar' }}
        </button>
      </form>

      <div class="register-link">
        ¿Primera vez? <router-link to="/register">Registra tu empresa</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const isOffline = ref(!navigator.onLine)

// Detectar cambios en el estado de conexión
const updateOnlineStatus = () => {
  isOffline.value = !navigator.onLine
}

onMounted(() => {
  // Si ya hay sesión guardada, redirigir
  if (authStore.user) {
    redirectByRole(authStore.user.role)
  }

  // Listeners para estado offline/online
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

const redirectByRole = (role: string) => {
  if (role === 'admin') {
    router.push('/admin/dashboard')
  } else if (role === 'supervisor') {
    router.push('/supervisor/dashboard')
  } else if (role === 'tecnico') {
    router.push('/inspecciones')
  } else {
    router.push('/inspecciones')
  }
}

const login = async () => {
  error.value = ''
  
  // Verificar si está offline
  if (isOffline.value) {
    error.value = '⚠️ No hay conexión a internet. El login requiere conexión para validar credenciales.'
    return
  }

  loading.value = true

  try {
    await authStore.login(email.value, password.value)
    
    // Redirigir según el rol
    const role = authStore.user?.role
    redirectByRole(role || 'tecnico')
  } catch (err: any) {
    console.error('Login error:', err)
    
    if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
      error.value = '⚠️ No se puede conectar al servidor. Verifica tu conexión.'
    } else {
      error.value = 'Email o contraseña incorrectos'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 100%;
  position: relative;
}

.offline-banner {
  background: #ff9800;
  color: white;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  font-weight: 600;
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

h1 {
  margin: 0 0 10px 0;
  color: #333;
  text-align: center;
  font-size: clamp(1.5rem, 4vw, 2rem);
  line-height: 1.2;
}

.subtitle {
  color: #666;
  text-align: center;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

input {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 5px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #FFD700;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 15px;
  text-align: center;
}

.btn-login {
  width: 100%;
  padding: 15px;
  background: #FFD700;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  color: #000;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-login:hover:not(:disabled) {
  background: #FFA500;
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.register-link a {
  color: #FFD700;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}

/* Media Queries para Móvil */
@media (max-width: 768px) {
  .login-page {
    padding: 20px;
    align-items: flex-start;
    padding-top: 40px;
  }

  .login-card {
    padding: 30px 25px;
    max-width: 100%;
  }

  h1 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 14px;
    margin-bottom: 25px;
  }

  .form-group {
    margin-bottom: 18px;
  }

  label {
    font-size: 14px;
  }

  input {
    padding: 12px;
    font-size: 16px;
  }

  .btn-login {
    padding: 14px;
    font-size: 15px;
  }

  .offline-banner {
    font-size: 14px;
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 15px;
    padding-top: 30px;
  }

  .login-card {
    padding: 25px 20px;
  }

  h1 {
    font-size: 1.3rem;
  }

  .subtitle {
    font-size: 13px;
  }

  input {
    padding: 10px;
    font-size: 15px;
  }

  .btn-login {
    padding: 12px;
    font-size: 14px;
  }

  .register-link {
    font-size: 14px;
  }
}
</style>
