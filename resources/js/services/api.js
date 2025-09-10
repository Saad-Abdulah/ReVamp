import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    
    // Handle other errors
    const message = error.response?.data?.message || error.message || 'An error occurred'
    
    // Create a more detailed error object
    const enhancedError = new Error(message)
    enhancedError.status = error.response?.status
    enhancedError.data = error.response?.data
    enhancedError.originalError = error
    
    return Promise.reject(enhancedError)
  }
)

// Mock data for testing without backend
let mockTemplates = []
let mockGeneratedPdfs = []
let mockUserId = 1
let nextTemplateId = 1
let nextGeneratedPdfId = 1

// Mock data storage functions
const loadMockData = () => {
  try {
    const templatesData = localStorage.getItem('pdf_mock_templates');
    const generatedData = localStorage.getItem('pdf_mock_generated');
    
    if (templatesData) {
      const parsed = JSON.parse(templatesData);
      mockTemplates.length = 0; // Clear existing data
      mockTemplates.push(...parsed);
      
      // Update nextTemplateId to avoid conflicts
      if (mockTemplates.length > 0) {
        nextTemplateId = Math.max(...mockTemplates.map(t => t.id)) + 1;
      }
    }
    
    if (generatedData) {
      const parsed = JSON.parse(generatedData);
      // Note: We don't restore blob URLs as they don't persist across sessions
      // The generated PDFs will need to be regenerated
      const validPdfs = parsed.filter(pdf => pdf.download_url && !pdf.download_url.startsWith('blob:'));
      mockGeneratedPdfs.length = 0; // Clear existing data
      mockGeneratedPdfs.push(...validPdfs);
      
      // Update nextGeneratedPdfId to avoid conflicts
      if (mockGeneratedPdfs.length > 0) {
        nextGeneratedPdfId = Math.max(...mockGeneratedPdfs.map(p => p.id)) + 1;
      }
    }
    
    console.log('Mock data loaded:', { templates: mockTemplates.length, generated: mockGeneratedPdfs.length });
  } catch (error) {
    console.error('Error loading mock data:', error);
  }
};

const saveMockData = () => {
  try {
    // For generated PDFs, we need to handle blob URLs specially
    const generatedToSave = mockGeneratedPdfs.map(pdf => {
      if (pdf.download_url.startsWith('blob:')) {
        // Don't save blob URLs as they don't persist
        return { ...pdf, download_url: null };
      }
      return pdf;
    });
    
    localStorage.setItem('pdf_mock_templates', JSON.stringify(mockTemplates));
    localStorage.setItem('pdf_mock_generated', JSON.stringify(generatedToSave));
    console.log('Mock data saved');
  } catch (error) {
    console.error('Error saving mock data:', error);
  }
};

// Load mock data on initialization
loadMockData()

// Clear mock data (for testing)
const clearMockData = () => {
  try {
    localStorage.removeItem('mockTemplates')
    localStorage.removeItem('mockGeneratedPdfs')
    mockTemplates = []
    mockGeneratedPdfs = []
    nextTemplateId = 1
    nextGeneratedPdfId = 1
    console.log('Mock data cleared successfully')
  } catch (error) {
    console.error('Error clearing mock data:', error)
  }
}

// Add to window for easy access in browser console
if (typeof window !== 'undefined') {
  window.clearPdfMockData = clearMockData
  console.log('Use window.clearPdfMockData() in console to clear all mock data')
}

