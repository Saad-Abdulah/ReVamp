<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">PDF Templates</h1>
        <p class="mt-1 text-sm text-gray-600">
          Upload, manage, and design your PDF templates
        </p>
      </div>
      <BaseButton @click="showUploadModal = true" variant="primary">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
        Upload Template
      </BaseButton>
    </div>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Upload PDF Template</h3>
          
          <form @submit.prevent="handleUpload" class="space-y-4">
            <BaseInput
              v-model="uploadForm.name"
              label="Template Name"
              placeholder="Enter template name"
              required
            />
            
            <BaseInput
              v-model="uploadForm.description"
              label="Description"
              placeholder="Template description (optional)"
            />
            
            <div>
              <label class="label">PDF File (Max 10MB)</label>
              <input
                ref="fileInput"
                type="file"
                accept=".pdf"
                @change="handleFileSelect"
                class="input"
                required
              />
              <p v-if="selectedFile" class="text-sm text-green-600 mt-1">
                Selected: {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
              </p>
            </div>
            
            <div class="flex justify-end space-x-3 mt-6">
              <BaseButton 
                type="button" 
                variant="secondary" 
                @click="closeUploadModal"
              >
                Cancel
              </BaseButton>
              <BaseButton 
                type="submit" 
                :loading="uploading"
                :disabled="!selectedFile"
              >
                Upload Template
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Templates Grid -->
    <div v-if="loading" class="text-center py-12">
      <LoadingSpinner size="lg" />
      <p class="mt-4 text-gray-600">Loading templates...</p>
    </div>

    <div v-else-if="templates.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">No templates yet</h3>
      <p class="mt-2 text-gray-600">Upload your first PDF template to get started</p>
      <BaseButton @click="showUploadModal = true" variant="primary" class="mt-4">
        Upload Template
      </BaseButton>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <BaseCard v-for="template in templates" :key="template.id" class="hover:shadow-lg transition-shadow duration-200">
        <div class="p-6">
          <!-- Template Icon -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-lg font-medium text-gray-900">{{ template.name }}</h3>
                <p class="text-sm text-gray-500">{{ template.original_filename }}</p>
              </div>
            </div>
            
            <!-- Dropdown Menu -->
            <div class="relative">
              <button 
                @click="toggleDropdown(template.id)"
                class="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              
              <div v-if="activeDropdown === template.id" 
                   class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                <router-link 
                  :to="`/templates/${template.id}/edit`"
                  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="activeDropdown = null"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Template
                </router-link>
                <button 
                  @click="generatePdfModal(template)"
                  class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate PDF
                </button>
                <button 
                  @click="confirmDelete(template)"
                  class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>

          <!-- Template Info -->
          <div class="space-y-2">
            <p v-if="template.description" class="text-sm text-gray-600">
              {{ template.description }}
            </p>
            <div class="flex items-center justify-between text-sm text-gray-500">
              <span>{{ template.fields_count }} fields</span>
              <span>{{ formatDate(template.updated_at) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-4 flex space-x-2">
            <router-link 
              :to="`/templates/${template.id}/edit`"
              class="flex-1 btn btn-primary btn-sm text-center"
            >
              Edit Template
            </router-link>
            <button 
              @click="generatePdfModal(template)"
              class="flex-1 btn btn-secondary btn-sm"
            >
              Generate PDF
            </button>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Generate PDF Modal -->
    <div v-if="showGenerateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Generate PDF: {{ selectedTemplate?.name }}</h3>
          
          <form @submit.prevent="handleGeneratePdf" class="space-y-4">
            <div v-for="field in selectedTemplate?.fields_config" :key="field.name" class="space-y-2">
              <BaseInput
                v-model="generateForm[field.name]"
                :label="field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())"
                :placeholder="`Enter ${field.name.replace(/_/g, ' ')}`"
                required
              />
            </div>
            
            <BaseInput
              v-model="generateForm.filename"
              label="Filename (optional)"
              placeholder="generated-document.pdf"
            />
            
            <div class="flex justify-end space-x-3 mt-6">
              <BaseButton 
                type="button" 
                variant="secondary" 
                @click="closeGenerateModal"
              >
                Cancel
              </BaseButton>
              <BaseButton 
                type="submit" 
                :loading="generating"
              >
                Generate PDF
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTemplatesStore } from '../stores/templates'
import { useNotificationStore } from '../stores/notifications'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import LoadingSpinner from '../components/ui/LoadingSpinner.vue'

const router = useRouter()
const templatesStore = useTemplatesStore()
const notificationStore = useNotificationStore()

// Reactive state
const showUploadModal = ref(false)
const showGenerateModal = ref(false)
const uploading = ref(false)
const generating = ref(false)
const selectedFile = ref(null)
const activeDropdown = ref(null)
const selectedTemplate = ref(null)

const uploadForm = ref({
  name: '',
  description: ''
})

const generateForm = ref({})

// Computed
const templates = computed(() => templatesStore.templates)
const loading = computed(() => templatesStore.loading)

// Methods
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 10 * 1024 * 1024) { // 10MB
      notificationStore.error('File too large', 'Please select a PDF file smaller than 10MB')
      event.target.value = ''
      return
    }
    if (file.type !== 'application/pdf') {
      notificationStore.error('Invalid file type', 'Please select a PDF file')
      event.target.value = ''
      return
    }
    selectedFile.value = file
  }
}

