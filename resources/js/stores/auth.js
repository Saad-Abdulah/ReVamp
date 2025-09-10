import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const demoMode = ref(true) // Enable demo mode for frontend testing

  // Getters
  const isAuthenticated = computed(() => {
    if (demoMode.value) {
      return !!user.value
    }
    return !!token.value && !!user.value
  })

  // Actions
  const login = async (credentials) => {
    loading.value = true
    try {
      if (demoMode.value) {
        // Demo mode - simulate login
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        user.value = {
          id: 1,
          name: 'Demo User',
          email: credentials.email
        }
        token.value = 'demo-token'
        localStorage.setItem('auth_token', 'demo-token')
        
        return { success: true, user: user.value }
      }
      
      const response = await api.post('/auth/login', credentials)
      const { user: userData, token: authToken } = response.data
      
      user.value = userData
      token.value = authToken
      localStorage.setItem('auth_token', authToken)
      
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
      
      return { success: true, user: userData }
    } catch (error) {
      if (demoMode.value) {
        throw new Error('Invalid demo credentials. Try any email and password.')
      }
      const message = error.response?.data?.message || 'Login failed'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const register = async (userData) => {
    loading.value = true
    try {
      if (demoMode.value) {
        // Demo mode - simulate registration
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        user.value = {
          id: 1,
          name: userData.name,
          email: userData.email
        }
        token.value = 'demo-token'
        localStorage.setItem('auth_token', 'demo-token')
        
        return { success: true, user: user.value }
      }
      
      const response = await api.post('/auth/register', userData)
      const { user: newUser, token: authToken } = response.data
      
      user.value = newUser
      token.value = authToken
      localStorage.setItem('auth_token', authToken)
      
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
      
      return { success: true, user: newUser }
    } catch (error) {
      if (demoMode.value) {
        throw new Error('Demo registration failed. Please try again.')
      }
      const message = error.response?.data?.message || 'Registration failed'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      if (!demoMode.value && token.value) {
        await api.post('/auth/logout')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local state regardless of API call success
      user.value = null
      token.value = null
      localStorage.removeItem('auth_token')
      delete api.defaults.headers.common['Authorization']
    }
  }

  const fetchUser = async () => {
    if (!token.value) {
      throw new Error('No token available')
    }
    
    try {
      if (demoMode.value) {
        // Demo mode - return demo user
        if (token.value === 'demo-token') {
          user.value = {
            id: 1,
            name: 'Demo User',
            email: 'demo@example.com'
          }
          return user.value
        } else {
          throw new Error('Invalid demo token')
        }
      }
      
      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      
      const response = await api.get('/auth/user')
      user.value = response.data
      
      return response.data
    } catch (error) {
      // Token is invalid, clear auth state
      user.value = null
      token.value = null
      localStorage.removeItem('auth_token')
      delete api.defaults.headers.common['Authorization']
      
      throw error
    }
  }

  const updateUser = (userData) => {
    user.value = { ...user.value, ...userData }
  }

  // Initialize auth state on store creation
  const initialize = async () => {
    if (token.value) {
      try {
        await fetchUser()
      } catch (error) {
        console.error('Failed to initialize auth:', error)
      }
    }
  }

  return {
    // State
    user,
    token,
    loading,
    demoMode,
    
    // Getters
    isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    fetchUser,
    updateUser,
    initialize
  }
}) 