// Mock API implementation
const mockApi = {
  // Auth endpoints
  login: async (credentials) => {
    // Simulate successful login
    const token = 'mock_token_' + Date.now()
    localStorage.setItem('auth_token', token)
    return {
      data: {
        token,
        user: { id: mockUserId, name: 'Test User', email: credentials.email }
      }
    }
  },
  
  register: async (userData) => {
    // Simulate successful registration
    const token = 'mock_token_' + Date.now()
    localStorage.setItem('auth_token', token)
    return {
      data: {
        token,
        user: { id: mockUserId, name: userData.name, email: userData.email }
      }
    }
  },
  
  logout: async () => {
    localStorage.removeItem('auth_token')
    return { data: { message: 'Logged out successfully' } }
  },
  
  getUser: async () => {
    return {
      data: { 
        user: { id: mockUserId, name: 'Test User', email: 'test@example.com' }
      }
    }
  },
  
  // Template endpoints
  getTemplates: async () => {
    return { data: { templates: mockTemplates } }
  },
  
  getTemplate: async (id) => {
    const template = mockTemplates.find(t => t.id === parseInt(id))
    if (!template) {
      throw new Error('Template not found')
    }
    return { data: { template } }
  },
  
  uploadTemplate: async (formData) => {
    // Get the actual PDF file
    const pdfFile = formData.get('pdf_file')
    let pdfUrl = ''
    
    // Convert uploaded PDF to data URL for storage
    if (pdfFile && pdfFile.size > 0) {
      pdfUrl = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(pdfFile)
      })
    }
    
    const template = {
      id: nextTemplateId++,
      name: formData.get('name'),
      description: formData.get('description') || '',
      original_filename: pdfFile?.name || 'template.pdf',
      pdf_url: pdfUrl,
      fields_config: [],
      fields_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    mockTemplates.unshift(template)
    
    // Save to localStorage to persist across page refreshes
    saveMockData()
    
    return { data: { template } }
  },
  
  updateTemplateFields: async (id, data) => {
    const template = mockTemplates.find(t => t.id === parseInt(id))
    if (!template) {
      throw new Error('Template not found')
    }
    
    console.log('Mock API: Updating template fields for ID:', id, 'with data:', data);
    
    // Extract fields_config from the data object
    const fieldsConfig = data.fields_config || [];
    
    // Update the template
    template.fields_config = fieldsConfig;
    template.fields_count = fieldsConfig.length;
    template.updated_at = new Date().toISOString();
    
    // Save to localStorage to persist across page refreshes
    saveMockData()
    
    console.log('Mock API: Template updated successfully with', fieldsConfig.length, 'fields');
    
    return { 
      data: { 
        template: {
          ...template,
          fields_config: fieldsConfig,
          fields_count: fieldsConfig.length
        } 
      } 
    };
  },
  
  deleteTemplate: async (id) => {
    const index = mockTemplates.findIndex(t => t.id === parseInt(id))
    if (index === -1) {
      throw new Error('Template not found')
    }
    
    mockTemplates.splice(index, 1)
    
    // Save to localStorage to persist across page refreshes
    saveMockData()
    
    return { data: { message: 'Template deleted successfully' } }
  },
  
  // PDF Generation endpoints
  generatePdf: async (templateId, data) => {
    console.log('Mock API: Starting PDF generation...');
    console.log('Template ID:', templateId);
    console.log('Generation data:', data);
    
    const template = mockTemplates.find(t => t.id === parseInt(templateId))
    if (!template) {
      throw new Error('Template not found')
    }
    
    console.log('Found template:', template.name);
    console.log('Template fields config:', template.fields_config);
    
    // Validate template has a PDF URL
    if (!template.pdf_url) {
      console.error('Template has no PDF URL');
      throw new Error('Template has no PDF file attached');
    }
    
    // Validate template has fields
    if (!template.fields_config || template.fields_config.length === 0) {
      console.warn('Template has no fields configured');
      // Still generate PDF but without fields
    }
    
    try {
      // Import the @pdfme libraries dynamically
      console.log('Importing @pdfme libraries...');
      const { generate } = await import('@pdfme/generator');
      const { text, image, barcodes } = await import('@pdfme/schemas');
      console.log('@pdfme libraries imported successfully');
      
      // Get the template PDF data
      let basePdf = template.pdf_url;
      console.log('Original PDF URL:', basePdf);
      
      if (!basePdf.startsWith('data:application/pdf;base64,')) {
        console.log('Converting PDF URL to base64...');
        // If it's a URL, fetch it and convert to base64
        const response = await fetch(basePdf);
        if (!response.ok) {
          throw new Error(`Failed to fetch template PDF: ${response.status}`);
        }
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const base64String = btoa(String.fromCharCode.apply(null, uint8Array));
        basePdf = `data:application/pdf;base64,${base64String}`;
        console.log('PDF converted to base64, length:', base64String.length);
      } else {
        console.log('PDF is already in base64 format');
      }
      
      // Prepare the template schema for @pdfme/generator
      const pdfTemplate = {
        basePdf: basePdf,
        schemas: [{}]
      };
      
      // Convert fields config to @pdfme schema format
      if (template.fields_config && template.fields_config.length > 0) {
        console.log('Processing fields config...');
        template.fields_config.forEach(field => {
          console.log('Processing field:', field.name, field);
          pdfTemplate.schemas[0][field.name] = {
            type: field.type || 'text',
            position: field.position,
            width: field.width,
            height: field.height,
            fontSize: field.fontSize || 12,
            fontColor: field.fontColor || '#000000',
            ...(field.options && { options: field.options })
          };
        });
      }
      
      console.log('Final template schema:', pdfTemplate.schemas[0]);
      console.log('Input data for generation:', data.data);
      
      // Prepare plugins for @pdfme/generator
      const plugins = { text, image, ...barcodes };
      
      // Generate the PDF
      console.log('Calling @pdfme/generator.generate...');
      const pdfBytes = await generate({
        template: pdfTemplate,
        inputs: [data.data],
        plugins: plugins
      });
      
      console.log('PDF generated successfully, size:', pdfBytes.length, 'bytes');
      
      // Convert the generated PDF to a blob URL
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      
      console.log('Created blob URL:', downloadUrl);
      
      // Create a mock generated PDF record
      const generatedPdf = {
        id: nextGeneratedPdfId++,
        filename: data.filename || `generated_${Date.now()}.pdf`,
        template_name: template.name,
        download_url: downloadUrl,
        file_size: `${Math.round(pdfBytes.length / 1024)} KB`,
        status: 'completed',
        created_at: new Date().toISOString(),
        data_used: data.data
      }
      
      // Add to the mock generated PDFs list
      mockGeneratedPdfs.unshift(generatedPdf);
      
      // Save to localStorage to persist across page refreshes
      saveMockData()
      
      console.log('Mock API: PDF generated successfully:', generatedPdf);
      
      return { 
        data: { 
          generated_pdf: generatedPdf,
          message: 'PDF generated successfully'
        } 
      };
    } catch (error) {
      console.error('PDF generation error:', error);
      console.error('Error stack:', error.stack);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  },
  
  getGeneratedPdfs: async () => {
    return { 
      data: { 
        generated_pdfs: mockGeneratedPdfs,
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 20,
          total: mockGeneratedPdfs.length
        }
      } 
    }
  }
}