const handleUpload = async () => {
  if (!selectedFile.value) return
  
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('pdf_file', selectedFile.value)
    formData.append('name', uploadForm.value.name)
    formData.append('description', uploadForm.value.description)
    
    const response = await templatesStore.uploadTemplate(formData)
    
    // Refresh templates from store instead of relying on automatic update
    await templatesStore.fetchTemplates()
    
    notificationStore.success('Template uploaded!', 'Your PDF template has been uploaded successfully')
    closeUploadModal()
  } catch (error) {
    console.error('Upload failed:', error)
    notificationStore.error('Upload failed', error.message)
  } finally {
    uploading.value = false
  }
}

const closeUploadModal = () => {
  showUploadModal.value = false
  uploadForm.value = { name: '', description: '' }
  selectedFile.value = null
  if (document.querySelector('input[type="file"]')) {
    document.querySelector('input[type="file"]').value = ''
  }
}

const toggleDropdown = (templateId) => {
  activeDropdown.value = activeDropdown.value === templateId ? null : templateId
}

const generatePdfModal = (template) => {
  selectedTemplate.value = template
  generateForm.value = {}
  
  // Initialize form with field names
  template.fields_config?.forEach(field => {
    generateForm.value[field.name] = ''
  })
  generateForm.value.filename = ''
  
  showGenerateModal.value = true
  activeDropdown.value = null
}

const handleGeneratePdf = async () => {
  generating.value = true
  try {
    const data = {
      data: { ...generateForm.value },
      filename: generateForm.value.filename || `${selectedTemplate.value.name}-${Date.now()}.pdf`
    }
    
    // Remove filename from data object as it's sent separately
    delete data.data.filename
    
    const response = await templatesStore.generatePdf(selectedTemplate.value.id, data)
    
    notificationStore.success('PDF Generated!', `${data.filename} has been generated successfully`)
    closeGenerateModal()
    
    // Redirect to generated PDFs page
    router.push('/generated')
    
  } catch (error) {
    notificationStore.error('Generation failed', error.message)
  } finally {
    generating.value = false
  }
}

const closeGenerateModal = () => {
  showGenerateModal.value = false
  selectedTemplate.value = null
  generateForm.value = {}
}

const confirmDelete = async (template) => {
  if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
    try {
      await templatesStore.deleteTemplate(template.id)
      notificationStore.success('Template deleted', 'Template has been deleted successfully')
    } catch (error) {
      notificationStore.error('Delete failed', error.message)
    }
  }
  activeDropdown.value = null
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

// Close dropdowns when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    activeDropdown.value = null
  }
}

onMounted(async () => {
  try {
    // Clear any existing templates in the store
    templatesStore.templates = []
    
    // Fetch templates from API/localStorage
    await templatesStore.fetchTemplates()
    
    console.log('Templates loaded:', templatesStore.templates.length)
  } catch (error) {
    console.error('Error loading templates:', error)
    notificationStore.error('Failed to load templates', error.message)
  }
  
  // Add event listener for closing dropdowns
  document.addEventListener('click', handleClickOutside)
})
</script> 