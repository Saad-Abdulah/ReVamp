import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])

  const add = (notification) => {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      type: 'info',
      title: '',
      message: '',
      duration: 5000,
      ...notification
    }
    
    notifications.value.push(newNotification)
    
    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        remove(id)
      }, newNotification.duration)
    }
    
    return id
  }

  const remove = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clear = () => {
    notifications.value = []
  }

  // Convenience methods
  const success = (title, message = '', options = {}) => {
    return add({ type: 'success', title, message, ...options })
  }

  const error = (title, message = '', options = {}) => {
    return add({ type: 'error', title, message, duration: 0, ...options })
  }

  const warning = (title, message = '', options = {}) => {
    return add({ type: 'warning', title, message, ...options })
  }

  const info = (title, message = '', options = {}) => {
    return add({ type: 'info', title, message, ...options })
  }

  return {
    notifications,
    add,
    remove,
    clear,
    success,
    error,
    warning,
    info
  }
}) 