// Helper to check if we should use mock API
const useMockApi = () => {
  return !window.location.hostname.includes('production') && 
         (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
}

// Create a wrapper that uses mock API in development
const apiWrapper = {
  get: async (url, config) => {
    if (useMockApi()) {
      console.log('Using mock API for GET:', url)
      
      // Handle mock API endpoints
      if (url === '/templates') {
        return mockApi.getTemplates()
      } else if (url.match(/\/templates\/\d+$/)) {
        const id = url.split('/').pop()
        return mockApi.getTemplate(id)
      } else if (url === '/auth/user') {
        return mockApi.getUser()
      } else if (url === '/generate') {
        return mockApi.getGeneratedPdfs()
      }
      
      console.warn('Unhandled mock GET endpoint:', url)
    }
    
    return api.get(url, config)
  },
  
  post: async (url, data, config) => {
    if (useMockApi()) {
      console.log('Using mock API for POST:', url, data)
      
      // Handle mock API endpoints
      if (url === '/auth/login') {
        return mockApi.login(data)
      } else if (url === '/auth/register') {
        return mockApi.register(data)
      } else if (url === '/auth/logout') {
        return mockApi.logout()
      } else if (url === '/templates') {
        return mockApi.uploadTemplate(data)
      } else if (url.match(/\/generate\/\d+$/)) {
        const id = url.split('/').pop()
        return mockApi.generatePdf(id, data)
      }
      
      console.warn('Unhandled mock POST endpoint:', url)
    }
    
    return api.post(url, data, config)
  },
  
  put: async (url, data, config) => {
    if (useMockApi()) {
      console.log('Using mock API for PUT:', url, data)
      
      // Handle mock API endpoints
      if (url.match(/\/templates\/\d+\/fields$/)) {
        const id = url.split('/')[2]
        return mockApi.updateTemplateFields(id, data)
      }
      
      console.warn('Unhandled mock PUT endpoint:', url)
    }
    
    return api.put(url, data, config)
  },
  
  delete: async (url, config) => {
    if (useMockApi()) {
      console.log('Using mock API for DELETE:', url)
      
      // Handle mock API endpoints
      if (url.match(/\/templates\/\d+$/)) {
        const id = url.split('/').pop()
        return mockApi.deleteTemplate(id)
      }
      
      console.warn('Unhandled mock DELETE endpoint:', url)
    }
    
    return api.delete(url, config)
  }
}

export default apiWrapper 