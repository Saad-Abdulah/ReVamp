import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Auth pages
import Login from '../pages/auth/Login.vue'
import Register from '../pages/auth/Register.vue'

// Main app pages
import Dashboard from '../pages/Dashboard.vue'
import Templates from '../pages/Templates.vue'
import TemplateEditor from '../pages/TemplateEditor.vue'
import GeneratedPdfs from '../pages/GeneratedPdfs.vue'

// Error pages
import NotFound from '../pages/errors/NotFound.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { 
      requiresGuest: true,
      title: 'Login'
    }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { 
      requiresGuest: true,
      title: 'Register'
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { 
      requiresAuth: true,
      title: 'Dashboard'
    }
  },
  {
    path: '/templates',
    name: 'templates',
    component: Templates,
    meta: { 
      requiresAuth: true,
      title: 'PDF Templates'
    }
  },
  {
    path: '/templates/:id/edit',
    name: 'template-editor',
    component: TemplateEditor,
    meta: { 
      requiresAuth: true,
      title: 'Edit Template'
    }
  },
  {
    path: '/generated',
    name: 'generated',
    component: GeneratedPdfs,
    meta: { 
      requiresAuth: true,
      title: 'Generated PDFs'
    }
  },
  {
    path: '/404',
    name: 'not-found',
    component: NotFound,
    meta: {
      title: 'Page Not Found'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Set page title
  document.title = to.meta.title ? `${to.meta.title} - PDF Designer` : 'PDF Designer'
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Try to restore auth from token
      const token = localStorage.getItem('auth_token')
      if (token) {
        try {
          await authStore.fetchUser()
        } catch (error) {
          localStorage.removeItem('auth_token')
          return next('/login')
        }
      } else {
        return next('/login')
      }
    }
  }
  
  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return next('/dashboard')
  }
  
  next()
})

export default router 