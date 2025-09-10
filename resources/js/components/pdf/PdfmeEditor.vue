<template>
  <div class="pdfme-editor-container">
    <!-- Toolbar -->
    <div class="flex items-center justify-between mb-4 p-4 bg-white rounded-lg shadow-sm border">
      <div class="flex items-center space-x-4">
        <h3 class="text-lg font-semibold text-gray-900">PDF Template Editor</h3>
        <span v-if="template" class="text-sm text-gray-500">{{ template.name }}</span>
      </div>
      
      <div class="flex items-center space-x-3">
        <div class="flex items-center space-x-2">
          <label class="label text-sm">Add Field:</label>
          <select v-model="selectedFieldType" class="input text-sm">
            <option value="">Select Type</option>
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="qrcode">QR Code</option>
            <option value="barcode">Barcode</option>
          </select>
        </div>
        
        <BaseButton 
          variant="secondary" 
          size="sm"
          @click="addField"
          :disabled="!selectedFieldType"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Field
        </BaseButton>
        
        <BaseButton 
          variant="primary" 
          size="sm"
          @click="saveTemplate"
          :loading="saving"
        >
          Save
        </BaseButton>
      </div>
    </div>

    <!-- PDF Editor Container -->
    <div class="relative bg-white rounded-lg shadow-sm border overflow-hidden">
      <div 
        ref="pdfmeContainer"
        class="min-h-[700px] w-full bg-gray-50"
        style="height: 700px; position: relative;"
      ></div>
      
      <!-- Loading Overlay -->
      <div 
        v-if="loading"
        class="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center"
      >
        <div class="text-center">
          <LoadingSpinner size="lg" />
          <p class="mt-4 text-gray-600">Loading PDF editor...</p>
        </div>
      </div>

      <!-- Error State -->
      <div 
        v-if="error"
        class="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center"
      >
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Failed to load editor</h3>
          <p class="mt-2 text-gray-600">{{ error }}</p>
          <BaseButton @click="initializeEditor" class="mt-4">
            Retry
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 class="text-sm font-medium text-blue-900 mb-2">How to use the PDF Editor:</h4>
      <ul class="text-sm text-blue-700 space-y-1">
        <li>• <strong>Add Fields:</strong> Select field type (Text, Image, QR Code, Barcode) and click "Add Field"</li>
        <li>• <strong>Move Fields:</strong> Drag fields to reposition them on the PDF</li>
        <li>• <strong>Resize Fields:</strong> Drag the corners to resize field boxes</li>
        <li>• <strong>Edit Properties:</strong> Click on fields to edit content, styling, and options</li>
        <li>• <strong>Delete Fields:</strong> Select field and press Delete key</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Designer } from '@pdfme/ui'
import { BLANK_PDF } from '@pdfme/common'
import { text, image, barcodes } from '@pdfme/schemas'
import BaseButton from '../ui/BaseButton.vue'
import LoadingSpinner from '../ui/LoadingSpinner.vue'

