import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'supervisor' | 'tecnico'
  companyId: number
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref('')

  const login = async (email: string, password: string) => {
    const resp = await api.post('/auth/login', { email, password })
    token.value = resp.data.token
    user.value = resp.data.user
    
    // Guardar en localStorage
    localStorage.setItem('token', token.value)
    localStorage.setItem('user', JSON.stringify(user.value))
    
    // Set auth header
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  const logout = () => {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
  }

  const loadFromStorage = () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    console.log('Loading from storage:', { 
      hasToken: !!savedToken, 
      hasUser: !!savedUser,
      savedUser: savedUser ? JSON.parse(savedUser) : null
    })
    
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
      console.log('Auth restored from localStorage:', user.value)
    } else {
      console.log('No auth data in localStorage')
    }
  }

  const setUser = (userData: User) => {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
    console.log('User set:', userData)
  }

  const setToken = (tokenValue: string) => {
    token.value = tokenValue
    localStorage.setItem('token', tokenValue)
    api.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`
    console.log('Token set')
  }

  return { user, token, login, logout, loadFromStorage, setUser, setToken }
})
