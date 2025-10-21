<template>
  <div class="register-page">
    <div class="register-card">
      <h1>Registro de Administrador</h1>
      <p class="subtitle">Crea tu cuenta de administrador para empezar</p>

      <form @submit.prevent="register">
        <div class="form-group">
          <label>Nombre de la Empresa</label>
          <input 
            v-model="form.companyName" 
            type="text" 
            placeholder="Ej: Alumbrado Municipal" 
            required 
          />
        </div>

        <div class="form-group">
          <label>Tu Nombre Completo</label>
          <input 
            v-model="form.name" 
            type="text" 
            placeholder="Ej: Juan Pérez" 
            required 
          />
        </div>

        <div class="form-group">
          <label>Email Corporativo</label>
          <input 
            v-model="form.email" 
            type="email" 
            placeholder="admin@empresa.com" 
            required 
          />
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="Mínimo 6 caracteres" 
            required 
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label>Confirmar Contraseña</label>
          <input 
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="Confirma tu contraseña" 
            required 
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Registrando...' : 'Crear Cuenta de Administrador' }}
        </button>
      </form>

      <div class="login-link">
        ¿Ya tienes cuenta? <router-link to="/">Inicia sesión</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  companyName: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const error = ref('')
const loading = ref(false)

const register = async () => {
  error.value = ''

  // Validaciones
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Las contraseñas no coinciden'
    return
  }

  if (form.value.password.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  loading.value = true

  try {
    // Registrar admin
    await api.post('/auth/register', {
      email: form.value.email,
      name: form.value.name,
      password: form.value.password,
      role: 'admin',
      companyId: Date.now() // Temporal, luego se puede mejorar
    })

    // Login automático
    await authStore.login(form.value.email, form.value.password)

    // Redirigir al dashboard de admin
    router.push('/admin/dashboard')
  } catch (err: any) {
    console.error('Error en registro:', err)
    error.value = err.response?.data?.error || 'Error al crear la cuenta'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  padding: 20px;
}

.register-card {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  max-width: 500px;
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

.btn-primary {
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

.btn-primary:hover:not(:disabled) {
  background: #FFA500;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.login-link a {
  color: #FFD700;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
