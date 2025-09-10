<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-1 text-sm text-gray-600">
        Welcome to the PDF Template Designer & Generator
      </p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <BaseCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="h-8 w-8 bg-primary-500 rounded-md flex items-center justify-center">
              <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                Templates
              </dt>
              <dd class="text-lg font-medium text-gray-900">
                {{ stats.templates || 0 }}
              </dd>
            </dl>
          </div>
        </div>
      </BaseCard>

      <BaseCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="h-8 w-8 bg-green-500 rounded-md flex items-center justify-center">
              <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                Generated PDFs
              </dt>
              <dd class="text-lg font-medium text-gray-900">
                {{ stats.generated || 0 }}
              </dd>
            </dl>
          </div>
        </div>
      </BaseCard>

      <BaseCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
              <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                This Month
              </dt>
              <dd class="text-lg font-medium text-gray-900">
                {{ stats.thisMonth || 0 }}
              </dd>
            </dl>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <BaseCard title="Quick Actions">
        <div class="space-y-4">
          <router-link
            to="/templates"
            class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <div class="ml-4">
              <h4 class="text-sm font-medium text-gray-900">Upload New Template</h4>
              <p class="text-sm text-gray-500">Upload a PDF and start designing</p>
            </div>
          </router-link>

          <router-link
            to="/templates"
            class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div class="ml-4">
              <h4 class="text-sm font-medium text-gray-900">Manage Templates</h4>
              <p class="text-sm text-gray-500">View and edit your templates</p>
            </div>
          </router-link>

          <router-link
            to="/generated"
            class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="ml-4">
              <h4 class="text-sm font-medium text-gray-900">Generated PDFs</h4>
              <p class="text-sm text-gray-500">View and download your PDFs</p>
            </div>
          </router-link>
        </div>
      </BaseCard>

      <BaseCard title="Getting Started">
        <div class="space-y-4">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 class="text-sm font-medium text-blue-900 mb-2">Welcome to PDF Designer!</h3>
            <p class="text-sm text-blue-700 mb-3">
              Create professional PDF templates with our intuitive drag-and-drop interface.
            </p>
            <ol class="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Upload your PDF template</li>
              <li>Add dynamic fields with drag & drop</li>
              <li>Save your template for reuse</li>
              <li>Generate PDFs with custom data</li>
            </ol>
          </div>
          
          <div class="text-center">
            <BaseButton variant="primary" @click="startTour">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-10h.01M5 8h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
              Take a Tour
            </BaseButton>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import { useNotificationStore } from '../stores/notifications'

const notificationStore = useNotificationStore()

const stats = ref({
  templates: 0,
  generated: 0,
  thisMonth: 0
})

const startTour = () => {
  notificationStore.info('Feature Coming Soon!', 'The guided tour feature will be available in the next update.')
}

onMounted(() => {
  // In a real app, you would fetch these stats from the API
  // For now, just show some placeholder data
  setTimeout(() => {
    stats.value = {
      templates: 0,
      generated: 0,
      thisMonth: 0
    }
  }, 500)
})
</script> 