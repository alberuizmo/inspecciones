<template>
  <div>
    <!-- Banner persistente cuando está offline -->
    <transition name="slide-down">
      <div v-if="isOffline" class="offline-indicator">
        <div class="indicator-content">
          <span class="icon">📡</span>
          <span class="text">Trabajando sin conexión</span>
          <span class="pulse"></span>
        </div>
      </div>
    </transition>

    <!-- Toast de notificación cuando cambia el estado -->
    <transition name="fade">
      <div v-if="showToast" :class="['toast-notification', toastType]">
        <span class="toast-icon">{{ toastIcon }}</span>
        <span class="toast-message">{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isOffline = ref(!navigator.onLine)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'online' | 'offline'>('offline')
const toastIcon = ref('🔴')

let toastTimeout: number | null = null

const showNotification = (message: string, type: 'online' | 'offline', icon: string) => {
  toastMessage.value = message
  toastType.value = type
  toastIcon.value = icon
  showToast.value = true

  // Auto-hide después de 3 segundos
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = window.setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const updateOnlineStatus = () => {
  const wasOffline = isOffline.value
  isOffline.value = !navigator.onLine
  
  // Mostrar notificación cuando cambia el estado
  if (!wasOffline && isOffline.value) {
    console.log('🔴 Conexión perdida - Modo offline activado')
    showNotification('Conexión perdida. Trabajando en modo offline', 'offline', '📡')
  } else if (wasOffline && !isOffline.value) {
    console.log('🟢 Conexión restaurada - Modo online')
    showNotification('Conexión restaurada. Sincronizando datos...', 'online', '✅')
    
    // Trigger sync event
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        if ('sync' in registration) {
          registration.sync.register('sync-inspecciones').catch(console.error)
        }
      })
    }
  }
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  
  // Mostrar estado inicial si está offline
  if (isOffline.value) {
    setTimeout(() => {
      showNotification('Sin conexión a internet', 'offline', '📡')
    }, 500)
  }
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
  if (toastTimeout) clearTimeout(toastTimeout)
})
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  color: white;
  padding: 12px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  font-weight: 600;
}

.indicator-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.icon {
  font-size: 20px;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.text {
  font-size: 16px;
}

.pulse {
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

/* Toast notification */
.toast-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 16px 24px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 9998;
  min-width: 280px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-notification.offline {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
}

.toast-notification.online {
  background: linear-gradient(135deg, #51cf66 0%, #37b24d 100%);
}

.toast-icon {
  font-size: 24px;
}

.toast-message {
  flex: 1;
  font-size: 15px;
}

/* Animación de entrada/salida del banner */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* Animación de fade para el toast */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(400px);
}
</style>
