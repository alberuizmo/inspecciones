import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar } from 'quasar'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

// Import Quasar css
import 'quasar/dist/quasar.css'

const app = createApp(App)

// Pinia
app.use(createPinia())

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
    { path: '/inspeccion/:id', component: () => import('./pages/InspeccionPage.vue') }
  ]
})

app.use(router)

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.log('SW registration failed:', err))
  })
}

app.mount('#app')
