import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar } from 'quasar'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { useAuthStore } from './stores/auth'

// Import Quasar css
import 'quasar/dist/quasar.css'

const app = createApp(App)

// Pinia
const pinia = createPinia()
app.use(pinia)

// Quasar
app.use(Quasar, {
  config: {}
})

// Router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./pages/LoginPage.vue') },
    { path: '/register', component: () => import('./pages/RegisterPage.vue') },
    { path: '/admin/dashboard', component: () => import('./pages/AdminDashboard.vue') },
    { path: '/supervisor/dashboard', component: () => import('./pages/SupervisorDashboard.vue') },
    { path: '/inspecciones', component: () => import('./pages/InspeccionesPage.vue') },
    { path: '/inspeccion/:id', component: () => import('./pages/InspeccionPage.vue') },
    { path: '/inspeccion/:id/detalle', component: () => import('./pages/DetalleInspeccionPage.vue') }
  ]
})

app.use(router)

// Cargar autenticación desde localStorage DESPUÉS de registrar el router
const authStore = useAuthStore()
authStore.loadFromStorage()

// Navigation guard para proteger rutas
router.beforeEach((to: any, from: any, next: any) => {
  const isAuthenticated = !!authStore.user
  const publicPages = ['/', '/register']
  const authRequired = !publicPages.includes(to.path)

  console.log('Navigation guard:', {
    to: to.path,
    isAuthenticated,
    user: authStore.user
  })

  if (authRequired && !isAuthenticated) {
    // Redirigir al login si intenta acceder a una ruta protegida sin autenticación
    console.log('Not authenticated, redirecting to login')
    return next('/')
  }

  if (isAuthenticated && to.path === '/') {
    // Si ya está autenticado y va al login, redirigir a su dashboard
    const role = authStore.user?.role
    console.log('Already authenticated, redirecting by role:', role)
    if (role === 'admin') {
      return next('/admin/dashboard')
    } else if (role === 'supervisor') {
      return next('/supervisor/dashboard')
    } else if (role === 'tecnico') {
      return next('/inspecciones')
    }
  }

  next()
})

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.log('SW registration failed:', err))
  })
}

app.mount('#app')
