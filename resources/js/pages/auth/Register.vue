<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
          <svg class="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Join the PDF Template Designer
        </p>
      </div>
      
      <BaseCard>
        <div class="text-center py-8">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Registration Coming Soon</h3>
          <p class="text-gray-600 mb-6">
            The registration feature is currently under development.
          </p>
          <router-link
            to="/login"
            class="text-primary-600 hover:text-primary-500 font-medium"
          >
            ← Back to Login
          </router-link>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import BaseCard from '../../components/ui/BaseCard.vue'
</script> 