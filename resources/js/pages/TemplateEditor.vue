<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-4">
        <router-link 
          to="/templates" 
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ template ? `Edit: ${template.name}` : 'Template Editor' }}
          </h1>
          <p class="text-sm text-gray-600">
            Design your PDF template with drag-and-drop field placement
          </p>
        </div>
      </div>
      
      <div class="flex items-center space-x-3">
        <BaseButton 
          variant="secondary"
          @click="previewTemplate"
          :disabled="!template"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview
        </BaseButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <LoadingSpinner size="lg" />
      <p class="mt-4 text-gray-600">Loading template...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">Template not found</h3>
      <p class="mt-2 text-gray-600">{{ error }}</p>
      <router-link to="/templates" class="mt-4 btn btn-primary">
        Back to Templates
      </router-link>
    </div>

    <!-- Template Editor with Real @pdfme/ui -->
    <div v-else-if="template" class="space-y-6">
      <!-- Template Info -->
      <BaseCard>
        <div class="p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ template.name }}</h3>
                <p class="text-sm text-gray-500">{{ template.original_filename }}</p>
              </div>
            </div>
            
            <div class="text-right">
              <p class="text-sm text-gray-500">
                {{ template.fields_count }} fields configured
              </p>
              <p class="text-xs text-gray-400">
                Last updated {{ formatDate(template.updated_at) }}
              </p>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Real PDF Editor with @pdfme/ui -->
      <PdfmeEditor 
        :template="template"
        @save="handleSave"
        @field-updated="handleFieldUpdate"
      />
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreview" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Template Preview</h3>
          <BaseButton variant="secondary" @click="showPreview = false">
            Close
          </BaseButton>
        </div>
        
        <div class="bg-gray-100 p-4 rounded-lg">
          <!-- PDF Preview -->
          <div class="bg-white p-4 rounded shadow-lg mx-auto">
            <h4 class="text-lg font-semibold mb-4">{{ template.name }} - Preview</h4>
            
            <!-- Actual PDF Preview -->
            <div class="border border-gray-300 rounded mb-4">
              <iframe 
                v-if="template && template.pdf_url" 
                :src="getPdfViewerUrl(template.pdf_url)" 
                class="w-full" 
                style="height: 500px;"
              ></iframe>
              <div v-else class="p-4 text-center text-gray-500">
                PDF preview not available
              </div>
            </div>
            
            <!-- Fields List -->
            <div class="mt-4">
              <h5 class="font-medium mb-2">Fields:</h5>
              <div class="space-y-2">
                <div v-for="field in template.fields_config" :key="field.name" class="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span class="font-medium">{{ field.name.replace(/_/g, ' ') }}:</span>
                  <span class="text-sm text-gray-600">{{ field.type }} field</span>
                </div>
                <div v-if="!template.fields_config || template.fields_config.length === 0" class="text-center text-gray-500 p-2">
                  No fields defined yet
                </div>
              </div>
            </div>
            
            <div class="mt-4 text-center">
              <BaseButton 
                variant="primary" 
                size="sm"
                @click="generateSamplePdf"
              >
                Generate Sample PDF
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTemplatesStore } from '../stores/templates'
import { useNotificationStore } from '../stores/notifications'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import LoadingSpinner from '../components/ui/LoadingSpinner.vue'
import PdfmeEditor from '../components/pdf/PdfmeEditor.vue'

const route = useRoute()
const router = useRouter()
const templatesStore = useTemplatesStore()
const notificationStore = useNotificationStore()

// State
const loading = ref(true)
const error = ref('')
const template = ref(null)
const showPreview = ref(false)

// Methods
const loadTemplate = async () => {
  try {
    loading.value = true
    const templateId = route.params.id
    const loadedTemplate = await templatesStore.getTemplate(templateId)
    template.value = loadedTemplate
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const handleSave = async (fieldsConfig) => {
  try {
    console.log('Saving template fields:', fieldsConfig);
    
    // Make sure we have valid fields config
    if (!Array.isArray(fieldsConfig) || fieldsConfig.length === 0) {
      console.warn('No fields to save or invalid fields config');
    }
    
    // Save to the backend/mock API
    await templatesStore.updateTemplateFields(template.value.id, {
      fields_config: fieldsConfig
    });
    
    // Update local template state
    template.value.fields_config = fieldsConfig;
    template.value.fields_count = fieldsConfig.length;
    template.value.updated_at = new Date().toISOString();
    
    notificationStore.success('Template saved!', 'Your template has been saved successfully');
  } catch (err) {
    console.error('Error saving template:', err);
    notificationStore.error('Save failed', err.message);
  }
}

const handleFieldUpdate = (fieldsConfig) => {
  // Update local template state when fields are modified
  if (template.value) {
    template.value.fields_config = fieldsConfig
    template.value.fields_count = fieldsConfig.length
  }
}

const previewTemplate = () => {
  // Make sure we have template and fields
  if (!template.value || !template.value.fields_config || template.value.fields_config.length === 0) {
    notificationStore.warning('No fields defined', 'Please add fields to your template before previewing');
    return;
  }
  
  console.log('Showing preview for template:', template.value.name, 'with', template.value.fields_config.length, 'fields');
  showPreview.value = true;
}

const generateSamplePdf = async () => {
  try {
    showPreview.value = false;
    
    // Make sure we have template and fields
    if (!template.value || !template.value.fields_config || template.value.fields_config.length === 0) {
      notificationStore.warning('No fields defined', 'Please add fields to your template before generating a PDF');
      return;
    }
    
    // Generate sample data based on field names
    const sampleData = {};
    template.value.fields_config.forEach(field => {
      sampleData[field.name] = `Sample ${field.name.replace(/_/g, ' ')}`;
    });
    
    console.log('Generating sample PDF with data:', sampleData);
    
    // Prepare data for API
    const data = {
      data: sampleData,
      filename: `${template.value.name}-sample.pdf`
    };
    
    // Show loading notification
    notificationStore.info('Generating PDF...', 'Please wait while your PDF is being generated');
    
    try {
      // Call API to generate PDF
      const result = await templatesStore.generatePdf(template.value.id, data);
      
      console.log('PDF generation result:', result);
      
      if (result) {
        notificationStore.success('Sample PDF Generated!', 'Your sample PDF has been generated');
        
        // Redirect to generated PDFs page
        setTimeout(() => {
          router.push('/generated');
        }, 1000);
      } else {
        throw new Error('PDF generation returned no result');
      }
    } catch (error) {
      console.error('API error generating PDF:', error);
      notificationStore.error('PDF Generation Failed', error.message || 'Error communicating with the server');
    }
  } catch (err) {
    console.error('Error in generateSamplePdf:', err);
    notificationStore.error('Sample generation failed', err.message);
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const getPdfViewerUrl = (url) => {
  // Use Google's PDF viewer for better compatibility
  // This works by passing the PDF URL as a parameter to Google's PDF viewer
  
  // Ensure the URL is absolute
  let fullUrl = url;
  if (url.startsWith('/')) {
    fullUrl = window.location.origin + url;
  }
  
  // Use Google's PDF viewer
  return `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
};

onMounted(() => {
  loadTemplate()
})
</script> 