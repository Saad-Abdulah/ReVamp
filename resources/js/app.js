import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import '../css/app.css'

// Global components
import BaseButton from './components/ui/BaseButton.vue'
import BaseInput from './components/ui/BaseInput.vue'
import BaseCard from './components/ui/BaseCard.vue'
import LoadingSpinner from './components/ui/LoadingSpinner.vue'
import NotificationContainer from './components/ui/NotificationContainer.vue'

const app = createApp(App)
const pinia = createPinia()

// Global components registration
app.component('BaseButton', BaseButton)
app.component('BaseInput', BaseInput)
app.component('BaseCard', BaseCard)
app.component('LoadingSpinner', LoadingSpinner)
app.component('NotificationContainer', NotificationContainer)

app.use(pinia)
app.use(router)

app.mount('#app') 