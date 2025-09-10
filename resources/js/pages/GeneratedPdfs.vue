<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Generated PDFs</h1>
        <p class="mt-1 text-sm text-gray-600">
          View, download, and manage your generated PDF documents
        </p>
      </div>
      
      <div class="flex items-center space-x-3">
        <BaseButton @click="showStatsModal = true" variant="secondary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Statistics
        </BaseButton>
        
        <router-link to="/templates" class="btn btn-primary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Generate New PDF
        </router-link>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <BaseCard>
        <div class="p-4 text-center">
          <div class="text-2xl font-bold text-primary-600">{{ generatedPdfs.length }}</div>
          <div class="text-sm text-gray-500">Total Generated</div>
        </div>
      </BaseCard>
      
      <BaseCard>
        <div class="p-4 text-center">
          <div class="text-2xl font-bold text-green-600">{{ completedCount }}</div>
          <div class="text-sm text-gray-500">Completed</div>
        </div>
      </BaseCard>
      
      <BaseCard>
        <div class="p-4 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ thisMonthCount }}</div>
          <div class="text-sm text-gray-500">This Month</div>
        </div>
      </BaseCard>
      
      <BaseCard>
        <div class="p-4 text-center">
          <div class="text-2xl font-bold text-purple-600">{{ totalSizeFormatted }}</div>
          <div class="text-sm text-gray-500">Total Size</div>
        </div>
      </BaseCard>
    </div>

    <!-- Filters -->
    <div class="mb-6 flex flex-wrap items-center gap-4">
      <div class="flex items-center space-x-2">
        <label class="label text-sm">Status:</label>
        <select v-model="statusFilter" class="input text-sm">
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      
      <div class="flex items-center space-x-2">
        <label class="label text-sm">Search:</label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by filename..."
          class="input text-sm"
        />
      </div>
      
      <BaseButton 
        variant="secondary" 
        size="sm"
        @click="refreshList"
        :loading="loading"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </BaseButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <LoadingSpinner size="lg" />
      <p class="mt-4 text-gray-600">Loading generated PDFs...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredPdfs.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">No PDFs generated yet</h3>
      <p class="mt-2 text-gray-600">Start by generating your first PDF from a template</p>
      <router-link to="/templates" class="mt-4 btn btn-primary">
        Generate PDF
      </router-link>
    </div>

    <!-- PDFs List -->
    <div v-else class="space-y-4">
      <div v-for="pdf in filteredPdfs" :key="pdf.id" class="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <!-- Status Icon -->
            <div class="flex-shrink-0">
              <div :class="getStatusClasses(pdf.status)" class="h-10 w-10 rounded-full flex items-center justify-center">
                <component :is="getStatusIcon(pdf.status)" class="h-5 w-5" />
              </div>
            </div>
            
            <!-- PDF Info -->
            <div class="flex-1">
              <h3 class="text-lg font-medium text-gray-900">{{ pdf.filename }}</h3>
              <p class="text-sm text-gray-500">Template: {{ pdf.template_name }}</p>
              <div class="flex items-center space-x-4 mt-1">
                <span :class="getStatusTextClass(pdf.status)" class="text-xs font-medium px-2 py-1 rounded-full">
                  {{ pdf.status.toUpperCase() }}
                </span>
                <span class="text-xs text-gray-500">{{ pdf.file_size }}</span>
                <span class="text-xs text-gray-500">{{ formatDate(pdf.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-2">
            <BaseButton 
              v-if="pdf.status === 'completed'"
              variant="primary" 
              size="sm"
              @click="downloadPdf(pdf)"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M7 7h10a2 2 0 012 2v9a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
              </svg>
              Download
            </BaseButton>
            
            <BaseButton 
              v-if="pdf.status === 'completed' && pdf.download_url"
              variant="secondary" 
              size="sm"
              @click="viewPdfInNewTab(pdf)"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View
            </BaseButton>
            
            <BaseButton 
              variant="secondary" 
              size="sm"
              @click="viewDetails(pdf)"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Details
            </BaseButton>
            
            <BaseButton 
              variant="danger" 
              size="sm"
              @click="deletePdf(pdf)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 max-w-2xl shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">PDF Details</h3>
          <BaseButton variant="secondary" @click="showDetailsModal = false">
            Close
          </BaseButton>
        </div>
        
        <div v-if="selectedPdf" class="space-y-4">
          <div>
            <label class="label">Filename</label>
            <p class="text-sm text-gray-900">{{ selectedPdf.filename }}</p>
          </div>
          <div>
            <label class="label">Template</label>
            <p class="text-sm text-gray-900">{{ selectedPdf.template_name }}</p>
          </div>
          <div>
            <label class="label">Status</label>
            <span :class="getStatusTextClass(selectedPdf.status)" class="text-xs font-medium px-2 py-1 rounded-full">
              {{ selectedPdf.status.toUpperCase() }}
            </span>
          </div>
          <div>
            <label class="label">File Size</label>
            <p class="text-sm text-gray-900">{{ selectedPdf.file_size }}</p>
          </div>
          <div>
            <label class="label">Created</label>
            <p class="text-sm text-gray-900">{{ formatDate(selectedPdf.created_at) }}</p>
          </div>
          <div v-if="selectedPdf.data_used">
            <label class="label">Data Used</label>
            <div class="bg-gray-50 p-3 rounded text-sm">
              <pre>{{ JSON.stringify(selectedPdf.data_used, null, 2) }}</pre>
            </div>
          </div>
          
          <!-- PDF Preview -->
          <div v-if="selectedPdf.download_url">
            <label class="label">Preview</label>
            <div class="border border-gray-300 rounded">
              <iframe 
                :src="getPdfViewerUrl(selectedPdf.download_url)" 
                class="w-full" 
                style="height: 400px;"
              ></iframe>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex justify-end space-x-3 mt-4">
            <BaseButton 
              v-if="selectedPdf.status === 'completed' && selectedPdf.download_url"
              variant="primary" 
              size="sm"
              @click="downloadPdf(selectedPdf)"
            >
              Download PDF
            </BaseButton>
            <BaseButton 
              v-if="selectedPdf.status === 'completed' && selectedPdf.download_url"
              variant="secondary" 
              size="sm"
              @click="viewPdfInNewTab(selectedPdf)"
            >
              Open in New Tab
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Modal -->
    <div v-if="showStatsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 max-w-lg shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">PDF Generation Statistics</h3>
          <BaseButton variant="secondary" @click="showStatsModal = false">
            Close
          </BaseButton>
        </div>
        
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-4 bg-gray-50 rounded">
              <div class="text-2xl font-bold text-gray-900">{{ generatedPdfs.length }}</div>
              <div class="text-sm text-gray-500">Total Generated</div>
            </div>
            <div class="text-center p-4 bg-green-50 rounded">
              <div class="text-2xl font-bold text-green-600">{{ completedCount }}</div>
              <div class="text-sm text-gray-500">Successful</div>
            </div>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Success Rate:</span>
              <span class="text-sm font-medium">{{ successRate }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Total Size:</span>
              <span class="text-sm font-medium">{{ totalSizeFormatted }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">This Month:</span>
              <span class="text-sm font-medium">{{ thisMonthCount }} PDFs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useNotificationStore } from '../stores/notifications'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import LoadingSpinner from '../components/ui/LoadingSpinner.vue'
import api from '../services/api'

const notificationStore = useNotificationStore()

// State
const loading = ref(false)
const statusFilter = ref('')
const searchQuery = ref('')
const showDetailsModal = ref(false)
const showStatsModal = ref(false)
const selectedPdf = ref(null)

// Real data for generated PDFs
const generatedPdfs = ref([])

// Fetch generated PDFs from API
const fetchGeneratedPdfs = async () => {
  loading.value = true
  try {
    const response = await api.get('/generate')
    console.log('Fetched generated PDFs:', response.data)
    
    if (response.data && response.data.generated_pdfs) {
      generatedPdfs.value = response.data.generated_pdfs
    }
  } catch (error) {
    console.error('Failed to fetch generated PDFs:', error)
    notificationStore.error('Failed to load PDFs', error.message)
  } finally {
    loading.value = false
  }
}

// Computed properties
const filteredPdfs = computed(() => {
  let filtered = [...generatedPdfs.value]
  
  if (statusFilter.value) {
    filtered = filtered.filter(pdf => pdf.status === statusFilter.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(pdf => 
      pdf.filename.toLowerCase().includes(query) ||
      pdf.template_name.toLowerCase().includes(query)
    )
  }
  
  return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const completedCount = computed(() => 
  generatedPdfs.value.filter(pdf => pdf.status === 'completed').length
)

const thisMonthCount = computed(() => {
  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  return generatedPdfs.value.filter(pdf => {
    const pdfDate = new Date(pdf.created_at)
    return pdfDate.getMonth() === thisMonth && pdfDate.getFullYear() === thisYear
  }).length
})

const totalSizeFormatted = computed(() => {
  // Calculate total size
  const totalKB = generatedPdfs.value
    .filter(pdf => pdf.status === 'completed')
    .reduce((sum, pdf) => {
      const size = pdf.file_size ? parseInt(pdf.file_size.replace(/[^\d]/g, '')) : 0
      return sum + size
    }, 0)
  
  if (totalKB > 1024) {
    return `${(totalKB / 1024).toFixed(1)} MB`
  }
  return `${totalKB} KB`
})

const successRate = computed(() => {
  if (generatedPdfs.value.length === 0) return 0
  return Math.round((completedCount.value / generatedPdfs.value.length) * 100)
})

// Methods
const refreshList = async () => {
  try {
    await fetchGeneratedPdfs()
    notificationStore.success('Refreshed!', 'PDF list has been updated')
  } catch (error) {
    notificationStore.error('Refresh failed', error.message)
  }
}

const downloadPdf = async (pdf) => {
  try {
    if (!pdf.download_url) {
      throw new Error('Download URL not available');
    }
    
    notificationStore.info('Download started', `Downloading ${pdf.filename}...`);
    
    console.log('Attempting to download PDF from URL:', pdf.download_url);
    
    // For direct download, create a Blob from the PDF URL and create an object URL
    try {
      // Fetch the PDF content
      const response = await fetch(pdf.download_url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      }
      
      // Get the PDF as a blob
      const blob = await response.blob();
      
      // Create a blob URL
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a hidden anchor element to trigger the download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = pdf.filename;
      document.body.appendChild(a);
      
      // Trigger the download
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl); // Release the blob URL
        notificationStore.success('Download complete', `${pdf.filename} has been downloaded`);
      }, 100);
    } catch (fetchError) {
      console.error('Error fetching PDF:', fetchError);
      
      // Fallback to opening in a new tab if fetch fails
      window.open(pdf.download_url, '_blank');
      notificationStore.info('Download initiated', 'PDF opened in a new tab. You may need to save it manually.');
    }
  } catch (error) {
    console.error('Download failed:', error);
    notificationStore.error('Download failed', error.message);
  }
};

const viewDetails = (pdf) => {
  selectedPdf.value = pdf
  showDetailsModal.value = true
}

const viewPdfInNewTab = (pdf) => {
  if (pdf.download_url) {
    console.log('Opening PDF in new tab:', pdf.download_url);
    
    // Ensure the URL is absolute
    let url = pdf.download_url;
    if (url.startsWith('/')) {
      url = window.location.origin + url;
    }
    
    window.open(url, '_blank');
  } else {
    notificationStore.error('No Preview URL', 'This PDF does not have a preview URL available.');
  }
};

const deletePdf = async (pdf) => {
  if (confirm(`Are you sure you want to delete "${pdf.filename}"?`)) {
    try {
      // In a real app, this would call the API to delete the PDF
      const index = generatedPdfs.value.findIndex(p => p.id === pdf.id)
      if (index > -1) {
        generatedPdfs.value.splice(index, 1)
        notificationStore.success('PDF deleted', 'PDF has been deleted successfully')
      }
    } catch (error) {
      notificationStore.error('Delete failed', error.message)
    }
  }
}

const getStatusClasses = (status) => {
  const classes = {
    completed: 'bg-green-100 text-green-600',
    processing: 'bg-blue-100 text-blue-600',
    failed: 'bg-red-100 text-red-600',
    pending: 'bg-yellow-100 text-yellow-600'
  }
  return classes[status] || classes.pending
}

const getStatusTextClass = (status) => {
  const classes = {
    completed: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || classes.pending
}

const getStatusIcon = (status) => {
  const icons = {
    completed: { template: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>` },
    processing: { template: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path></svg>` },
    failed: { template: `<svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>` }
  }
  return icons[status] || icons.processing
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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

onMounted(async () => {
  await fetchGeneratedPdfs()
  
  // Auto-refresh every 30 seconds for processing PDFs
  setInterval(() => {
    const hasProcessing = generatedPdfs.value.some(pdf => pdf.status === 'processing')
    if (hasProcessing) {
      fetchGeneratedPdfs()
    }
  }, 30000)
})
</script> 