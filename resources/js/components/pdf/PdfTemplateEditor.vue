<template>
  <div class="pdf-template-editor">
    <!-- Toolbar -->
    <div class="flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="flex items-center space-x-4">
        <h2 class="text-lg font-semibold text-gray-900">Template Editor</h2>
        <div class="text-sm text-gray-500">
          {{ template?.name || 'Untitled Template' }}
        </div>
      </div>
      
      <div class="flex items-center space-x-3">
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
        
        <select 
          v-model="selectedFieldType"
          class="input text-sm"
        >
          <option value="">Select Field Type</option>
          <option value="text">Text</option>
          <option value="multilineText">Multi-line Text</option>
          <option value="check">Checkbox</option>
          <option value="radioGroup">Radio Group</option>
          <option value="select">Select</option>
          <option value="signature">Signature</option>
          <option value="image">Image</option>
          <option value="dateTime">Date/Time</option>
        </select>
        
        <BaseButton 
          variant="primary" 
          size="sm"
          @click="saveTemplate"
          :loading="saving"
        >
          Save Template
        </BaseButton>
      </div>
    </div>

    <!-- PDF Editor Container -->
    <div class="relative">
      <div 
        ref="editorContainer"
        class="pdfme-ui-container border border-gray-300 rounded-lg overflow-hidden"
        style="min-height: 600px;"
      ></div>
      
      <!-- Loading Overlay -->
      <div 
        v-if="loading"
        class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg"
      >
        <div class="text-center">
          <LoadingSpinner size="lg" />
          <p class="mt-2 text-gray-600">Loading PDF template...</p>
        </div>
      </div>
    </div>

    <!-- Field Properties Panel -->
    <div 
      v-if="selectedField"
      class="mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200"
    >
      <h3 class="text-lg font-medium text-gray-900 mb-4">Field Properties</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="label">Field Name</label>
          <input
            v-model="selectedField.name"
            type="text"
            class="input"
            placeholder="Enter field name"
            @input="updateField"
          />
        </div>
        
        <div>
          <label class="label">Field Type</label>
          <select 
            v-model="selectedField.type"
            class="input"
            @change="updateField"
          >
            <option value="text">Text</option>
            <option value="multilineText">Multi-line Text</option>
            <option value="check">Checkbox</option>
            <option value="radioGroup">Radio Group</option>
            <option value="select">Select</option>
            <option value="signature">Signature</option>
            <option value="image">Image</option>
            <option value="dateTime">Date/Time</option>
          </select>
        </div>
        
        <div v-if="selectedField.type === 'text' || selectedField.type === 'multilineText'">
          <label class="label">Font Size</label>
          <input
            v-model.number="selectedField.fontSize"
            type="number"
            class="input"
            min="8"
            max="72"
            @input="updateField"
          />
        </div>
        
        <div v-if="selectedField.type === 'text' || selectedField.type === 'multilineText'">
          <label class="label">Font Color</label>
          <input
            v-model="selectedField.fontColor"
            type="color"
            class="input h-10"
            @input="updateField"
          />
        </div>
        
        <div v-if="selectedField.type === 'select' || selectedField.type === 'radioGroup'">
          <label class="label">Options (one per line)</label>
          <textarea
            v-model="selectedField.optionsText"
            class="input"
            rows="3"
            placeholder="Option 1&#10;Option 2&#10;Option 3"
            @input="updateFieldOptions"
          ></textarea>
        </div>
      </div>
      
      <div class="mt-4 flex justify-end space-x-3">
        <BaseButton variant="danger" size="sm" @click="deleteField">
          Delete Field
        </BaseButton>
        <BaseButton variant="secondary" size="sm" @click="selectedField = null">
          Close
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Designer } from '@pdfme/ui'
import BaseButton from '../ui/BaseButton.vue'
import LoadingSpinner from '../ui/LoadingSpinner.vue'

