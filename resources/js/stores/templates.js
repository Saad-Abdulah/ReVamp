import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useTemplatesStore = defineStore('templates', () => {
  const templates = ref([])
  const loading = ref(false)
  const currentTemplate = ref(null)

  const fetchTemplates = async () => {
    loading.value = true
    try {
      const response = await api.get('/templates')
      templates.value = response.data.templates
      return templates.value
    } catch (error) {
      console.error('Failed to fetch templates:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const getTemplate = async (id) => {
    try {
      const response = await api.get(`/templates/${id}`)
      currentTemplate.value = response.data.template
      return response.data.template
    } catch (error) {
      console.error('Failed to get template:', error)
      throw error
    }
  }

  const uploadTemplate = async (formData) => {
    loading.value = true
    try {
      const response = await api.post('/templates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Add the new template to the list
      if (response.data.template) {
        templates.value.unshift(response.data.template)
      }
      
      return response.data.template
    } catch (error) {
      console.error('Failed to upload template:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateTemplateFields = async (id, data) => {
    try {
      console.log('Updating template fields for ID:', id, 'with data:', data);
      
      // Make sure we have the fields_config property
      const fieldsConfig = data.fields_config || data;
      
      const response = await api.put(`/templates/${id}/fields`, {
        fields_config: fieldsConfig
      });
      
      // Update the template in the list
      const index = templates.value.findIndex(t => t.id === parseInt(id));
      if (index > -1) {
        templates.value[index] = {
          ...templates.value[index],
          ...response.data.template,
          fields_config: fieldsConfig,
          fields_count: fieldsConfig.length,
          updated_at: new Date().toISOString()
        };
      }
      
      // Update current template if it's the same one
      if (currentTemplate.value?.id === parseInt(id)) {
        currentTemplate.value = {
          ...currentTemplate.value,
          ...response.data.template,
          fields_config: fieldsConfig,
          fields_count: fieldsConfig.length,
          updated_at: new Date().toISOString()
        };
      }
      
      console.log('Template fields updated successfully');
      return response.data.template;
    } catch (error) {
      console.error('Failed to update template fields:', error);
      throw error;
    }
  };

  const deleteTemplate = async (id) => {
    try {
      await api.delete(`/templates/${id}`)
      
      // Remove the template from the list
      const index = templates.value.findIndex(t => t.id === parseInt(id))
      if (index > -1) {
        templates.value.splice(index, 1)
      }
      
      return true
    } catch (error) {
      console.error('Failed to delete template:', error)
      throw error
    }
  }

  const generatePdf = async (templateId, data) => {
    try {
      console.log('Generating PDF for template ID:', templateId, 'with data:', data);
      
      // Validate template exists
      const template = templates.value.find(t => t.id === parseInt(templateId));
      if (!template) {
        console.error('Template not found for ID:', templateId);
        throw new Error(`Template with ID ${templateId} not found`);
      }
      
      // Make API call
      const response = await api.post(`/generate/${templateId}`, data);
      
      if (!response.data || !response.data.generated_pdf) {
        console.error('Invalid response from PDF generation:', response);
        throw new Error('Invalid response from PDF generation service');
      }
      
      console.log('PDF generated successfully:', response.data.generated_pdf);
      
      // Return the generated PDF data
      return response.data.generated_pdf;
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      throw error;
    }
  };

  return {
    templates,
    loading,
    currentTemplate,
    fetchTemplates,
    getTemplate,
    uploadTemplate,
    updateTemplateFields,
    deleteTemplate,
    generatePdf
  }
}) 