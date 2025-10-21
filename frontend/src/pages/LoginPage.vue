<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Inspecciones de Postes</h1>
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

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? 'Iniciando...' : 'Entrar' }}
        </button>
      </form>

      <div class="register-link">
        ¿Primera vez? <router-link to="/register">Registra tu empresa</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const login = async () => {
  error.value = ''
  loading.value = true

  try {
    await authStore.login(email.value, password.value)
    
    // Redirigir según el rol
    const role = authStore.user?.role
    if (role === 'admin') {
      router.push('/admin/dashboard')
    } else if (role === 'supervisor') {
      router.push('/supervisor/dashboard')
    } else if (role === 'tecnico') {
      router.push('/inspecciones')
    } else {
      router.push('/inspecciones')
    }
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = 'Email o contraseña incorrectos'
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
}

h1 {
  margin: 0 0 10px 0;
  color: #333;
  text-align: center;
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
</style>
