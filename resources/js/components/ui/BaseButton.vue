<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <LoadingSpinner v-if="loading" class="mr-2" />
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'success', 'warning'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const buttonClasses = computed(() => {
  const classes = ['btn']
  
  // Variant classes
  switch (props.variant) {
    case 'primary':
      classes.push('btn-primary')
      break
    case 'secondary':
      classes.push('btn-secondary')
      break
    case 'danger':
      classes.push('btn-danger')
      break
    case 'success':
      classes.push('bg-green-600 text-white hover:bg-green-700 focus:ring-green-500')
      break
    case 'warning':
      classes.push('bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500')
      break
  }
  
  // Size classes
  switch (props.size) {
    case 'sm':
      classes.push('btn-sm')
      break
    case 'lg':
      classes.push('btn-lg')
      break
  }
  
  // Block class
  if (props.block) {
    classes.push('w-full')
  }
  
  return classes.join(' ')
})
</script> 