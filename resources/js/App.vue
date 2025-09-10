<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <nav v-if="authStore.isAuthenticated" class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/dashboard" class="flex items-center">
              <svg class="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="ml-2 text-xl font-bold text-gray-900">PDF Designer</span>
            </router-link>
          </div>
          
          <div class="flex items-center space-x-4">
            <router-link 
              v-for="item in navigationItems"
              :key="item.name"
              :to="item.to"
              class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              :class="{ 'text-primary-600 bg-primary-50': $route.name === item.name }"
            >
              {{ item.label }}
            </router-link>
            
            <div class="relative">
              <button 
                @click="showUserMenu = !showUserMenu"
                class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <div class="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span class="text-sm font-medium text-white">
                    {{ authStore.user?.name?.charAt(0).toUpperCase() }}
                  </span>
                </div>
              </button>
              
              <div 
                v-if="showUserMenu"
                @click.away="showUserMenu = false"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
              >
                <div class="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                  <div class="font-medium">{{ authStore.user?.name }}</div>
                  <div class="text-gray-500">{{ authStore.user?.email }}</div>
                </div>
                <button 
                  @click="logout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Global Notifications -->
    <NotificationContainer />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import NotificationContainer from './components/ui/NotificationContainer.vue'

const router = useRouter()
const authStore = useAuthStore()
const showUserMenu = ref(false)

const navigationItems = computed(() => [
  { name: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  { name: 'templates', label: 'Templates', to: '/templates' },
  { name: 'generated', label: 'Generated PDFs', to: '/generated' },
])

const logout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Close user menu when clicking outside
const clickAway = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event, el)
      }
    }
    document.body.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent)
  }
}

// Register click-away directive globally
import { createApp } from 'vue'
const app = createApp({})
app.directive('click-away', clickAway)
</script>

<style scoped>
/* Component-specific styles */
.router-link-active {
  @apply text-primary-600 bg-primary-50;
}
</style> 