const props = defineProps({
  template: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save', 'field-updated'])

// State
const pdfmeContainer = ref(null)
const designer = ref(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const selectedFieldType = ref('')

// Template data for @pdfme
const templateData = ref({
  basePdf: '',
  schemas: [{}]
})

// Plugin registry for @pdfme
const plugins = {
  text,
  image,
  qrcode: barcodes.qrcode,
  barcode: barcodes.code128
}

// Initialize @pdfme Designer
const initializeEditor = async () => {
  try {
    loading.value = true
    error.value = ''
    
    if (!props.template) {
      throw new Error('No template provided')
    }

    console.log('Template PDF URL:', props.template.pdf_url)

    // Use the template's PDF if available, otherwise use BLANK_PDF
    if (props.template.pdf_url) {
      try {
        // Fetch the actual PDF and convert to base64
        const pdfData = await fetchPdfAsBase64(props.template.pdf_url)
        console.log('PDF data received, type:', typeof pdfData, 'length:', pdfData?.length || 0)
        
        // Validate PDF data format
        if (pdfData && (pdfData.startsWith('data:application/pdf;base64,') || pdfData === BLANK_PDF)) {
          templateData.value.basePdf = pdfData
          console.log('Valid PDF data format, using for template')
        } else {
          console.warn('Invalid PDF data format, using BLANK_PDF')
          templateData.value.basePdf = BLANK_PDF
        }
      } catch (error) {
        console.warn('Failed to load PDF, using BLANK_PDF:', error)
        templateData.value.basePdf = BLANK_PDF
      }
    } else {
      console.log('No PDF URL provided, using BLANK_PDF')
      templateData.value.basePdf = BLANK_PDF
    }
    
    // Load existing fields if any
    if (props.template.fields_config && props.template.fields_config.length > 0) {
      const schemas = {}
      props.template.fields_config.forEach(field => {
        schemas[field.name] = {
          type: field.type,
          position: field.position,
          width: field.width,
          height: field.height,
          ...(field.fontSize && { fontSize: field.fontSize }),
          ...(field.fontColor && { fontColor: field.fontColor }),
          ...(field.content && { content: field.content })
        }
      })
      templateData.value.schemas = [schemas]
    } else {
      // Ensure empty schema structure
      templateData.value.schemas = [{}]
    }

    await nextTick()

    if (!pdfmeContainer.value) {
      throw new Error('Container not found')
    }

    console.log('Initializing Designer with template:', {
      ...templateData.value,
      basePdf: templateData.value.basePdf ? 'PDF_DATA_PRESENT' : 'NO_PDF_DATA'
    })

    // Initialize @pdfme Designer with drag-and-drop
    designer.value = new Designer({
      domContainer: pdfmeContainer.value,
      template: templateData.value,
      plugins: plugins,
      options: {
        theme: {
          token: {
            colorPrimary: '#3b82f6',
          }
        },
        // Add these options for better functionality
        lang: 'en',
        labels: {
          'field.text': 'Text',
          'field.image': 'Image', 
          'field.qrcode': 'QR Code',
          'field.barcode': 'Barcode'
        }
      }
    })

    // Store a reference to the current template
    let currentTemplate = { ...templateData.value }

    // Listen for template changes (when fields are moved/resized)
    designer.value.onChangeTemplate((template) => {
      console.log('Template changed')
      // Update our local template data without losing reference
      templateData.value.basePdf = template.basePdf
      templateData.value.schemas = [...template.schemas]
      currentTemplate = template
      
      // Only update fields when explicitly requested, not on every change
      // This prevents the unselection issue
    })
    
    // Listen for field focus/selection using onFocusElement instead of onFocusField
    designer.value.onFocusElement && designer.value.onFocusElement((elementName, schemaIdx) => {
      console.log('Field focused:', elementName, schemaIdx)
      // When a field is focused, we don't need to do anything that would cause unselection
    })
    
    // Listen for field blur/unselection using onBlurElement instead of onBlurField
    designer.value.onBlurElement && designer.value.onBlurElement(() => {
      console.log('Field blurred')
      // When a field is blurred naturally, update the template fields
      updateTemplateFields()
    })

    console.log('PDF Designer initialized successfully')
    
  } catch (err) {
    console.error('Failed to initialize PDF designer:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Fetch PDF as base64 from URL
const fetchPdfAsBase64 = async (url) => {
  try {
    // Handle demo URLs - return BLANK_PDF for demo cases
    if (url.startsWith('/demo-') || url.includes('demo')) {
      console.log('Using BLANK_PDF for demo template')
      return BLANK_PDF
    }
    
    // Handle data URLs (uploaded PDFs stored as base64)
    if (url.startsWith('data:application/pdf;base64,')) {
      console.log('Using uploaded PDF data URL')
      // Return the full data URL as is - this is what @pdfme expects
      return url
    }
    
    console.log('Fetching real PDF from:', url)
    
    // For real uploaded PDFs, try to fetch from the URL
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
      },
      // Add credentials if needed for authentication
      credentials: 'same-origin'
    })
    
    if (!response.ok) {
      console.warn(`Failed to fetch PDF (${response.status}), using BLANK_PDF`)
      return BLANK_PDF
    }
    
    const blob = await response.blob()
    console.log('PDF blob size:', blob.size)
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result
        console.log('PDF loaded successfully, size:', result.length)
        // Return the full data URL - do NOT extract just the base64 part
        resolve(result)
      }
      reader.onerror = () => reject(new Error('Failed to read PDF file'))
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error fetching PDF:', error)
    console.log('Falling back to BLANK_PDF')
    return BLANK_PDF
  }
}

// Add a new field to the PDF
const addField = async () => {
  if (!selectedFieldType.value || !designer.value) {
    console.log('Cannot add field: missing type or designer not ready')
    return
  }
  
  const fieldName = `${selectedFieldType.value}_${Date.now()}`
  const newField = {
    type: selectedFieldType.value,
    position: { x: 50, y: 50 + Object.keys(templateData.value.schemas[0]).length * 40 },
    width: selectedFieldType.value === 'qrcode' || selectedFieldType.value === 'barcode' ? 80 : 120,
    height: selectedFieldType.value === 'qrcode' ? 80 : (selectedFieldType.value === 'barcode' ? 40 : 30),
    // Add common properties
    required: false,
    readOnly: false,
    // Type-specific properties
    ...(selectedFieldType.value === 'text' && {
      fontSize: 12,
      fontColor: '#000000',
      content: 'Sample Text',
      fontName: 'NotoSerifJP-Regular',
      alignment: 'left'
    }),
    ...(selectedFieldType.value === 'qrcode' && {
      content: 'https://pdfme.com'
    }),
    ...(selectedFieldType.value === 'barcode' && {
      content: '123456789'
    }),
    ...(selectedFieldType.value === 'image' && {
      content: ''
    })
  }
  
  console.log('Adding new field:', fieldName, newField)
  
  try {
    // Add field to current template
    const currentTemplate = { 
      basePdf: templateData.value.basePdf,
      schemas: [{ ...templateData.value.schemas[0] }]
    }
    currentTemplate.schemas[0][fieldName] = newField
    
    console.log('Updating template with new field')
    
    // Update the designer with the new template
    designer.value.updateTemplate(currentTemplate)
    
    // Update our local template data
    templateData.value = currentTemplate
    
    // Update template fields and emit to parent
    updateTemplateFields()
    
    // Reset selection
    selectedFieldType.value = ''
    
  } catch (error) {
    console.error('Error adding field:', error)
  }
}

// Update template fields and emit to parent
const updateTemplateFields = () => {
  if (!templateData.value.schemas[0]) return
  
  const fieldsConfig = Object.entries(templateData.value.schemas[0]).map(([name, config]) => ({
    name,
    type: config.type,
    position: config.position,
    width: config.width,
    height: config.height,
    ...(config.fontSize && { fontSize: config.fontSize }),
    ...(config.fontColor && { fontColor: config.fontColor }),
    ...(config.content && { content: config.content }),
    ...(config.options && { options: config.options })
  }))
  
  emit('field-updated', fieldsConfig)
}

// Save template
const saveTemplate = async () => {
  saving.value = true
  try {
    // Get the latest template data from the designer
    const currentTemplate = designer.value.getTemplate();
    console.log('Saving template with data:', currentTemplate);
    
    if (!currentTemplate || !currentTemplate.schemas || !currentTemplate.schemas[0]) {
      throw new Error('No template data available');
    }
    
    // Extract field configuration from the template
    const fieldsConfig = Object.entries(currentTemplate.schemas[0]).map(([name, config]) => ({
      name,
      type: config.type,
      position: config.position,
      width: config.width,
      height: config.height,
      ...(config.fontSize && { fontSize: config.fontSize }),
      ...(config.fontColor && { fontColor: config.fontColor }),
      ...(config.content && { content: config.content }),
      ...(config.options && { options: config.options })
    }));
    
    console.log('Extracted fields config:', fieldsConfig);
    
    // Emit save event with the fields configuration
    emit('save', fieldsConfig);
    
    // Update our local template data
    templateData.value = currentTemplate;
  } catch (err) {
    console.error('Error saving template:', err);
    error.value = err.message;
  } finally {
    saving.value = false;
  }
};

// Lifecycle
onMounted(() => {
  initializeEditor()
})

onUnmounted(() => {
  if (designer.value) {
    try {
      designer.value.destroy()
    } catch (err) {
      console.warn('Error destroying designer:', err)
    }
  }
})

// Watch for template changes
watch(() => props.template, () => {
  if (designer.value) {
    initializeEditor()
  }
}, { deep: true })
</script>

<style scoped>
.pdfme-editor-container {
  @apply w-full;
}

/* Override @pdfme styles */
:deep(.pdfme-ui-container) {
  border: none !important;
  border-radius: 0.5rem !important;
  min-height: 700px !important;
  width: 100% !important;
}

:deep(.pdfme-ui-toolbar) {
  background: #f9fafb !important;
  border-bottom: 1px solid #e5e7eb !important;
}

:deep(.pdfme-field) {
  border: 2px solid #3b82f6 !important;
  background: rgba(59, 130, 246, 0.1) !important;
  min-height: 20px !important;
  min-width: 20px !important;
  color: #000000 !important;
  font-size: 12px !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

:deep(.pdfme-field:hover) {
  border-color: #2563eb !important;
  background: rgba(59, 130, 246, 0.2) !important;
}

:deep(.pdfme-field.selected) {
  border-color: #1d4ed8 !important;
  background: rgba(59, 130, 246, 0.3) !important;
}

/* Ensure @pdfme content is visible */
:deep(.ant-design-pro-base-select-content-item) {
  background: white !important;
  color: black !important;
}

:deep(.ant-select-dropdown) {
  z-index: 9999 !important;
}

/* PDF preview area */
:deep(.pdfme-ui-canvas) {
  background: white !important;
  border: 1px solid #e5e7eb !important;
}
</style> 