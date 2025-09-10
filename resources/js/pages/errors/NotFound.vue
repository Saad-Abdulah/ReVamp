<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-primary-600">404</h1>
        <h2 class="mt-4 text-2xl font-bold text-gray-900">Page not found</h2>
        <p class="mt-2 text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
      </div>
      
      <div class="space-y-4">
        <BaseButton @click="goBack" variant="secondary">
          ← Go back
        </BaseButton>
        <br />
        <router-link to="/dashboard" class="text-primary-600 hover:text-primary-500 font-medium">
          Go to dashboard
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import BaseButton from '../../components/ui/BaseButton.vue'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}
</script> 