const props = defineProps({
  template: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save', 'field-added', 'field-updated', 'field-deleted'])

// Refs
const editorContainer = ref(null)
const designer = ref(null)
const loading = ref(true)
const saving = ref(false)
const selectedFieldType = ref('text')
const selectedField = ref(null)

// PDF Template data
const templateData = ref({
  basePdf: '',
  schemas: [{}]
})

// Initialize the PDF designer
const initializeDesigner = async () => {
  try {
    loading.value = true;
    
    // Convert template PDF URL to base64
    if (props.template.pdf_url) {
      console.log('Template PDF URL:', props.template.pdf_url);
      try {
        const pdfData = await fetchPdfAsBase64(props.template.pdf_url);
        templateData.value.basePdf = pdfData;
        
        if (!templateData.value.basePdf || !templateData.value.basePdf.startsWith('data:application/pdf;base64,')) {
          console.error('Invalid PDF data format:', templateData.value.basePdf?.substring(0, 100) + '...');
          throw new Error('Invalid PDF data format. Expected data:application/pdf;base64,');
        }
      } catch (error) {
        console.error('Failed to load PDF template:', error);
        alert('Failed to load PDF template: ' + error.message);
        loading.value = false;
        return;
      }
    } else {
      console.error('No PDF URL provided');
      alert('No PDF URL provided for the template');
      loading.value = false;
      return;
    }
    
    // Load existing fields configuration
    if (props.template.fields_config) {
      const schemas = {};
      props.template.fields_config.forEach(field => {
        schemas[field.name] = {
          type: field.type,
          position: field.position,
          width: field.width,
          height: field.height,
          fontSize: field.fontSize || 12,
          fontColor: field.fontColor || '#000000',
          ...(field.additionalProperties || {})
        };
      });
      templateData.value.schemas = [schemas];
    }
    
    await nextTick();
    
    console.log('Initializing PDF designer with template:', JSON.stringify({
      ...templateData.value,
      basePdf: templateData.value.basePdf ? 'PDF_DATA_BASE64_STRING' : null
    }));
    
    // Initialize @pdfme Designer
    try {
      designer.value = new Designer({
        domContainer: editorContainer.value,
        template: templateData.value,
        options: {
          lang: 'en',
          theme: {
            token: {
              colorPrimary: '#3b82f6',
            }
          }
        }
      });
      
      // Listen for field selection
      designer.value.onChangeTemplate((template) => {
        templateData.value = template;
      });
      
      // Listen for field focus/selection
      designer.value.onFocusTemplate((template, focusedField) => {
        if (focusedField) {
          const field = template.schemas[0][focusedField];
          if (field) {
            selectedField.value = {
              name: focusedField,
              ...field,
              optionsText: field.options ? field.options.join('\n') : ''
            };
          }
        } else {
          selectedField.value = null;
        }
      });
    } catch (error) {
      console.error('Failed to initialize PDF designer:', error);
      alert('Failed to initialize PDF designer: ' + error.message);
    }
    
  } catch (error) {
    console.error('Failed to initialize PDF designer:', error);
    alert('Error initializing PDF designer: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// Fetch PDF as base64
const fetchPdfAsBase64 = async (url) => {
  try {
    console.log('Fetching PDF from URL:', url);
    
    // Handle local file URLs differently
    if (url.startsWith('/storage/')) {
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      if (blob.type !== 'application/pdf') {
        console.warn('Warning: Fetched content is not a PDF. Content type:', blob.type);
      }
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          console.log('PDF loaded as base64, length:', result.length);
          resolve(result);
        };
        reader.readAsDataURL(blob);
      });
    } else {
      // For remote URLs, use the original approach
      const response = await fetch(url);
      const blob = await response.blob();
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    }
  } catch (error) {
    console.error('Failed to fetch PDF:', error);
    throw error;
  }
};

// Add a new field
const addField = () => {
  if (!selectedFieldType.value || !designer.value) return
  
  const fieldName = `field_${Date.now()}`
  const newField = {
    type: selectedFieldType.value,
    position: { x: 50, y: 50 },
    width: 100,
    height: 20,
    fontSize: 12,
    fontColor: '#000000'
  }
  
  // Add field to template
  const currentTemplate = { ...templateData.value }
  currentTemplate.schemas[0][fieldName] = newField
  
  designer.value.updateTemplate(currentTemplate)
  templateData.value = currentTemplate
  
  emit('field-added', { name: fieldName, ...newField })
}

// Update selected field
const updateField = () => {
  if (!selectedField.value || !designer.value) return
  
  const currentTemplate = { ...templateData.value }
  const fieldName = selectedField.value.name
  
  // Update field in template
  currentTemplate.schemas[0][fieldName] = {
    type: selectedField.value.type,
    position: selectedField.value.position,
    width: selectedField.value.width,
    height: selectedField.value.height,
    fontSize: selectedField.value.fontSize || 12,
    fontColor: selectedField.value.fontColor || '#000000',
    options: selectedField.value.options || undefined
  }
  
  designer.value.updateTemplate(currentTemplate)
  templateData.value = currentTemplate
  
  emit('field-updated', selectedField.value)
}

// Update field options (for select/radio fields)
const updateFieldOptions = () => {
  if (!selectedField.value) return
  
  const options = selectedField.value.optionsText
    .split('\n')
    .map(opt => opt.trim())
    .filter(opt => opt.length > 0)
  
  selectedField.value.options = options
  updateField()
}

// Delete selected field
const deleteField = () => {
  if (!selectedField.value || !designer.value) return
  
  const currentTemplate = { ...templateData.value }
  const fieldName = selectedField.value.name
  
  delete currentTemplate.schemas[0][fieldName]
  
  designer.value.updateTemplate(currentTemplate)
  templateData.value = currentTemplate
  
  emit('field-deleted', fieldName)
  selectedField.value = null
}

// Save template
const saveTemplate = async () => {
  if (!designer.value) return
  
  try {
    saving.value = true
    
    // Convert template to fields configuration format
    const fieldsConfig = Object.entries(templateData.value.schemas[0]).map(([name, config]) => ({
      name,
      type: config.type,
      position: config.position,
      width: config.width,
      height: config.height,
      fontSize: config.fontSize || 12,
      fontColor: config.fontColor || '#000000',
      additionalProperties: {
        options: config.options
      }
    }))
    
    emit('save', fieldsConfig)
  } catch (error) {
    console.error('Failed to save template:', error)
  } finally {
    saving.value = false
  }
}

// Lifecycle
onMounted(() => {
  initializeDesigner()
})

onUnmounted(() => {
  if (designer.value) {
    designer.value.destroy()
  }
})

// Watch for template changes
watch(() => props.template, () => {
  if (designer.value) {
    initializeDesigner()
  }
}, { deep: true })
</script>

<style scoped>
.pdf-template-editor {
  @apply w-full;
}

/* Override @pdfme UI styles */
:deep(.pdfme-ui-container) {
  border: none !important;
}

:deep(.pdfme-ui-toolbar) {
  background: #f9fafb !important;
  border-bottom: 1px solid #e5e7eb !important;
}
</style> 